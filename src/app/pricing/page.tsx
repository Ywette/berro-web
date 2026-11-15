import type { Metadata } from "next";
import { PriceSimulator } from "@/components/pricing/price-simulator";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.nav.pricing };
}

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12">
      <PriceSimulator />
    </section>
  );
}
