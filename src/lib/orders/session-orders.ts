import type { StaffOrder } from "@/types/dashboard";

export const SESSION_ORDERS_KEY = "berro-crm-demo-orders";

export type QuoteOrderInput = {
  trip?: string;
  name?: string;
  email?: string;
  phone?: string;
  pickup?: string;
  dropoff?: string;
  departure?: string;
  returnAt?: string;
  passengers?: string;
  planDocument?: string;
};

export type QuoteRequiredField =
  | "name"
  | "email"
  | "pickup"
  | "dropoff"
  | "passengers"
  | "departure"
  | "return";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function quoteFieldErrors(input: QuoteOrderInput): QuoteRequiredField[] {
  const errors: QuoteRequiredField[] = [];
  const name = input.name?.trim() ?? "";
  if (name.length < 2 || name.length > 80) errors.push("name");

  const email = input.email?.trim() ?? "";
  if (!emailPattern.test(email)) errors.push("email");

  if (!input.pickup?.trim()) errors.push("pickup");
  if (!input.dropoff?.trim()) errors.push("dropoff");

  const passengers = input.passengers?.trim() ?? "";
  const count = Number(passengers);
  if (!/^\d+$/.test(passengers) || count < 1 || count > 80) errors.push("passengers");

  const departure = travelDate(input.departure);
  if (!departure) errors.push("departure");

  if (input.trip === "Round Trip") {
    const returning = travelDate(input.returnAt);
    if (!returning || (departure && returning < departure)) errors.push("return");
  }

  return errors;
}

function travelDate(value: string | undefined) {
  const match = value?.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2})?$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
}

export function readSessionOrders(): StaffOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(SESSION_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StaffOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeSessionOrders(orders: StaffOrder[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_ORDERS_KEY, JSON.stringify(orders));
}

export function prependSessionOrder(order: StaffOrder) {
  const existing = readSessionOrders().filter((item) => item.id !== order.id);
  writeSessionOrders([order, ...existing]);
}

export function removeSessionOrderByReference(reference: string) {
  const next = readSessionOrders().filter((item) => item.reference !== reference);
  writeSessionOrders(next);
  return next;
}

export function mergeOrdersWithSession(base: StaffOrder[]): StaffOrder[] {
  const session = readSessionOrders();
  if (session.length === 0) return base;
  const ids = new Set(session.map((order) => order.id));
  return [...session, ...base.filter((order) => !ids.has(order.id))];
}

export function orderFromQuoteInput(input: QuoteOrderInput): StaffOrder {
  const { destination, returnTo } = splitDropoff(input.dropoff);
  const stamp = Date.now();
  const reference = `ORD-${String(stamp).slice(-4)}`;

  return {
    id: `session-order-${stamp}`,
    reference,
    origin: (input.pickup || "—").trim() || "—",
    destination: destination || "—",
    returnTo,
    passengerCount: Number(input.passengers),
    requestorName: input.name?.trim() || null,
    requestorEmail: input.email?.trim() || null,
    requestorPhone: input.phone?.trim() || null,
    status: "new",
    departureOn: toDateOnly(input.departure),
    returnOn: toDateOnly(input.returnAt),
    assignedDriverId: null,
    assignedDriverName: null,
    assignedGuideId: null,
    assignedGuideName: null,
    assignedVehicleId: null,
  };
}

function splitDropoff(dropoff: string | undefined) {
  const value = (dropoff || "").trim();
  if (!value) {
    return { destination: "", returnTo: null as string | null };
  }

  const separators = [" → ", "->", " – ", " - back to ", " back to "];
  for (const separator of separators) {
    const index = value.toLowerCase().indexOf(separator.toLowerCase());
    if (index >= 0) {
      return {
        destination: value.slice(0, index).trim(),
        returnTo: value.slice(index + separator.length).trim() || null,
      };
    }
  }

  return { destination: value, returnTo: null as string | null };
}

function toDateOnly(value: string | undefined) {
  if (!value) return null;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}
