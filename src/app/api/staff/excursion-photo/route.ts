import { auth } from "@clerk/nextjs/server";
import {
  ExcursionPhotoUploadException,
  uploadExcursionPhoto,
} from "@/lib/excursions/upload-photo";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const entry = formData.get("photo");
    if (typeof File === "undefined" || !(entry instanceof File) || entry.size <= 0) {
      return Response.json({ ok: false, error: "Missing photo" }, { status: 400 });
    }

    const url = await uploadExcursionPhoto(entry);
    return Response.json({ ok: true, url });
  } catch (caught) {
    if (caught instanceof ExcursionPhotoUploadException) {
      const message =
        caught.code === "type"
          ? "Unsupported image type."
          : caught.code === "size"
            ? "Image is too large (max 4 MB per photo)."
            : "Invalid image.";
      return Response.json({ ok: false, error: message }, { status: 400 });
    }
    const message =
      caught instanceof Error && caught.message
        ? caught.message
        : "Could not upload photo.";
    console.error("[api/staff/excursion-photo]", message);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
