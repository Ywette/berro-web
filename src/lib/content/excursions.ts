import type { Localized } from "@/lib/i18n/locale";

export type ExcursionImage = {
  src: string;
  alt: Localized;
  logo?: boolean;
};

export type ExcursionOffer = {
  title: Localized;
  fromPrice: number;
  includes: Localized[];
  notes?: Localized[];
};

export type ExcursionDetails = {
  intro: Localized[];
  highlights?: Localized[];
  images?: ExcursionImage[];
  callout?: Localized;
  offers?: ExcursionOffer[];
  terms?: Localized[];
  closing?: Localized;
};

export type ExcursionRegion = "latvia" | "france" | "baltics" | "germany";

export const excursionRegions: readonly ExcursionRegion[] = [
  "latvia",
  "france",
  "baltics",
  "germany",
];

export const bookingContact = {
  email: "berro@berro.lv",
  phone: "+371 26406179",
  website: "www.berro.lv",
};

/** Rich detail pages for selected seeded excursions (listing data lives in data/excursions.json). */
export const excursionDetailsBySlug: Record<string, ExcursionDetails> = {
  "moulin-rouge": {
    intro: [
      {
        lv: "Katru vakaru plkst. 19.00 piedzīvojiet izsmalcinātas vakariņas un pasaules līmeņa šovu leģendārajā Parīzes kabarē.",
        en: "Every evening at 7 pm, enjoy a refined dinner and a world-class show at the legendary Paris cabaret.",
      },
      {
        lv: "Ar prieku piedāvājam divas “Pavasaris 2026” ēdienkartes – Toulouse-Lautrec un Belle Epoque, kas būs pieejamas no 2026. gada 19. marta līdz 17. jūnijam.",
        en: "We are pleased to offer two “Spring 2026” menus, Toulouse-Lautrec and Belle Epoque, available from 19 March to 17 June 2026.",
      },
      {
        lv: "Šajā periodā pieejama arī vegānā ēdienkarte.",
        en: "A vegan menu is also available during this period.",
      },
    ],
    offers: [
      {
        title: { lv: "Vakariņas + šovs", en: "Dinner + show" },
        fromPrice: 242,
        includes: [
          { lv: "izvēlētā ēdienkarte", en: "your chosen menu" },
          { lv: "šovs", en: "the show" },
          { lv: "½ pudele šampanieša", en: "½ bottle of champagne" },
        ],
        notes: [
          {
            lv: "Cenas var atšķirties atkarībā no perioda un izvēlētās ēdienkartes.",
            en: "Prices may vary with the period and the chosen menu.",
          },
          { lv: "Ietaupījums 5–7%.", en: "Save 5–7%." },
        ],
      },
      {
        title: { lv: "Biļetes tikai uz šovu", en: "Show-only tickets" },
        fromPrice: 118,
        includes: [
          { lv: "šovs", en: "the show" },
          { lv: "½ pudele šampanieša", en: "½ bottle of champagne" },
        ],
        notes: [{ lv: "Ietaupījums 5–7%.", en: "Save 5–7%." }],
      },
    ],
    closing: {
      lv: "Ja nepieciešama papildu informācija, ar prieku palīdzēsim.",
      en: "If you need more information, we will be glad to help.",
    },
  },
  disneyland: {
    intro: [],
    highlights: [
      { lv: "Tikšanās ar Disneja personāžiem", en: "Meet the Disney characters" },
      {
        lv: "Vakariņas vai pusdienas ar MIKIMAUSU vai PRINCESI",
        en: "Dinner or lunch with MICKEY MOUSE or a PRINCESS",
      },
      { lv: "Dzimšanas dienas torte numurā", en: "A birthday cake in your room" },
      {
        lv: "VIP kategorijas numuru rezervēšana DISNEYLAND 5★ VIESNĪCĀ",
        en: "VIP room bookings at the DISNEYLAND 5★ HOTEL",
      },
    ],
    images: [
      {
        src: "/excursions/disney-plus-logo.png",
        alt: { lv: "Disney+ logotips", en: "Disney+ logo" },
        logo: true,
      },
      {
        src: "/excursions/disneyland-hotel.png",
        alt: { lv: "Disneyland viesnīcas vestibils", en: "Disneyland hotel lobby" },
      },
    ],
    callout: {
      lv: "TAS VISS IR IESPĒJAMS AR TŪROPERATORU BERRO!",
      en: "ALL OF THIS IS POSSIBLE WITH TOUR OPERATOR BERRO!",
    },
    terms: [
      {
        lv: "Veicot rezervāciju, priekšapmaksa ir TIKAI 30% no pasūtīto pakalpojumu vērtības (100% vietā).",
        en: "When you book, the prepayment is ONLY 30% of the ordered services (instead of 100%).",
      },
      {
        lv: "Pilna apmaksa 17 dienas pirms ierašanās, un tikai pēc pilnas apmaksas veikšanas pasūtīto pakalpojumu anulēšana nav iespējama (līgumsods 100%).",
        en: "Full payment is due 17 days before arrival. Once paid in full, the ordered services can no longer be cancelled (100% penalty).",
      },
    ],
    closing: {
      lv: "Sazinieties ar mums, mēs priecāsimies par jūsu pasūtījumiem!",
      en: "Get in touch, we look forward to your bookings!",
    },
  },
};

export function getExcursionDetails(slug: string): ExcursionDetails | null {
  return excursionDetailsBySlug[slug] ?? null;
}
