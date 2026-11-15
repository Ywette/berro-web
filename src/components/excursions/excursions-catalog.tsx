"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RevealList } from "@/components/ui/reveal-list";
import {
  excursionRegions,
  type ExcursionRegion,
} from "@/lib/content/excursions";

export type ExcursionCardData = {
  slug: string;
  href: string;
  title: string;
  route: string;
  description: string;
  cta: string;
  image: string;
  imageIsLogo?: boolean;
  region?: ExcursionRegion;
};

type ExcursionsCatalogProps = {
  items: ExcursionCardData[];
  filterLabel: string;
  filterAll: string;
  filterEmpty: string;
  regionLabels: Record<ExcursionRegion, string>;
};

export function ExcursionsCatalog({
  items,
  filterLabel,
  filterAll,
  filterEmpty,
  regionLabels,
}: ExcursionsCatalogProps) {
  const [region, setRegion] = useState<ExcursionRegion | null>(null);

  const visible = useMemo(
    () => (region ? items.filter((item) => item.region === region) : items),
    [items, region],
  );

  const options: { value: ExcursionRegion | null; label: string }[] = [
    { value: null, label: filterAll },
    ...excursionRegions.map((value) => ({ value, label: regionLabels[value] })),
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={filterLabel}>
        {options.map((option) => {
          const active = region === option.value;
          return (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setRegion(option.value)}
              className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-xs font-semibold tracking-wide transition sm:text-sm ${
                active
                  ? "bg-burgundy text-white"
                  : "border border-white/15 text-ivory/85 hover:bg-white/8"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-[#141418] px-6 py-10 text-sm text-mist">
          {filterEmpty}
        </p>
      ) : (
        <RevealList className="grid gap-4">
          {visible.map((excursion, index) => (
            <article
              key={excursion.slug}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141418]"
            >
              <div className="grid h-full flex-1 sm:grid-cols-[minmax(0,1.15fr)_minmax(9rem,0.85fr)]">
                <div className="flex h-full min-h-0 flex-col px-6 py-7 sm:px-7 sm:py-8">
                  <h2 className="text-lg font-medium tracking-wide text-ivory sm:text-xl">
                    <Link href={excursion.href} className="hover:text-white">
                      {excursion.title}
                    </Link>
                  </h2>
                  {excursion.route ? (
                    <p className="mt-3 text-sm font-medium tracking-wide text-champagne/90">
                      {excursion.route}
                    </p>
                  ) : null}
                  {excursion.description ? (
                    <p className="mt-3 text-sm leading-6 text-mist">{excursion.description}</p>
                  ) : null}
                  <div className="mt-auto pt-7">
                    <Link
                      href={excursion.href}
                      className={
                        index % 2 === 0
                          ? "inline-flex h-11 w-full items-center justify-center rounded-full bg-ivory px-5 text-sm font-semibold text-night transition hover:bg-white sm:w-auto"
                          : "inline-flex h-11 w-full items-center justify-center rounded-full border border-white/35 px-5 text-sm font-semibold text-ivory transition hover:border-white/60 hover:bg-white/5 sm:w-auto"
                      }
                    >
                      {excursion.cta}
                    </Link>
                  </div>
                </div>

                <Link
                  href={excursion.href}
                  tabIndex={-1}
                  aria-hidden="true"
                  className={`relative min-h-44 overflow-hidden sm:h-full sm:min-h-0 ${
                    excursion.imageIsLogo ? "bg-[#242426]" : ""
                  }`}
                >
                  <Image
                    src={excursion.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 28vw, (min-width: 640px) 35vw, 90vw"
                    className={excursion.imageIsLogo ? "object-contain p-6" : "object-cover"}
                    style={excursion.imageIsLogo ? undefined : { objectPosition: "center center" }}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#141418] via-[#141418]/70 to-transparent"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#141418] via-[#141418]/70 to-transparent"
                  />
                </Link>
              </div>
            </article>
          ))}
        </RevealList>
      )}
    </div>
  );
}
