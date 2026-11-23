import { intlLocales, type Locale } from "@/lib/i18n/locale";

export function formatEuro(amount: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocales[locale], {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatWaterPrice(travellers: number, locale: Locale) {
  const amount = new Intl.NumberFormat(intlLocales[locale], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format((travellers * 130) / 100);
  return `${amount} Eur`;
}
