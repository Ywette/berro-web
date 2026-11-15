import { transportModels } from "@/lib/content/transport/models";
import { transportPhotos } from "@/lib/content/transport/photos";
import type {
  TransportKind,
  TransportModel,
  TransportPhoto,
  TransportSectionId,
  TransportUnit,
  TransportUnitView,
} from "@/lib/content/transport/types";
import { transportSectionAnchors } from "@/lib/content/transport/types";
import { transportUnits } from "@/lib/content/transport/units";

export type {
  TransportKind,
  TransportModel,
  TransportPhoto,
  TransportSectionId,
  TransportUnit,
  TransportUnitView,
} from "@/lib/content/transport/types";
export { transportSectionAnchors } from "@/lib/content/transport/types";

const sectionKinds: Record<TransportSectionId, TransportKind[]> = {
  minibuses: ["van", "minibus"],
  coaches: ["coach"],
  carRental: ["vip"],
  retroCarRental: ["retro"],
};

export const transportSections: TransportSectionId[] = [
  "minibuses",
  "coaches",
  "carRental",
  "retroCarRental",
];

export function transportSectionHref(section: TransportSectionId) {
  return `/autoparks#${transportSectionAnchors[section]}`;
}

export { transportModels } from "@/lib/content/transport/models";
export { transportPhotos } from "@/lib/content/transport/photos";
export { transportUnits } from "@/lib/content/transport/units";

export function findTransportPhoto(id: string): TransportPhoto | null {
  return transportPhotos.find((photo) => photo.id === id) ?? null;
}

export function findTransportModel(id: string): TransportModel | null {
  return transportModels.find((model) => model.id === id) ?? null;
}

export function findTransportUnit(id: string): TransportUnit | null {
  return transportUnits.find((unit) => unit.id === id) ?? null;
}

export function getTransportPhotoSrc(photoId: string): string | null {
  return findTransportPhoto(photoId)?.src ?? null;
}

export function listGalleryPhotos(): TransportPhoto[] {
  return transportPhotos.filter((photo) => photo.showInGallery);
}

export function listModelPhotos(modelId: string): TransportPhoto[] {
  const model = findTransportModel(modelId);
  if (!model) return [];
  const ids = [...new Set([model.primaryPhotoId, ...model.galleryPhotoIds])];
  return ids
    .map((id) => findTransportPhoto(id))
    .filter((photo): photo is TransportPhoto => Boolean(photo));
}

export function listActiveTransportUnits(): TransportUnit[] {
  return transportUnits.filter((unit) => unit.isActive);
}

export function toTransportUnitView(unit: TransportUnit): TransportUnitView | null {
  const model = findTransportModel(unit.modelId);
  if (!model) return null;
  const image = getTransportPhotoSrc(model.primaryPhotoId);
  if (!image) return null;

  return {
    ...unit,
    name: model.name,
    passengers: model.passengers,
    guideSeats: model.guideSeats,
    kind: model.kind,
    image,
    modelSummary: model.summary,
    galleryPhotoIds: model.galleryPhotoIds,
  };
}

/** Display seats as "16/17" when a guide seat is available. */
export function formatTransportSeats(model: Pick<TransportModel, "passengers" | "guideSeats">) {
  const total = model.passengers + model.guideSeats;
  if (model.guideSeats <= 0) return String(model.passengers);
  return `${model.passengers}/${total}`;
}

export function listTransportUnitViews(): TransportUnitView[] {
  return transportUnits
    .map(toTransportUnitView)
    .filter((unit): unit is TransportUnitView => Boolean(unit));
}

export function listModelsForSection(section: TransportSectionId): TransportModel[] {
  const kinds = sectionKinds[section];
  return transportModels.filter((model) => kinds.includes(model.kind));
}

/** Convert a YouTube watch/share URL into an embeddable URL. */
export function toYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\//, "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/embed/")) return url;
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}
