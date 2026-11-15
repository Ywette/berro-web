export const quoteHeardAboutSources = [
  "facebook",
  "google",
  "ai",
  "tiktok",
  "instagram",
  "friends",
  "other",
] as const;

export type QuoteHeardAboutSource = (typeof quoteHeardAboutSources)[number];

export function isQuoteHeardAboutSource(value: string): value is QuoteHeardAboutSource {
  return quoteHeardAboutSources.includes(value as QuoteHeardAboutSource);
}

export function formatHeardAboutLabel(
  source: string | null | undefined,
  detail: string | null | undefined,
  options: Record<QuoteHeardAboutSource, string>,
): string {
  if (!source) return "—";
  if (isQuoteHeardAboutSource(source)) {
    if (source === "other") {
      const note = detail?.trim();
      return note ? `${options.other}: ${note}` : options.other;
    }
    return options[source];
  }
  return source;
}
