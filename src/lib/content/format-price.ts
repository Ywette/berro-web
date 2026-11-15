import { intlLocales, type Locale } from "@/lib/i18n/locale";

export function formatEuro(amount: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocales[locale], {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
