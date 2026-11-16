import {
  isExcursionLogoVariant,
  parseExcursionPrice,
  type ManagedExcursion,
} from "@/lib/content/managed-excursion";
import {
  isExcursionRegion,
  parseExcursionRegions,
  type ExcursionRegion,
} from "@/lib/content/excursions";

export type ExcursionRow = {
  id: string;
  slug: string;
  title: string;
  images: unknown;
  logo_variant: string;
  route: string;
  teaser: string;
  details: string;
  region: string | null;
  regions?: unknown;
  price?: number | string | null;
  is_active: boolean;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function regionsFromRow(row: ExcursionRow): ExcursionRegion[] {
  const fromList = parseExcursionRegions(row.regions);
  if (fromList.length > 0) return fromList;
  return isExcursionRegion(row.region) ? [row.region] : [];
}

export function excursionFromRow(row: ExcursionRow): ManagedExcursion {
  const regions = regionsFromRow(row);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    images: asStringArray(row.images),
    logoVariant: isExcursionLogoVariant(row.logo_variant) ? row.logo_variant : "dark",
    route: row.route ?? "",
    teaser: row.teaser ?? "",
    details: row.details ?? "",
    regions,
    price: parseExcursionPrice(row.price),
    isActive: row.is_active !== false,
  };
}

export function excursionToRow(excursion: ManagedExcursion): ExcursionRow {
  return {
    id: excursion.id,
    slug: excursion.slug,
    title: excursion.title,
    images: excursion.images,
    logo_variant: excursion.logoVariant,
    route: excursion.route,
    teaser: excursion.teaser,
    details: excursion.details,
    // Keep legacy single column for older readers; prefer first selected region.
    region: excursion.regions[0] ?? null,
    regions: excursion.regions,
    price: excursion.price,
    is_active: excursion.isActive,
  };
}
