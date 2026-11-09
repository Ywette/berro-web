import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bookingContact, excursions, findExcursion } from "@/lib/content/excursions";
import { formatEuro } from "@/lib/content/format-price";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export function generateStaticParams() {
  return excursions
    .filter((excursion) => excursion.details)
    .map((excursion) => ({ slug: excursion.slug }));
}

export async function generateMetadata({ params }: PageProps<"/excursions/[slug]">): Promise<Metadata> {
  const [{ slug }, dictionary] = await Promise.all([params, getDictionary()]);
  const excursion = findExcursion(slug);
  return { title: excursion ? excursion.title[dictionary.locale] : dictionary.nav.excursions };
}

export default function ExcursionPage({ params }: PageProps<"/excursions/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto min-h-[60vh] max-w-4xl px-5 py-12" />}>
      <ExcursionDetails params={params} />
    </Suspense>
  );
}

async function ExcursionDetails({ params }: { params: PageProps<"/excursions/[slug]">["params"] }) {
  const [{ slug }, dictionary] = await Promise.all([params, getDictionary()]);
  const excursion = findExcursion(slug);

  if (!excursion?.details) {
    notFound();
  }

  const locale = dictionary.locale;
  const details = excursion.details;
  const text = dictionary.excursions;

  return (
    <article className="mx-auto max-w-4xl px-5 py-12">
      <Link href="/excursions" className="text-sm text-mist hover:text-white">
        ← {text.back}
      </Link>
      <h1 className="mt-6 font-serif text-4xl leading-tight tracking-wide sm:text-5xl">
        {excursion.title[locale]}
      </h1>

      <div
        className={`relative mt-8 h-72 overflow-hidden rounded-2xl sm:h-96 ${excursion.imageIsLogo ? "bg-[#242426]" : ""}`}
      >
        <Image
          src={excursion.image}
          alt={excursion.title[locale]}
          fill
          priority
          sizes="(min-width: 896px) 896px, 100vw"
          className={excursion.imageIsLogo ? "object-contain p-6" : "object-cover"}
        />
      </div>

      {details.intro.length > 0 ? (
        <div className="mt-8 grid gap-4 text-base leading-8 text-ivory/90">
          {details.intro.map((paragraph) => (
            <p key={paragraph.lv}>{paragraph[locale]}</p>
          ))}
        </div>
      ) : null}

      {details.highlights ? (
        <ul className="mt-8 grid gap-3">
          {details.highlights.map((item) => (
            <li key={item.lv} className="flex gap-3 text-base leading-7">
              <CheckIcon />
              <span>{item[locale]}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {details.images ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {details.images.map((image) => (
            <div
              key={image.src}
              className={`relative h-56 overflow-hidden rounded-2xl ${image.logo ? "bg-ivory" : ""}`}
            >
              <Image
                src={image.src}
                alt={image.alt[locale]}
                fill
                sizes="(min-width: 640px) 440px, 100vw"
                className={image.logo ? "object-contain p-8" : "object-cover"}
              />
            </div>
          ))}
        </div>
      ) : null}

      {details.callout ? (
        <p className="mt-8 rounded-2xl border border-burgundy/40 bg-burgundy/15 px-5 py-4 text-center font-serif text-xl tracking-wide">
          {details.callout[locale]}
        </p>
      ) : null}

      {details.offers ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {details.offers.map((offer) => (
            <section key={offer.title.lv} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-card p-6">
              <div>
                <h2 className="text-xl font-medium">{offer.title[locale]}</h2>
                <p className="mt-1 text-lg text-burgundy">
                  {text.fromPrice(formatEuro(offer.fromPrice, locale))}
                </p>
              </div>
              <div>
                <p className="text-xs tracking-[0.18em] text-mist uppercase">{text.included}</p>
                <ul className="mt-2 grid gap-2 text-sm">
                  {offer.includes.map((item) => (
                    <li key={item.lv} className="flex gap-2">
                      <CheckIcon />
                      <span>{item[locale]}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {offer.notes ? (
                <div className="mt-auto grid gap-1 text-xs leading-5 text-mist">
                  {offer.notes.map((note) => (
                    <p key={note.lv}>{note[locale]}</p>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      ) : null}

      {details.terms ? (
        <ul className="mt-8 grid gap-3 rounded-2xl border border-white/10 bg-panel p-6">
          {details.terms.map((term) => (
            <li key={term.lv} className="flex gap-3 text-sm leading-6">
              <CheckIcon />
              <span>{term[locale]}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <section className="mt-10 rounded-2xl border border-white/10 bg-card p-6">
        <h2 className="font-serif text-2xl tracking-wide">{text.bookingTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-mist">{text.bookingBody}</p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          <ContactItem label={text.email} href={`mailto:${bookingContact.email}`} value={bookingContact.email} />
          <ContactItem
            label={text.phone}
            href={`tel:${bookingContact.phone.replace(/\s/g, "")}`}
            value={bookingContact.phone}
          />
          <ContactItem label={text.website} href={`https://${bookingContact.website}`} value={bookingContact.website} />
        </dl>
        {details.closing ? <p className="mt-4 text-sm text-ivory/90">{details.closing[locale]}</p> : null}
      </section>
    </article>
  );
}

function ContactItem({ label, href, value }: { label: string; href: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-mist">{label}</dt>
      <dd>
        <a href={href} className="text-ivory underline decoration-burgundy underline-offset-4 hover:text-white">
          {value}
        </a>
      </dd>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="mt-1 h-4 w-4 shrink-0 text-burgundy" aria-hidden="true">
      <path d="M4 10.5 8 14.5 16 5.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
