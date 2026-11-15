"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/components/i18n/locale-provider";
import { DateTimeInput } from "@/components/landing/datetime-field";
import { PlaceField } from "@/components/landing/place-field";
import { QuoteSummaryDialog } from "@/components/landing/quote-summary-dialog";
import { parsePlanDocument } from "@/lib/plan-document/client";
import type { ExtractedPlanFields } from "@/lib/plan-document/types";
import {
  toDatetimeLocalInput,
} from "@/lib/orders/route-points";
import {
  encodeStops,
  mergeStops,
  totalWaitingMinutes,
  type QuoteStop,
} from "@/lib/orders/stops";
import { quoteFieldErrors, type QuoteOrderInput, type QuoteRequiredField } from "@/lib/orders/session-orders";
import { quoteTripKinds, type QuoteTripKind } from "@/lib/quote-trips";

const trips = quoteTripKinds;
type Trip = QuoteTripKind;

const maxDocumentBytes = 4 * 1024 * 1024;
const documentTypes = [".pdf", ".doc", ".docx", ".txt"];

type PlanDocument = { name: string; size: number };

export type QuoteDefaults = {
  trip?: Trip;
  name?: string;
  email?: string;
  phone?: string;
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
  showDocument?: boolean;
  formId?: string;
};

export function QuoteCard({
  defaults,
  showDocument = true,
  formId = "book",
}: QuoteCardProps = {}) {
  const router = useRouter();
  const dictionary = useDictionary();
  const tripLabels: Record<Trip, string> = {
    "Bus Rental": dictionary.quote.busRental,
    "Minibus Rental": dictionary.quote.minibusRental,
    Transfer: dictionary.quote.transfer,
    Excursions: dictionary.quote.excursionsType,
  };
  const initialDeparture = splitDateTime(defaults?.departure);
  const initialReturn = splitDateTime(defaults?.returnAt);
  const [trip, setTrip] = useState<Trip>(defaults?.trip ?? "Bus Rental");
  const [name, setName] = useState(defaults?.name ?? "");
  const [email, setEmail] = useState(defaults?.email ?? "");
  const [phone, setPhone] = useState(defaults?.phone ?? "");
  const [pickup, setPickup] = useState(defaults?.pickup ?? "");
  const [pickupPlace, setPickupPlace] = useState(defaults?.pickupPlace ?? "");
  const [dropoff, setDropoff] = useState(defaults?.dropoff ?? "");
  const [dropoffPlace, setDropoffPlace] = useState(defaults?.dropoffPlace ?? "");
  const [departureAt, setDepartureAt] = useState(
    toDatetimeLocalInput(initialDeparture.date, initialDeparture.time),
  );
  const [returnAt, setReturnAt] = useState(
    toDatetimeLocalInput(initialReturn.date, initialReturn.time),
  );
  const [passengers, setPassengers] = useState(defaults?.passengers ?? "");
  const [planDocument, setPlanDocument] = useState<PlanDocument | null>(null);
  const [documentNote, setDocumentNote] = useState("");
  const [documentError, setDocumentError] = useState("");
  const [reading, setReading] = useState(false);
  const [invalid, setInvalid] = useState<Set<QuoteRequiredField>>(new Set());
  const [stops, setStops] = useState<QuoteStop[]>([]);
  const [otherWaitingMinutes, setOtherWaitingMinutes] = useState(0);
  const [stopsFromPlan, setStopsFromPlan] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState<QuoteOrderInput | null>(null);
  const [placeIds, setPlaceIds] = useState({
    pickup: defaults?.pickupPlace ?? "",
    dropoff: defaults?.dropoffPlace ?? "",
  });

  function clearInvalid(field: QuoteRequiredField) {
    setInvalid((current) => {
      if (!current.has(field)) return current;
      const next = new Set(current);
      next.delete(field);
      return next;
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reading) return;

    const form = new FormData(event.currentTarget);
    const input: QuoteOrderInput = {
      trip,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      pickup: String(form.get("pickup") ?? ""),
      dropoff: String(form.get("dropoff") ?? ""),
      departure: String(form.get("departureAt") ?? departureAt),
      returnAt: String(form.get("returnAt") ?? returnAt) || undefined,
      passengers: String(form.get("passengers") ?? ""),
    };
    const errors = quoteFieldErrors(input);
    if (errors.length > 0) {
      setInvalid(new Set(errors));
      return;
    }

    setPlaceIds({
      pickup: String(form.get("pickupPlace") ?? ""),
      dropoff: String(form.get("dropoffPlace") ?? ""),
    });
    setPickup(input.pickup || "");
    setDropoff(input.dropoff || "");
    setSummaryDraft(input);
    setSummaryOpen(true);
  }

  function confirmSummary() {
    if (!summaryDraft) return;
    const waiting = totalWaitingMinutes(stops, otherWaitingMinutes);
    const input: QuoteOrderInput = {
      ...summaryDraft,
      stops: encodeStops(stops),
      otherWaitingMinutes: otherWaitingMinutes > 0 ? String(otherWaitingMinutes) : "",
      waitingMinutes: waiting > 0 ? String(waiting) : "",
    };
    if (planDocument) input.planDocument = planDocument.name;

    const params = new URLSearchParams({ trip });
    for (const [key, value] of Object.entries(input)) {
      if (key !== "trip" && value) params.set(key, value);
    }
    if (placeIds.pickup) params.set("pickupPlace", placeIds.pickup);
    if (placeIds.dropoff) params.set("dropoffPlace", placeIds.dropoff);
    setSummaryOpen(false);
    router.push(`/order-received?${params.toString()}`);
  }

  async function readDocument(file: File) {
    setReading(true);
    setDocumentError("");
    setDocumentNote("");

    try {
      const result = await parsePlanDocument(file, dictionary.locale);
      const populated = applyExtracted(result.fields);
      setDocumentNote(
        result.summary?.trim() ||
          (populated
            ? dictionary.pricing.aiFilled(file.name)
            : dictionary.quote.documentIncomplete),
      );
    } catch (caught) {
      const code =
        caught instanceof Error && "code" in caught
          ? String((caught as Error & { code?: string }).code ?? "")
          : "";
      const message =
        code === "ai_missing_key"
          ? dictionary.pricing.aiMissingKey
          : code === "ai_no_credits"
            ? dictionary.pricing.aiNoCredits
            : code === "ai_unavailable"
              ? dictionary.pricing.aiUnavailable
              : caught instanceof Error
                ? caught.message
                : dictionary.pricing.documentReadError;
      setDocumentError(message || dictionary.pricing.documentReadError);
    } finally {
      setReading(false);
    }
  }

  function applyExtracted(fields: ExtractedPlanFields) {
    const filled = new Set<QuoteRequiredField>();
    const returning = splitDateTime(fields.returnAt);
    if (fields.trip) setTrip(fields.trip);
    else if (returning.date) setTrip("Excursions");

    if (fields.name) {
      setName(fields.name);
      filled.add("name");
    }
    if (fields.email) {
      setEmail(fields.email);
      filled.add("email");
    }
    if (fields.phone) setPhone(fields.phone);
    if (fields.pickup) {
      setPickup(fields.pickup);
      setPickupPlace("");
      filled.add("pickup");
    }
    if (fields.dropoff) {
      setDropoff(fields.dropoff);
      setDropoffPlace("");
      filled.add("dropoff");
    }
    if (fields.passengers) {
      setPassengers(String(fields.passengers));
      filled.add("passengers");
    }
    const departure = splitDateTime(fields.departure || fields.pickupDate);
    if (departure.date) {
      setDepartureAt(toDatetimeLocalInput(departure.date, departure.time));
      filled.add("departure");
    }
    if (returning.date) {
      setReturnAt(toDatetimeLocalInput(returning.date, returning.time));
      filled.add("return");
    }
    if (fields.stops?.length) {
      setStops((current) => mergeStops(current, fields.stops ?? []));
      setStopsFromPlan(true);
    }
    if (typeof fields.otherWaitingMinutes === "number" && fields.otherWaitingMinutes > 0) {
      setOtherWaitingMinutes(fields.otherWaitingMinutes);
      setStopsFromPlan(true);
    }
    if (filled.size > 0) {
      setInvalid((current) => {
        const next = new Set(current);
        for (const field of filled) next.delete(field);
        return next;
      });
    }
    return filled.size > 0 || Boolean(fields.stops?.length);
  }

  return (
    <form
      id={formId}
      noValidate
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
          onRead={(file) => void readDocument(file)}
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

      <div className="mt-4 grid grid-cols-2 gap-3">
        <input
          name="name"
          autoComplete="name"
          value={name}
          placeholder={dictionary.quote.name}
          aria-label={dictionary.quote.name}
          aria-invalid={invalid.has("name") || undefined}
          onChange={(event) => {
            setName(event.target.value);
            clearInvalid("name");
          }}
          className={controlClass(invalid.has("name"))}
        />
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          placeholder={dictionary.quote.phone}
          aria-label={dictionary.quote.phone}
          onChange={(event) => setPhone(event.target.value)}
          className={controlClass(false)}
        />
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,1.6fr)_minmax(4.5rem,0.7fr)] gap-3">
        <input
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          placeholder={dictionary.quote.email}
          aria-label={dictionary.quote.email}
          aria-invalid={invalid.has("email") || undefined}
          onChange={(event) => {
            setEmail(event.target.value);
            clearInvalid("email");
          }}
          className={controlClass(invalid.has("email"))}
        />
        <input
          name="passengers"
          inputMode="numeric"
          value={passengers}
          placeholder={dictionary.quote.passengers}
          aria-label={dictionary.quote.passengers}
          aria-invalid={invalid.has("passengers") || undefined}
          onChange={(event) => {
            setPassengers(event.target.value.replace(/[^\d]/g, "").slice(0, 2));
            clearInvalid("passengers");
          }}
          className={controlClass(invalid.has("passengers"))}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 items-end gap-2 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1.15fr)] sm:gap-3">
        <PlaceField
          key={`pickup-${pickup}`}
          name="pickup"
          label={dictionary.quote.pickup}
          placeholder={dictionary.quote.pickup}
          inputClassName={controlClass(invalid.has("pickup"))}
          defaultText={pickup}
          defaultPlaceId={pickupPlace}
          invalid={invalid.has("pickup")}
          onPlaceChange={(value, placeId) => {
            setPickup(value);
            setPickupPlace(placeId);
            clearInvalid("pickup");
          }}
        />
        <Field label={dictionary.quote.departureAt} invalid={invalid.has("departure")}>
          <DateTimeInput
            name="departureAt"
            value={departureAt}
            invalid={invalid.has("departure")}
            onChange={(value) => {
              setDepartureAt(value);
              clearInvalid("departure");
              if (returnAt && value && returnAt < value) setReturnAt(value);
            }}
          />
        </Field>
      </div>

      <div className="mt-3 grid grid-cols-1 items-end gap-2 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1.15fr)] sm:gap-3">
        <PlaceField
          key={`dropoff-${dropoff}`}
          name="dropoff"
          label={dictionary.quote.dropoff}
          placeholder={dictionary.quote.dropoff}
          inputClassName={controlClass(invalid.has("dropoff"))}
          defaultText={dropoff}
          defaultPlaceId={dropoffPlace}
          invalid={invalid.has("dropoff")}
          onPlaceChange={(value, placeId) => {
            setDropoff(value);
            setDropoffPlace(placeId);
            clearInvalid("dropoff");
          }}
        />
        <Field label={dictionary.quote.returnAt} invalid={invalid.has("return")}>
          <DateTimeInput
            name="returnAt"
            value={returnAt}
            min={departureAt || undefined}
            invalid={invalid.has("return")}
            onChange={(value) => {
              setReturnAt(value);
              clearInvalid("return");
            }}
          />
        </Field>
      </div>

      {invalid.size > 0 ? (
        <p role="alert" className="mt-3 text-xs text-red-300">
          {dictionary.quote.missingFields}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link
          href="/plan"
          className="inline-flex h-10 items-center justify-center rounded-md border border-white/30 px-3 text-sm font-medium text-ivory hover:border-white/60 hover:bg-white/5"
        >
          {dictionary.quote.planner}
        </Link>
        <button
          type="submit"
          disabled={reading}
          className="h-10 rounded-md bg-burgundy px-3 text-sm font-medium text-white hover:bg-burgundy-deep disabled:opacity-60"
        >
          {dictionary.quote.search}
        </button>
      </div>

      {summaryDraft ? (
        <QuoteSummaryDialog
          open={summaryOpen}
          draft={summaryDraft}
          tripLabel={tripLabels[trip]}
          stops={stops}
          otherWaitingMinutes={otherWaitingMinutes}
          stopsMissingFromPlan={!stopsFromPlan && stops.length === 0}
          onStopsChange={setStops}
          onClose={() => setSummaryOpen(false)}
          onConfirm={confirmSummary}
        />
      ) : null}
    </form>
  );
}

function Field({
  label,
  invalid = false,
  children,
}: {
  label: string;
  invalid?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`grid min-w-0 gap-1.5 text-xs ${invalid ? "text-red-200" : "text-ivory/70"}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function controlClass(invalid: boolean) {
  return `h-10 w-full min-w-0 max-w-full rounded-md border bg-white px-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 [color-scheme:light] sm:px-3 ${
    invalid ? "border-red-600 focus:ring-red-500/40" : "border-black/5 focus:ring-burgundy/30"
  }`;
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
      <div className="flex min-w-0 items-center gap-2">
        {document ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="min-w-0 truncate text-ivory" title={document.name}>
              {document.name}
              <span className="text-ivory/55"> · {formatSize(document.size)}</span>
            </span>
            <button
              type="button"
              onClick={remove}
              disabled={reading}
              className="shrink-0 text-ivory/70 hover:text-white disabled:opacity-50"
            >
              {dictionary.pricing.removeDocument}
            </button>
          </div>
        ) : (
          <p className="min-w-0 flex-1 text-[11px] text-ivory/60">{dictionary.pricing.planDocumentHint}</p>
        )}
        <label
          className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-white/30 px-3 py-1.5 text-ivory hover:border-white/60 ${
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
      {error ? <p className="text-ivory">{error}</p> : null}
      {!reading && note ? <p className="text-pine">{note}</p> : null}
    </div>
  );
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function splitDateTime(value: string | undefined) {
  const match = value?.match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/);
  return { date: match?.[1] ?? "", time: match?.[2] ?? "" };
}
