import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { FLEET_PHOTO_MAX_BYTES, FLEET_PHOTO_MAX_COUNT } from "@/lib/fleet/photo-limits";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = FLEET_PHOTO_MAX_BYTES;

export { FLEET_PHOTO_MAX_BYTES, FLEET_PHOTO_MAX_COUNT };

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type FleetImageUploadError = "type" | "size" | "empty" | "count";

export class FleetImageUploadException extends Error {
  constructor(readonly code: FleetImageUploadError) {
    super(code);
  }
}

function isFile(value: FormDataEntryValue): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

/** Persist uploaded fleet photos under /public/transport/uploads and return public paths in order. */
export async function saveFleetImageUploads(
  entries: FormDataEntryValue[],
  options?: { maxCount?: number },
): Promise<string[]> {
  const files = entries.filter(isFile);
  if (files.length === 0) return [];
  if (files.length > (options?.maxCount ?? FLEET_PHOTO_MAX_COUNT)) {
    throw new FleetImageUploadException("count");
  }

  const dir = path.join(process.cwd(), "public", "transport", "uploads");
  await mkdir(dir, { recursive: true });

  const paths: string[] = [];
  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new FleetImageUploadException("type");
    }
    if (file.size > MAX_BYTES) {
      throw new FleetImageUploadException("size");
    }

    const ext = EXT_BY_TYPE[file.type] ?? "jpg";
    const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.byteLength === 0) {
      throw new FleetImageUploadException("empty");
    }

    await writeFile(path.join(dir, filename), bytes);
    paths.push(`/transport/uploads/${filename}`);
  }

  return paths;
}
