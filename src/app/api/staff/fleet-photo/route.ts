import { requireUser } from "@/lib/auth/session";
import { fleetVehiclePhotoFolder } from "@/lib/fleet/photo-folder";
import { FleetPhotoUploadException, uploadFleetPhoto } from "@/lib/fleet/upload-photo";

export async function POST(request: Request) {
  await requireUser();

  try {
    const formData = await request.formData();
    const entry = formData.get("photo");
    if (typeof File === "undefined" || !(entry instanceof File) || entry.size <= 0) {
      return Response.json({ ok: false, error: "Missing photo" }, { status: 400 });
    }

    const vehicleId = String(formData.get("vehicleId") ?? "").trim();
    const vehicleName = String(formData.get("vehicleName") ?? "").trim();
    const folderFromClient = String(formData.get("folder") ?? "").trim();

    if (!vehicleId && !folderFromClient) {
      return Response.json(
        { ok: false, error: "Missing vehicle folder for photo upload." },
        { status: 400 },
      );
    }

    const folder =
      folderFromClient ||
      fleetVehiclePhotoFolder({
        vehicleId: vehicleId || "vehicle",
        name: vehicleName || undefined,
      });

    const url = await uploadFleetPhoto(entry, { folder });
    return Response.json({ ok: true, url, folder });
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
