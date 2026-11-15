import type { TransportKind } from "@/lib/content/transport/types";

export type FleetCategoryId = "minibuses" | "coaches" | "carRental" | "retroCarRental";

export type FleetModel = {
  id: FleetCategoryId;
  /** Display range, e.g. "12–17". */
  passengers: string;
  image: string;
};

/** Staff + Autoparks transport record (file-backed store). */
export type FleetVehicle = {
  id: string;
  name: string;
  kind: TransportKind;
  passengers: number;
  guideSeats: number;
  /** Main / primary photo path. */
  image: string;
  /** All photos in display order (includes the main photo). */
  galleryImages: string[];
  videoUrl: string | null;
  plate: string | null;
  insuranceExpiresOn: string | null;
  inspectionExpiresOn: string | null;
  /** ISO country codes where this vehicle can operate. */
  availableIn: string[];
  interiorColor: string;
  bodyColor: string;
  extras: string[];
  summary: string;
  description: string[];
  closingNotes: string[];
  readinessNote: string | null;
  isActive: boolean;
};

/** Category cards for the public landing page fleet preview. */
export const fleetModels: FleetModel[] = [
  {
    id: "minibuses",
    passengers: "12–17",
    image: "/fleet/sprinter-black.jpg",
  },
  {
    id: "coaches",
    passengers: "25–49",
    image: "/fleet/coach-white.jpg",
  },
  {
    id: "carRental",
    passengers: "1–3",
    image: "/fleet/mercedes-s-class-black.jpg",
  },
  {
    id: "retroCarRental",
    passengers: "1–3",
    image: "/fleet/retro-horch.jpg",
  },
];

/** Legacy seed catalog — empty; staff fleet store is the source of truth. */
export const fleetCatalog: FleetVehicle[] = [];
