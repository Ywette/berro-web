"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { isExcursionRegion, type ExcursionRegion } from "@/lib/content/excursions";
import {
  EXCURSION_COLLAGE_PHOTO_COUNT,
  isExcursionLogoVariant,
  parseExcursionDurationDays,
  parseExcursionPlannedDate,
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
import type { Localized } from "@/lib/i18n/locale";
import {
  localizedTextFromForm,
  pickLocalizedText,
} from "@/lib/i18n/localized-content";

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
      title: Localized;
      route: Localized;
      teaser: Localized;
      details: Localized;
      regions: ExcursionRegion[];
      price: number | null;
      durationDays: number | null;
      plannedDate: string | null;
      isActive: boolean;
      images: string[];
      logoVariant: ExcursionLogoVariant;
    }
  | { error: string }
> {
  const title = localizedTextFromForm(formData, "title");
  const route = localizedTextFromForm(formData, "route");
  const teaser = localizedTextFromForm(formData, "teaser");
  const details = localizedTextFromForm(formData, "details");
  const regions = parseRegions(formData);
  const priceRaw = String(formData.get("price") ?? "").trim();
  const durationRaw = String(formData.get("durationDays") ?? "").trim();
  const plannedDateRaw = String(formData.get("plannedDate") ?? "").trim();
  const plannedDate = parseExcursionPlannedDate(plannedDateRaw);
  if (plannedDateRaw && !plannedDate) return { error: labels.excursionFormPlannedDateInvalid };
  const logoRaw = String(formData.get("logoVariant") ?? "dark");
  const logoVariant: ExcursionLogoVariant = isExcursionLogoVariant(logoRaw) ? logoRaw : "dark";
  const existingPhotos = formData
    .getAll("existingPhotos")
    .map(String)
    .filter(Boolean);
  const photoSlots = formData.getAll("photoSlots").map(String);

  if (!pickLocalizedText(title, "lv")) {
    return { error: labels.excursionFormTitleRequired };
  }

  let price: number | null = null;
  if (priceRaw) {
    const parsedPrice = parseExcursionPrice(priceRaw.replace(",", "."));
    if (parsedPrice === null) return { error: labels.excursionFormPriceInvalid };
    price = parsedPrice;
  }

  let durationDays: number | null = null;
  if (durationRaw) {
    const parsedDuration = parseExcursionDurationDays(durationRaw);
    if (parsedDuration === null) return { error: labels.excursionFormDurationInvalid };
    durationDays = parsedDuration;
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
    durationDays,
    plannedDate,
    isActive: formData.get("isActive") === "on",
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

  try {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : labels.excursionFormPhotoInvalid;
    console.error("[excursions] save failed", message);
    return { error: message };
  }
}

export async function deleteManagedExcursionAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await removeManagedExcursion(id);
  revalidatePath("/staff/excursions");
  revalidatePath("/excursions");
}
