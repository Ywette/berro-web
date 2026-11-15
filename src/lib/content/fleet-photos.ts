import type { Localized } from "@/lib/i18n/locale";

export type FleetPhotoCategory = "coach" | "van" | "vip" | "excursion";

export type FleetPhoto = {
  id: string;
  src: string;
  category: FleetPhotoCategory;
  alt: Localized;
};

/** Shared fleet photo library used by About gallery and other surfaces. */
export const fleetPhotos: FleetPhoto[] = [
  {
    id: "coach-maroon-coast",
    src: "/fleet/gallery/coach-maroon-coast.png",
    category: "coach",
    alt: {
      lv: "Tumši sarkans tūrisma autobuss pie jūras un piekrastes pilsētas",
      en: "Dark red touring coach by the coast",
      fr: "Autocar rouge foncé près de la côte",
      ru: "Тёмно-красный туристический автобус у побережья",
    },
  },
  {
    id: "v-class-tallinn-airport",
    src: "/fleet/gallery/v-class-tallinn-airport.png",
    category: "van",
    alt: {
      lv: "Melns Mercedes-Benz V-Class pie Tallinas lidostas",
      en: "Black Mercedes-Benz V-Class at Tallinn Airport",
      fr: "Mercedes-Benz V-Class noir à l'aéroport de Tallinn",
      ru: "Чёрный Mercedes-Benz V-Class у аэропорта Таллина",
    },
  },
  {
    id: "coach-white-mountains",
    src: "/fleet/gallery/coach-white-mountains.jpg",
    category: "excursion",
    alt: {
      lv: "Balts Scania autobuss ekskursijā kalnos rudenī",
      en: "White Scania coach on an autumn mountain excursion",
      fr: "Autocar Scania blanc en excursion en montagne en automne",
      ru: "Белый автобус Scania на осенней экскурсии в горах",
    },
  },
  {
    id: "sprinter-eiffel",
    src: "/fleet/gallery/sprinter-eiffel.jpg",
    category: "van",
    alt: {
      lv: "Melns Mercedes Sprinter pie Eifeļa torņa Parīzē",
      en: "Black Mercedes Sprinter by the Eiffel Tower in Paris",
      fr: "Mercedes Sprinter noir près de la tour Eiffel à Paris",
      ru: "Чёрный Mercedes Sprinter у Эйфелевой башни в Париже",
    },
  },
  {
    id: "coach-white-city",
    src: "/fleet/gallery/coach-white-city.jpg",
    category: "coach",
    alt: {
      lv: "Balts Scania tūrisma autobuss pilsētā",
      en: "White Scania touring coach in the city",
      fr: "Autocar de tourisme Scania blanc en ville",
      ru: "Белый туристический автобус Scania в городе",
    },
  },
  {
    id: "v-class-open-door",
    src: "/fleet/gallery/v-class-open-door.jpg",
    category: "vip",
    alt: {
      lv: "Melns Mercedes V-Class ar atvērtām durvīm un VIP salonu",
      en: "Black Mercedes V-Class with open door and VIP interior",
      fr: "Mercedes V-Class noir avec porte ouverte et intérieur VIP",
      ru: "Чёрный Mercedes V-Class с открытой дверью и VIP-салоном",
    },
  },
  {
    id: "vip-fleet-canopy",
    src: "/fleet/gallery/vip-fleet-canopy.jpg",
    category: "vip",
    alt: {
      lv: "VIP mikroautobusu flote pie modernā iebrauktuves nojumes",
      en: "VIP minibus fleet under a modern entrance canopy",
      fr: "Flotte de minibus VIP sous un auvent d'entrée moderne",
      ru: "VIP-микроавтобусы под современным навесом у входа",
    },
  },
  {
    id: "s-class-vip",
    src: "/fleet/gallery/s-class-vip.jpg",
    category: "vip",
    alt: {
      lv: "Melns Mercedes-Benz S-Class VIP pārvadājumiem",
      en: "Black Mercedes-Benz S-Class for VIP transfers",
      fr: "Mercedes-Benz Classe S noire pour transferts VIP",
      ru: "Чёрный Mercedes-Benz S-Class для VIP-трансферов",
    },
  },
  {
    id: "sprinter-winter",
    src: "/fleet/gallery/sprinter-winter.jpg",
    category: "van",
    alt: {
      lv: "Melns Mercedes Sprinter ziemas mežā",
      en: "Black Mercedes Sprinter in a winter forest",
      fr: "Mercedes Sprinter noir dans une forêt d'hiver",
      ru: "Чёрный Mercedes Sprinter в зимнем лесу",
    },
  },
  {
    id: "v-class-flags",
    src: "/fleet/gallery/v-class-flags.jpg",
    category: "vip",
    alt: {
      lv: "Melns Mercedes V-Class ar Latvijas un Mercedes karogiem fonā",
      en: "Black Mercedes V-Class with Latvian and Mercedes flags behind",
      fr: "Mercedes V-Class noir avec drapeaux letton et Mercedes en fond",
      ru: "Чёрный Mercedes V-Class на фоне флагов Латвии и Mercedes",
    },
  },
  {
    id: "coaches-palace",
    src: "/fleet/gallery/coaches-palace.jpg",
    category: "excursion",
    alt: {
      lv: "Divi balti tūrisma autobusi pie pils Eiropā",
      en: "Two white touring coaches at a European palace",
      fr: "Deux autocars blancs devant un palais européen",
      ru: "Два белых туристических автобуса у европейского дворца",
    },
  },
  {
    id: "sprinter-chateau",
    src: "/fleet/gallery/sprinter-chateau.jpg",
    category: "excursion",
    alt: {
      lv: "Melns Mercedes Sprinter pie vēsturiskā Eiropas muižas",
      en: "Black Mercedes Sprinter at a historic European château",
      fr: "Mercedes Sprinter noir devant un château européen historique",
      ru: "Чёрный Mercedes Sprinter у исторического европейского замка",
    },
  },
];

export function findFleetPhoto(id: string) {
  return fleetPhotos.find((photo) => photo.id === id) ?? null;
}

export function fleetPhotosByCategory(category: FleetPhotoCategory) {
  return fleetPhotos.filter((photo) => photo.category === category);
}
