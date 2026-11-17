import type { FleetVehicle } from "@/lib/content/fleet";
import { normalizeFleetKind } from "@/lib/fleet/kind";
import type { Localized } from "@/lib/i18n/locale";
import type { LocalizedLines } from "@/lib/i18n/localized-content";
import {
  localizedFromSeed,
  parseLocalizedLines,
  parseLocalizedText,
} from "@/lib/i18n/localized-content";

export type FleetVehicleRow = {
  id: string;
  name: Localized | string;
  kind: string;
  passengers: number;
  guide_seats: number;
  image: string;
  gallery_images: unknown;
  video_url: string | null;
  plate: string | null;
  insurance_expires_on: string | null;
  inspection_expires_on: string | null;
  available_in: unknown;
  interior_color: Localized | string;
  body_color: Localized | string;
  extras: LocalizedLines | unknown;
  summary: Localized | string;
  description: LocalizedLines | unknown;
  closing_notes: LocalizedLines | unknown;
  readiness_note: string | null;
  is_active: boolean;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function fleetVehicleFromRow(row: FleetVehicleRow): FleetVehicle {
  return {
    id: row.id,
    name: parseLocalizedText(row.name),
    kind: normalizeFleetKind(row.kind),
    passengers: row.passengers,
    guideSeats: row.guide_seats,
    image: row.image ?? "",
    galleryImages: asStringArray(row.gallery_images),
    videoUrl: row.video_url,
    plate: row.plate,
    insuranceExpiresOn: row.insurance_expires_on,
    inspectionExpiresOn: row.inspection_expires_on,
    availableIn: asStringArray(row.available_in),
    interiorColor: parseLocalizedText(row.interior_color),
    bodyColor: parseLocalizedText(row.body_color),
    extras: parseLocalizedLines(row.extras),
    summary: parseLocalizedText(row.summary),
    description: parseLocalizedLines(row.description),
    closingNotes: parseLocalizedLines(row.closing_notes),
    readinessNote: row.readiness_note,
    isActive: row.is_active !== false,
  };
}

/** Accepts Supabase rows or camelCase JSON-file vehicles (legacy string fields OK). */
export function normalizeFleetVehicle(raw: unknown): FleetVehicle | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id : "";
  if (!id) return null;

  if ("guide_seats" in item || "gallery_images" in item) {
    return fleetVehicleFromRow(raw as FleetVehicleRow);
  }

  const passengers = Number(item.passengers);
  const guideSeats = Number(item.guideSeats ?? 0);
  if (!Number.isFinite(passengers) || passengers < 1) return null;

  return {
    id,
    name: parseLocalizedText(item.name),
    kind: normalizeFleetKind(String(item.kind ?? "van")),
    passengers,
    guideSeats: Number.isFinite(guideSeats) ? guideSeats : 0,
    image: typeof item.image === "string" ? item.image : "",
    galleryImages: asStringArray(item.galleryImages),
    videoUrl: typeof item.videoUrl === "string" ? item.videoUrl : null,
    plate: typeof item.plate === "string" ? item.plate : null,
    insuranceExpiresOn:
      typeof item.insuranceExpiresOn === "string" ? item.insuranceExpiresOn : null,
    inspectionExpiresOn:
      typeof item.inspectionExpiresOn === "string" ? item.inspectionExpiresOn : null,
    availableIn: asStringArray(item.availableIn),
    interiorColor: parseLocalizedText(item.interiorColor),
    bodyColor: parseLocalizedText(item.bodyColor),
    extras: parseLocalizedLines(item.extras),
    summary: parseLocalizedText(item.summary),
    description: parseLocalizedLines(item.description),
    closingNotes: parseLocalizedLines(item.closingNotes),
    readinessNote: typeof item.readinessNote === "string" ? item.readinessNote : null,
    isActive: item.isActive !== false,
  };
}

export function fleetVehicleToRow(vehicle: FleetVehicle): FleetVehicleRow {
  return {
    id: vehicle.id,
    name: vehicle.name,
    kind: vehicle.kind,
    passengers: vehicle.passengers,
    guide_seats: vehicle.guideSeats,
    image: vehicle.image,
    gallery_images: vehicle.galleryImages,
    video_url: vehicle.videoUrl,
    plate: vehicle.plate,
    insurance_expires_on: vehicle.insuranceExpiresOn,
    inspection_expires_on: vehicle.inspectionExpiresOn,
    available_in: vehicle.availableIn,
    interior_color: vehicle.interiorColor,
    body_color: vehicle.bodyColor,
    extras: vehicle.extras,
    summary: vehicle.summary,
    description: vehicle.description,
    closing_notes: vehicle.closingNotes,
    readiness_note: vehicle.readinessNote,
    is_active: vehicle.isActive,
  };
}

export function emptyFleetLocalized(): Localized {
  return localizedFromSeed("");
}
