import type { ManagedExcursion } from "@/lib/content/managed-excursion";

/** Initial rows migrated from the former static excursions catalog (LV listing copy). */
export const excursionSeed: ManagedExcursion[] = [
  {
    id: "excursion-moulin-rouge",
    slug: "moulin-rouge",
    title: "Biļešu rezervācija uz kabarē “Moulin Rouge” ar vakariņu piedāvājumu",
    image: "/excursions/moulin-rouge-logo.png",
    route: "",
    teaser:
      "Katru vakaru plkst. 19.00 piedzīvojiet izsmalcinātas vakariņas un pasaules līmeņa šovu leģendārajā Parīzes kabarē.",
    region: "france",
    isActive: true,
  },
  {
    id: "excursion-disneyland",
    slug: "disneyland",
    title: "Biļešu rezervācija uz Disnejlendu",
    image: "/excursions/disneyland-mickey-minnie.png",
    route: "",
    teaser:
      "Tikšanās ar Disneja personāžiem, vakariņas ar Mikimausu un VIP numuri Disneyland 5★ viesnīcā.",
    region: "france",
    isActive: true,
  },
  {
    id: "excursion-paris",
    slug: "paris",
    title: "Parīze",
    image: "/hero/paris.jpg",
    route: "Rīga – Berlīne – Parīze – Rīga",
    teaser:
      "Sešas dienas ar divu šoferu maiņu, nakts pieturu Berlīnē un brīvu laiku Parīzes centrā.",
    region: "france",
    isActive: true,
  },
  {
    id: "excursion-berlin",
    slug: "berlin",
    title: "Berlīnes nedēļas nogale",
    image: "/hero/berlin.jpg",
    route: "Rīga – Kauņa – Berlīne – Rīga",
    teaser:
      "Muzeju sala, Špreja vakarā un viesnīca pilsētas centrā. Piemērots uzņēmumu un skolu grupām.",
    region: "germany",
    isActive: true,
  },
  {
    id: "excursion-luxembourg",
    slug: "luxembourg",
    title: "Luksemburga un Beniluksa valstis",
    image: "/hero/luxembourg.jpg",
    route: "Rīga – Brisele – Luksemburga – Amsterdama – Rīga",
    teaser: "Trīs galvaspilsētas vienā braucienā, ar saulrietu virs Luksemburgas vecpilsētas.",
    region: null,
    isActive: true,
  },
  {
    id: "excursion-alps",
    slug: "alps",
    title: "Alpu ceļi",
    image: "/hero/mountains.jpg",
    route: "Rīga – Minhene – Insbruka – Zalcburga – Rīga",
    teaser: "Kalnu pārejas, ezeri un mazas pilsētiņas. Ceļš ir daļa no ceļojuma.",
    region: null,
    isActive: true,
  },
];
