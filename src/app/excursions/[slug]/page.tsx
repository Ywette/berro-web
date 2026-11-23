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
  listManagedExcursions,
} from "@/lib/data/managed-excursions";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { intlLocales, pickLocalized, type Locale } from "@/lib/i18n/locale";
import { pickLocalizedText } from "@/lib/i18n/localized-content";

export const instant = false;

export async function generateStaticParams() {
  const excursions = await listManagedExcursions();
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
  const excursions = await listManagedExcursions();
  const listIndex = excursions.findIndex((item) => item.slug === slug);
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
        <p className="mt-3 text-sm font-medium tracking-wide text-champagne/90 uppercase">{route}</p>
      ) : null}

      {excursion.price != null ? (
        <p className="mt-3 text-lg font-medium text-burgundy">
          {text.fromPrice(formatEuro(excursion.price, locale))}
        </p>
      ) : null}

      {teaser ? (
        <p className="mt-4 text-base/7 text-ivory/90">{teaser}</p>
      ) : null}

      {excursion.images.length > 0 && (
        <ExcursionCollage
          images={excursion.images}
          logoVariant={logoVariant}
          alt={title}
          priority
          className="relative mt-8 h-72 overflow-hidden rounded-2xl sm:h-96"
          sizes="(min-width: 896px) 896px, 100vw"
        />
      )}

      {detailsText ? (
        <div className="mt-8 grid gap-4 text-base/7 text-ivory/90">
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
        <div className="mt-8 grid gap-4 text-base/7 text-ivory/90">
          {details.intro.map((paragraph) => (
            <p key={paragraph.lv}>{pickLocalized(paragraph, locale)}</p>
          ))}
        </div>
      ) : null}

      {excursion.descriptionDocument && (
        <p className="mt-6 text-base/7 text-ivory">
          {text.planAvailable}{" "}
          <a
            href={`/excursions/${encodeURIComponent(excursion.slug)}/plan`}
            className="text-champagne underline underline-offset-4 hover:text-ivory"
          >
            {text.openPlan}
          </a>
        </p>
      )}

      {details?.highlights ? (
        <ul className="mt-8 grid gap-3">
          {details.highlights.map((item) => (
            <li key={item.lv} className="flex gap-3 text-base/7">
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

      <section id="booking" aria-label={text.bookingTitle} className="mt-10 scroll-mt-[calc(var(--site-header-height)+1rem)] bg-panel px-4 py-5 sm:px-6">
        <div className="mb-3 flex flex-col items-center gap-4 border-b border-champagne/75 pb-4 text-center">
          {excursion.plannedDate && (
            <time dateTime={excursion.plannedDate} className="text-2xl text-champagne sm:text-3xl">
              {formatBookingDate(excursion.plannedDate, locale)}
            </time>
          )}
          <AvailabilityButton
            slug={excursion.slug}
            title={title}
            route={route || undefined}
            teaser={teaser || undefined}
            durationDays={excursion.durationDays}
            plannedDate={excursion.plannedDate}
            isRegistrationOpen={excursion.isActive}
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
            excursions={excursions.map((item) => ({
              slug: item.slug,
              title: pickLocalizedText(item.title, locale),
              route: pickLocalizedText(item.route, locale) || undefined,
              teaser: pickLocalizedText(item.teaser, locale) || undefined,
              durationDays: item.durationDays,
              plannedDate: item.plannedDate,
            }))}
          />
        </div>
        <ul className="flex flex-col items-center gap-2 text-lg sm:flex-row sm:justify-center sm:gap-0 sm:divide-x sm:divide-champagne/75 sm:[&>li]:px-5">
          <ContactItem href={`tel:${bookingContact.phone.replace(/\s/g, "")}`}>
            {bookingContact.phone}
          </ContactItem>
          <ContactItem href={`mailto:${bookingContact.email}`}>{bookingContact.email}</ContactItem>
          <ContactItem href={bookingContact.licenceUrl}>
            {text.tourOperatorLicence} <span aria-hidden="true">↗</span>
          </ContactItem>
        </ul>
        {excursion.isActive && details?.closing && (
          <p className="mt-4 text-sm text-ivory/90">{pickLocalized(details.closing, locale)}</p>
        )}
      </section>
    </article>
  );
}

function formatBookingDate(date: string, locale: Locale) {
  const formatter = new Intl.DateTimeFormat(intlLocales[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const value = new Date(date);

  if (locale !== "lv") return formatter.format(value);

  const parts = formatter.formatToParts(value);
  const get = (type: "day" | "month" | "year") => parts.find((part) => part.type === type)?.value;
  return `${get("day")}. ${get("month")} ${get("year")}`;
}

function ContactItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a href={href} className="text-ivory underline decoration-burgundy decoration-2 underline-offset-4 hover:text-white">
        {children}
      </a>
    </li>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="mt-1 h-4 w-4 shrink-0 text-burgundy" aria-hidden="true">
      <path d="M4 10.5 8 14.5 16 5.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
