"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { FleetPhoto } from "@/lib/content/fleet-photos";
import { pickLocalized, type Locale } from "@/lib/i18n/locale";

type FleetPhotoGalleryProps = {
  photos: FleetPhoto[];
  locale: Locale;
  title: string;
  closeLabel: string;
  prevLabel: string;
  nextLabel: string;
};

export function FleetPhotoGallery({
  photos,
  locale,
  title,
  closeLabel,
  prevLabel,
  nextLabel,
}: FleetPhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : (photos[activeIndex] ?? null);

  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveIndex(null);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((index) => (index === null ? index : (index - 1 + photos.length) % photos.length));
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((index) => (index === null ? index : (index + 1) % photos.length));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [activeIndex, photos.length]);

  function showPrevious() {
    setActiveIndex((index) => (index === null ? index : (index - 1 + photos.length) % photos.length));
  }

  function showNext() {
    setActiveIndex((index) => (index === null ? index : (index + 1) % photos.length));
  }

  return (
    <section className="mt-14 border-t border-white/8 pt-12" aria-labelledby="about-gallery-title">
      <h2 id="about-gallery-title" className="font-serif text-3xl tracking-wide text-ivory">
        {title}
      </h2>

      <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((photo, index) => {
          const alt = pickLocalized(photo.alt, locale);

          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group mb-4 block w-full break-inside-avoid bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
            >
              {/* Native img keeps each photo's real aspect ratio so previews are never cropped. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={alt}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full transition duration-300 group-hover:opacity-90"
              />
            </button>
          );
        })}
      </div>

      {active && activeIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={pickLocalized(active.alt, locale)}
          className="popup-enter-overlay fixed inset-0 z-50 flex items-center justify-center bg-night/90 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            aria-label={closeLabel}
            className="absolute top-4 right-4 z-20 rounded-full border border-white/20 bg-night/60 px-3 py-1.5 text-xs text-ivory hover:border-white/50"
          >
            {closeLabel}
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            aria-label={prevLabel}
            className="absolute top-1/2 left-3 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-night/70 text-ivory hover:border-white/50 sm:left-6"
          >
            <ChevronLeft />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            aria-label={nextLabel}
            className="absolute top-1/2 right-3 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-night/70 text-ivory hover:border-white/50 sm:right-6"
          >
            <ChevronRight />
          </button>

          <div
            className="popup-enter-panel relative flex max-h-[min(90vh,56rem)] w-full max-w-6xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={active.src}
              alt={pickLocalized(active.alt, locale)}
              width={2400}
              height={1600}
              sizes="100vw"
              className="max-h-[min(90vh,56rem)] w-auto max-w-full object-contain"
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12.5 4.5 7 10l5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
      <path
        d="M7.5 4.5 13 10l-5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
