import type { ManagedExcursion } from "@/lib/content/managed-excursion";
import { localizedFromSeed, slugifyExcursionTitle } from "@/lib/content/managed-excursion";
import {
  deleteManagedExcursion,
  insertManagedExcursion,
  readExcursionStore,
  updateManagedExcursion,
} from "@/lib/excursions/store";
import type { Localized } from "@/lib/i18n/locale";
import { deleteCompanyDocumentFile } from "@/lib/documents/upload";

export async function listManagedExcursions(): Promise<ManagedExcursion[]> {
  return readExcursionStore();
}

export async function getManagedExcursionBySlug(
  slug: string,
): Promise<ManagedExcursion | null> {
  const items = await readExcursionStore();
  return items.find((item) => item.slug === slug) ?? null;
}

function uniqueSlug(title: Localized | string, existing: ManagedExcursion[], excludeId?: string): string {
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
  input: Omit<ManagedExcursion, "id" | "slug" | "teaser"> & { slug?: string },
): Promise<ManagedExcursion> {
  const existing = await readExcursionStore();
  const excursion: ManagedExcursion = {
    id: `excursion-${crypto.randomUUID()}`,
    slug: uniqueSlug(input.title, existing),
    title: input.title,
    images: input.images,
    logoVariant: input.logoVariant,
    route: input.route,
    teaser: localizedFromSeed(),
    details: input.details,
    descriptionDocument: input.descriptionDocument,
    regions: input.regions,
    price: input.price,
    durationDays: input.durationDays,
    plannedDate: input.plannedDate,
    isActive: input.isActive,
  };
  return insertManagedExcursion(excursion);
}

export async function updateManagedExcursionById(
  id: string,
  input: Omit<ManagedExcursion, "id" | "slug" | "teaser">,
  removalPath?: string,
): Promise<ManagedExcursion | null> {
  const existing = await readExcursionStore();
  const current = existing.find((item) => item.id === id);
  if (!current || (removalPath && current.descriptionDocument?.filePath !== removalPath)) return null;
  const next: ManagedExcursion = {
    ...current,
    title: input.title,
    images: input.images,
    logoVariant: input.logoVariant,
    route: input.route,
    details: input.details,
    descriptionDocument: input.descriptionDocument,
    regions: input.regions,
    price: input.price,
    durationDays: input.durationDays,
    plannedDate: input.plannedDate,
    isActive: input.isActive,
    slug: uniqueSlug(input.title, existing, id),
  };
  const updated = await updateManagedExcursion(next, current.descriptionDocument?.filePath);
  if (updated && input.descriptionDocument !== undefined && current.descriptionDocument) {
    await deleteCompanyDocumentFile(current.descriptionDocument.filePath);
  }
  return updated;
}

export async function removeManagedExcursion(id: string): Promise<boolean> {
  return deleteManagedExcursion(id);
}
