"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/components/i18n/locale-provider";

const trips = ["One-Way", "Round Trip", "Hourly Charter"] as const;
type Trip = (typeof trips)[number];

const fieldClass =
  "h-10 w-full rounded-md border border-black/5 bg-white px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-burgundy/30";

export function QuoteCard() {
  const router = useRouter();
  const dictionary = useDictionary();
  const tripLabels: Record<Trip, string> = {
    "One-Way": dictionary.quote.oneWay,
    "Round Trip": dictionary.quote.roundTrip,
    "Hourly Charter": dictionary.quote.hourly,
  };
  const [trip, setTrip] = useState<Trip>("One-Way");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams({
      trip,
      pickup: String(form.get("pickup") ?? ""),
      dropoff: String(form.get("dropoff") ?? ""),
      departure: String(form.get("departure") ?? ""),
      returnAt: String(form.get("returnAt") ?? ""),
      passengers: String(form.get("passengers") ?? ""),
    });
    router.push(`/contact?${params.toString()}`);
  }

  return (
    <form
      id="book"
      onSubmit={onSubmit}
      className="rounded-2xl border border-white/30 bg-white/15 p-4 shadow-[0_30px_80px_-36px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-1">
        {trips.map((option) => {
          const active = option === trip;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setTrip(option)}
              className={
                active
                  ? "rounded-full bg-burgundy px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-white"
                  : "rounded-full px-2.5 py-1.5 text-[13px] whitespace-nowrap text-ivory/80 hover:text-white"
              }
            >
              {tripLabels[option]}
            </button>
          );
        })}
      </div>

      <label className="mt-4 grid gap-1.5 text-xs text-ivory/70">
        {dictionary.quote.pickup}
        <span className="relative">
          <Pin />
          <input
            name="pickup"
            required
            placeholder={dictionary.quote.pickupPlaceholder}
            className={`${fieldClass} pl-9`}
          />
        </span>
      </label>

      <label className="mt-3 grid gap-1.5 text-xs text-ivory/70">
        {dictionary.quote.dropoff}
        <span className="relative">
          <Pin />
          <input
            name="dropoff"
            required
            placeholder={dictionary.quote.dropoffPlaceholder}
            className={`${fieldClass} pl-9`}
          />
        </span>
      </label>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_7.5rem]">
        <fieldset className="grid min-w-0 gap-1.5">
          <legend className="text-xs text-ivory/70">{dictionary.quote.dateTime}</legend>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5">
            <span className="relative">
              <Calendar />
              <input
                name="departure"
                required
                placeholder={dictionary.quote.departure}
                aria-label={dictionary.quote.departure}
                className={`${fieldClass} min-w-0 pl-8`}
              />
            </span>
            <span className="text-sm text-ivory/50" aria-hidden="true">
              +
            </span>
            <span className="relative">
              <Calendar />
              <input
                name="returnAt"
                placeholder={dictionary.quote.return}
                aria-label={dictionary.quote.return}
                disabled={trip !== "Round Trip"}
                className={`${fieldClass} min-w-0 pl-8 disabled:cursor-not-allowed disabled:opacity-50`}
              />
            </span>
          </div>
        </fieldset>
        <label className="grid min-w-0 gap-1.5 text-xs text-ivory/70">
          {dictionary.quote.passengers}
          <select name="passengers" defaultValue="8" className={`${fieldClass} min-w-0`}>
            {["1", "4", "8", "14", "20", "36", "56"].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="mt-4 h-10 w-full rounded-md bg-burgundy text-sm font-medium text-white hover:bg-burgundy-deep"
      >
        {dictionary.quote.search}
      </button>
    </form>
  );
}

function Calendar() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
      aria-hidden="true"
    >
      <rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 3.5v3M16 3.5v3M4 10h16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function Pin() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12 2.5a6.2 6.2 0 0 0-6.2 6.2c0 4.7 6.2 12.8 6.2 12.8s6.2-8.1 6.2-12.8A6.2 6.2 0 0 0 12 2.5Zm0 8.4a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Z"
      />
    </svg>
  );
}
