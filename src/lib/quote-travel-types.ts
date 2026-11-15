export const quoteTravelTypes = [
  "schoolClass",
  "sportsTeam",
  "corporate",
  "businessPartners",
  "privateFamily",
  "agencyTourism",
  "airportTransfer",
  "weddingEvent",
  "other",
] as const;

export type QuoteTravelType = (typeof quoteTravelTypes)[number];

export function isQuoteTravelType(value: string | undefined | null): value is QuoteTravelType {
  return Boolean(value && (quoteTravelTypes as readonly string[]).includes(value));
}

export function formatTravelTypeLabel(
  type: string | null | undefined,
  detail: string | null | undefined,
  options: Record<QuoteTravelType, string>,
): string {
  if (!type) return "—";
  if (isQuoteTravelType(type)) {
    if (type === "other") {
      const note = detail?.trim();
      return note ? `${options.other}: ${note}` : options.other;
    }
    return options[type];
  }
  return type;
}
