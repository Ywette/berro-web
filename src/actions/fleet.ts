"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { isFleetCountryCode } from "@/lib/content/countries";
import type { FleetVehicle } from "@/lib/content/fleet";
import type { TransportKind } from "@/lib/content/transport/types";
import { createVehicle, removeVehicle, updateVehicle } from "@/lib/data/vehicles";
import { normalizeFleetKind } from "@/lib/fleet/kind";
import { FleetImageUploadException, saveFleetImageUploads } from "@/lib/fleet/upload-images";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  localizedLinesFromForm,
  localizedTextFromForm,
  pickLocalizedText,
} from "@/lib/i18n/localized-content";

export type FleetActionState = {
  error?: string;
  success?: string;
};

const kinds: TransportKind[] = ["van", "coach", "vip", "retro"];

function parseKind(value: FormDataEntryValue | null): TransportKind | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const normalized = normalizeFleetKind(value);
  return kinds.includes(normalized) ? normalized : null;
}

function buildImageFields(orderedPaths: string[], mainIndex: number) {
  if (orderedPaths.length === 0) {
    return { image: "", galleryImages: [] as string[] };
  }
  const safeMain = Number.isFinite(mainIndex)
    ? Math.min(Math.max(Math.round(mainIndex), 0), orderedPaths.length - 1)
    : 0;
  return {
    image: orderedPaths[safeMain] ?? "",
    galleryImages: orderedPaths,
  };
}

function isPhotoRef(value: string): boolean {
  return (
    value.startsWith("/") ||
    value.startsWith("https://") ||
    value.startsWith("http://")
  );
}

async function parseVehicleForm(
  formData: FormData,
  labels: Awaited<ReturnType<typeof getDictionary>>["staffDashboard"],
): Promise<{ vehicle: Omit<FleetVehicle, "id" | "readinessNote" | "isActive"> } | { error: string }> {
  const name = localizedTextFromForm(formData, "name");
  const kind = parseKind(formData.get("kind"));
  const passengers = Number(formData.get("passengers"));
  const guideSeats = Number(formData.get("guideSeats") ?? 0);
  const plate = String(formData.get("plate") ?? "").trim() || null;
  const insuranceExpiresOn = String(formData.get("insuranceExpiresOn") ?? "").trim() || null;
  const inspectionExpiresOn = String(formData.get("inspectionExpiresOn") ?? "").trim() || null;
  const interiorColor = localizedTextFromForm(formData, "interiorColor");
  const bodyColor = localizedTextFromForm(formData, "bodyColor");
  const summary = localizedTextFromForm(formData, "summary");
  const videoUrl = String(formData.get("videoUrl") ?? "").trim() || null;
  const extras = localizedLinesFromForm(formData, "extras");
  const description = localizedLinesFromForm(formData, "description");
  const closingNotes = localizedLinesFromForm(formData, "closingNotes");
  const availableIn = formData
    .getAll("availableIn")
    .map(String)
    .filter(isFleetCountryCode);
  const existingPhotos = formData
    .getAll("existingPhotos")
    .map(String)
    .map((value) => value.trim())
    .filter(isPhotoRef);
  const mainPhotoIndex = Number(formData.get("mainPhotoIndex") ?? 0);

  const nameLv = pickLocalizedText(name, "lv");
  if (!nameLv || nameLv.length > 120) return { error: labels.fleetFormNameRequired };
  if (!kind) return { error: labels.fleetFormKindRequired };
  if (!Number.isFinite(passengers) || passengers < 1 || passengers > 80) {
    return { error: labels.fleetFormPassengersRequired };
  }
  if (!Number.isFinite(guideSeats) || guideSeats < 0 || guideSeats > 5) {
    return { error: labels.fleetFormGuideSeatsInvalid };
  }
  if (availableIn.length === 0) return { error: labels.fleetFormCountriesRequired };

  const slots = formData.getAll("photoSlots").map(String);
  const existingInSlots = slots.filter(isPhotoRef).length;
  const totalPhotoCount =
    slots.length > 0 ? slots.length : existingPhotos.length + formData.getAll("photos").length;
  if (totalPhotoCount > 5) {
    return { error: labels.fleetFormPhotoCount };
  }

  let uploadedPaths: string[] = [];
  try {
    uploadedPaths = await saveFleetImageUploads(formData.getAll("photos"), {
      maxCount: Math.max(0, 5 - existingInSlots),
    });
  } catch (error) {
    if (error instanceof FleetImageUploadException) {
      if (error.code === "type") return { error: labels.fleetFormPhotoType };
      if (error.code === "size") return { error: labels.fleetFormPhotoSize };
      if (error.code === "count") return { error: labels.fleetFormPhotoCount };
      return { error: labels.fleetFormPhotoInvalid };
    }
    return { error: labels.fleetFormPhotoInvalid };
  }

  const orderedPaths: string[] = [];
  let uploadCursor = 0;
  if (slots.length > 0) {
    for (const slot of slots) {
      if (slot === "new") {
        const path = uploadedPaths[uploadCursor];
        uploadCursor += 1;
        if (path) orderedPaths.push(path);
      } else if (isPhotoRef(slot)) {
        orderedPaths.push(slot);
      }
    }
  } else {
    orderedPaths.push(...existingPhotos, ...uploadedPaths);
  }

  const { image, galleryImages } = buildImageFields(orderedPaths, mainPhotoIndex);

  return {
    vehicle: {
      name,
      kind,
      passengers: Math.round(passengers),
      guideSeats: Math.round(guideSeats),
      image,
      galleryImages,
      videoUrl,
      plate,
      insuranceExpiresOn,
      inspectionExpiresOn,
      availableIn,
      interiorColor,
      bodyColor,
      extras,
      summary,
      description,
      closingNotes,
    },
  };
}

export async function saveFleetTransport(
  _state: FleetActionState,
  formData: FormData,
): Promise<FleetActionState> {
  await requireUser();
  const dictionary = await getDictionary();
  const labels = dictionary.staffDashboard;
  const existingId = String(formData.get("id") ?? "").trim();

  const parsed = await parseVehicleForm(formData, labels);
  if ("error" in parsed) return { error: parsed.error };

  if (existingId) {
    const updated = await updateVehicle({
      ...parsed.vehicle,
      id: existingId,
      readinessNote: null,
      isActive: true,
    });
    if (!updated) return { error: labels.fleetFormNotFound };
    revalidatePath("/staff/fleet");
    revalidatePath("/autoparks");
    return { success: labels.fleetFormUpdated };
  }

  await createVehicle({
    ...parsed.vehicle,
    id: `fleet-${crypto.randomUUID()}`,
    readinessNote: null,
    isActive: true,
  });
  revalidatePath("/staff/fleet");
  revalidatePath("/autoparks");
  return { success: labels.fleetFormSaved };
}

/** @deprecated Use saveFleetTransport — kept as alias for older imports. */
export const addFleetTransport = saveFleetTransport;

export async function deleteFleetTransport(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await removeVehicle(id);
  revalidatePath("/staff/fleet");
  revalidatePath("/autoparks");
}
