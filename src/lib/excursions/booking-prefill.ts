import type { QuoteTripMode } from "@/lib/orders/session-orders";
import type { QuoteTravelType } from "@/lib/quote-travel-types";

export type ExcursionBookingPrefill = {
  service: "bus" | "minibus" | "transfer";
  pickup: string;
  dropoff: string;
  tripMode: QuoteTripMode;
  stops: string[];
  travelType: QuoteTravelType;
  travelTypeDetail: string;
  planNote: string;
};

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
  title: string;
  route?: string;
  teaser?: string;
  destination?: string;
}): ExcursionBookingPrefill {
  const fromRoute = input.route?.trim()
    ? parseExcursionRoute(input.route)
    : {
        pickup: "Rīga",
        dropoff: input.destination?.trim() || input.title,
        tripMode: "roundTrip" as const,
        stops: [] as string[],
      };

  const noteParts = [input.title.trim(), input.teaser?.trim()].filter(Boolean);

  return {
    service: "minibus",
    pickup: fromRoute.pickup || "Rīga",
    dropoff: fromRoute.dropoff || input.title,
    tripMode: fromRoute.tripMode,
    stops: fromRoute.stops,
    travelType: "agencyTourism",
    travelTypeDetail: "",
    planNote: noteParts.join("\n\n"),
  };
}
