export function tripDurationDays(departure: string | null, arrival: string | null): number | null {
  if (!departure || !arrival) return null;
  const start = Date.parse(`${departure}T00:00:00Z`);
  const end = Date.parse(`${arrival}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
  return Math.round((end - start) / 86_400_000) + 1;
}

export function formatTripDuration(days: number | null, locale: string, plural: string): string {
  if (days === null) return "—";
  const singular = new Intl.PluralRules(locale).select(days) === "one";
  const word = singular ? ({ lv: "diena", en: "day", fr: "jour" }[locale] ?? plural) : plural;
  return `${days} ${word}`;
}
