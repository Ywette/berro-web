import { EXCURSION_PHOTO_MAX_BYTES } from "@/lib/excursions/photo-limits";

/** Collage display size; smaller = faster encode + upload. */
const MAX_EDGE = 1600;
/** Aim well under the hard limit so we rarely need retry passes. */
const TARGET_BYTES = 1.25 * 1024 * 1024;

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function scaleSize(width: number, height: number, maxEdge: number) {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function toJpegFile(blob: Blob, originalName: string): File {
  const baseName = originalName.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

/** Resize/compress a collage photo for fast upload under the byte limit. */
export async function prepareExcursionPhoto(
  file: File,
  maxBytes = EXCURSION_PHOTO_MAX_BYTES,
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  // Already small enough for a quick upload — skip canvas work.
  if (file.size <= TARGET_BYTES) return file;

  const bitmap = await createImageBitmap(file);
  try {
    let { width, height } = scaleSize(bitmap.width, bitmap.height, MAX_EDGE);
    // Extra downscale when the source file is very large.
    if (file.size > 8 * 1024 * 1024) {
      width = Math.max(1, Math.round(width * 0.85));
      height = Math.max(1, Math.round(height * 0.85));
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return file;

    const attempts: { edgeScale: number; quality: number }[] = [
      { edgeScale: 1, quality: 0.72 },
      { edgeScale: 1, quality: 0.58 },
      { edgeScale: 0.75, quality: 0.55 },
    ];

    for (const attempt of attempts) {
      const w = Math.max(1, Math.round(width * attempt.edgeScale));
      const h = Math.max(1, Math.round(height * attempt.edgeScale));
      canvas.width = w;
      canvas.height = h;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, w, h);
      context.drawImage(bitmap, 0, 0, w, h);

      const blob = await canvasToBlob(canvas, "image/jpeg", attempt.quality);
      if (!blob) continue;
      if (blob.size <= maxBytes) {
        return toJpegFile(blob, file.name);
      }
    }
  } finally {
    bitmap.close();
  }

  throw new Error("Could not compress image under the size limit.");
}
