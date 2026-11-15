import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RevealList } from "@/components/ui/reveal-list";
import { excursions } from "@/lib/content/excursions";
import { formatEuro } from "@/lib/content/format-price";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pickLocalized } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.nav.excursions };
}

export default async function ExcursionsPage() {
  const dictionary = await getDictionary();
  const locale = dictionary.locale;

  return (
    <section className="mx-auto w-full px-5 py-12 md:w-[75vw] md:px-0">
      <RevealList className="flex flex-col gap-6">
        {excursions.map((excursion, index) => {
          const imageRight = index % 2 === 1;
          const title = pickLocalized(excursion.title, locale);
          const query = new URLSearchParams({
            trip: "Excursions",
            pickup: pickLocalized({ lv: "Rīga", en: "Riga", fr: "Riga", ru: "Рига" }, locale),
            dropoff: excursion.destination ?? title,
          });
          const href = excursion.details ? `/excursions/${excursion.slug}` : `/contact?${query.toString()}`;
          const badge = excursion.fromPrice
            ? dictionary.excursions.fromPrice(formatEuro(excursion.fromPrice, locale))
            : excursion.days
              ? dictionary.excursions.days(excursion.days)
              : null;

          return (
            <article
              key={excursion.slug}
              className="grid overflow-hidden rounded-2xl border border-white/10 bg-card md:grid-cols-2"
            >
              <Link
                href={href}
                tabIndex={-1}
                aria-hidden="true"
                className={`relative block h-56 md:h-auto md:min-h-80 ${excursion.imageIsLogo ? "bg-[#242426]" : ""} ${
                  imageRight ? "md:order-2" : ""
                }`}
              >
                <Image
                  src={excursion.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 38vw, 100vw"
                  className={excursion.imageIsLogo ? "object-contain p-6" : "object-cover"}
                />
                {badge ? (
                  <span className="absolute top-4 left-4 rounded-full bg-night/80 px-3 py-1 text-xs text-ivory">
                    {badge}
                  </span>
                ) : null}
              </Link>
              <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
                <h2 className="font-serif text-3xl leading-tight tracking-wide">
                  <Link href={href} className="hover:text-white">
                    {title}
                  </Link>
                </h2>
                <p className="text-sm leading-7 text-mist">{pickLocalized(excursion.summary, locale)}</p>
                {excursion.route ? (
                  <p className="text-xs text-ivory/80">
                    <span className="text-mist">{dictionary.excursions.route}: </span>
                    {pickLocalized(excursion.route, locale)}
                  </p>
                ) : null}
                <Link
                  href={href}
                  className="self-start text-sm text-ivory underline decoration-burgundy underline-offset-4 hover:text-white"
                >
                  {excursion.details ? dictionary.excursions.details : dictionary.excursions.requestQuote}
                </Link>
              </div>
            </article>
          );
        })}
      </RevealList>
    </section>
  );
}
