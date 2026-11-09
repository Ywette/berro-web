import Image from "next/image";
import { FleetSection } from "@/components/landing/fleet-section";
import { SloganHero } from "@/components/landing/hero-scene";
import { QuoteCard } from "@/components/landing/quote-card";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function HomePage() {
  const dictionary = await getDictionary();

  return (
    <div>
      <SloganHero>
        <QuoteCard />
      </SloganHero>

      <FleetSection />

      <section id="services" className="border-t border-white/8 bg-panel">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-14 md:grid-cols-3">
          {dictionary.services.map((service) => (
            <article key={service.title} className="rounded-2xl border border-white/8 bg-card px-5 py-6">
              <span className="mb-4 block h-0.5 w-10 bg-burgundy" />
              <h2 className="text-lg font-medium">{service.title}</h2>
              <p className="mt-2 text-sm leading-6 text-mist">{service.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="border-t border-white/8">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-end">
          <h2>
            <Image
              src="/brand/berro-travel-logo.png"
              alt="Berro Travel"
              width={352}
              height={112}
              className="h-auto w-64 sm:w-80"
            />
          </h2>
          <p className="max-w-xl text-sm leading-7 text-mist">
            {dictionary.about}
          </p>
        </div>
      </section>
    </div>
  );
}
