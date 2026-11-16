"use client";

import { Suspense, useMemo, useRef } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import { HeroBooking, type HeroBookingPrefill } from "@/components/landing/hero-booking";
import { buildExcursionBookingPrefill } from "@/lib/excursions/booking-prefill";

type AvailabilityButtonProps = {
  title: string;
  route?: string;
  teaser?: string;
  destination?: string;
  image: string;
};

export function AvailabilityButton({
  title,
  route,
  teaser,
  destination,
  image,
}: AvailabilityButtonProps) {
  const dictionary = useDictionary();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prefill = useMemo<HeroBookingPrefill>(() => {
    const built = buildExcursionBookingPrefill({ title, route, teaser, destination });
    return {
      service: built.service,
      pickup: built.pickup,
      dropoff: built.dropoff,
      tripMode: built.tripMode,
      stops: built.stops,
      travelType: built.travelType,
      travelTypeDetail: built.travelTypeDetail,
      planNote: built.planNote,
    };
  }, [title, route, teaser, destination]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="mt-5 rounded-full bg-burgundy px-5 py-2.5 text-sm font-medium text-white hover:bg-burgundy-deep"
      >
        {dictionary.excursions.checkAvailability}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="availability-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="popup-enter m-auto max-h-[calc(100dvh-1.5rem)] w-[min(40rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl bg-transparent p-0 text-ivory backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      >
        <div
          className="relative overflow-hidden rounded-2xl bg-cover bg-center"
          style={{ backgroundImage: `url('${image}')` }}
        >
          <div className="bg-black/60 p-3 sm:p-4">
            <div className="mb-3 flex items-start justify-between gap-3 px-1">
              <div className="min-w-0">
                <h2 id="availability-title" className="font-serif text-2xl tracking-wide">
                  {dictionary.excursions.availabilityTitle}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-ivory/80">{title}</p>
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
                <div className="h-48 animate-pulse rounded-2xl bg-white/10" aria-hidden="true" />
              }
            >
              <HeroBooking prefill={prefill} variant="panel" />
            </Suspense>
          </div>
        </div>
      </dialog>
    </>
  );
}
