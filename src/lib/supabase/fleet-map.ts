import type { FleetVehicle } from "@/lib/content/fleet";
import { normalizeFleetKind } from "@/lib/fleet/kind";

export type FleetVehicleRow = {
  id: string;
  name: string;
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
  interior_color: string;
  body_color: string;
  extras: unknown;
  summary: string;
  description: unknown;
  closing_notes: unknown;
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
    name: row.name,
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
    interiorColor: row.interior_color ?? "",
    bodyColor: row.body_color ?? "",
    extras: asStringArray(row.extras),
    summary: row.summary ?? "",
    description: asStringArray(row.description),
    closingNotes: asStringArray(row.closing_notes),
    readinessNote: row.readiness_note,
    isActive: row.is_active !== false,
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
