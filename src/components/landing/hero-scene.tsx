"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";

const FADE_MS = 1100;
const HOLD_MS = 6000;

const SLIDES = [
  { src: "/hero/Turaidas pils un tūrisma autobuss.png" },
  { src: "/hero/Gaujas līkums ar ceļotāju minibusu.png" },
  { src: "/hero/Luksusa transfērs pie Rīgas viesnīcas.png" },
  { src: "/hero/Elegants tūrisma autobuss pie viesnīcas.png" },
  { src: "/hero/Eleganta ierašanās pie Baltijas muižas.png" },
] as const;

export function SloganHero({ children }: { children: ReactNode }) {
  const dictionary = useDictionary();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hold = window.setTimeout(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, HOLD_MS);
    return () => window.clearTimeout(hold);
  }, [index]);

  return (
    <section
      id="book"
      className="relative flex h-[calc(100svh-var(--site-header-height))] scroll-mt-[var(--site-header-height)] overflow-x-hidden overflow-y-auto lg:overflow-hidden"
    >
      <div className="absolute inset-0" aria-hidden="true">
        {SLIDES.map((slide, slideIndex) => (
          <Image
            key={slide.src}
            src={encodeURI(slide.src)}
            alt=""
            fill
            priority={slideIndex === 0}
            sizes="100vw"
            className={`object-cover object-center transition-opacity ease-in-out motion-reduce:transition-none ${
              slideIndex === index ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transitionDuration: `${FADE_MS}ms`,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(8,8,10,0.88)_0%,rgba(8,8,10,0.58)_40%,rgba(8,8,10,0.32)_70%,rgba(8,8,10,0.55)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-night via-night/50 to-transparent lg:h-28" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-5 px-0 py-6 sm:gap-6 sm:px-6 lg:py-8">
        <div className="max-w-xl px-4 sm:px-0">
          <h1 className="font-serif text-3xl leading-[1.1] tracking-wide text-ivory sm:text-4xl lg:text-[2.65rem] xl:text-[3rem]">
            {dictionary.hero.headline}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-ivory/78 sm:mt-4 sm:leading-7">
            {dictionary.hero.support}
          </p>
        </div>

        <div className="w-full min-w-0 sm:max-w-xl">{children}</div>
      </div>
    </section>
  );
}
