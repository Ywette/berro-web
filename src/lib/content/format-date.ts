import { intlLocales, type Locale } from "@/lib/i18n/locale";

export function formatPostDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocales[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
