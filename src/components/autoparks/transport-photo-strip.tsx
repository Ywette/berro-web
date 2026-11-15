"use client";

import { useEffect, useState } from "react";
import type { TransportPhoto } from "@/lib/content/transport";
import { pickLocalized, type Locale } from "@/lib/i18n/locale";

type TransportPhotoStripProps = {
  photos: TransportPhoto[];
  locale: Locale;
  closeLabel: string;
  prevLabel: string;
  nextLabel: string;
};

export function TransportPhotoStrip({
  photos,
  locale,
  closeLabel,
  prevLabel,
  nextLabel,
}: TransportPhotoStripProps) {
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

  if (photos.length === 0) return null;

  return (
    <>
      <div className="mt-6 flex gap-3 overflow-x-auto pb-1">
        {photos.map((photo, index) => {
          const alt = pickLocalized(photo.alt, locale);
          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#141418] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- full natural aspect for fleet previews */}
              <img src={photo.src} alt={alt} className="h-28 w-auto max-w-[11rem] object-contain sm:h-32" />
            </button>
          );
        })}
      </div>

      {active ? (
        <div
          className="popup-enter-overlay fixed inset-0 z-50 flex items-center justify-center bg-night/92 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={pickLocalized(active.alt, locale)}
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 rounded-full border border-white/20 px-3 py-1.5 text-xs text-ivory hover:border-white/50"
            onClick={() => setActiveIndex(null)}
          >
            {closeLabel}
          </button>
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-3 rounded-full border border-white/20 px-3 py-2 text-sm text-ivory hover:border-white/50 sm:left-6"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex((index) =>
                    index === null ? index : (index - 1 + photos.length) % photos.length,
                  );
                }}
              >
                {prevLabel}
              </button>
              <button
                type="button"
                className="absolute right-3 rounded-full border border-white/20 px-3 py-2 text-sm text-ivory hover:border-white/50 sm:right-6"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex((index) => (index === null ? index : (index + 1) % photos.length));
                }}
              >
                {nextLabel}
              </button>
            </>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element -- lightbox shows full uncropped photo */}
          <img
            src={active.src}
            alt={pickLocalized(active.alt, locale)}
            className="popup-enter-panel max-h-[88vh] max-w-[min(96vw,1100px)] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
