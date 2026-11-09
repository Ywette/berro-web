import type { Locale } from "@/lib/i18n/dictionary";

export function formatPostDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "lv" ? "lv-LV" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
