"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { excursionRegions, type ExcursionRegion } from "@/lib/content/excursions";
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

function parseRegion(value: FormDataEntryValue | null): ExcursionRegion | null {
  if (typeof value !== "string" || !value) return null;
  return excursionRegions.includes(value as ExcursionRegion)
    ? (value as ExcursionRegion)
    : null;
}

async function parseExcursionForm(
  formData: FormData,
  labels: Awaited<ReturnType<typeof getDictionary>>["staffDashboard"],
): Promise<
  | {
      title: string;
      route: string;
      teaser: string;
      region: ExcursionRegion | null;
      image: string;
    }
  | { error: string }
> {
  const title = String(formData.get("title") ?? "").trim();
  const route = String(formData.get("route") ?? "").trim();
  const teaser = String(formData.get("teaser") ?? "").trim();
  const region = parseRegion(formData.get("region"));
  const existingPhotos = formData
    .getAll("existingPhotos")
    .map(String)
    .filter(Boolean);
  const photoSlots = formData.getAll("photoSlots").map(String);
  const mainPhotoIndex = Number(formData.get("mainPhotoIndex") ?? 0);

  if (!title) return { error: labels.excursionFormTitleRequired };

  let uploaded: string[] = [];
  try {
    uploaded = await saveFleetImageUploads(formData.getAll("photos"), {
      publicFolder: "excursions/uploads",
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
  if (orderedPaths.length === 0 && existingPhotos[0]) {
    orderedPaths.push(existingPhotos[0]);
  }

  const safeMain = Number.isFinite(mainPhotoIndex)
    ? Math.min(Math.max(Math.round(mainPhotoIndex), 0), Math.max(orderedPaths.length - 1, 0))
    : 0;
  const image = orderedPaths[safeMain] ?? orderedPaths[0] ?? "";

  if (!image) return { error: labels.excursionFormPhotoRequired };

  return { title, route, teaser, region, image };
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
