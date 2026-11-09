import type { Metadata } from "next";
import { PriceSimulator } from "@/components/pricing/price-simulator";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.nav.pricing };
}

export default async function PricingPage() {
  const dictionary = await getDictionary();

  return (
    <section className="mx-auto max-w-7xl px-5 py-12">
      <div className="mb-8 max-w-3xl">
        <p className="text-xs tracking-[0.22em] text-burgundy uppercase">{dictionary.pricing.kicker}</p>
        <h1 className="mt-3 font-serif text-5xl tracking-wide">{dictionary.pricing.title}</h1>
        <p className="mt-3 text-sm leading-6 text-mist">{dictionary.pricing.intro}</p>
      </div>
      <PriceSimulator />
    </section>
  );
}
