import type { FleetVehicle } from "@/lib/content/fleet";
import {
  getTransportPhotoSrc,
  listModelPhotos,
  transportModels,
} from "@/lib/content/transport";
import type { Localized } from "@/lib/i18n/locale";
import {
  localizedFromSeed,
  type LocalizedLines,
} from "@/lib/i18n/localized-content";

function paragraphsToLines(paragraphs: Localized[]): LocalizedLines {
  return {
    lv: paragraphs.map((item) => item.lv),
    en: paragraphs.map((item) => item.en),
    fr: paragraphs.map((item) => item.fr ?? item.en),
    ru: paragraphs.map((item) => item.ru ?? item.lv),
  };
}

function extrasToLines(extras: Localized[]): LocalizedLines {
  return paragraphsToLines(extras);
}

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
        name: localizedFromSeed(model.name),
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
        interiorColor: model.interiorColor,
        bodyColor: model.bodyColor,
        extras: extrasToLines(model.extras),
        summary: model.summary,
        description: paragraphsToLines(model.description),
        closingNotes: paragraphsToLines(model.closingNotes),
        readinessNote: null,
        isActive: true,
      };
    })
    .filter((vehicle): vehicle is FleetVehicle => vehicle !== null);
}
