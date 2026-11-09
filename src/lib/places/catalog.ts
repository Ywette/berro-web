import type { Locale } from "@/lib/i18n/dictionary";

type Country = "lv" | "ee" | "lt" | "fi" | "se" | "pl" | "de" | "cz" | "at" | "lu" | "fr";

const countries: Record<Country, Record<Locale, string>> = {
  lv: { lv: "Latvija", en: "Latvia" },
  ee: { lv: "Igaunija", en: "Estonia" },
  lt: { lv: "Lietuva", en: "Lithuania" },
  fi: { lv: "Somija", en: "Finland" },
  se: { lv: "Zviedrija", en: "Sweden" },
  pl: { lv: "Polija", en: "Poland" },
  de: { lv: "Vācija", en: "Germany" },
  cz: { lv: "Čehija", en: "Czechia" },
  at: { lv: "Austrija", en: "Austria" },
  lu: { lv: "Luksemburga", en: "Luxembourg" },
  fr: { lv: "Francija", en: "France" },
};

export type CatalogPlace = {
  id: string;
  name: Record<Locale, string>;
  country: Country;
  lat: number;
  lng: number;
};

export const catalog: CatalogPlace[] = [
  { id: "riga-airport", name: { lv: "Rīgas lidosta (RIX)", en: "Riga Airport (RIX)" }, country: "lv", lat: 56.9236, lng: 23.9711 },
  { id: "riga", name: { lv: "Rīga", en: "Riga" }, country: "lv", lat: 56.9496, lng: 24.1052 },
  { id: "jurmala", name: { lv: "Jūrmala", en: "Jurmala" }, country: "lv", lat: 56.968, lng: 23.77 },
  { id: "sigulda", name: { lv: "Sigulda", en: "Sigulda" }, country: "lv", lat: 57.1537, lng: 24.853 },
  { id: "cesis", name: { lv: "Cēsis", en: "Cesis" }, country: "lv", lat: 57.3119, lng: 25.2706 },
  { id: "valmiera", name: { lv: "Valmiera", en: "Valmiera" }, country: "lv", lat: 57.5385, lng: 25.4264 },
  { id: "rundale", name: { lv: "Rundāles pils", en: "Rundale Palace" }, country: "lv", lat: 56.4136, lng: 24.0247 },
  { id: "bauska", name: { lv: "Bauska", en: "Bauska" }, country: "lv", lat: 56.4079, lng: 24.1934 },
  { id: "jelgava", name: { lv: "Jelgava", en: "Jelgava" }, country: "lv", lat: 56.6511, lng: 23.7214 },
  { id: "kuldiga", name: { lv: "Kuldīga", en: "Kuldiga" }, country: "lv", lat: 56.9677, lng: 21.9681 },
  { id: "liepaja", name: { lv: "Liepāja", en: "Liepaja" }, country: "lv", lat: 56.5047, lng: 21.0108 },
  { id: "ventspils", name: { lv: "Ventspils", en: "Ventspils" }, country: "lv", lat: 57.3894, lng: 21.5606 },
  { id: "daugavpils", name: { lv: "Daugavpils", en: "Daugavpils" }, country: "lv", lat: 55.8714, lng: 26.5161 },
  { id: "rezekne", name: { lv: "Rēzekne", en: "Rezekne" }, country: "lv", lat: 56.5099, lng: 27.3332 },
  { id: "tallinn", name: { lv: "Tallina", en: "Tallinn" }, country: "ee", lat: 59.437, lng: 24.7536 },
  { id: "tallinn-airport", name: { lv: "Tallinas lidosta (TLL)", en: "Tallinn Airport (TLL)" }, country: "ee", lat: 59.4133, lng: 24.8328 },
  { id: "parnu", name: { lv: "Pērnava", en: "Parnu" }, country: "ee", lat: 58.3859, lng: 24.4971 },
  { id: "tartu", name: { lv: "Tartu", en: "Tartu" }, country: "ee", lat: 58.3776, lng: 26.729 },
  { id: "vilnius", name: { lv: "Viļņa", en: "Vilnius" }, country: "lt", lat: 54.6872, lng: 25.2797 },
  { id: "vilnius-airport", name: { lv: "Viļņas lidosta (VNO)", en: "Vilnius Airport (VNO)" }, country: "lt", lat: 54.6341, lng: 25.2858 },
  { id: "kaunas", name: { lv: "Kauņa", en: "Kaunas" }, country: "lt", lat: 54.8985, lng: 23.9036 },
  { id: "klaipeda", name: { lv: "Klaipēda", en: "Klaipeda" }, country: "lt", lat: 55.7033, lng: 21.1443 },
  { id: "helsinki", name: { lv: "Helsinki", en: "Helsinki" }, country: "fi", lat: 60.1699, lng: 24.9384 },
  { id: "warsaw", name: { lv: "Varšava", en: "Warsaw" }, country: "pl", lat: 52.2297, lng: 21.0122 },
  { id: "krakow", name: { lv: "Krakova", en: "Krakow" }, country: "pl", lat: 50.0647, lng: 19.945 },
  { id: "berlin", name: { lv: "Berlīne", en: "Berlin" }, country: "de", lat: 52.52, lng: 13.405 },
  { id: "munich", name: { lv: "Minhene", en: "Munich" }, country: "de", lat: 48.1351, lng: 11.582 },
  { id: "prague", name: { lv: "Prāga", en: "Prague" }, country: "cz", lat: 50.0755, lng: 14.4378 },
  { id: "vienna", name: { lv: "Vīne", en: "Vienna" }, country: "at", lat: 48.2082, lng: 16.3738 },
  { id: "luxembourg", name: { lv: "Luksemburga", en: "Luxembourg" }, country: "lu", lat: 49.6116, lng: 6.1319 },
  { id: "paris", name: { lv: "Parīze", en: "Paris" }, country: "fr", lat: 48.8566, lng: 2.3522 },
  { id: "disneyland-paris", name: { lv: "Disneyland Paris", en: "Disneyland Paris" }, country: "fr", lat: 48.8722, lng: 2.7758 },
  { id: "moulin-rouge", name: { lv: "Moulin Rouge, Parīze", en: "Moulin Rouge, Paris" }, country: "fr", lat: 48.8841, lng: 2.3322 },
  { id: "stockholm", name: { lv: "Stokholma", en: "Stockholm" }, country: "se", lat: 59.3293, lng: 18.0686 },
];

const popular = ["riga-airport", "riga", "jurmala", "sigulda", "tallinn", "vilnius"];

export function countryName(place: CatalogPlace, locale: Locale) {
  return countries[place.country][locale];
}

export function findCatalogPlace(id: string) {
  return catalog.find((place) => place.id === id) ?? null;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function searchCatalog(query: string, limit = 6) {
  const needle = normalize(query);
  if (!needle) {
    return popular.map((id) => findCatalogPlace(id)!);
  }

  return catalog
    .filter((place) => {
      const texts = [place.name.lv, place.name.en, countries[place.country].lv, countries[place.country].en].map(
        normalize,
      );
      return texts.some(
        (text) =>
          text.startsWith(needle) ||
          text.includes(` ${needle}`) ||
          text.split(/[\s(),/-]+/).some((word) => word.startsWith(needle)),
      );
    })
    .slice(0, limit);
}
