import type { Dictionary } from "@/lib/i18n/dictionary";

export const quoteTripKinds = ["Bus Rental", "Minibus Rental", "Transfer", "Excursions"] as const;

export type QuoteTripKind = (typeof quoteTripKinds)[number];

export function isQuoteTripKind(value: string | undefined | null): value is QuoteTripKind {
  return Boolean(value && (quoteTripKinds as readonly string[]).includes(value));
}

export function quoteTripLabel(trip: string | undefined, dictionary: Dictionary) {
  const kind = isQuoteTripKind(trip) ? trip : quoteTripKinds[0];
  return {
    "Bus Rental": dictionary.quote.busRental,
    "Minibus Rental": dictionary.quote.minibusRental,
    Transfer: dictionary.quote.transfer,
    Excursions: dictionary.quote.excursionsType,
  }[kind];
}
