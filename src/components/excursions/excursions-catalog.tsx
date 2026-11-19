"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ExcursionCollage } from "@/components/excursions/excursion-collage";
import { RevealList } from "@/components/ui/reveal-list";
import { formatDate } from "@/lib/content/format-date";
import {
  excursionRegions,
  type ExcursionRegion,
} from "@/lib/content/excursions";
import {
  excursionLogoPlateFromIndex,
  type ExcursionLogoVariant,
} from "@/lib/content/managed-excursion";

export type ExcursionCardData = {
  slug: string;
  href: string;
  title: string;
  route: string;
  description: string;
  cta: string;
  images: string[];
  logoVariant: ExcursionLogoVariant;
  regions?: ExcursionRegion[];
  isActive: boolean;
  plannedDate?: string;
  /** Preformatted "from €X" label when a price is set. */
  priceLabel?: string;
};

type ExcursionsCatalogProps = {
  items: ExcursionCardData[];
  filterLabel: string;
  filterAll: string;
  filterEmpty: string;
  filterRegistrationOpen: string;
  filterAllRegistrations: string;
  applyForLabel: string;
  regionLabels: Record<ExcursionRegion, string>;
};

type CatalogFilterProps = {
  group: string;
  label: string;
  allLabel?: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  steadyGlow?: boolean;
};

function CatalogFilter({ group, label, allLabel, options, selected, onChange, steadyGlow }: CatalogFilterProps) {
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const selectedOptions = options.filter(({ value }) => selected.includes(value));

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      const dropdown = dropdownRef.current;
      if (dropdown?.open && event.target instanceof Node && !dropdown.contains(event.target)) {
        dropdown.open = false;
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  return (
    <div className="relative z-10 min-w-0 max-w-xs flex-1 basis-44 has-[details[open]]:z-20">
      <details ref={dropdownRef} name={group} className={`excursion-filter group ${steadyGlow ? "excursion-filter-steady" : ""}`}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-white/20 bg-[#141418] px-4 py-3 text-sm font-semibold text-ivory hover:border-white/40 [&::-webkit-details-marker]:hidden">
          {label}
          <svg viewBox="0 0 16 16" className="size-4 shrink-0 group-open:rotate-180" aria-hidden="true">
            <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <fieldset aria-label={label} className="excursion-filter-options absolute inset-x-0 top-full mt-1 grid min-w-0 max-h-64 gap-1 overflow-y-auto rounded-xl border border-white/20 bg-[#141418] p-2 shadow-xl">
          {allLabel && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="rounded-lg px-2 py-1.5 text-left text-sm text-mist hover:bg-white/10"
            >
              {allLabel}
            </button>
          )}
          {options.map(({ value, label: optionLabel }) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ivory hover:bg-white/10">
              <input
                type="checkbox"
                className="size-4 shrink-0 accent-burgundy"
                checked={selected.includes(value)}
                onChange={(event) => onChange(event.target.checked
                  ? [...selected, value]
                  : selected.filter((choice) => choice !== value))}
              />
              {optionLabel}
            </label>
          ))}
        </fieldset>
      </details>
      {selectedOptions.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 px-1 text-sm font-semibold text-ivory">
          {selectedOptions.map((option) => <li key={option.value}>{option.label}</li>)}
        </ul>
      )}
    </div>
  );
}

const allRegistrations = "all";

export function ExcursionsCatalog({
  items,
  filterLabel,
  filterAll,
  filterEmpty,
  filterRegistrationOpen,
  filterAllRegistrations,
  applyForLabel,
  regionLabels,
}: ExcursionsCatalogProps) {
  const filterGroup = useId();
  const [regions, setRegions] = useState<string[]>([]);
  const [registrationSelection, setRegistrationSelection] = useState<string[]>([]);
  const hasOpenRegistrations = items.some((item) => item.isActive);
  const dates = [...new Set(items.flatMap((item) =>
    item.isActive && item.plannedDate ? [item.plannedDate] : [],
  ))].sort();
  const allOpenSelected = registrationSelection.includes(allRegistrations);
  const selectedDates = dates.filter((date) => registrationSelection.includes(date));
  const visible = items.filter((item) =>
    (!regions.length || item.regions?.some((value) => regions.includes(value))) &&
    (!hasOpenRegistrations || (!allOpenSelected && !selectedDates.length) ||
      (item.isActive && (allOpenSelected || (item.plannedDate && selectedDates.includes(item.plannedDate))))),
  );

  function changeRegistrationSelection(values: string[]) {
    setRegistrationSelection(values.at(-1) === allRegistrations
      ? [allRegistrations]
      : values.filter((value) => value !== allRegistrations));
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
        <CatalogFilter
          group={filterGroup}
          label={filterLabel}
          allLabel={filterAll}
          options={excursionRegions.map((value) => ({ value, label: regionLabels[value] }))}
          selected={regions}
          onChange={setRegions}
        />
        {hasOpenRegistrations && (
          <CatalogFilter
            group={filterGroup}
            label={filterRegistrationOpen}
            options={[
              { value: allRegistrations, label: filterAllRegistrations },
              ...dates.map((value) => ({ value, label: formatDate(value) })),
            ]}
            selected={registrationSelection}
            onChange={changeRegistrationSelection}
            steadyGlow
          />
        )}
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
              className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141418]"
            >
              <div className="grid h-full flex-1 sm:grid-cols-[minmax(0,1.15fr)_minmax(9rem,0.85fr)]">
                <div className="flex h-full min-h-0 flex-col px-6 py-7 sm:px-7 sm:py-8">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 text-lg font-medium tracking-wide text-ivory sm:text-xl">
                      <Link href={excursion.href} className="hover:text-white">
                        {excursion.title}
                      </Link>
                    </h2>
                    {excursion.priceLabel && (
                      <p className="shrink-0 rounded-full bg-night/90 px-3 py-1.5 text-sm font-semibold text-ivory">
                        {excursion.priceLabel}
                      </p>
                    )}
                  </div>
                  {excursion.route ? (
                    <p className="mt-3 text-sm font-medium tracking-wide text-champagne/90">
                      {excursion.route}
                    </p>
                  ) : null}
                  {excursion.description ? (
                    <p className="mt-3 text-sm leading-6 text-mist">{excursion.description}</p>
                  ) : null}
                  <div className="mt-auto flex flex-wrap items-end gap-x-3 gap-y-2 pt-7">
                    <Link
                      href={excursion.href}
                      className={
                        index % 2 === 0
                          ? "inline-flex h-11 items-center justify-center rounded-full bg-ivory px-5 text-sm font-semibold text-night transition hover:bg-white"
                          : "inline-flex h-11 items-center justify-center rounded-full border border-white/35 px-5 text-sm font-semibold text-ivory transition hover:border-white/60 hover:bg-white/5"
                      }
                    >
                      {excursion.cta}
                    </Link>
                    {excursion.isActive && excursion.plannedDate && (
                      <Link
                        href={`${excursion.href}#booking`}
                        className="ml-auto flex flex-col items-center rounded-2xl border border-white/25 bg-burgundy px-5 py-2 text-sm font-semibold text-white hover:bg-burgundy-deep"
                      >
                        {applyForLabel}
                        <time dateTime={excursion.plannedDate}>{formatDate(excursion.plannedDate)}</time>
                      </Link>
                    )}
                  </div>
                </div>

                <Link
                  href={excursion.href}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="relative min-h-44 overflow-hidden sm:h-full sm:min-h-0"
                >
                  <ExcursionCollage
                    images={excursion.images}
                    logoVariant={excursionLogoPlateFromIndex(index)}
                    alt=""
                    className="absolute inset-0 h-full w-full"
                    sizes="(min-width: 1024px) 28vw, (min-width: 640px) 35vw, 90vw"
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
