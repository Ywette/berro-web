import type { Locale } from "@/lib/i18n/dictionary";

export function formatEuro(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "lv" ? "lv-LV" : "en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
