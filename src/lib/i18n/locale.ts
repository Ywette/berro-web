export const locales = ["lv", "en", "fr", "ru"] as const;

export type Locale = (typeof locales)[number];

export const LOCALE_COOKIE = "berro-locale";

export const intlLocales: Record<Locale, string> = {
  lv: "lv-LV",
  en: "en-GB",
  fr: "fr-FR",
  ru: "ru-RU",
};

export type Localized<T = string> = {
  lv: T;
  en: T;
  fr?: T;
  ru?: T;
};

export function parseLocale(value: string | undefined | null): Locale {
  if (value === "en" || value === "fr" || value === "ru" || value === "lv") return value;
  return "lv";
}

export function pickLocalized<T>(value: Localized<T>, locale: Locale): T {
  if (locale === "fr") return (value.fr ?? value.en) as T;
  if (locale === "ru") return (value.ru ?? value.lv) as T;
  return value[locale] as T;
}
