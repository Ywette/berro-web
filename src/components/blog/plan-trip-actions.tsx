"use client";

import { useRef } from "react";
import Link from "next/link";
import { useDictionary } from "@/components/i18n/locale-provider";
import { QuoteCard } from "@/components/landing/quote-card";

export function PlanTripActions() {
  const dictionary = useDictionary();
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="mt-10 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-full bg-burgundy px-5 py-2.5 text-sm font-medium text-white hover:bg-burgundy-deep"
      >
        {dictionary.blog.planTrip}
      </button>
      <Link
        href="/contact"
        className="rounded-full border border-white/25 px-5 py-2.5 text-sm text-ivory hover:border-white/60"
      >
        {dictionary.blog.helpPlan}
      </Link>

      <dialog
        ref={dialogRef}
        aria-labelledby="plan-trip-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            event.currentTarget.close();
          }
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(28rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl bg-transparent p-0 text-ivory backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="relative overflow-hidden rounded-2xl bg-[url('/hero/luxembourg.jpg')] bg-cover bg-center">
          <div className="bg-black/55 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="plan-trip-title" className="font-serif text-2xl tracking-wide">
                {dictionary.blog.planTripTitle}
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
            <QuoteCard />
          </div>
        </div>
      </dialog>
    </div>
  );
}
