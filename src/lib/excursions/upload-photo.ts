import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export const EXCURSION_PHOTOS_BUCKET = "excursion-photos";
/** Stay under Vercel’s ~4.5MB request body when uploading one file at a time. */
export const EXCURSION_PHOTO_MAX_BYTES = 4 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type ExcursionPhotoUploadError = "type" | "size" | "empty" | "config";

export class ExcursionPhotoUploadException extends Error {
  constructor(readonly code: ExcursionPhotoUploadError) {
    super(code);
  }
}

async function ensureExcursionPhotosBucket(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("[excursions] list buckets failed", listError.message);
    return { ok: false as const, error: listError.message };
  }
  if (buckets?.some((bucket) => bucket.name === EXCURSION_PHOTOS_BUCKET)) {
    return { ok: true as const };
  }

  const { error: createError } = await supabase.storage.createBucket(EXCURSION_PHOTOS_BUCKET, {
    public: true,
    fileSizeLimit: EXCURSION_PHOTO_MAX_BYTES,
    allowedMimeTypes: [...ALLOWED_TYPES],
  });

  if (createError && !/already exists|duplicate/i.test(createError.message)) {
    console.error("[excursions] create bucket failed", createError.message);
    return {
      ok: false as const,
      error:
        "Storage bucket `excursion-photos` is missing. Run supabase/migrations/005_excursion_photos.sql in the Supabase SQL Editor.",
    };
  }

  return { ok: true as const };
}

async function saveLocalFallback(file: File): Promise<string> {
  const publicFolder = "excursions/uploads";
  const dir = path.join(process.cwd(), "public", publicFolder);
  await mkdir(dir, { recursive: true });
  const ext = EXT_BY_TYPE[file.type] ?? "jpg";
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.byteLength === 0) {
    throw new ExcursionPhotoUploadException("empty");
  }
  await writeFile(path.join(dir, filename), bytes);
  return `/${publicFolder}/${filename}`;
}

/** Upload one collage photo; prefers Supabase public storage, falls back to /public locally. */
export async function uploadExcursionPhoto(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new ExcursionPhotoUploadException("type");
  }
  if (file.size > EXCURSION_PHOTO_MAX_BYTES) {
    throw new ExcursionPhotoUploadException("size");
  }
  if (file.size <= 0) {
    throw new ExcursionPhotoUploadException("empty");
  }

  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return saveLocalFallback(file);
  }

  const bucket = await ensureExcursionPhotosBucket(supabase);
  if (!bucket.ok) {
    throw new Error(bucket.error);
  }

  const ext = EXT_BY_TYPE[file.type] ?? "jpg";
  const objectPath = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength === 0) {
    throw new ExcursionPhotoUploadException("empty");
  }

  const { error } = await supabase.storage.from(EXCURSION_PHOTOS_BUCKET).upload(objectPath, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("[excursions] photo upload failed", error.message);
    if (/bucket not found/i.test(error.message)) {
      throw new Error(
        "Storage bucket `excursion-photos` is missing. Run supabase/migrations/005_excursion_photos.sql in the Supabase SQL Editor.",
      );
    }
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(EXCURSION_PHOTOS_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}
