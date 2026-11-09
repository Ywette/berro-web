export type FleetModel = {
  id: string;
  name: string;
  passengers: number;
  image: string;
};

export type FleetVehicle = {
  id: string;
  name: string;
  passengers: number;
  image: string;
  plate: string | null;
  insuranceExpiresOn: string | null;
  inspectionExpiresOn: string | null;
  readinessNote: string | null;
  isActive: boolean;
};

/** Unique models for the public landing page. */
export const fleetModels: FleetModel[] = [
  {
    id: "model-sprinter-black",
    name: "Executive Mercedes Sprinter",
    passengers: 8,
    image: "/fleet/sprinter-black.jpg",
  },
  {
    id: "model-coach-white",
    name: "Van Hool CX45 Luxury Coach",
    passengers: 56,
    image: "/fleet/coach-white.jpg",
  },
  {
    id: "model-coach-silver",
    name: "Van Hool CX45 Luxury Coach",
    passengers: 14,
    image: "/fleet/sprinter-silver.jpg",
  },
  {
    id: "model-s-class",
    name: "Mercedes-Benz S-Class",
    passengers: 4,
    image: "/fleet/mercedes-s-class-black.jpg",
  },
];

/** Staff Autoparks units: three vehicles per model, each with its own dates. */
export const fleetCatalog: FleetVehicle[] = [
  // Executive Mercedes Sprinter × 3
  {
    id: "fleet-sprinter-black-1",
    name: "Executive Mercedes Sprinter",
    passengers: 8,
    image: "/fleet/sprinter-black.jpg",
    plate: "BT-1001",
    insuranceExpiresOn: "2027-03-12",
    inspectionExpiresOn: "2027-01-20",
    readinessNote: null,
    isActive: true,
  },
  {
    id: "fleet-sprinter-black-2",
    name: "Executive Mercedes Sprinter",
    passengers: 8,
    image: "/fleet/sprinter-black.jpg",
    plate: "BT-1002",
    insuranceExpiresOn: "2026-11-28",
    inspectionExpiresOn: "2027-05-04",
    readinessNote: null,
    isActive: true,
  },
  {
    id: "fleet-sprinter-black-3",
    name: "Executive Mercedes Sprinter",
    passengers: 8,
    image: "/fleet/sprinter-black.jpg",
    plate: "BT-1003",
    insuranceExpiresOn: "2026-09-01",
    inspectionExpiresOn: "2026-11-18",
    readinessNote: null,
    isActive: true,
  },
  // Van Hool CX45 56 pax × 3
  {
    id: "fleet-coach-white-1",
    name: "Van Hool CX45 Luxury Coach",
    passengers: 56,
    image: "/fleet/coach-white.jpg",
    plate: "BT-5601",
    insuranceExpiresOn: "2027-06-01",
    inspectionExpiresOn: "2026-12-10",
    readinessNote: null,
    isActive: true,
  },
  {
    id: "fleet-coach-white-2",
    name: "Van Hool CX45 Luxury Coach",
    passengers: 56,
    image: "/fleet/coach-white.jpg",
    plate: "BT-5602",
    insuranceExpiresOn: "2026-11-22",
    inspectionExpiresOn: "2027-02-14",
    readinessNote: null,
    isActive: true,
  },
  {
    id: "fleet-coach-white-3",
    name: "Van Hool CX45 Luxury Coach",
    passengers: 56,
    image: "/fleet/coach-white.jpg",
    plate: "BT-5603",
    insuranceExpiresOn: "2026-08-15",
    inspectionExpiresOn: "2026-10-02",
    readinessNote: null,
    isActive: true,
  },
  // Van Hool CX45 14 pax × 3
  {
    id: "fleet-coach-silver-1",
    name: "Van Hool CX45 Luxury Coach",
    passengers: 14,
    image: "/fleet/sprinter-silver.jpg",
    plate: "BT-1401",
    insuranceExpiresOn: "2027-04-22",
    inspectionExpiresOn: "2027-01-08",
    readinessNote: null,
    isActive: true,
  },
  {
    id: "fleet-coach-silver-2",
    name: "Van Hool CX45 Luxury Coach",
    passengers: 14,
    image: "/fleet/sprinter-silver.jpg",
    plate: "BT-1402",
    insuranceExpiresOn: "2026-12-05",
    inspectionExpiresOn: "2026-11-25",
    readinessNote: null,
    isActive: true,
  },
  {
    id: "fleet-coach-silver-3",
    name: "Van Hool CX45 Luxury Coach",
    passengers: 14,
    image: "/fleet/sprinter-silver.jpg",
    plate: "BT-1403",
    insuranceExpiresOn: "2026-07-12",
    inspectionExpiresOn: "2026-11-15",
    readinessNote: null,
    isActive: true,
  },
  // Mercedes-Benz S-Class × 3
  {
    id: "fleet-s-class-1",
    name: "Mercedes-Benz S-Class",
    passengers: 4,
    image: "/fleet/mercedes-s-class-black.jpg",
    plate: "BT-0401",
    insuranceExpiresOn: "2027-08-01",
    inspectionExpiresOn: "2027-03-01",
    readinessNote: null,
    isActive: true,
  },
  {
    id: "fleet-s-class-2",
    name: "Mercedes-Benz S-Class",
    passengers: 4,
    image: "/fleet/mercedes-s-class-black.jpg",
    plate: "BT-0402",
    insuranceExpiresOn: "2026-11-30",
    inspectionExpiresOn: "2027-06-18",
    readinessNote: null,
    isActive: true,
  },
  {
    id: "fleet-s-class-3",
    name: "Mercedes-Benz S-Class",
    passengers: 4,
    image: "/fleet/mercedes-s-class-black.jpg",
    plate: "BT-0403",
    insuranceExpiresOn: "2026-05-20",
    inspectionExpiresOn: "2026-11-12",
    readinessNote: null,
    isActive: true,
  },
];
