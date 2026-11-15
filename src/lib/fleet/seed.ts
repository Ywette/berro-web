import type { FleetVehicle } from "@/lib/content/fleet";
import {
  getTransportPhotoSrc,
  listModelPhotos,
  transportModels,
} from "@/lib/content/transport";

/** Built-in fleet rows from the committed transport catalog (works on Vercel). */
export function buildFleetSeed(): FleetVehicle[] {
  return transportModels
    .map((model): FleetVehicle | null => {
      const photos = listModelPhotos(model.id);
      const galleryImages = photos.map((photo) => photo.src).filter(Boolean);
      const image =
        galleryImages[0] ?? getTransportPhotoSrc(model.primaryPhotoId) ?? "";
      if (!image) return null;

      return {
        id: `fleet-seed-${model.id}`,
        name: model.name,
        kind: model.kind,
        passengers: model.passengers,
        guideSeats: model.guideSeats,
        image,
        galleryImages: galleryImages.length > 0 ? galleryImages : [image],
        videoUrl: model.videoUrl ?? null,
        plate: null,
        insuranceExpiresOn: null,
        inspectionExpiresOn: null,
        availableIn: ["LV"],
        interiorColor: model.interiorColor.lv,
        bodyColor: model.bodyColor.lv,
        extras: model.extras.map((item) => item.lv),
        summary: model.summary.lv,
        description: model.description.map((item) => item.lv),
        closingNotes: model.closingNotes.map((item) => item.lv),
        readinessNote: null,
        isActive: true,
      };
    })
    .filter((vehicle): vehicle is FleetVehicle => vehicle !== null);
}
