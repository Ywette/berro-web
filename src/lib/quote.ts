import type { Dictionary } from "@/lib/i18n/dictionary";

const tripIds = ["One-Way", "Round Trip", "Hourly Charter"] as const;

export function quoteMessage(
  input: {
    trip?: string;
    pickup?: string;
    dropoff?: string;
    departure?: string;
    returnAt?: string;
    passengers?: string;
  },
  dictionary: Dictionary,
) {
  if (!input.pickup && !input.dropoff && !input.departure) {
    return "";
  }

  const tripId = tripIds.find((id) => id === input.trip) ?? "One-Way";
  const tripLabel = {
    "One-Way": dictionary.quote.oneWay,
    "Round Trip": dictionary.quote.roundTrip,
    "Hourly Charter": dictionary.quote.hourly,
  }[tripId];

  return [
    `${dictionary.quote.trip}: ${tripLabel}`,
    `${dictionary.quote.pickup}: ${input.pickup || "—"}`,
    `${dictionary.quote.dropoff}: ${input.dropoff || "—"}`,
    `${dictionary.quote.departure}: ${input.departure || "—"}`,
    tripId === "Round Trip" ? `${dictionary.quote.return}: ${input.returnAt || "—"}` : null,
    `${dictionary.quote.passengers}: ${input.passengers || "—"}`,
    "",
    dictionary.quote.pleaseQuote,
  ]
    .filter((line) => line !== null)
    .join("\n");
}
