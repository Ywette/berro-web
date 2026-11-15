import type { Locale, Localized } from "@/lib/i18n/locale";
import { pickLocalized } from "@/lib/i18n/locale";

type Country = "lv" | "ee" | "lt" | "fi" | "se" | "pl" | "de" | "cz" | "at" | "lu" | "fr";

const countries: Record<Country, Localized> = {
  lv: { lv: "Latvija", en: "Latvia", fr: "Lettonie", ru: "Латвия" },
  ee: { lv: "Igaunija", en: "Estonia", fr: "Estonie", ru: "Эстония" },
  lt: { lv: "Lietuva", en: "Lithuania", fr: "Lituanie", ru: "Литва" },
  fi: { lv: "Somija", en: "Finland", fr: "Finlande", ru: "Финляндия" },
  se: { lv: "Zviedrija", en: "Sweden", fr: "Suède", ru: "Швеция" },
  pl: { lv: "Polija", en: "Poland", fr: "Pologne", ru: "Польша" },
  de: { lv: "Vācija", en: "Germany", fr: "Allemagne", ru: "Германия" },
  cz: { lv: "Čehija", en: "Czechia", fr: "Tchéquie", ru: "Чехия" },
  at: { lv: "Austrija", en: "Austria", fr: "Autriche", ru: "Австрия" },
  lu: { lv: "Luksemburga", en: "Luxembourg", fr: "Luxembourg", ru: "Люксембург" },
  fr: { lv: "Francija", en: "France", fr: "France", ru: "Франция" },
};

export type CatalogPlace = {
  id: string;
  name: Localized;
  country: Country;
  lat: number;
  lng: number;
};

export const catalog: CatalogPlace[] = [
  { id: "riga-airport", name: { lv: "Rīgas lidosta (RIX)", en: "Riga Airport (RIX)", fr: "Aéroport de Riga (RIX)", ru: "Рижский аэропорт (RIX)" }, country: "lv", lat: 56.9236, lng: 23.9711 },
  { id: "riga", name: { lv: "Rīga", en: "Riga", fr: "Riga", ru: "Рига" }, country: "lv", lat: 56.9496, lng: 24.1052 },
  { id: "jurmala", name: { lv: "Jūrmala", en: "Jurmala", fr: "Jurmala", ru: "Юрмала" }, country: "lv", lat: 56.968, lng: 23.77 },
  { id: "sigulda", name: { lv: "Sigulda", en: "Sigulda", fr: "Sigulda", ru: "Сигулда" }, country: "lv", lat: 57.1537, lng: 24.853 },
  { id: "cesis", name: { lv: "Cēsis", en: "Cesis", fr: "Cesis", ru: "Цесис" }, country: "lv", lat: 57.3119, lng: 25.2706 },
  { id: "valmiera", name: { lv: "Valmiera", en: "Valmiera", fr: "Valmiera", ru: "Валмиера" }, country: "lv", lat: 57.5385, lng: 25.4264 },
  { id: "rundale", name: { lv: "Rundāles pils", en: "Rundale Palace", fr: "Palais de Rundale", ru: "Рундальский дворец" }, country: "lv", lat: 56.4136, lng: 24.0247 },
  { id: "bauska", name: { lv: "Bauska", en: "Bauska", fr: "Bauska", ru: "Бауска" }, country: "lv", lat: 56.4079, lng: 24.1934 },
  { id: "jelgava", name: { lv: "Jelgava", en: "Jelgava", fr: "Jelgava", ru: "Елгава" }, country: "lv", lat: 56.6511, lng: 23.7214 },
  { id: "kuldiga", name: { lv: "Kuldīga", en: "Kuldiga", fr: "Kuldiga", ru: "Кулдига" }, country: "lv", lat: 56.9677, lng: 21.9681 },
  { id: "liepaja", name: { lv: "Liepāja", en: "Liepaja", fr: "Liepaja", ru: "Лиепая" }, country: "lv", lat: 56.5047, lng: 21.0108 },
  { id: "ventspils", name: { lv: "Ventspils", en: "Ventspils", fr: "Ventspils", ru: "Вентспилс" }, country: "lv", lat: 57.3894, lng: 21.5606 },
  { id: "daugavpils", name: { lv: "Daugavpils", en: "Daugavpils", fr: "Daugavpils", ru: "Даугавпилс" }, country: "lv", lat: 55.8714, lng: 26.5161 },
  { id: "rezekne", name: { lv: "Rēzekne", en: "Rezekne", fr: "Rezekne", ru: "Резекне" }, country: "lv", lat: 56.5099, lng: 27.3332 },
  { id: "tallinn", name: { lv: "Tallina", en: "Tallinn", fr: "Tallinn", ru: "Таллин" }, country: "ee", lat: 59.437, lng: 24.7536 },
  { id: "tallinn-airport", name: { lv: "Tallinas lidosta (TLL)", en: "Tallinn Airport (TLL)", fr: "Aéroport de Tallinn (TLL)", ru: "Таллинский аэропорт (TLL)" }, country: "ee", lat: 59.4133, lng: 24.8328 },
  { id: "parnu", name: { lv: "Pērnava", en: "Parnu", fr: "Pärnu", ru: "Пярну" }, country: "ee", lat: 58.3859, lng: 24.4971 },
  { id: "tartu", name: { lv: "Tartu", en: "Tartu", fr: "Tartu", ru: "Тарту" }, country: "ee", lat: 58.3776, lng: 26.729 },
  { id: "vilnius", name: { lv: "Viļņa", en: "Vilnius", fr: "Vilnius", ru: "Вильнюс" }, country: "lt", lat: 54.6872, lng: 25.2797 },
  { id: "vilnius-airport", name: { lv: "Viļņas lidosta (VNO)", en: "Vilnius Airport (VNO)", fr: "Aéroport de Vilnius (VNO)", ru: "Вильнюсский аэропорт (VNO)" }, country: "lt", lat: 54.6341, lng: 25.2858 },
  { id: "kaunas", name: { lv: "Kauņa", en: "Kaunas", fr: "Kaunas", ru: "Каунас" }, country: "lt", lat: 54.8985, lng: 23.9036 },
  { id: "klaipeda", name: { lv: "Klaipēda", en: "Klaipeda", fr: "Klaipeda", ru: "Клайпеда" }, country: "lt", lat: 55.7033, lng: 21.1443 },
  { id: "helsinki", name: { lv: "Helsinki", en: "Helsinki", fr: "Helsinki", ru: "Хельсинки" }, country: "fi", lat: 60.1699, lng: 24.9384 },
  { id: "warsaw", name: { lv: "Varšava", en: "Warsaw", fr: "Varsovie", ru: "Варшава" }, country: "pl", lat: 52.2297, lng: 21.0122 },
  { id: "krakow", name: { lv: "Krakova", en: "Krakow", fr: "Cracovie", ru: "Краков" }, country: "pl", lat: 50.0647, lng: 19.945 },
  { id: "berlin", name: { lv: "Berlīne", en: "Berlin", fr: "Berlin", ru: "Берлин" }, country: "de", lat: 52.52, lng: 13.405 },
  { id: "munich", name: { lv: "Minhene", en: "Munich", fr: "Munich", ru: "Мюнхен" }, country: "de", lat: 48.1351, lng: 11.582 },
  { id: "prague", name: { lv: "Prāga", en: "Prague", fr: "Prague", ru: "Прага" }, country: "cz", lat: 50.0755, lng: 14.4378 },
  { id: "vienna", name: { lv: "Vīne", en: "Vienna", fr: "Vienne", ru: "Вена" }, country: "at", lat: 48.2082, lng: 16.3738 },
  { id: "luxembourg", name: { lv: "Luksemburga", en: "Luxembourg", fr: "Luxembourg", ru: "Люксембург" }, country: "lu", lat: 49.6116, lng: 6.1319 },
  { id: "paris", name: { lv: "Parīze", en: "Paris", fr: "Paris", ru: "Париж" }, country: "fr", lat: 48.8566, lng: 2.3522 },
  { id: "disneyland-paris", name: { lv: "Disneyland Paris", en: "Disneyland Paris", fr: "Disneyland Paris", ru: "Диснейленд Париж" }, country: "fr", lat: 48.8722, lng: 2.7758 },
  { id: "moulin-rouge", name: { lv: "Moulin Rouge, Parīze", en: "Moulin Rouge, Paris", fr: "Moulin Rouge, Paris", ru: "Мулен Руж, Париж" }, country: "fr", lat: 48.8841, lng: 2.3322 },
  { id: "stockholm", name: { lv: "Stokholma", en: "Stockholm", fr: "Stockholm", ru: "Стокгольм" }, country: "se", lat: 59.3293, lng: 18.0686 },
];

const popular = ["riga-airport", "riga", "jurmala", "sigulda", "tallinn", "vilnius"];

export function countryName(place: CatalogPlace, locale: Locale) {
  return pickLocalized(countries[place.country], locale);
}

export function placeName(place: CatalogPlace, locale: Locale) {
  return pickLocalized(place.name, locale);
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

export function searchCatalog(query: string, locale: Locale, limit = 8): CatalogPlace[] {
  const needle = normalize(query);
  if (!needle) {
    return popular
      .map((id) => findCatalogPlace(id))
      .filter((place): place is CatalogPlace => Boolean(place))
      .slice(0, limit);
  }

  return catalog
    .map((place) => {
      const label = normalize(pickLocalized(place.name, locale));
      const score =
        label.startsWith(needle) ? 0 : label.includes(needle) ? 1 : Number.POSITIVE_INFINITY;
      return { place, score };
    })
    .filter((item) => Number.isFinite(item.score))
    .sort((left, right) => left.score - right.score || left.place.id.localeCompare(right.place.id))
    .slice(0, limit)
    .map((item) => item.place);
}
