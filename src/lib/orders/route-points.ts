import { createStop, DEFAULT_STOP_WAIT_MINUTES, type QuoteStop } from "@/lib/orders/stops";

export type RoutePoint = {
  id: string;
  place: string;
  placeId: string;
  date: string;
  time: string;
  waitMinutes: number;
};

export function createRoutePoint(
  partial: Partial<Omit<RoutePoint, "id">> & { place?: string } = {},
): RoutePoint {
  return {
    id: createId(),
    place: partial.place?.trim() ?? "",
    placeId: partial.placeId ?? "",
    date: partial.date ?? "",
    time: partial.time ?? "",
    waitMinutes:
      partial.waitMinutes == null ? DEFAULT_STOP_WAIT_MINUTES : Math.max(0, Math.round(partial.waitMinutes)),
  };
}

export function defaultRoutePoints(seed?: {
  pickup?: string;
  dropoff?: string;
  departureDate?: string;
  departureTime?: string;
  returnDate?: string;
  returnTime?: string;
}): RoutePoint[] {
  return [
    createRoutePoint({
      place: seed?.pickup ?? "",
      date: seed?.departureDate ?? "",
      time: seed?.departureTime ?? "",
      waitMinutes: 0,
    }),
    createRoutePoint({
      place: seed?.dropoff ?? "",
      date: seed?.returnDate || seed?.departureDate || "",
      time: seed?.returnTime || "",
      waitMinutes: DEFAULT_STOP_WAIT_MINUTES,
    }),
  ];
}

export function insertRoutePoint(points: RoutePoint[], index: number) {
  const next = [...points];
  const anchor = next[Math.max(0, Math.min(index, next.length - 1))];
  next.splice(index, 0, createRoutePoint({ date: anchor?.date ?? "", time: "", waitMinutes: DEFAULT_STOP_WAIT_MINUTES }));
  return next;
}

export function removeRoutePoint(points: RoutePoint[], id: string) {
  if (points.length <= 2) return points;
  return points.filter((point) => point.id !== id);
}

export function routePointsToQuote(points: RoutePoint[]) {
  const first = points[0];
  const last = points[points.length - 1];
  const middle = points.slice(1, -1);
  const stops: QuoteStop[] = [
    ...middle
      .filter((point) => point.place.trim())
      .map((point) => createStop(point.place, point.waitMinutes || DEFAULT_STOP_WAIT_MINUTES)),
  ];
  if (last?.place.trim() && last.waitMinutes > 0) {
    stops.push(createStop(last.place, last.waitMinutes));
  }

  return {
    pickup: first?.place.trim() ?? "",
    dropoff: last?.place.trim() ?? "",
    pickupPlace: first?.placeId ?? "",
    dropoffPlace: last?.placeId ?? "",
    departure: joinDateTime(first?.date ?? "", first?.time ?? ""),
    returnAt: joinDateTime(last?.date ?? "", last?.time ?? ""),
    stops,
    waitingMinutes: points.reduce((sum, point, index) => {
      if (index === 0) return sum;
      return sum + Math.max(0, point.waitMinutes);
    }, 0),
  };
}

export function joinDateTime(date: string, time: string) {
  const day = date.trim();
  const clock = time.trim();
  if (!day) return "";
  return clock ? `${day}T${clock}` : day;
}

export function splitDateTime(value: string | undefined) {
  const match = value?.match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/);
  return { date: match?.[1] ?? "", time: match?.[2] ?? "" };
}

/** Value for `<input type="datetime-local">` (`YYYY-MM-DDTHH:mm`). */
export function toDatetimeLocalInput(date: string, time: string) {
  const day = date.trim();
  if (!day) return "";
  const clock = time.trim();
  return `${day}T${clock || "00:00"}`;
}

export function fromDatetimeLocalInput(value: string) {
  return splitDateTime(value);
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `point-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
