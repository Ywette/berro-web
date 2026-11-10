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

      <section id="about" className="scroll-mt-[var(--site-header-height)] border-t border-white/8">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16 lg:py-20">
          <div>
            <h2 className="font-serif text-3xl leading-tight text-ivory sm:text-4xl">
              {dictionary.about.title}
            </h2>
            <p className="mt-5 text-base font-medium leading-7 text-ivory">{dictionary.about.lead}</p>
          </div>
          <div>
            <div className="space-y-4 text-sm leading-7 text-mist">
              {dictionary.about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <p className="mt-6 text-base font-medium leading-7 text-ivory">{dictionary.about.closing}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#book"
                className="rounded-full bg-burgundy px-5 py-2.5 text-sm font-medium text-white hover:bg-burgundy-deep"
              >
                {dictionary.about.planTrip}
              </a>
              <a
                href="#fleet"
                className="rounded-full border border-white/25 px-5 py-2.5 text-sm text-ivory hover:border-white/60"
              >
                {dictionary.about.viewFleet}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
