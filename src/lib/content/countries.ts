import type { Localized } from "@/lib/i18n/locale";

/** Places where a vehicle can be offered / filtered on Autoparks. */
export const fleetCountries = [
  {
    code: "LV",
    name: { lv: "Latvija", en: "Latvia", fr: "Lettonie", ru: "Латвия" },
  },
  {
    code: "FR",
    name: { lv: "Francija", en: "France", fr: "France", ru: "Франция" },
  },
  {
    code: "US",
    name: {
      lv: "ASV (Denvera, Kolorādo)",
      en: "USA (Denver, Colorado)",
      fr: "États-Unis (Denver, Colorado)",
      ru: "США (Денвер, Колорадо)",
    },
  },
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
