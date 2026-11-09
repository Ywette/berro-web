import type { StaffOrder } from "@/types/dashboard";

export const SESSION_ORDERS_KEY = "berro-crm-demo-orders";

export type QuoteOrderInput = {
  trip?: string;
  pickup?: string;
  dropoff?: string;
  departure?: string;
  returnAt?: string;
  passengers?: string;
  planDocument?: string;
};

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
    passengerCount: Math.max(1, Number(input.passengers) || 1),
    requestorName: null,
    requestorEmail: null,
    requestorPhone: null,
    status: "new",
    departureOn: toDateOnly(input.departure),
    returnOn: toDateOnly(input.returnAt),
    assignedDriverId: null,
    assignedDriverName: null,
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
