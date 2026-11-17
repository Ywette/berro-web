import {
  parseExcursionRegions,
  type ExcursionRegion,
} from "@/lib/content/excursions";
import type { Localized } from "@/lib/i18n/locale";
import {
  localizedFromSeed,
  parseLocalizedText,
  pickLocalizedText,
} from "@/lib/i18n/localized-content";

export const EXCURSION_COLLAGE_PHOTO_COUNT = 4;

export const excursionLogoVariants = ["dark", "white"] as const;
export type ExcursionLogoVariant = (typeof excursionLogoVariants)[number];

export const excursionLogoSrc: Record<ExcursionLogoVariant, string> = {
  /** Light letters — use on black plate. */
  dark: "/brand/berro-travel-logo-dark.png",
  /** Dark letters — use on white plate. */
  white: "/brand/berro-travel-logo-white.png",
};

/** Even list rows → white plate; odd → black plate. */
export function excursionLogoPlateFromIndex(index: number): ExcursionLogoVariant {
  return index % 2 === 0 ? "white" : "dark";
}

/** Staff-managed excursion listing card (JSON store / Supabase). */
export type ManagedExcursion = {
  id: string;
  slug: string;
  title: Localized;
  /** Exactly four cover photos for the 2×2 collage. */
  images: string[];
  logoVariant: ExcursionLogoVariant;
  route: Localized;
  teaser: Localized;
  /** Long-form description shown on the excursion detail page. */
  details: Localized;
  /** One or more regions for catalog filters (e.g. Latvia + Estonia + Lithuania). */
  regions: ExcursionRegion[];
  /** Optional from-price in EUR. */
  price: number | null;
  /** Optional trip length in calendar days (return = departure + days − 1). */
  durationDays: number | null;
  isActive: boolean;
};

export function parseExcursionPrice(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100) / 100;
}

export function parseExcursionDurationDays(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const days = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(days) || !Number.isInteger(days) || days < 1) return null;
  return days;
}

export function isExcursionLogoVariant(value: unknown): value is ExcursionLogoVariant {
  return value === "dark" || value === "white";
}

export function excursionCoverImage(excursion: Pick<ManagedExcursion, "images">): string {
  return excursion.images[0] ?? "";
}

export function hasExcursionCollage(images: string[]): boolean {
  return images.length >= EXCURSION_COLLAGE_PHOTO_COUNT;
}

export function normalizeManagedExcursion(raw: unknown): ManagedExcursion | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id : "";
  const slug = typeof item.slug === "string" ? item.slug : "";
  const title = parseLocalizedText(item.title);
  if (!id || !slug || !pickLocalizedText(title, "lv").trim()) return null;

  const fromArray = Array.isArray(item.images)
    ? item.images.filter((value): value is string => typeof value === "string" && Boolean(value))
    : [];
  const legacyImage = typeof item.image === "string" && item.image ? item.image : "";
  const images =
    fromArray.length > 0 ? fromArray.slice(0, EXCURSION_COLLAGE_PHOTO_COUNT) : legacyImage ? [legacyImage] : [];

  return {
    id,
    slug,
    title,
    images,
    logoVariant: isExcursionLogoVariant(item.logoVariant) ? item.logoVariant : "dark",
    route: parseLocalizedText(item.route),
    teaser: parseLocalizedText(item.teaser),
    details: parseLocalizedText(item.details),
    regions: (() => {
      const fromList = parseExcursionRegions(item.regions);
      if (fromList.length > 0) return fromList;
      return parseExcursionRegions(item.region);
    })(),
    price: parseExcursionPrice(item.price),
    durationDays: parseExcursionDurationDays(item.durationDays ?? item.duration_days),
    isActive: item.isActive !== false,
  };
}

export function slugifyExcursionTitle(title: string | Localized): string {
  const source = typeof title === "string" ? title : pickLocalizedText(title, "lv");
  const base = source
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return base || `excursion-${Date.now().toString(36)}`;
}

export { localizedFromSeed };
