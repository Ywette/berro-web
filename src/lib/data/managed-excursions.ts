import type { ManagedExcursion } from "@/lib/content/managed-excursion";
import { slugifyExcursionTitle } from "@/lib/content/managed-excursion";
import {
  deleteManagedExcursion,
  insertManagedExcursion,
  readExcursionStore,
  updateManagedExcursion,
} from "@/lib/excursions/store";

export async function listManagedExcursions(): Promise<ManagedExcursion[]> {
  return readExcursionStore();
}

export async function listActiveManagedExcursions(): Promise<ManagedExcursion[]> {
  const items = await readExcursionStore();
  return items.filter((item) => item.isActive);
}

export async function getManagedExcursionBySlug(
  slug: string,
): Promise<ManagedExcursion | null> {
  const items = await readExcursionStore();
  return items.find((item) => item.slug === slug && item.isActive) ?? null;
}

function uniqueSlug(title: string, existing: ManagedExcursion[], excludeId?: string): string {
  const base = slugifyExcursionTitle(title);
  let slug = base;
  let n = 2;
  while (existing.some((item) => item.slug === slug && item.id !== excludeId)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export async function createManagedExcursion(
  input: Omit<ManagedExcursion, "id" | "slug" | "isActive"> & { slug?: string },
): Promise<ManagedExcursion> {
  const existing = await readExcursionStore();
  const excursion: ManagedExcursion = {
    id: `excursion-${crypto.randomUUID()}`,
    slug: uniqueSlug(input.title, existing),
    title: input.title,
    images: input.images,
    logoVariant: input.logoVariant,
    route: input.route,
    teaser: input.teaser,
    details: input.details,
    region: input.region,
    isActive: true,
  };
  return insertManagedExcursion(excursion);
}

export async function updateManagedExcursionById(
  id: string,
  input: Omit<ManagedExcursion, "id" | "slug" | "isActive">,
): Promise<ManagedExcursion | null> {
  const existing = await readExcursionStore();
  const current = existing.find((item) => item.id === id);
  if (!current) return null;
  const next: ManagedExcursion = {
    ...current,
    title: input.title,
    images: input.images,
    logoVariant: input.logoVariant,
    route: input.route,
    teaser: input.teaser,
    details: input.details,
    region: input.region,
    slug: uniqueSlug(input.title, existing, id),
  };
  return updateManagedExcursion(next);
}

export async function removeManagedExcursion(id: string): Promise<boolean> {
  return deleteManagedExcursion(id);
}
