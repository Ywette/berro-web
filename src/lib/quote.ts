import type { Dictionary, Locale } from "@/lib/i18n/dictionary";
import { intlLocales } from "@/lib/i18n/locale";
import type { TripRoute } from "@/lib/places/types";
import { isQuoteTripKind, quoteTripKinds, quoteTripLabel } from "@/lib/quote-trips";
import { formatTravelTypeLabel } from "@/lib/quote-travel-types";
import { formatDate } from "@/lib/content/format-date";

export function formatTripDate(value: string | undefined, locale: Locale) {
  void locale;
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return value;
  return `${formatDate(value)} ${match[4]}:${match[5]}`;
}

export function formatDistance(route: TripRoute, locale: Locale) {
  if (route.distanceKm === null) return null;
  const km = new Intl.NumberFormat(intlLocales[locale]).format(route.distanceKm);
  return `${route.estimated ? "≈ " : ""}${km} km`;
}

export function formatDuration(minutes: number | null, locale: Locale = "en") {
  if (minutes === null) return null;
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const remainder = minutes % 60;
  const dayLabel = locale === "lv" ? (days === 1 ? "diena" : "dienas")
    : locale === "fr" ? (days === 1 ? "jour" : "jours")
    : locale === "ru" ? "дн." : (days === 1 ? "day" : "days");
  return [days ? `${days} ${dayLabel}` : null, hours ? `${hours} h` : null,
    remainder || (!days && !hours) ? `${remainder} min` : null].filter(Boolean).join(" ");
}

export function quoteMessage(
  input: {
    trip?: string;
    travelType?: string;
    travelTypeDetail?: string;
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

  const tripId = isQuoteTripKind(input.trip) ? input.trip : quoteTripKinds[0];
  const tripLabel = quoteTripLabel(tripId, dictionary);
  const travelTypeLabel = input.travelType
    ? formatTravelTypeLabel(
        input.travelType,
        input.travelTypeDetail,
        dictionary.quote.travelTypeOptions,
      )
    : null;
  const distance = route ? formatDistance(route, dictionary.locale) : null;
  const duration = route ? formatDuration(route.durationMinutes) : null;

  return [
    `${dictionary.quote.trip}: ${tripLabel}`,
    travelTypeLabel
      ? `${dictionary.quote.travelTypeLabel}: ${travelTypeLabel}`
      : null,
    `${dictionary.quote.pickup}: ${input.pickup || "—"}`,
    `${dictionary.quote.dropoff}: ${input.dropoff || "—"}`,
    distance ? `${dictionary.quote.distance}: ${distance}` : null,
    duration ? `${dictionary.quote.drivingTime}: ${duration}` : null,
    `${dictionary.quote.departure}: ${formatTripDate(input.departure, dictionary.locale) || "—"}`,
    input.returnAt
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
