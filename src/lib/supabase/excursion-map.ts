import {
  isExcursionLogoVariant,
  type ManagedExcursion,
} from "@/lib/content/managed-excursion";
import type { ExcursionRegion } from "@/lib/content/excursions";

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
  is_active: boolean;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function parseRegion(value: string | null): ExcursionRegion | null {
  if (value === "latvia" || value === "france" || value === "baltics" || value === "germany") {
    return value;
  }
  return null;
}

export function excursionFromRow(row: ExcursionRow): ManagedExcursion {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    images: asStringArray(row.images),
    logoVariant: isExcursionLogoVariant(row.logo_variant) ? row.logo_variant : "dark",
    route: row.route ?? "",
    teaser: row.teaser ?? "",
    details: row.details ?? "",
    region: parseRegion(row.region),
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
    region: excursion.region,
    is_active: excursion.isActive,
  };
}
