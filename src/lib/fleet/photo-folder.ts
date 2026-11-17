/** Public storage bucket for staff fleet vehicle photos. */
export const FLEET_PHOTOS_BUCKET = "fleet-photos";

/** Safe single path segment for Supabase Storage folders. */
export function sanitizeFleetStorageSegment(value: string, fallback = "vehicle"): string {
  const cleaned = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return cleaned || fallback;
}

/**
 * Per-vehicle folder under `fleet-photos`.
 * Example: `Mercedes-Benz-S-Class-fleet-abc12345`
 * Supabase creates the path on first upload (no explicit mkdir).
 */
export function fleetVehiclePhotoFolder(opts: { vehicleId: string; name?: string }): string {
  const idPart = sanitizeFleetStorageSegment(opts.vehicleId, "fleet-vehicle");
  const namePart = opts.name?.trim()
    ? sanitizeFleetStorageSegment(opts.name.trim(), "")
    : "";
  if (!namePart) return idPart;
  return sanitizeFleetStorageSegment(`${namePart}-${idPart}`, idPart);
}

/** Reuse folder from an existing public fleet-photos URL when editing. */
export function fleetPhotoFolderFromUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const marker = `/object/public/${FLEET_PHOTOS_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index < 0) return null;
  const rest = url.slice(index + marker.length);
  const folder = decodeURIComponent(rest.split("/")[0] ?? "").trim();
  if (!folder || folder.includes("..")) return null;
  return sanitizeFleetStorageSegment(folder, "");
}
