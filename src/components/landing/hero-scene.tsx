"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";

const FADE_MS = 1100;
const HOLD_MS = 6000;

export function SloganHero({ children }: { children: ReactNode }) {
  const dictionary = useDictionary();
  const slides = [
    { src: "/hero/luxembourg.jpg" },
    { src: "/hero/airport.jpg" },
    { src: "/hero/paris.jpg" },
    { src: "/hero/mountains.jpg" },
    { src: "/hero/berlin.jpg" },
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
  }, [index, visible, slides.length]);

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
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(8,8,10,0.88)_0%,rgba(8,8,10,0.62)_38%,rgba(8,8,10,0.28)_68%,rgba(8,8,10,0.55)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-night via-night/70 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-10 px-4 py-10 sm:px-6 lg:py-14">
        <div className="max-w-2xl">
          <h1 className="font-serif text-4xl leading-[1.08] tracking-wide text-ivory sm:text-5xl lg:text-[3.35rem]">
            {dictionary.hero.headline}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-ivory/80 sm:text-[15px]">
            {dictionary.hero.support}
          </p>
        </div>

        <div className="w-full max-w-2xl">{children}</div>
      </div>
    </section>
  );
}
