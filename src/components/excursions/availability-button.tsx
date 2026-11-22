"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import { HeroBooking, type HeroBookingPrefill } from "@/components/landing/hero-booking";
import {
  buildExcursionBookingPrefill,
  type ExcursionQuoteOption,
} from "@/lib/excursions/booking-prefill";

type AvailabilityButtonProps = {
  slug: string;
  title: string;
  route?: string;
  teaser?: string;
  destination?: string;
  durationDays?: number | null;
  plannedDate?: string | null;
  isRegistrationOpen: boolean;
  image: string;
  excursions: ExcursionQuoteOption[];
};

function toPrefill(option: ExcursionQuoteOption): HeroBookingPrefill {
  const built = buildExcursionBookingPrefill(option);
  return {
    service: built.service,
    pickup: built.pickup,
    dropoff: built.dropoff,
    tripMode: built.tripMode,
    stops: built.stops,
    travelType: built.travelType,
    travelTypeDetail: built.travelTypeDetail,
    planNote: built.planNote,
    excursionSlug: built.excursionSlug,
    excursionTitle: built.excursionTitle,
    durationDays: built.durationDays,
    plannedDate: built.plannedDate,
  };
}

export function AvailabilityButton({
  slug,
  title,
  route,
  teaser,
  destination,
  durationDays = null,
  plannedDate = null,
  isRegistrationOpen,
  image,
  excursions,
}: AvailabilityButtonProps) {
  const dictionary = useDictionary();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const options = useMemo<ExcursionQuoteOption[]>(() => {
    if (excursions.some((item) => item.slug === slug)) return excursions;
    return [{ slug, title, route, teaser, destination, durationDays, plannedDate }, ...excursions];
  }, [destination, durationDays, excursions, plannedDate, route, slug, teaser, title]);

  const [selectedSlug, setSelectedSlug] = useState(slug);
  const selected = useMemo(() => {
    return (
      options.find((item) => item.slug === selectedSlug) ??
      options[0] ?? {
        slug,
        title,
        route,
        teaser,
        destination,
        durationDays,
        plannedDate,
      }
    );
  }, [destination, durationDays, options, plannedDate, route, selectedSlug, slug, teaser, title]);
  const prefill = useMemo(() => toPrefill(selected), [selected]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="order-button text-base sm:text-xl"
      >
        {isRegistrationOpen ? dictionary.excursions.reserveSeat : dictionary.excursions.checkAvailability}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="availability-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="request-form popup-enter m-auto max-h-[calc(100dvh-1rem)] w-[min(44rem,calc(100vw-1rem))] overflow-visible bg-transparent p-0 text-ivory backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      >
        <div
          className="relative overflow-visible bg-cover bg-center"
          style={image ? { backgroundImage: `url('${image}')` } : undefined}
        >
          <div className="min-h-[min(36rem,calc(100dvh-3rem))] bg-black/60 p-4 sm:min-h-[min(42rem,calc(100dvh-2.5rem))] sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3 px-1">
              <div className="min-w-0">
                <h2 id="availability-title" className="font-serif text-2xl tracking-wide sm:text-3xl">
                  {dictionary.excursions.availabilityTitle}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-ivory/80">{selected.title}</p>
              </div>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label={dictionary.blog.close}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ivory/80 hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M5 5l10 10M15 5 5 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <Suspense
              fallback={
                <div className="h-56 animate-pulse bg-white/10" aria-hidden="true" />
              }
            >
              <HeroBooking
                key={selected.slug}
                prefill={prefill}
                variant="panel"
                excursionOptions={options}
                onExcursionChange={setSelectedSlug}
              />
            </Suspense>
          </div>
        </div>
      </dialog>
    </>
  );
}
