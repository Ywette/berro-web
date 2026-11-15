import type { Localized } from "@/lib/i18n/locale";

/** Countries where a vehicle can be offered. */
export const fleetCountries = [
  { code: "LV", name: { lv: "Latvija", en: "Latvia", fr: "Lettonie", ru: "Латвия" } },
  { code: "EE", name: { lv: "Igaunija", en: "Estonia", fr: "Estonie", ru: "Эстония" } },
  { code: "LT", name: { lv: "Lietuva", en: "Lithuania", fr: "Lituanie", ru: "Литва" } },
  { code: "FR", name: { lv: "Francija", en: "France", fr: "France", ru: "Франция" } },
  { code: "BE", name: { lv: "Beļģija", en: "Belgium", fr: "Belgique", ru: "Бельгия" } },
  { code: "DE", name: { lv: "Vācija", en: "Germany", fr: "Allemagne", ru: "Германия" } },
  { code: "PL", name: { lv: "Polija", en: "Poland", fr: "Pologne", ru: "Польша" } },
  { code: "FI", name: { lv: "Somija", en: "Finland", fr: "Finlande", ru: "Финляндия" } },
  { code: "SE", name: { lv: "Zviedrija", en: "Sweden", fr: "Suède", ru: "Швеция" } },
  { code: "NL", name: { lv: "Nīderlande", en: "Netherlands", fr: "Pays-Bas", ru: "Нидерланды" } },
] as const;

export type FleetCountryCode = (typeof fleetCountries)[number]["code"];

export function isFleetCountryCode(value: string): value is FleetCountryCode {
  return fleetCountries.some((country) => country.code === value);
}

export function countryLabel(code: string, locale: keyof Localized): string {
  const match = fleetCountries.find((country) => country.code === code);
  if (!match) return code;
  return match.name[locale] ?? match.name.en;
}
