import { localizedFromSeed, type ManagedExcursion } from "@/lib/content/managed-excursion";

function collage(image: string): string[] {
  return [image, image, image, image];
}

/** Initial rows migrated from the former static excursions catalog (LV listing copy). */
export const excursionSeed: ManagedExcursion[] = [
  {
    id: "excursion-moulin-rouge",
    slug: "moulin-rouge",
    title: localizedFromSeed(
      "Biļešu rezervācija uz kabarē “Moulin Rouge” ar vakariņu piedāvājumu",
    ),
    images: collage("/excursions/moulin-rouge-logo.png"),
    logoVariant: "dark",
    route: localizedFromSeed(""),
    teaser: localizedFromSeed(
      "Katru vakaru plkst. 19.00 piedzīvojiet izsmalcinātas vakariņas un pasaules līmeņa šovu leģendārajā Parīzes kabarē.",
    ),
    details: localizedFromSeed(""),
    regions: ["france"],
    price: null,
    durationDays: null,
    isActive: true,
  },
  {
    id: "excursion-disneyland",
    slug: "disneyland",
    title: localizedFromSeed("Biļešu rezervācija uz Disnejlendu"),
    images: collage("/excursions/disneyland-mickey-minnie.png"),
    logoVariant: "dark",
    route: localizedFromSeed(""),
    teaser: localizedFromSeed(
      "Tikšanās ar Disneja personāžiem, vakariņas ar Mikimausu un VIP numuri Disneyland 5★ viesnīcā.",
    ),
    details: localizedFromSeed(""),
    regions: ["france"],
    price: null,
    durationDays: null,
    isActive: true,
  },
  {
    id: "excursion-paris",
    slug: "paris",
    title: localizedFromSeed("Parīze"),
    images: collage("/hero/paris.jpg"),
    logoVariant: "white",
    route: localizedFromSeed("Rīga – Berlīne – Parīze – Rīga"),
    teaser: localizedFromSeed(
      "Sešas dienas ar divu šoferu maiņu, nakts pieturu Berlīnē un brīvu laiku Parīzes centrā.",
    ),
    details: localizedFromSeed(""),
    regions: ["france"],
    price: null,
    durationDays: null,
    isActive: true,
  },
  {
    id: "excursion-berlin",
    slug: "berlin",
    title: localizedFromSeed("Berlīnes nedēļas nogale"),
    images: collage("/hero/berlin.jpg"),
    logoVariant: "white",
    route: localizedFromSeed("Rīga – Kauņa – Berlīne – Rīga"),
    teaser: localizedFromSeed(
      "Muzeju sala, Špreja vakarā un viesnīca pilsētas centrā. Piemērots uzņēmumu un skolu grupām.",
    ),
    details: localizedFromSeed(""),
    regions: ["germany"],
    price: null,
    durationDays: null,
    isActive: true,
  },
  {
    id: "excursion-luxembourg",
    slug: "luxembourg",
    title: localizedFromSeed("Luksemburga un Beniluksa valstis"),
    images: collage("/hero/luxembourg.jpg"),
    logoVariant: "white",
    route: localizedFromSeed("Rīga – Brisele – Luksemburga – Amsterdama – Rīga"),
    teaser: localizedFromSeed(
      "Trīs galvaspilsētas vienā braucienā, ar saulrietu virs Luksemburgas vecpilsētas.",
    ),
    details: localizedFromSeed(""),
    regions: [],
    price: null,
    durationDays: null,
    isActive: true,
  },
  {
    id: "excursion-alps",
    slug: "alps",
    title: localizedFromSeed("Alpu ceļi"),
    images: collage("/hero/mountains.jpg"),
    logoVariant: "white",
    route: localizedFromSeed("Rīga – Minhene – Insbruka – Zalcburga – Rīga"),
    teaser: localizedFromSeed(
      "Kalnu pārejas, ezeri un mazas pilsētiņas. Ceļš ir daļa no ceļojuma.",
    ),
    details: localizedFromSeed(""),
    regions: [],
    price: null,
    durationDays: null,
    isActive: true,
  },
];
