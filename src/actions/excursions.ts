"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { isExcursionRegion, type ExcursionRegion } from "@/lib/content/excursions";
import {
  EXCURSION_COLLAGE_PHOTO_COUNT,
  isExcursionLogoVariant,
  parseExcursionPrice,
  type ExcursionLogoVariant,
} from "@/lib/content/managed-excursion";
import {
  createManagedExcursion,
  removeManagedExcursion,
  updateManagedExcursionById,
} from "@/lib/data/managed-excursions";
import { FleetImageUploadException, saveFleetImageUploads } from "@/lib/fleet/upload-images";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export type ExcursionActionState = {
  error?: string;
  success?: string;
};

function parseRegions(formData: FormData): ExcursionRegion[] {
  return formData
    .getAll("regions")
    .map(String)
    .filter(isExcursionRegion);
}

async function parseExcursionForm(
  formData: FormData,
  labels: Awaited<ReturnType<typeof getDictionary>>["staffDashboard"],
): Promise<
  | {
      title: string;
      route: string;
      teaser: string;
      details: string;
      regions: ExcursionRegion[];
      price: number | null;
      images: string[];
      logoVariant: ExcursionLogoVariant;
    }
  | { error: string }
> {
  const title = String(formData.get("title") ?? "").trim();
  const route = String(formData.get("route") ?? "").trim();
  const teaser = String(formData.get("teaser") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  const regions = parseRegions(formData);
  const priceRaw = String(formData.get("price") ?? "").trim();
  const logoRaw = String(formData.get("logoVariant") ?? "dark");
  const logoVariant: ExcursionLogoVariant = isExcursionLogoVariant(logoRaw) ? logoRaw : "dark";
  const existingPhotos = formData
    .getAll("existingPhotos")
    .map(String)
    .filter(Boolean);
  const photoSlots = formData.getAll("photoSlots").map(String);

  if (!title) return { error: labels.excursionFormTitleRequired };

  let price: number | null = null;
  if (priceRaw) {
    const parsedPrice = parseExcursionPrice(priceRaw.replace(",", "."));
    if (parsedPrice === null) return { error: labels.excursionFormPriceInvalid };
    price = parsedPrice;
  }

  let uploaded: string[] = [];
  try {
    uploaded = await saveFleetImageUploads(formData.getAll("photos"), {
      publicFolder: "excursions/uploads",
      maxCount: EXCURSION_COLLAGE_PHOTO_COUNT,
    });
  } catch (error) {
    if (error instanceof FleetImageUploadException) {
      if (error.code === "type") return { error: labels.excursionFormPhotoType };
      if (error.code === "size") return { error: labels.excursionFormPhotoSize };
      if (error.code === "count") return { error: labels.excursionFormPhotoCount };
      return { error: labels.excursionFormPhotoInvalid };
    }
    throw error;
  }

  const orderedPaths: string[] = [];
  let uploadIndex = 0;
  for (const slot of photoSlots) {
    if (slot === "new") {
      const path = uploaded[uploadIndex++];
      if (path) orderedPaths.push(path);
    } else if (existingPhotos.includes(slot)) {
      orderedPaths.push(slot);
    }
  }

  if (orderedPaths.length !== EXCURSION_COLLAGE_PHOTO_COUNT) {
    return { error: labels.excursionFormPhotoRequired };
  }

  return {
    title,
    route,
    teaser,
    details,
    regions,
    price,
    images: orderedPaths,
    logoVariant,
  };
}

export async function saveManagedExcursion(
  _prev: ExcursionActionState,
  formData: FormData,
): Promise<ExcursionActionState> {
  await requireUser();
  const dictionary = await getDictionary();
  const labels = dictionary.staffDashboard;
  const parsed = await parseExcursionForm(formData, labels);
  if ("error" in parsed) return { error: parsed.error };

  const id = String(formData.get("id") ?? "").trim();
  if (id) {
    const updated = await updateManagedExcursionById(id, parsed);
    if (!updated) return { error: labels.excursionFormNotFound };
    revalidatePath("/staff/excursions");
    revalidatePath("/excursions");
    revalidatePath(`/excursions/${updated.slug}`);
    return { success: labels.excursionFormUpdated };
  }

  const created = await createManagedExcursion(parsed);
  revalidatePath("/staff/excursions");
  revalidatePath("/excursions");
  revalidatePath(`/excursions/${created.slug}`);
  return { success: labels.excursionFormSaved };
}

export async function deleteManagedExcursionAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await removeManagedExcursion(id);
  revalidatePath("/staff/excursions");
  revalidatePath("/excursions");
}
