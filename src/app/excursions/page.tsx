import type { Metadata } from "next";
import { Suspense } from "react";
import {
  ExcursionsCatalog,
  type ExcursionCardData,
} from "@/components/excursions/excursions-catalog";
import { listActiveManagedExcursions } from "@/lib/data/managed-excursions";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.nav.excursions };
}

export default function ExcursionsPage() {
  return (
    <Suspense fallback={<section className="mx-auto max-w-7xl px-5 py-12 md:py-14" />}>
      <ExcursionsCatalogSection />
    </Suspense>
  );
}

async function ExcursionsCatalogSection() {
  const dictionary = await getDictionary();
  const managed = await listActiveManagedExcursions();

  const items: ExcursionCardData[] = managed.map((excursion) => ({
    slug: excursion.slug,
    href: `/excursions/${excursion.slug}`,
    title: excursion.title,
    route: excursion.route,
    description: excursion.teaser,
    cta: dictionary.excursions.more,
    images: excursion.images,
    logoVariant: excursion.logoVariant,
    regions: excursion.regions,
  }));

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 md:py-14">
      <ExcursionsCatalog
        items={items}
        filterLabel={dictionary.excursions.filterLabel}
        filterAll={dictionary.excursions.filterAll}
        filterEmpty={dictionary.excursions.filterEmpty}
        regionLabels={{
          latvia: dictionary.excursions.filterLatvia,
          estonia: dictionary.excursions.filterEstonia,
          lithuania: dictionary.excursions.filterLithuania,
          france: dictionary.excursions.filterFrance,
          baltics: dictionary.excursions.filterBaltics,
          germany: dictionary.excursions.filterGermany,
        }}
      />
    </section>
  );
}
