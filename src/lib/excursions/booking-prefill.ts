import type { QuoteTripMode } from "@/lib/orders/session-orders";
import type { QuoteTravelType } from "@/lib/quote-travel-types";

export type ExcursionQuoteOption = {
  slug: string;
  title: string;
  route?: string;
  teaser?: string;
  destination?: string;
  durationDays?: number | null;
};

export type ExcursionBookingPrefill = {
  service: "bus" | "minibus" | "transfer";
  pickup: string;
  dropoff: string;
  tripMode: QuoteTripMode;
  stops: string[];
  travelType: QuoteTravelType;
  travelTypeDetail: string;
  planNote: string;
  excursionSlug: string;
  excursionTitle: string;
  durationDays: number | null;
};

/** Shift a `YYYY-MM-DDTHH:mm` value by whole calendar days (local wall clock). */
export function shiftDatetimeLocal(value: string, days: number): string {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match || !Number.isFinite(days) || days === 0) return value;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const date = new Date(year, month - 1, day + days, hour, minute);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

export function returnAtFromDeparture(departureAt: string, durationDays: number | null | undefined) {
  if (!departureAt.trim()) return "";
  const days = durationDays && durationDays >= 1 ? durationDays : 1;
  return shiftDatetimeLocal(departureAt, days - 1);
}

function normalizePlace(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Split "Riga → Paris → Riga" / "Rīga – Parīze" style route strings. */
export function parseExcursionRoute(route: string): {
  pickup: string;
  dropoff: string;
  tripMode: QuoteTripMode;
  stops: string[];
} {
  const parts = route
    .split(/\s*(?:→|->|—|–|-)\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { pickup: "", dropoff: "", tripMode: "roundTrip", stops: [] };
  }

  const pickup = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  const roundTrip =
    parts.length >= 2 && normalizePlace(pickup) === normalizePlace(last);

  if (roundTrip) {
    const destination = parts[1] ?? pickup;
    return {
      pickup,
      dropoff: destination,
      tripMode: "roundTrip",
      // Extra midpoints after the main destination, before return home.
      stops: parts.slice(2, -1),
    };
  }

  return {
    pickup,
    dropoff: last,
    tripMode: "oneWay",
    stops: parts.slice(1, -1),
  };
}

export function buildExcursionBookingPrefill(input: {
  slug?: string;
  title: string;
  route?: string;
  teaser?: string;
  destination?: string;
  durationDays?: number | null;
}): ExcursionBookingPrefill {
  const title = input.title.trim();
  const fromRoute = input.route?.trim()
    ? parseExcursionRoute(input.route)
    : {
        pickup: "Rīga",
        dropoff: input.destination?.trim() || title,
        tripMode: "roundTrip" as const,
        stops: [] as string[],
      };

  const noteParts = [title, input.teaser?.trim()].filter(Boolean);
  const durationDays =
    typeof input.durationDays === "number" && input.durationDays >= 1
      ? input.durationDays
      : null;

  return {
    service: "minibus",
    pickup: fromRoute.pickup || "Rīga",
    dropoff: fromRoute.dropoff || title,
    tripMode: fromRoute.tripMode,
    stops: fromRoute.stops,
    travelType: "agencyTourism",
    travelTypeDetail: "",
    planNote: noteParts.join("\n\n"),
    excursionSlug: input.slug?.trim() || "",
    excursionTitle: title,
    durationDays,
  };
}
