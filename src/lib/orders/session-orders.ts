import { isValidContactPhone, sanitizeContactPhone } from "@/lib/contact/validation";
import { tripDurationDays } from "@/lib/orders/trip-duration";
import { decodeStops, totalWaitingMinutes } from "@/lib/orders/stops";
import { isOrderStatus, type StaffOrder } from "@/types/dashboard";

export const SESSION_ORDERS_KEY = "berro-crm-demo-orders";

export type QuoteTripMode = "oneWay" | "roundTrip";

export type QuoteOrderInput = {
  locale?: string;
  trip?: string;
  tripMode?: QuoteTripMode | string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  heardAbout?: string;
  heardAboutDetail?: string;
  travelType?: string;
  travelTypeDetail?: string;
  pickupPlace?: string;
  dropoffPlace?: string;
  pickup?: string;
  dropoff?: string;
  departure?: string;
  returnAt?: string;
  passengers?: string;
  planDocument?: string;
  planDocumentPath?: string;
  /** Selected catalog excursion (quote from excursion view). */
  excursionSlug?: string;
  excursionTitle?: string;
  /** JSON array of { name, waitMinutes }. */
  stops?: string;
  otherWaitingMinutes?: string;
  waitingMinutes?: string;
};

export type QuoteRequiredField =
  | "name"
  | "email"
  | "phone"
  | "pickup"
  | "dropoff"
  | "passengers"
  | "departure"
  | "return";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function quoteFieldErrors(
  input: QuoteOrderInput,
  options?: { requireContact?: boolean },
): QuoteRequiredField[] {
  const errors: QuoteRequiredField[] = [];
  const requireContact = options?.requireContact !== false;

  if (requireContact) {
    const name = input.name?.trim() ?? "";
    if (name.length < 2 || name.length > 80) errors.push("name");

    const email = input.email?.trim() ?? "";
    if (!emailPattern.test(email)) errors.push("email");
  }

  const phone = sanitizeContactPhone(input.phone ?? "").trim();
  if (input.phone?.trim() && !isValidContactPhone(phone, { required: true })) {
    errors.push("phone");
  }

  if (!input.pickup?.trim()) errors.push("pickup");
  if (!input.dropoff?.trim()) errors.push("dropoff");

  const passengers = input.passengers?.trim() ?? "";
  const count = Number(passengers);
  if (!/^\d+$/.test(passengers) || count < 1 || count > 80) errors.push("passengers");

  const departure = travelDate(input.departure);
  if (!departure) errors.push("departure");

  if (input.returnAt?.trim()) {
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
    return Array.isArray(parsed)
      ? parsed.map((order) => ({ ...order, status: isOrderStatus(order.status) ? order.status : "new" }))
      : [];
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
  const visible = base.filter((order) => !(order.id.startsWith("demo-order-") &&
    typeof window !== "undefined" && window.sessionStorage.getItem(`hidden-${order.id}`)));
  const savedIds = new Set(visible.map((order) => order.id));
  return [...session.filter((order) => !savedIds.has(order.id)), ...visible.map((order) =>
    order.id.startsWith("demo-order-") ? session.find((item) => item.id === order.id) ?? order : order)];
}

export function orderFromQuoteInput(input: QuoteOrderInput): StaffOrder {
  const { destination, returnTo } = splitDropoff(input.dropoff);
  const stamp = Date.now();
  const reference = `ORD-${String(stamp).slice(-4)}`;
  const stops = decodeStops(input.stops);
  const otherWaiting = Number(input.otherWaitingMinutes ?? "");
  const waiting =
    Number(input.waitingMinutes ?? "") ||
    totalWaitingMinutes(stops, Number.isFinite(otherWaiting) ? otherWaiting : 0);
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `order-${stamp}`;

  return {
    id,
    reference,
    requestLocale: input.locale ?? null,
    createdAt: new Date(stamp).toISOString(),
    origin: (input.pickup || "—").trim() || "—",
    destination: destination || "—",
    returnTo,
    passengerCount: Number(input.passengers),
    requestorName: input.name?.trim() || null,
    requestorCompany: input.company?.trim() || null,
    requestorEmail: input.email?.trim() || null,
    requestorPhone: input.phone?.trim() || null,
    heardAbout: input.heardAbout?.trim() || null,
    heardAboutDetail: input.heardAboutDetail?.trim() || null,
    travelType: input.travelType?.trim() || null,
    travelTypeDetail: input.travelTypeDetail?.trim() || null,
    planDocument: input.planDocument?.trim() || null,
    planDocumentPath: input.planDocumentPath?.trim() || null,
    status: "new",
    departureOn: toDateOnly(input.departure),
    departureAt: input.departure ?? null,
    returnOn: toDateOnly(input.returnAt),
    tripDurationDays: tripDurationDays(toDateOnly(input.departure), toDateOnly(input.returnAt)),
    stops: stops.map((stop) => ({ name: stop.name, waitMinutes: stop.waitMinutes })),
    waitingMinutes: waiting > 0 ? waiting : null,
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
