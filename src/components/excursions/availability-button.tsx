"use client";

import { useMemo, useRef } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import { QuoteCard, type QuoteDefaults } from "@/components/landing/quote-card";

type AvailabilityButtonProps = {
  title: string;
  destination?: string;
  days?: number;
  image: string;
};

const placeByDestination: Record<string, { label: { lv: string; en: string }; placeId: string }> = {
  Paris: { label: { lv: "Parīze, Francija", en: "Paris, France" }, placeId: "local:paris" },
  Berlin: { label: { lv: "Berlīne, Vācija", en: "Berlin, Germany" }, placeId: "local:berlin" },
  Luxembourg: { label: { lv: "Luksemburga, Luksemburga", en: "Luxembourg, Luxembourg" }, placeId: "local:luxembourg" },
  Alps: { label: { lv: "Alpi, Austrija", en: "Alps, Austria" }, placeId: "local:vienna" },
  "Disneyland Paris": {
    label: { lv: "Disneyland Paris, Francija", en: "Disneyland Paris, France" },
    placeId: "local:disneyland-paris",
  },
  "Moulin Rouge": {
    label: { lv: "Moulin Rouge, Parīze", en: "Moulin Rouge, Paris" },
    placeId: "local:moulin-rouge",
  },
};

export function AvailabilityButton({ title, destination, days, image }: AvailabilityButtonProps) {
  const dictionary = useDictionary();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const defaults = useMemo(
    () => buildDefaults({ title, destination, days, locale: dictionary.locale }),
    [title, destination, days, dictionary.locale],
  );

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
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(28rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl bg-transparent p-0 text-ivory backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div
          className="relative overflow-hidden rounded-2xl bg-cover bg-center"
          style={{ backgroundImage: `url('${image}')` }}
        >
          <div className="bg-black/55 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="availability-title" className="font-serif text-2xl tracking-wide">
                {dictionary.excursions.availabilityTitle}
              </h2>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label={dictionary.blog.close}
                className="grid h-8 w-8 place-items-center rounded-full text-ivory/80 hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                  <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p className="mb-3 line-clamp-2 text-sm text-ivory/80">{title}</p>
            <QuoteCard
              formId="excursion-availability"
              defaults={defaults}
              requirePassengerChoice
              showDocument={false}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}

function buildDefaults({
  title,
  destination,
  days,
  locale,
}: {
  title: string;
  destination?: string;
  days?: number;
  locale: "lv" | "en";
}): QuoteDefaults {
  const pickup =
    locale === "lv"
      ? { text: "Rīga, Latvija", placeId: "local:riga" }
      : { text: "Riga, Latvia", placeId: "local:riga" };

  const mapped =
    (destination && placeByDestination[destination]) ||
    (title.toLowerCase().includes("moulin")
      ? placeByDestination["Moulin Rouge"]
      : title.toLowerCase().includes("disney")
        ? placeByDestination["Disneyland Paris"]
        : null);

  const dropoff = mapped
    ? { text: mapped.label[locale], placeId: mapped.placeId }
    : {
        text: destination ?? title,
        placeId: "",
      };

  const start = defaultDeparture(days);
  const end = defaultReturn(start, days);

  return {
    trip: "Round Trip",
    pickup: pickup.text,
    pickupPlace: pickup.placeId,
    dropoff: dropoff.text,
    dropoffPlace: dropoff.placeId,
    departure: toLocalInput(start),
    returnAt: toLocalInput(end),
  };
}

function defaultDeparture(days?: number) {
  const date = new Date();
  date.setHours(8, 0, 0, 0);
  date.setDate(date.getDate() + (days && days > 3 ? 21 : 14));
  return date;
}

function defaultReturn(departure: Date, days?: number) {
  const end = new Date(departure);
  end.setDate(end.getDate() + Math.max((days ?? 2) - 1, 1));
  end.setHours(18, 0, 0, 0);
  return end;
}

function toLocalInput(date: Date) {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 16);
}
