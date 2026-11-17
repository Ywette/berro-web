import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { EXCURSION_PHOTO_MAX_BYTES } from "@/lib/excursions/photo-limits";
import {
  FLEET_PHOTOS_BUCKET,
  sanitizeFleetStorageSegment,
} from "@/lib/fleet/photo-folder";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export { FLEET_PHOTOS_BUCKET } from "@/lib/fleet/photo-folder";

/** Match excursion/Vercel single-request limit. */
export const FLEET_PHOTO_UPLOAD_MAX_BYTES = EXCURSION_PHOTO_MAX_BYTES;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type FleetPhotoUploadError = "type" | "size" | "empty";

export class FleetPhotoUploadException extends Error {
  constructor(readonly code: FleetPhotoUploadError) {
    super(code);
  }
}

async function ensureFleetPhotosBucket(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("[fleet] list buckets failed", listError.message);
    return { ok: false as const, error: listError.message };
  }
  if (buckets?.some((bucket) => bucket.name === FLEET_PHOTOS_BUCKET)) {
    return { ok: true as const };
  }

  const { error: createError } = await supabase.storage.createBucket(FLEET_PHOTOS_BUCKET, {
    public: true,
    fileSizeLimit: FLEET_PHOTO_UPLOAD_MAX_BYTES,
    allowedMimeTypes: [...ALLOWED_TYPES],
  });

  if (createError && !/already exists|duplicate/i.test(createError.message)) {
    console.error("[fleet] create bucket failed", createError.message);
    return {
      ok: false as const,
      error:
        "Storage bucket `fleet-photos` is missing. Run supabase/migrations/007_fleet_photos.sql in the Supabase SQL Editor.",
    };
  }

  return { ok: true as const };
}

async function saveLocalFallback(file: File, folder: string): Promise<string> {
  const publicFolder = path.posix.join("transport/uploads", folder);
  const dir = path.join(process.cwd(), "public", ...publicFolder.split("/"));
  await mkdir(dir, { recursive: true });
  const ext = EXT_BY_TYPE[file.type] ?? "jpg";
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.byteLength === 0) {
    throw new FleetPhotoUploadException("empty");
  }
  await writeFile(path.join(dir, filename), bytes);
  return `/${publicFolder}/${filename}`;
}

export type UploadFleetPhotoOptions = {
  /** Storage folder for this vehicle (created automatically on upload). */
  folder: string;
};

/** Upload one fleet photo into the vehicle folder; prefers Supabase, falls back to /public locally. */
export async function uploadFleetPhoto(
  file: File,
  options: UploadFleetPhotoOptions,
): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new FleetPhotoUploadException("type");
  }
  if (file.size > FLEET_PHOTO_UPLOAD_MAX_BYTES) {
    throw new FleetPhotoUploadException("size");
  }
  if (file.size <= 0) {
    throw new FleetPhotoUploadException("empty");
  }

  const rawFolder = options.folder.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!rawFolder || rawFolder.includes("..") || rawFolder.includes("/")) {
    throw new Error("Invalid photo folder.");
  }
  const folder = sanitizeFleetStorageSegment(rawFolder, "vehicle");

  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return saveLocalFallback(file, folder);
  }

  const bucket = await ensureFleetPhotosBucket(supabase);
  if (!bucket.ok) {
    throw new Error(bucket.error);
  }

  const ext = EXT_BY_TYPE[file.type] ?? "jpg";
  const objectPath = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength === 0) {
    throw new FleetPhotoUploadException("empty");
  }

  const { error } = await supabase.storage.from(FLEET_PHOTOS_BUCKET).upload(objectPath, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("[fleet] photo upload failed", error.message);
    if (/bucket not found/i.test(error.message)) {
      throw new Error(
        "Storage bucket `fleet-photos` is missing. Run supabase/migrations/007_fleet_photos.sql in the Supabase SQL Editor.",
      );
    }
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(FLEET_PHOTOS_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}
