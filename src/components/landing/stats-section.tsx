import { fleetCountries } from "@/lib/content/countries";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const YEARS_ON_MARKET = 10;

export async function StatsSection() {
  const dictionary = await getDictionary();
  const { stats } = dictionary;

  const items = [
    {
      value: `${YEARS_ON_MARKET}+`,
      label: stats.yearsOnMarket,
    },
    {
      value: "3500+",
      label: stats.satisfiedTravelers,
    },
    {
      value: "500+",
      label: stats.successfulTravels,
    },
    {
      value: `${fleetCountries.length}+`,
      label: stats.countriesServed,
    },
  ] as const;

  return (
    <section aria-label={stats.title} className="border-t border-white/8">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:py-14">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
          {items.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-white/10 bg-[#141418] px-5 py-6 text-center sm:px-6 sm:py-7"
            >
              <p className="font-serif text-3xl tracking-wide text-ivory sm:text-4xl">{item.value}</p>
              <p className="mt-2 text-sm leading-5 text-mist">{item.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
