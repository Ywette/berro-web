export const ORDER_STATUSES = [
  "new",
  "in_progress",
  "sent",
  "approved",
  "paid",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type StaffOrder = {
  id: string;
  reference: string;
  origin: string;
  destination: string;
  returnTo: string | null;
  passengerCount: number;
  requestorName: string | null;
  requestorEmail: string | null;
  requestorPhone: string | null;
  status: OrderStatus;
  departureOn: string | null;
  returnOn: string | null;
  stops: Array<{ name: string; waitMinutes: number }> | null;
  waitingMinutes: number | null;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  assignedGuideId: string | null;
  assignedGuideName: string | null;
  assignedVehicleId: string | null;
};

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.some((status) => status === value);
}

export type ExpiryState = "ok" | "attention" | "blocked" | "missing";

export function dateExpiryState(
  value: string | null,
  today = new Date(),
): ExpiryState {
  if (!value) {
    return "missing";
  }

  const expires = new Date(`${value}T00:00:00Z`);
  const startOfToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  if (expires < startOfToday) {
    return "blocked";
  }

  const inThirtyDays = new Date(startOfToday);
  inThirtyDays.setUTCDate(inThirtyDays.getUTCDate() + 30);

  if (expires <= inThirtyDays) {
    return "attention";
  }

  return "ok";
}

export function vehicleReadiness(
  insuranceExpiresOn: string | null,
  inspectionExpiresOn: string | null,
  today = new Date(),
): "ready" | "attention" | "blocked" {
  const states = [
    dateExpiryState(insuranceExpiresOn, today),
    dateExpiryState(inspectionExpiresOn, today),
  ];

  if (states.every((state) => state === "missing")) {
    return "attention";
  }
  if (states.includes("blocked")) {
    return "blocked";
  }
  if (states.includes("attention") || states.includes("missing")) {
    return "attention";
  }
  return "ready";
}
