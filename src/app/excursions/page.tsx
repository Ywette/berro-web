import type { Metadata } from "next";
import { Suspense } from "react";
import {
  ExcursionsCatalog,
  type ExcursionCardData,
} from "@/components/excursions/excursions-catalog";
import { formatEuro } from "@/lib/content/format-price";
import { listManagedExcursions } from "@/lib/data/managed-excursions";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pickLocalizedText } from "@/lib/i18n/localized-content";

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
  const managed = await listManagedExcursions();

  const locale = dictionary.locale;
  const items: ExcursionCardData[] = managed.map((excursion) => {
    const days = excursion.durationDays;
    return {
      slug: excursion.slug,
      href: `/excursions/${excursion.slug}`,
      title: pickLocalizedText(excursion.title, locale),
      route: pickLocalizedText(excursion.route, locale),
      duration: days == null ? dictionary.excursions.durationUnset : dictionary.excursions.days(days),
      cta: dictionary.excursions.more,
      images: excursion.images,
      logoVariant: excursion.logoVariant,
      regions: excursion.regions,
      isActive: excursion.isActive,
      plannedDate: excursion.plannedDate || undefined,
      priceLabel:
        excursion.price != null
          ? dictionary.excursions.fromPrice(formatEuro(excursion.price, locale))
          : undefined,
    };
  });

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 md:py-14">
      <ExcursionsCatalog
        items={items}
        filterLabel={dictionary.excursions.filterLabel}
        filterAll={dictionary.excursions.filterAll}
        filterEmpty={dictionary.excursions.filterEmpty}
        filterRegistrationOpen={dictionary.excursions.filterRegistrationOpen}
        filterAllRegistrations={dictionary.excursions.filterAllRegistrations}
        locale={locale}
        applyForLabel={dictionary.excursions.applyFor}
        durationLabel={dictionary.excursions.durationLabel}
        regionLabels={{
          latvia: dictionary.excursions.filterLatvia,
          estonia: dictionary.excursions.filterEstonia,
          lithuania: dictionary.excursions.filterLithuania,
          france: dictionary.excursions.filterFrance,
          belgium: dictionary.excursions.filterBelgium,
          baltics: dictionary.excursions.filterBaltics,
          germany: dictionary.excursions.filterGermany,
        }}
      />
    </section>
  );
}
