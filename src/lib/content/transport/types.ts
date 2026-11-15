import type { Localized } from "@/lib/i18n/locale";

/** Coach / van / VIP / minibus / retro. */
export type TransportKind = "coach" | "van" | "vip" | "minibus" | "retro";

/** One image file under /public/transport/... */
export type TransportPhoto = {
  id: string;
  /** Public path, e.g. "/transport/vans/sprinter-lux-1-eiffel.jpg" */
  src: string;
  kind: TransportKind;
  alt: Localized;
  /** Include in About gallery. */
  showInGallery: boolean;
};

/** Vehicle model shown in Autoparks and order transport picks. */
export type TransportModel = {
  id: string;
  name: string;
  kind: TransportKind;
  /** Passenger seats (without guide). */
  passengers: number;
  /** Extra seat for guide when available (e.g. 16 + 1 = 17). */
  guideSeats: number;
  /** Main image for lists and cards. */
  primaryPhotoId: string;
  /** Extra photos for Autoparks / gallery. */
  galleryPhotoIds: string[];
  /** Optional YouTube watch or embed URL for Autoparks. */
  videoUrl?: string | null;
  interiorColor: Localized;
  bodyColor: Localized;
  extras: Localized[];
  summary: Localized;
  description: Localized[];
  closingNotes: Localized[];
};

/** Public Autoparks page sections. */
export type TransportSectionId = "minibuses" | "coaches" | "carRental" | "retroCarRental";

/** Stable URL hash anchors for Autoparks sections (LV-facing slugs). */
export const transportSectionAnchors: Record<TransportSectionId, string> = {
  minibuses: "Mikroautobusi",
  coaches: "Autobusi",
  carRental: "Auto-noma",
  retroCarRental: "Retro-auto-noma",
};

/** Physical unit (plate, insurance) assigned on orders. */
export type TransportUnit = {
  id: string;
  modelId: string;
  plate: string | null;
  insuranceExpiresOn: string | null;
  inspectionExpiresOn: string | null;
  readinessNote: string | null;
  isActive: boolean;
};

/** Unit + resolved model/photo fields for UI tables. */
export type TransportUnitView = TransportUnit & {
  name: string;
  passengers: number;
  guideSeats: number;
  kind: TransportKind;
  image: string;
  modelSummary: Localized;
  galleryPhotoIds: string[];
};
