import { EXCURSION_PHOTO_MAX_BYTES } from "@/lib/excursions/photo-limits";

const MAX_EDGE = 2400;
const QUALITIES = [0.86, 0.78, 0.7, 0.6, 0.5, 0.42];

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

/** Resize/compress a collage photo so it stays under the upload byte limit. */
export async function prepareExcursionPhoto(
  file: File,
  maxBytes = EXCURSION_PHOTO_MAX_BYTES,
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size <= maxBytes) return file;

  const bitmap = await createImageBitmap(file);
  try {
    let { width, height } = scaleSize(bitmap.width, bitmap.height, MAX_EDGE);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return file;

    let outputType = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
    // Animated/large GIFs compress more reliably as JPEG for collage use.
    if (file.type === "image/gif") outputType = "image/jpeg";

    for (let pass = 0; pass < 4; pass += 1) {
      canvas.width = width;
      canvas.height = height;
      context.clearRect(0, 0, width, height);
      context.drawImage(bitmap, 0, 0, width, height);

      for (const quality of QUALITIES) {
        const blob = await canvasToBlob(canvas, outputType, quality);
        if (!blob) continue;
        if (blob.size <= maxBytes) {
          const extension = outputType === "image/png" ? "png" : outputType === "image/webp" ? "webp" : "jpg";
          const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
          return new File([blob], `${baseName}.${extension}`, {
            type: outputType,
            lastModified: Date.now(),
          });
        }
      }

      width = Math.max(1, Math.round(width * 0.75));
      height = Math.max(1, Math.round(height * 0.75));
      outputType = "image/jpeg";
    }
  } finally {
    bitmap.close();
  }

  throw new Error("Could not compress image under the size limit.");
}
