"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/components/i18n/locale-provider";
import { PlaceField } from "@/components/landing/place-field";

const trips = ["One-Way", "Round Trip", "Hourly Charter"] as const;
type Trip = (typeof trips)[number];

const fieldClass =
  "h-10 w-full rounded-md border border-black/5 bg-white px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-burgundy/30";

const maxDocumentBytes = 4 * 1024 * 1024;
const documentTypes = [".pdf", ".doc", ".docx", ".txt"];

type PlanDocument = { name: string; size: number };

export type QuoteDefaults = {
  trip?: Trip;
  pickup?: string;
  pickupPlace?: string;
  dropoff?: string;
  dropoffPlace?: string;
  departure?: string;
  returnAt?: string;
};

type QuoteCardProps = {
  defaults?: QuoteDefaults;
  requirePassengerChoice?: boolean;
  showDocument?: boolean;
  formId?: string;
};

export function QuoteCard({
  defaults,
  requirePassengerChoice = false,
  showDocument = true,
  formId = "book",
}: QuoteCardProps = {}) {
  const router = useRouter();
  const dictionary = useDictionary();
  const tripLabels: Record<Trip, string> = {
    "One-Way": dictionary.quote.oneWay,
    "Round Trip": dictionary.quote.roundTrip,
    "Hourly Charter": dictionary.quote.hourly,
  };
  const [trip, setTrip] = useState<Trip>(defaults?.trip ?? "One-Way");
  const [departure, setDeparture] = useState(defaults?.departure ?? "");
  const [returnAt, setReturnAt] = useState(defaults?.returnAt ?? "");
  const [planDocument, setPlanDocument] = useState<PlanDocument | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams({ trip });
    for (const field of ["pickup", "pickupPlace", "dropoff", "dropoffPlace", "departure", "returnAt", "passengers"]) {
      const value = String(form.get(field) ?? "");
      if (value) params.set(field, value);
    }
    if (planDocument) params.set("planDocument", planDocument.name);
    router.push(`/contact?${params.toString()}`);
  }

  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      className="rounded-2xl border border-white/20 bg-white/5 p-4 shadow-[0_30px_80px_-36px_rgba(0,0,0,0.85)] backdrop-blur-md sm:p-5"
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

      <PlaceField
        name="pickup"
        label={dictionary.quote.pickup}
        placeholder={dictionary.quote.pickupPlaceholder}
        inputClassName={fieldClass}
        className="mt-4"
        defaultText={defaults?.pickup}
        defaultPlaceId={defaults?.pickupPlace}
      />
      <PlaceField
        name="dropoff"
        label={dictionary.quote.dropoff}
        placeholder={dictionary.quote.dropoffPlaceholder}
        inputClassName={fieldClass}
        className="mt-3"
        defaultText={defaults?.dropoff}
        defaultPlaceId={defaults?.dropoffPlace}
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="grid min-w-0 gap-1.5 text-xs text-ivory/70">
          {dictionary.quote.departure}
          <input
            type="datetime-local"
            name="departure"
            required
            value={departure}
            onChange={(event) => setDeparture(event.target.value)}
            onFocus={(event) => {
              event.currentTarget.min = localNow();
            }}
            className={`${fieldClass} min-w-0 [color-scheme:light]`}
          />
        </label>
        <label className="grid min-w-0 gap-1.5 text-xs text-ivory/70">
          {dictionary.quote.return}
          <input
            type="datetime-local"
            name="returnAt"
            required={trip === "Round Trip"}
            disabled={trip !== "Round Trip"}
            min={departure || undefined}
            value={trip === "Round Trip" ? returnAt : ""}
            onChange={(event) => setReturnAt(event.target.value)}
            className={`${fieldClass} min-w-0 [color-scheme:light] disabled:cursor-not-allowed disabled:opacity-50`}
          />
        </label>
      </div>

      <label className="mt-3 grid gap-1.5 text-xs text-ivory/70">
        {dictionary.quote.passengers}
        <select
          name="passengers"
          required
          defaultValue={requirePassengerChoice ? "" : "8"}
          className={fieldClass}
        >
          {requirePassengerChoice ? (
            <option value="" disabled>
              {dictionary.excursions.choosePassengers}
            </option>
          ) : null}
          {["1", "4", "8", "14", "20", "36", "56"].map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </label>

      {showDocument ? <PlanDocumentAttach document={planDocument} onDocument={setPlanDocument} /> : null}

      <button
        type="submit"
        className="mt-4 h-10 w-full rounded-md bg-burgundy text-sm font-medium text-white hover:bg-burgundy-deep"
      >
        {dictionary.quote.search}
      </button>
    </form>
  );
}

function PlanDocumentAttach({
  document,
  onDocument,
}: {
  document: PlanDocument | null;
  onDocument: (document: PlanDocument | null) => void;
}) {
  const dictionary = useDictionary();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  function choose(file: File | undefined) {
    setError("");
    if (!file) return;

    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!documentTypes.includes(extension)) {
      setError(dictionary.pricing.documentType);
      return;
    }
    if (file.size > maxDocumentBytes) {
      setError(dictionary.pricing.documentTooLarge);
      return;
    }

    onDocument({ name: file.name, size: file.size });
  }

  function remove() {
    onDocument(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="mt-3 grid gap-2 rounded-xl border border-dashed border-white/25 bg-white/5 p-3 text-xs text-ivory/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-ivory">{dictionary.pricing.planDocument}</p>
          <p className="text-[11px] text-ivory/60">{dictionary.pricing.planDocumentHint}</p>
        </div>
        <label className="cursor-pointer rounded-full border border-white/30 px-3 py-1.5 text-ivory hover:border-white/60">
          {dictionary.pricing.chooseDocument}
          <input
            ref={inputRef}
            type="file"
            accept={documentTypes.join(",")}
            className="sr-only"
            onChange={(event) => choose(event.target.files?.[0])}
          />
        </label>
      </div>
      {document ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-black/20 px-2.5 py-1.5">
          <span className="min-w-0 truncate text-ivory">
            {document.name}{" "}
            <span className="text-ivory/55">· {formatSize(document.size)}</span>
          </span>
          <button type="button" onClick={remove} className="text-ivory/70 hover:text-white">
            {dictionary.pricing.removeDocument}
          </button>
        </div>
      ) : null}
      {error ? <p className="text-ivory">{error}</p> : null}
    </div>
  );
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function localNow() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}
