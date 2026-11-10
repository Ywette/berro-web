"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";

const FADE_MS = 900;
const HOLD_MS = 5200;

export function SloganHero({ children }: { children: ReactNode }) {
  const dictionary = useDictionary();
  const slides = [
    { src: "/hero/luxembourg.jpg", label: dictionary.hero.luxembourg },
    { src: "/hero/airport.jpg", label: dictionary.hero.airport },
    { src: "/hero/paris.jpg", label: dictionary.hero.paris },
    { src: "/hero/mountains.jpg", label: dictionary.hero.mountains },
    { src: "/hero/berlin.jpg", label: dictionary.hero.berlin },
  ] as const;
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const fadeTimer = useRef<number | null>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => {
      if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!visible || reducedMotion.current) return;
    const hold = window.setTimeout(() => {
      reveal((index + 1) % slides.length);
    }, HOLD_MS);
    return () => window.clearTimeout(hold);
  }, [index, visible]);

  function reveal(next: number) {
    if (next === index && visible) return;
    if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current);
    if (reducedMotion.current) {
      setIndex(next);
      setVisible(true);
      return;
    }
    setVisible(false);
    fadeTimer.current = window.setTimeout(() => {
      setIndex(next);
      fadeTimer.current = window.setTimeout(() => {
        setVisible(true);
        fadeTimer.current = null;
      }, 40);
    }, FADE_MS);
  }

  return (
    <section
      id="book"
      className="relative flex min-h-[calc(100svh-var(--site-header-height))] scroll-mt-[var(--site-header-height)] overflow-x-hidden"
    >
      <div className="absolute inset-0" aria-hidden="true">
        {slides.map((slide, slideIndex) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt=""
            fill
            priority={slideIndex === 0}
            sizes="100vw"
            className={`object-cover object-center transition-opacity ease-in-out ${
              slideIndex === index && visible ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDuration: reducedMotion.current ? "0ms" : `${FADE_MS}ms` }}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.5)_42%,rgba(0,0,0,0.22)_72%,rgba(0,0,0,0.4)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-night to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-4 py-8 sm:px-6">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[36rem_minmax(0,1fr)] lg:gap-10">
          <div className="order-2 w-full max-w-[36rem] justify-self-start lg:order-1 lg:w-[36rem] lg:max-w-[36rem] lg:min-w-[36rem]">
            {children}
          </div>
          <div className="order-1 flex flex-col items-start lg:order-2 lg:items-end lg:justify-self-end">
            <h1 className="text-left font-serif leading-[0.85] text-burgundy">
              <span className="block text-5xl tracking-[0.06em] sm:text-6xl xl:text-7xl">
                BERRO
              </span>
              <span className="mt-3 block text-lg tracking-[0.34em] text-ivory sm:text-xl xl:text-2xl">
                TRAVEL
              </span>
            </h1>
            <div
              className="mt-6 flex items-center gap-2"
              role="tablist"
              aria-label={dictionary.hero.scenes}
            >
              {slides.map((slide, slideIndex) => {
                const selected = slideIndex === index;
                return (
                  <button
                    key={slide.src}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-label={slide.label}
                    onClick={() => reveal(slideIndex)}
                    className={`h-2 rounded-full transition-all ${
                      selected ? "w-6 bg-ivory" : "w-2 bg-ivory/45 hover:bg-ivory/75"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
