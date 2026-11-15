import { Suspense } from "react";
import type { Metadata } from "next";
import { TransportCatalog } from "@/components/autoparks/transport-catalog";
import { listVehicles } from "@/lib/data/vehicles";
import { getDictionary, getLocale } from "@/lib/i18n/get-dictionary";

/** Public fleet listing reads cookies + filesystem store. */
export const instant = false;

export const metadata: Metadata = {
  title: "Autoparks",
};

export default function AutoparksPage() {
  return (
    <Suspense fallback={<section className="mx-auto max-w-7xl px-5 py-16 lg:py-20" />}>
      <AutoparksContent />
    </Suspense>
  );
}

async function AutoparksContent() {
  const [dictionary, locale, vehicles] = await Promise.all([
    getDictionary(),
    getLocale(),
    listVehicles(),
  ]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
      <p className="max-w-3xl text-sm leading-7 text-mist sm:text-base">{dictionary.autoparks.intro}</p>

      <TransportCatalog vehicles={vehicles} locale={locale} labels={dictionary.autoparks} />
    </section>
  );
}
