import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { excursions } from "@/lib/content/excursions";
import { formatEuro } from "@/lib/content/format-price";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.nav.excursions };
}

export default async function ExcursionsPage() {
  const dictionary = await getDictionary();
  const locale = dictionary.locale;

  return (
    <section className="mx-auto max-w-7xl px-5 py-12">
      <div className="mb-8 max-w-3xl">
        <p className="text-xs tracking-[0.22em] text-burgundy uppercase">{dictionary.excursions.kicker}</p>
        <h1 className="mt-3 font-serif text-5xl tracking-wide">{dictionary.excursions.title}</h1>
        <p className="mt-3 text-sm leading-6 text-mist">{dictionary.excursions.intro}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {excursions.map((excursion) => {
          const query = new URLSearchParams({
            trip: "Round Trip",
            pickup: locale === "lv" ? "Rīga" : "Riga",
            dropoff: excursion.destination ?? excursion.title[locale],
          });
          const badge = excursion.fromPrice
            ? dictionary.excursions.fromPrice(formatEuro(excursion.fromPrice, locale))
            : excursion.days
              ? dictionary.excursions.days(excursion.days)
              : null;

          return (
            <article
              key={excursion.slug}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-card"
            >
              <div className={`relative h-56 ${excursion.imageIsLogo ? "bg-[#242426]" : ""}`}>
                <Image
                  src={excursion.image}
                  alt={excursion.title[locale]}
                  fill
                  sizes="(min-width: 768px) 45vw, 90vw"
                  className={excursion.imageIsLogo ? "object-contain p-4" : "object-cover"}
                />
                {badge ? (
                  <span className="absolute top-4 left-4 rounded-full bg-night/80 px-3 py-1 text-xs text-ivory">
                    {badge}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h2 className="font-serif text-2xl tracking-wide">{excursion.title[locale]}</h2>
                <p className="text-sm leading-6 text-mist">{excursion.summary[locale]}</p>
                {excursion.route ? (
                  <p className="text-xs text-ivory/80">
                    <span className="text-mist">{dictionary.excursions.route}: </span>
                    {excursion.route[locale]}
                  </p>
                ) : null}
                <Link
                  href={excursion.details ? `/excursions/${excursion.slug}` : `/contact?${query.toString()}`}
                  className="mt-auto self-start rounded-full bg-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-burgundy-deep"
                >
                  {excursion.details ? dictionary.excursions.details : dictionary.excursions.requestQuote}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
