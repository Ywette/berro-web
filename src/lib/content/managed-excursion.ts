import type { ExcursionRegion } from "@/lib/content/excursions";

/** Staff-managed excursion listing card (JSON store). */
export type ManagedExcursion = {
  id: string;
  slug: string;
  title: string;
  image: string;
  route: string;
  teaser: string;
  region: ExcursionRegion | null;
  isActive: boolean;
};

export function slugifyExcursionTitle(title: string): string {
  const base = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return base || `excursion-${Date.now().toString(36)}`;
}
