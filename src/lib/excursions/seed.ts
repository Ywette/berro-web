import type { ManagedExcursion } from "@/lib/content/managed-excursion";

function collage(image: string): string[] {
  return [image, image, image, image];
}

/** Initial rows migrated from the former static excursions catalog (LV listing copy). */
export const excursionSeed: ManagedExcursion[] = [
  {
    id: "excursion-moulin-rouge",
    slug: "moulin-rouge",
    title: "Biļešu rezervācija uz kabarē “Moulin Rouge” ar vakariņu piedāvājumu",
    images: collage("/excursions/moulin-rouge-logo.png"),
    logoVariant: "dark",
    route: "",
    teaser:
      "Katru vakaru plkst. 19.00 piedzīvojiet izsmalcinātas vakariņas un pasaules līmeņa šovu leģendārajā Parīzes kabarē.",
    details: "",
    regions: ["france"],
    price: null,
    isActive: true,
  },
  {
    id: "excursion-disneyland",
    slug: "disneyland",
    title: "Biļešu rezervācija uz Disnejlendu",
    images: collage("/excursions/disneyland-mickey-minnie.png"),
    logoVariant: "dark",
    route: "",
    teaser:
      "Tikšanās ar Disneja personāžiem, vakariņas ar Mikimausu un VIP numuri Disneyland 5★ viesnīcā.",
    details: "",
    regions: ["france"],
    price: null,
    isActive: true,
  },
  {
    id: "excursion-paris",
    slug: "paris",
    title: "Parīze",
    images: collage("/hero/paris.jpg"),
    logoVariant: "white",
    route: "Rīga – Berlīne – Parīze – Rīga",
    teaser:
      "Sešas dienas ar divu šoferu maiņu, nakts pieturu Berlīnē un brīvu laiku Parīzes centrā.",
    details: "",
    regions: ["france"],
    price: null,
    isActive: true,
  },
  {
    id: "excursion-berlin",
    slug: "berlin",
    title: "Berlīnes nedēļas nogale",
    images: collage("/hero/berlin.jpg"),
    logoVariant: "white",
    route: "Rīga – Kauņa – Berlīne – Rīga",
    teaser:
      "Muzeju sala, Špreja vakarā un viesnīca pilsētas centrā. Piemērots uzņēmumu un skolu grupām.",
    details: "",
    regions: ["germany"],
    price: null,
    isActive: true,
  },
  {
    id: "excursion-luxembourg",
    slug: "luxembourg",
    title: "Luksemburga un Beniluksa valstis",
    images: collage("/hero/luxembourg.jpg"),
    logoVariant: "white",
    route: "Rīga – Brisele – Luksemburga – Amsterdama – Rīga",
    teaser: "Trīs galvaspilsētas vienā braucienā, ar saulrietu virs Luksemburgas vecpilsētas.",
    details: "",
    regions: [],
    price: null,
    isActive: true,
  },
  {
    id: "excursion-alps",
    slug: "alps",
    title: "Alpu ceļi",
    images: collage("/hero/mountains.jpg"),
    logoVariant: "white",
    route: "Rīga – Minhene – Insbruka – Zalcburga – Rīga",
    teaser: "Kalnu pārejas, ezeri un mazas pilsētiņas. Ceļš ir daļa no ceļojuma.",
    details: "",
    regions: [],
    price: null,
    isActive: true,
  },
];
