"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { TransportPhoto } from "@/lib/content/transport";
import { pickLocalized, type Locale } from "@/lib/i18n/locale";

type TransportPhotoStripProps = {
  photos: TransportPhoto[];
  locale: Locale;
  closeLabel: string;
  prevLabel: string;
  nextLabel: string;
  /** Large preview above thumbnails; opens the lightbox starting on this image. */
  featuredSrc?: string;
  featuredAlt?: string;
};

export function TransportPhotoStrip({
  photos,
  locale,
  closeLabel,
  prevLabel,
  nextLabel,
  featuredSrc,
  featuredAlt,
}: TransportPhotoStripProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /** Main photo first, then the rest — lightbox starts here and chevrons step through all. */
  const gallery = useMemo(() => {
    if (!featuredSrc) return photos;
    const match = photos.find((photo) => photo.src === featuredSrc);
    const rest = photos.filter((photo) => photo.src !== featuredSrc);
    const featured: TransportPhoto = match ?? {
      id: "featured-main",
      src: featuredSrc,
      kind: photos[0]?.kind ?? "van",
      showInGallery: false,
      alt: photos[0]?.alt ?? { lv: featuredAlt ?? "", en: featuredAlt ?? "" },
    };
    return [featured, ...rest];
  }, [photos, featuredSrc, featuredAlt]);

  const active = activeIndex === null ? null : (gallery[activeIndex] ?? null);
  const canNavigate = gallery.length > 1;

  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        setActiveIndex(null);
        return;
      }
      if (!canNavigate) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        event.stopImmediatePropagation();
        setActiveIndex((index) =>
          index === null ? index : (index - 1 + gallery.length) % gallery.length,
        );
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        event.stopImmediatePropagation();
        setActiveIndex((index) => (index === null ? index : (index + 1) % gallery.length));
      }
    }

    window.addEventListener("keydown", onKeyDown, true);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previous;
    };
  }, [activeIndex, canNavigate, gallery.length]);

  if (gallery.length === 0 && !featuredSrc) return null;

  const lightbox =
    active && mounted
      ? createPortal(
          <div
            className="popup-enter-overlay fixed inset-0 z-[80] flex items-center justify-center bg-night/92 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={pickLocalized(active.alt, locale)}
            onClick={() => setActiveIndex(null)}
          >
            <button
              type="button"
              className="absolute top-4 right-4 z-20 rounded-full border border-white/20 bg-night/70 px-3 py-1.5 text-xs text-ivory hover:border-white/50"
              onClick={() => setActiveIndex(null)}
            >
              {closeLabel}
            </button>
            {canNavigate ? (
              <>
                <button
                  type="button"
                  aria-label={prevLabel}
                  className="absolute top-1/2 left-3 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-night/80 text-ivory hover:border-white/60 sm:left-6"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveIndex((index) =>
                      index === null ? index : (index - 1 + gallery.length) % gallery.length,
                    );
                  }}
                >
                  <ChevronLeft />
                </button>
                <button
                  type="button"
                  aria-label={nextLabel}
                  className="absolute top-1/2 right-3 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-night/80 text-ivory hover:border-white/60 sm:right-6"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveIndex((index) =>
                      index === null ? index : (index + 1) % gallery.length,
                    );
                  }}
                >
                  <ChevronRight />
                </button>
              </>
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element -- lightbox shows full uncropped photo */}
            <img
              src={active.src}
              alt={pickLocalized(active.alt, locale)}
              className="popup-enter-panel relative z-10 max-h-[88vh] max-w-[min(96vw,1100px)] object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {featuredSrc ? (
        <button
          type="button"
          onClick={() => setActiveIndex(0)}
          className="block w-full overflow-hidden rounded-xl border border-white/10 bg-[#141418] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- full natural aspect for fleet previews */}
          <img
            src={featuredSrc}
            alt={featuredAlt ?? ""}
            className="h-auto w-full object-contain"
          />
        </button>
      ) : null}

      {gallery.length > 0 ? (
        <div className={`flex gap-3 overflow-x-auto pb-1 ${featuredSrc ? "mt-4" : "mt-6"}`}>
          {gallery.map((photo, index) => {
            const alt = pickLocalized(photo.alt, locale);
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#141418] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- full natural aspect for fleet previews */}
                <img
                  src={photo.src}
                  alt={alt}
                  className="h-28 w-auto max-w-[11rem] object-contain sm:h-32"
                />
              </button>
            );
          })}
        </div>
      ) : null}

      {lightbox}
    </>
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
