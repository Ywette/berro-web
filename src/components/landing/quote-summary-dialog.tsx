"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import {
  createStop,
  DEFAULT_STOP_WAIT_MINUTES,
  formatWaitingHours,
  totalWaitingMinutes,
  type QuoteStop,
} from "@/lib/orders/stops";
import type { QuoteOrderInput } from "@/lib/orders/session-orders";

type QuoteSummaryDialogProps = {
  open: boolean;
  draft: QuoteOrderInput;
  tripLabel: string;
  stops: QuoteStop[];
  otherWaitingMinutes: number;
  stopsMissingFromPlan: boolean;
  onStopsChange: (stops: QuoteStop[]) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function QuoteSummaryDialog({
  open,
  draft,
  tripLabel,
  stops,
  otherWaitingMinutes,
  stopsMissingFromPlan,
  onStopsChange,
  onClose,
  onConfirm,
}: QuoteSummaryDialogProps) {
  const dictionary = useDictionary();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const totalMinutes = useMemo(
    () => totalWaitingMinutes(stops, otherWaitingMinutes),
    [stops, otherWaitingMinutes],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function updateStop(id: string, patch: Partial<Pick<QuoteStop, "name" | "waitMinutes">>) {
    onStopsChange(
      stops.map((stop) =>
        stop.id === id
          ? {
              ...stop,
              ...patch,
              waitMinutes:
                patch.waitMinutes == null
                  ? stop.waitMinutes
                  : Math.max(0, Math.round(patch.waitMinutes)),
            }
          : stop,
      ),
    );
  }

  function addStop() {
    onStopsChange([...stops, createStop("", DEFAULT_STOP_WAIT_MINUTES)]);
  }

  function removeStop(id: string) {
    onStopsChange(stops.filter((stop) => stop.id !== id));
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(36rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-white/15 bg-[#1a1210] p-0 text-ivory shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9)] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-ivory/50 uppercase">
              {dictionary.quote.summaryEyebrow}
            </p>
            <h2 id={titleId} className="mt-1 font-serif text-2xl tracking-wide">
              {dictionary.quote.summaryTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={dictionary.quote.summaryClose}
            className="grid h-8 w-8 place-items-center rounded-full text-ivory/70 hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
              <path
                d="M5 5l10 10M15 5 5 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <p className="mt-2 text-sm leading-6 text-ivory/70">{dictionary.quote.summaryBody}</p>

        <dl className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm sm:grid-cols-2">
          <SummaryItem label={dictionary.quote.trip} value={tripLabel} />
          <SummaryItem label={dictionary.quote.passengers} value={draft.passengers || "—"} />
          <SummaryItem label={dictionary.quote.name} value={draft.name || "—"} />
          <SummaryItem label={dictionary.quote.email} value={draft.email || "—"} />
          <SummaryItem label={dictionary.quote.phone} value={draft.phone || "—"} />
          <SummaryItem
            label={dictionary.quote.pickup}
            value={draft.pickup || "—"}
            className="sm:col-span-2"
          />
          <SummaryItem
            label={dictionary.quote.dropoff}
            value={draft.dropoff || "—"}
            className="sm:col-span-2"
          />
          <SummaryItem label={dictionary.quote.departure} value={formatWhen(draft.departure)} />
          <SummaryItem label={dictionary.quote.return} value={formatWhen(draft.returnAt)} />
        </dl>

        <section className="mt-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium text-ivory">{dictionary.quote.stopsTitle}</h3>
              <p className="mt-1 text-xs leading-5 text-ivory/60">{dictionary.quote.stopsHint}</p>
            </div>
            <button
              type="button"
              onClick={addStop}
              className="rounded-full border border-white/25 px-3 py-1.5 text-xs text-ivory hover:border-white/55"
            >
              {dictionary.quote.addStop}
            </button>
          </div>

          {stopsMissingFromPlan && stops.length === 0 ? (
            <p role="status" className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
              {dictionary.quote.stopsAsk}
            </p>
          ) : null}

          <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
            <div className="grid grid-cols-[minmax(0,1fr)_6.5rem_2.5rem] gap-2 border-b border-white/10 bg-white/5 px-3 py-2 text-[11px] tracking-wide text-ivory/55 uppercase">
              <span>{dictionary.quote.stopName}</span>
              <span>{dictionary.quote.stopWait}</span>
              <span className="sr-only">{dictionary.quote.removeStop}</span>
            </div>
            {stops.length === 0 ? (
              <p className="px-3 py-4 text-xs text-ivory/55">{dictionary.quote.stopsEmpty}</p>
            ) : (
              <ul className="divide-y divide-white/10">
                {stops.map((stop) => (
                  <li
                    key={stop.id}
                    className="grid grid-cols-[minmax(0,1fr)_6.5rem_2.5rem] items-center gap-2 px-3 py-2"
                  >
                    <input
                      value={stop.name}
                      placeholder={dictionary.quote.stopName}
                      aria-label={dictionary.quote.stopName}
                      onChange={(event) => updateStop(stop.id, { name: event.target.value })}
                      className="h-9 min-w-0 rounded-md border border-white/15 bg-white px-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-burgundy/30"
                    />
                    <input
                      type="number"
                      min={0}
                      max={24 * 60}
                      step={5}
                      value={stop.waitMinutes}
                      aria-label={dictionary.quote.stopWait}
                      onChange={(event) =>
                        updateStop(stop.id, { waitMinutes: Number(event.target.value) })
                      }
                      className="h-9 w-full rounded-md border border-white/15 bg-white px-2 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-burgundy/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeStop(stop.id)}
                      aria-label={dictionary.quote.removeStop}
                      className="grid h-9 place-items-center rounded-md text-ivory/60 hover:bg-white/10 hover:text-white"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm">
            <span className="text-ivory/70">{dictionary.quote.waitingTotal}</span>
            <span className="font-medium text-ivory">
              {totalMinutes} {dictionary.quote.minutesShort}
              <span className="ml-2 text-ivory/55">
                ({formatWaitingHours(totalMinutes)} {dictionary.quote.hoursShort})
              </span>
            </span>
          </div>
          {otherWaitingMinutes > 0 ? (
            <p className="mt-2 text-xs text-ivory/55">
              {dictionary.quote.otherWaitingNote(otherWaitingMinutes)}
            </p>
          ) : null}
        </section>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md border border-white/30 px-3 text-sm font-medium text-ivory hover:border-white/60 hover:bg-white/5"
          >
            {dictionary.quote.summaryBack}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-md bg-burgundy px-3 text-sm font-medium text-white hover:bg-burgundy-deep"
          >
            {dictionary.quote.summaryConfirm}
          </button>
        </div>
      </div>
    </dialog>
  );
}

function SummaryItem({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[11px] text-ivory/50">{label}</dt>
      <dd className="mt-1 text-ivory">{value}</dd>
    </div>
  );
}

function formatWhen(value: string | undefined) {
  if (!value?.trim()) return "—";
  return value.replace("T", " ");
}
