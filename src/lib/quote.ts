import type { Dictionary, Locale } from "@/lib/i18n/dictionary";
import type { TripRoute } from "@/lib/places/types";

const tripIds = ["One-Way", "Round Trip", "Hourly Charter"] as const;

const numberLocale: Record<Locale, string> = { lv: "lv-LV", en: "en-GB" };

export function formatTripDate(value: string | undefined, locale: Locale) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return value;
  const [, year, month, day, hour, minute] = match.map(Number);
  return new Intl.DateTimeFormat(numberLocale[locale], {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, hour, minute)));
}

export function formatDistance(route: TripRoute, locale: Locale) {
  if (route.distanceKm === null) return null;
  const km = new Intl.NumberFormat(numberLocale[locale]).format(route.distanceKm);
  return `${route.estimated ? "≈ " : ""}${km} km`;
}

export function formatDuration(minutes: number | null) {
  if (minutes === null) return null;
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours} h ${minutes % 60} min` : `${minutes} min`;
}

export function quoteMessage(
  input: {
    trip?: string;
    pickup?: string;
    dropoff?: string;
    departure?: string;
    returnAt?: string;
    passengers?: string;
    planDocument?: string;
  },
  dictionary: Dictionary,
  route: TripRoute | null = null,
) {
  if (!input.pickup && !input.dropoff && !input.departure && !input.planDocument) {
    return "";
  }

  const tripId = tripIds.find((id) => id === input.trip) ?? "One-Way";
  const tripLabel = {
    "One-Way": dictionary.quote.oneWay,
    "Round Trip": dictionary.quote.roundTrip,
    "Hourly Charter": dictionary.quote.hourly,
  }[tripId];
  const distance = route ? formatDistance(route, dictionary.locale) : null;
  const duration = route ? formatDuration(route.durationMinutes) : null;

  return [
    `${dictionary.quote.trip}: ${tripLabel}`,
    `${dictionary.quote.pickup}: ${input.pickup || "—"}`,
    `${dictionary.quote.dropoff}: ${input.dropoff || "—"}`,
    distance ? `${dictionary.quote.distance}: ${distance}` : null,
    duration ? `${dictionary.quote.drivingTime}: ${duration}` : null,
    `${dictionary.quote.departure}: ${formatTripDate(input.departure, dictionary.locale) || "—"}`,
    tripId === "Round Trip"
      ? `${dictionary.quote.return}: ${formatTripDate(input.returnAt, dictionary.locale) || "—"}`
      : null,
    `${dictionary.quote.passengers}: ${input.passengers || "—"}`,
    input.planDocument ? `${dictionary.pricing.planDocument}: ${input.planDocument}` : null,
    "",
    dictionary.quote.pleaseQuote,
  ]
    .filter((line) => line !== null)
    .join("\n");
}
