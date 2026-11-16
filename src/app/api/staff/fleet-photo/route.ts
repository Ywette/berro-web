import { requireUser } from "@/lib/auth/session";
import { FleetPhotoUploadException, uploadFleetPhoto } from "@/lib/fleet/upload-photo";

export async function POST(request: Request) {
  await requireUser();

  try {
    const formData = await request.formData();
    const entry = formData.get("photo");
    if (typeof File === "undefined" || !(entry instanceof File) || entry.size <= 0) {
      return Response.json({ ok: false, error: "Missing photo" }, { status: 400 });
    }

    const url = await uploadFleetPhoto(entry);
    return Response.json({ ok: true, url });
  } catch (caught) {
    if (caught instanceof FleetPhotoUploadException) {
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
    console.error("[api/staff/fleet-photo]", message);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
