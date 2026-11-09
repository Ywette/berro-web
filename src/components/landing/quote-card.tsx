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
const passengerOptions = [1, 4, 8, 14, 20, 36, 56];
const readingDelayMs = 2000;

/** Demo fill until AI extraction is connected. */
const demoDocumentFields = {
  trip: "Round Trip" as Trip,
  pickup: "Riga Airport",
  dropoff: "Roga Hotel, Sigulda",
  departure: "2026-11-15T05:00",
  returnAt: "2026-11-15T20:00",
  returnPlace: "Riga Hotel",
  passengers: "8",
};

type PlanDocument = { name: string; size: number };

export type QuoteDefaults = {
  trip?: Trip;
  pickup?: string;
  pickupPlace?: string;
  dropoff?: string;
  dropoffPlace?: string;
  departure?: string;
  returnAt?: string;
  passengers?: string;
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
  const [pickup, setPickup] = useState(defaults?.pickup ?? "");
  const [pickupPlace, setPickupPlace] = useState(defaults?.pickupPlace ?? "");
  const [dropoff, setDropoff] = useState(defaults?.dropoff ?? "");
  const [dropoffPlace, setDropoffPlace] = useState(defaults?.dropoffPlace ?? "");
  const [departure, setDeparture] = useState(defaults?.departure ?? "");
  const [returnAt, setReturnAt] = useState(defaults?.returnAt ?? "");
  const [passengers, setPassengers] = useState(
    defaults?.passengers ?? (requirePassengerChoice ? "" : "8"),
  );
  const [planDocument, setPlanDocument] = useState<PlanDocument | null>(null);
  const [documentNote, setDocumentNote] = useState("");
  const [documentError, setDocumentError] = useState("");
  const [reading, setReading] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams({ trip });
    for (const field of ["pickup", "pickupPlace", "dropoff", "dropoffPlace", "departure", "returnAt", "passengers"]) {
      const value = String(form.get(field) ?? "");
      if (value) params.set(field, value);
    }
    if (planDocument) params.set("planDocument", planDocument.name);
    router.push(`/order-received?${params.toString()}`);
  }

  function applyDemoDocument(fileName: string) {
    setReading(true);
    setDocumentError("");
    setDocumentNote("");

    window.setTimeout(() => {
      setTrip(demoDocumentFields.trip);
      setPickup(demoDocumentFields.pickup);
      setPickupPlace("");
      setDropoff(`${demoDocumentFields.dropoff} → ${demoDocumentFields.returnPlace}`);
      setDropoffPlace("");
      setDeparture(demoDocumentFields.departure);
      setReturnAt(demoDocumentFields.returnAt);
      setPassengers(demoDocumentFields.passengers);
      setDocumentNote(dictionary.pricing.aiFilled(fileName));
      setReading(false);
    }, readingDelayMs);
  }

  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      className="rounded-2xl border border-white/20 bg-white/5 p-4 shadow-[0_30px_80px_-36px_rgba(0,0,0,0.85)] backdrop-blur-md sm:p-5"
    >
      {showDocument ? (
        <PlanDocumentAttach
          document={planDocument}
          reading={reading}
          note={documentNote}
          error={documentError}
          onDocument={setPlanDocument}
          onError={setDocumentError}
          onNote={setDocumentNote}
          onRead={(file) => applyDemoDocument(file.name)}
        />
      ) : null}

      <div className={`${showDocument ? "mt-4" : ""} flex flex-wrap items-center gap-1`}>
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

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <PlaceField
          name="pickup"
          label={dictionary.quote.pickup}
          placeholder={dictionary.quote.pickupPlaceholder}
          inputClassName={fieldClass}
          defaultText={pickup}
          defaultPlaceId={pickupPlace}
        />
        <PlaceField
          name="dropoff"
          label={dictionary.quote.dropoff}
          placeholder={dictionary.quote.dropoffPlaceholder}
          inputClassName={fieldClass}
          defaultText={dropoff}
          defaultPlaceId={dropoffPlace}
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
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
        <label className="grid min-w-0 gap-1.5 text-xs text-ivory/70">
          {dictionary.quote.passengers}
          <select
            name="passengers"
            required
            value={passengers}
            onChange={(event) => setPassengers(event.target.value)}
            className={fieldClass}
          >
            {requirePassengerChoice ? (
              <option value="" disabled>
                {dictionary.excursions.choosePassengers}
              </option>
            ) : null}
            {passengerOptions.map((count) => (
              <option key={count} value={String(count)}>
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

function PlanDocumentAttach({
  document,
  reading,
  note,
  error,
  onDocument,
  onError,
  onNote,
  onRead,
}: {
  document: PlanDocument | null;
  reading: boolean;
  note: string;
  error: string;
  onDocument: (document: PlanDocument | null) => void;
  onError: (error: string) => void;
  onNote: (note: string) => void;
  onRead: (file: File) => void;
}) {
  const dictionary = useDictionary();
  const inputRef = useRef<HTMLInputElement>(null);

  function choose(file: File | undefined) {
    onError("");
    onNote("");
    if (!file) return;

    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (extension === ".doc") {
      onError(dictionary.pricing.documentLegacyDoc);
      return;
    }
    if (!documentTypes.includes(extension)) {
      onError(dictionary.pricing.documentType);
      return;
    }
    if (file.size > maxDocumentBytes) {
      onError(dictionary.pricing.documentTooLarge);
      return;
    }

    onDocument({ name: file.name, size: file.size });
    onRead(file);
  }

  function remove() {
    onDocument(null);
    onError("");
    onNote("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="grid gap-2 rounded-xl border border-dashed border-white/25 bg-white/5 p-3 text-xs text-ivory/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-ivory/60">{dictionary.pricing.planDocumentHint}</p>
        <label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/30 px-3 py-1.5 text-ivory hover:border-white/60 ${
            reading ? "pointer-events-none opacity-80" : ""
          }`}
        >
          {reading ? (
            <>
              <span className="doc-read-spinner" aria-hidden="true" />
              <span>{dictionary.pricing.readingWithAi}</span>
            </>
          ) : (
            dictionary.pricing.chooseDocument
          )}
          <input
            ref={inputRef}
            type="file"
            accept={documentTypes.join(",")}
            className="sr-only"
            disabled={reading}
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
          <button
            type="button"
            onClick={remove}
            disabled={reading}
            className="text-ivory/70 hover:text-white disabled:opacity-50"
          >
            {dictionary.pricing.removeDocument}
          </button>
        </div>
      ) : null}
      {reading ? (
        <p className="inline-flex items-center gap-2 text-ivory/80">
          <span className="doc-read-spinner" aria-hidden="true" />
          {dictionary.pricing.readingWithAi}
        </p>
      ) : null}
      {error ? <p className="text-ivory">{error}</p> : null}
      {!reading && note ? <p className="text-pine">{note}</p> : null}
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
