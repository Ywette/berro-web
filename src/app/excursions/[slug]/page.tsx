import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvailabilityButton } from "@/components/excursions/availability-button";
import { ExcursionCollage } from "@/components/excursions/excursion-collage";
import { bookingContact, getExcursionDetails } from "@/lib/content/excursions";
import { formatEuro } from "@/lib/content/format-price";
import {
  excursionCoverImage,
  excursionLogoPlateFromIndex,
} from "@/lib/content/managed-excursion";
import {
  getManagedExcursionBySlug,
  listActiveManagedExcursions,
} from "@/lib/data/managed-excursions";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pickLocalized } from "@/lib/i18n/locale";
import { pickLocalizedText } from "@/lib/i18n/localized-content";

export const instant = false;

export async function generateStaticParams() {
  const excursions = await listActiveManagedExcursions();
  return excursions.map((excursion) => ({ slug: excursion.slug }));
}

export async function generateMetadata({ params }: PageProps<"/excursions/[slug]">): Promise<Metadata> {
  const [{ slug }, dictionary] = await Promise.all([params, getDictionary()]);
  const excursion = await getManagedExcursionBySlug(slug);
  return {
    title: excursion
      ? pickLocalizedText(excursion.title, dictionary.locale)
      : dictionary.nav.excursions,
  };
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
  const excursion = await getManagedExcursionBySlug(slug);

  if (!excursion) {
    notFound();
  }

  const locale = dictionary.locale;
  const details = getExcursionDetails(slug);
  const text = dictionary.excursions;
  const title = pickLocalizedText(excursion.title, locale);
  const route = pickLocalizedText(excursion.route, locale);
  const teaser = pickLocalizedText(excursion.teaser, locale);
  const detailsText = pickLocalizedText(excursion.details, locale);
  const coverImage = excursionCoverImage(excursion);
  const activeExcursions = await listActiveManagedExcursions();
  const listIndex = activeExcursions.findIndex((item) => item.slug === slug);
  const logoVariant = excursionLogoPlateFromIndex(listIndex < 0 ? 0 : listIndex);

  return (
    <article className="mx-auto max-w-4xl px-5 py-12">
      <Link href="/excursions" className="text-sm text-mist hover:text-white">
        ← {text.back}
      </Link>
      <h1 className="mt-6 font-serif text-4xl leading-tight tracking-wide sm:text-5xl">
        {title}
      </h1>

      {route ? (
        <p className="mt-3 text-sm font-medium tracking-wide text-champagne/90">{route}</p>
      ) : null}

      {excursion.price != null ? (
        <p className="mt-3 text-lg font-medium text-burgundy">
          {text.fromPrice(formatEuro(excursion.price, locale))}
        </p>
      ) : null}

      {teaser ? (
        <p className="mt-4 text-base leading-7 text-ivory/90">{teaser}</p>
      ) : null}

      <ExcursionCollage
        images={excursion.images}
        logoVariant={logoVariant}
        alt={title}
        priority
        className="relative mt-8 h-72 overflow-hidden rounded-2xl sm:h-96"
        sizes="(min-width: 896px) 896px, 100vw"
      />

      {detailsText ? (
        <div className="mt-8 grid gap-4 text-base leading-8 text-ivory/90">
          {detailsText
            .split(/\n\s*\n/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .map((paragraph) => (
              <p key={paragraph} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
        </div>
      ) : details?.intro && details.intro.length > 0 ? (
        <div className="mt-8 grid gap-4 text-base leading-8 text-ivory/90">
          {details.intro.map((paragraph) => (
            <p key={paragraph.lv}>{pickLocalized(paragraph, locale)}</p>
          ))}
        </div>
      ) : null}

      {details?.highlights ? (
        <ul className="mt-8 grid gap-3">
          {details.highlights.map((item) => (
            <li key={item.lv} className="flex gap-3 text-base leading-7">
              <CheckIcon />
              <span>{pickLocalized(item, locale)}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {details?.images ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {details.images.map((image) => (
            <div
              key={image.src}
              className={`relative h-56 overflow-hidden rounded-2xl ${image.logo ? "bg-ivory" : ""}`}
            >
              <Image
                src={image.src}
                alt={pickLocalized(image.alt, locale)}
                fill
                sizes="(min-width: 640px) 440px, 100vw"
                className={image.logo ? "object-contain p-8" : "object-cover"}
              />
            </div>
          ))}
        </div>
      ) : null}

      {details?.callout ? (
        <p className="mt-8 rounded-2xl border border-burgundy/40 bg-burgundy/15 px-5 py-4 text-center font-serif text-xl tracking-wide">
          {pickLocalized(details.callout, locale)}
        </p>
      ) : null}

      {details?.offers ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {details.offers.map((offer) => (
            <section key={offer.title.lv} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-card p-6">
              <div>
                <h2 className="text-xl font-medium">{pickLocalized(offer.title, locale)}</h2>
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
                      <span>{pickLocalized(item, locale)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {offer.notes ? (
                <div className="mt-auto grid gap-1 text-xs leading-5 text-mist">
                  {offer.notes.map((note) => (
                    <p key={note.lv}>{pickLocalized(note, locale)}</p>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      ) : null}

      {details?.terms ? (
        <ul className="mt-8 grid gap-3 rounded-2xl border border-white/10 bg-panel p-6">
          {details.terms.map((term) => (
            <li key={term.lv} className="flex gap-3 text-sm leading-6">
              <CheckIcon />
              <span>{pickLocalized(term, locale)}</span>
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
        <AvailabilityButton
          slug={excursion.slug}
          title={title}
          route={route || undefined}
          teaser={teaser || undefined}
          durationDays={excursion.durationDays}
          destination={
            excursion.slug === "moulin-rouge"
              ? "Moulin Rouge"
              : excursion.slug === "disneyland"
                ? "Disneyland Paris"
                : excursion.slug === "paris"
                  ? "Paris"
                  : excursion.slug === "berlin"
                    ? "Berlin"
                    : excursion.slug === "luxembourg"
                      ? "Luxembourg"
                      : excursion.slug === "alps"
                        ? "Alps"
                        : undefined
          }
          image={coverImage}
          excursions={activeExcursions.map((item) => ({
            slug: item.slug,
            title: pickLocalizedText(item.title, locale),
            route: pickLocalizedText(item.route, locale) || undefined,
            teaser: pickLocalizedText(item.teaser, locale) || undefined,
            durationDays: item.durationDays,
          }))}
        />
        {details?.closing ? (
          <p className="mt-4 text-sm text-ivory/90">{pickLocalized(details.closing, locale)}</p>
        ) : null}
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
