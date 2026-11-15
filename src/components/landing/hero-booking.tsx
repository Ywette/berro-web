"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import { DateTimeField } from "@/components/landing/datetime-field";
import {
  OfferRequestDialog,
  type OfferContactSubmit,
} from "@/components/landing/offer-request-dialog";
import {
  PassengerField,
  totalPassengers,
  type PassengerCounts,
} from "@/components/landing/passenger-field";
import { TravelTypeField } from "@/components/landing/travel-type-field";
import { submitQuoteOrder } from "@/lib/orders/client";
import { parsePlanDocument } from "@/lib/plan-document/client";
import type { ExtractedPlanFields } from "@/lib/plan-document/types";
import {
  prependSessionOrder,
  type QuoteOrderInput,
  type QuoteTripMode,
} from "@/lib/orders/session-orders";
import { createStop, encodeStops } from "@/lib/orders/stops";
import {
  splitDateTime,
  toDatetimeLocalInput,
} from "@/lib/orders/route-points";
import type { QuoteTripKind } from "@/lib/quote-trips";
import type { QuoteTravelType } from "@/lib/quote-travel-types";

type ServiceId = "bus" | "minibus" | "transfer";

type HeroStop = {
  id: string;
  place: string;
};

type HeroTripDraft = {
  passengers: PassengerCounts;
  pickup: string;
  dropoff: string;
  tripMode: QuoteTripMode;
  departureAt: string;
  arrivalAt: string;
  returnAt: string;
  stops: HeroStop[];
  planDocumentName: string | null;
  planNote: string;
};

const emptyPassengers = (): PassengerCounts => ({
  adults: 0,
  teens: 0,
  children: 0,
  infants: 0,
});

type HeroFieldError =
  | "passengers"
  | "travelType"
  | "travelTypeOther"
  | "pickup"
  | "dropoff"
  | "departureAt"
  | "arrivalAt"
  | "returnAt";

function clearFieldError(
  setter: Dispatch<SetStateAction<Set<HeroFieldError>>>,
  ...keys: HeroFieldError[]
) {
  setter((current) => {
    const next = new Set(current);
    for (const key of keys) next.delete(key);
    return next;
  });
}

const BUS_MAX_PASSENGERS = 49;
const maxDocumentBytes = 4 * 1024 * 1024;
const documentTypes = [".pdf", ".doc", ".docx", ".txt"];

const serviceTrip: Record<ServiceId, QuoteTripKind> = {
  bus: "Bus Rental",
  minibus: "Minibus Rental",
  transfer: "Transfer",
};

function parseService(value: string | null): ServiceId {
  if (value === "transfer" || value === "minibus" || value === "bus") return value;
  if (value === "excursions") return "minibus";
  return "bus";
}

function serviceFromTrip(trip: QuoteTripKind | undefined): ServiceId | null {
  if (trip === "Bus Rental") return "bus";
  if (trip === "Minibus Rental") return "minibus";
  if (trip === "Transfer") return "transfer";
  if (trip === "Excursions") return "minibus";
  return null;
}

const emptyDraft = (): HeroTripDraft => ({
  passengers: emptyPassengers(),
  pickup: "",
  dropoff: "",
  tripMode: "oneWay",
  departureAt: "",
  arrivalAt: "",
  returnAt: "",
  stops: [],
  planDocumentName: null,
  planNote: "",
});

function newStop(place = ""): HeroStop {
  return { id: createStop(place || "stop", 15).id, place };
}

export function HeroBooking() {
  const dictionary = useDictionary();
  const searchParams = useSearchParams();
  const planInputRef = useRef<HTMLInputElement>(null);
  const [service, setService] = useState<ServiceId>("bus");
  const [travelType, setTravelType] = useState<QuoteTravelType | "">("");
  const [travelTypeDetail, setTravelTypeDetail] = useState("");
  const [planFile, setPlanFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<HeroTripDraft>(emptyDraft);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [phase, setPhase] = useState<"contact" | "sent">("contact");
  const [invalid, setInvalid] = useState<Set<HeroFieldError>>(new Set());
  const [readingPlan, setReadingPlan] = useState(false);
  const [planError, setPlanError] = useState("");

  useEffect(() => {
    setService(parseService(searchParams.get("service")));
  }, [searchParams]);

  function patchDraft(patch: Partial<HeroTripDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function applyExtracted(fields: ExtractedPlanFields) {
    const departure = splitDateTime(fields.departure || fields.pickupDate);
    const returning = splitDateTime(fields.returnAt);
    const patch: Partial<HeroTripDraft> = {};

    if (fields.passengers) {
      const adults = Math.min(
        BUS_MAX_PASSENGERS,
        Math.max(1, Math.round(fields.passengers)),
      );
      patch.passengers = { adults, teens: 0, children: 0, infants: 0 };
    }
    if (fields.pickup) patch.pickup = fields.pickup;
    if (fields.dropoff) patch.dropoff = fields.dropoff;
    if (departure.date) {
      patch.departureAt = toDatetimeLocalInput(departure.date, departure.time);
    }

    const pickup = fields.pickup?.trim() ?? "";
    const dropoff = fields.dropoff?.trim() ?? "";
    const samePlace =
      pickup.length > 0 && dropoff.length > 0 && placesMatch(pickup, dropoff);
    const endAt = returning.date
      ? toDatetimeLocalInput(returning.date, returning.time)
      : "";

    if (pickup && dropoff && !samePlace) {
      patch.tripMode = "oneWay";
      patch.returnAt = "";
      patch.arrivalAt = endAt;
    } else if (pickup && dropoff && samePlace) {
      patch.tripMode = "roundTrip";
      patch.arrivalAt = "";
      patch.returnAt = endAt;
    } else if (returning.date) {
      patch.tripMode = "roundTrip";
      patch.returnAt = endAt;
      patch.arrivalAt = "";
    } else if (fields.trip === "Transfer" || departure.date) {
      patch.tripMode = "oneWay";
      patch.returnAt = "";
      patch.arrivalAt = endAt;
    }

    if (fields.stops?.length) {
      const endpoints = new Set(
        [pickup, dropoff].filter(Boolean).map((place) => normalizePlace(place)),
      );
      patch.stops = fields.stops
        .filter((stop) => {
          const name = stop.name.trim();
          return name.length > 0 && !endpoints.has(normalizePlace(name));
        })
        .map((stop) => newStop(stop.name.trim()));
    }
    if (fields.trip) {
      const matched = serviceFromTrip(fields.trip);
      if (matched) setService(matched);
    }

    setDraft((current) => ({ ...current, ...patch }));
  }

  async function readTravelPlan(file: File) {
    setReadingPlan(true);
    setPlanError("");
    try {
      const result = await parsePlanDocument(file, dictionary.locale);
      applyExtracted(result.fields);
      setPlanFile(file);
      setDraft((current) => ({
        ...current,
        planDocumentName: file.name,
        planNote: result.summary?.trim() || dictionary.pricing.aiFilled(file.name),
      }));
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
      setPlanError(message || dictionary.pricing.documentReadError);
      setPlanFile(null);
      setDraft((current) => ({ ...current, planDocumentName: null, planNote: "" }));
    } finally {
      setReadingPlan(false);
    }
  }

  function chooseTravelPlan(file: File | undefined) {
    setPlanError("");
    if (!file) return;
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (extension === ".doc") {
      setPlanError(dictionary.pricing.documentLegacyDoc);
      return;
    }
    if (!documentTypes.includes(extension)) {
      setPlanError(dictionary.pricing.documentType);
      return;
    }
    if (file.size > maxDocumentBytes) {
      setPlanError(dictionary.pricing.documentTooLarge);
      return;
    }
    setPlanFile(file);
    setDraft((current) => ({ ...current, planDocumentName: file.name }));
    void readTravelPlan(file);
  }

  function clearTravelPlan() {
    setPlanError("");
    setPlanFile(null);
    setDraft((current) => ({ ...current, planDocumentName: null, planNote: "" }));
    if (planInputRef.current) planInputRef.current.value = "";
  }

  function buildQuoteInput(contact: OfferContactSubmit): QuoteOrderInput {
    const needsDestination = draft.tripMode === "oneWay";
    const needsReturn = draft.tripMode === "roundTrip";
    const resolvedDropoff = needsDestination
      ? draft.dropoff.trim() || draft.pickup.trim()
      : draft.dropoff.trim() || draft.pickup.trim();
    const stops = draft.stops
      .map((stop) => createStop(stop.place))
      .filter((stop) => stop.name.length > 0);

    return {
      trip: serviceTrip[service],
      tripMode: draft.tripMode,
      name: contact.name,
      company: contact.company,
      email: contact.email,
      phone: contact.phone,
      heardAbout: contact.heardAbout,
      heardAboutDetail: contact.heardAboutDetail,
      travelType: travelType || undefined,
      travelTypeDetail:
        travelType === "other" ? travelTypeDetail.trim() || undefined : undefined,
      pickup: draft.pickup.trim(),
      dropoff: resolvedDropoff,
      departure: draft.departureAt || undefined,
      returnAt: needsReturn
        ? draft.returnAt || undefined
        : draft.arrivalAt || undefined,
      passengers:
        totalPassengers(draft.passengers) > 0
          ? String(totalPassengers(draft.passengers))
          : undefined,
      stops: stops.length > 0 ? encodeStops(stops) : undefined,
      planDocument: draft.planDocumentName || draft.planNote || undefined,
    };
  }

  function collectErrors() {
    const errors = new Set<HeroFieldError>();
    const count = totalPassengers(draft.passengers);
    if (count < 1 || count > BUS_MAX_PASSENGERS) {
      errors.add("passengers");
    }
    if (!travelType) errors.add("travelType");
    if (travelType === "other" && travelTypeDetail.trim().length < 2) {
      errors.add("travelTypeOther");
    }
    if (!draft.pickup.trim()) errors.add("pickup");
    if (!draft.departureAt) errors.add("departureAt");
    if (draft.tripMode === "oneWay") {
      if (!draft.dropoff.trim()) errors.add("dropoff");
      if (!draft.arrivalAt) errors.add("arrivalAt");
    }
    if (draft.tripMode === "roundTrip" && !draft.returnAt) {
      errors.add("returnAt");
    }
    return errors;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = collectErrors();
    if (errors.size > 0) {
      setInvalid(errors);
      return;
    }
    setInvalid(new Set());
    setPhase("contact");
    setDialogOpen(true);
  }

  function closeDialog() {
    const shouldReload = phase === "sent";
    setDialogOpen(false);
    setPhase("contact");
    if (shouldReload) window.location.reload();
  }

  async function submitContact(contact: OfferContactSubmit) {
    const input = buildQuoteInput(contact);
    const formData = new FormData();
    for (const [key, value] of Object.entries(input)) {
      if (value) formData.set(key, value);
    }
    if (planFile) formData.set("planFile", planFile, planFile.name);

    const result = await submitQuoteOrder(formData);
    if (!result.ok) {
      throw new Error(result.error || dictionary.hero.contactSubmitError);
    }
    prependSessionOrder(result.order);
    setPhase("sent");
  }

  const needsDestination = draft.tripMode === "oneWay";
  const needsReturn = draft.tripMode === "roundTrip";
  const formReady = collectErrors().size === 0;

  const fieldClass = (bad = false) =>
    `h-10 w-full rounded-full border bg-white/95 px-3.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 ${
      bad ? "field-error-blink" : "border-transparent"
    }`;

  return (
    <div className="hero-booking-enter w-full">
      <form
        noValidate
        onSubmit={onSubmit}
        className="relative flex max-h-[min(34rem,calc(100svh-var(--site-header-height)-5.5rem))] flex-col overflow-visible rounded-2xl border border-white/12 bg-black/50 p-5 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.95)] backdrop-blur-md sm:p-6 lg:max-h-[calc(100svh-var(--site-header-height)-4rem)]"
      >
        {readingPlan ? (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-night/70 px-5 backdrop-blur-[2px]"
            role="status"
            aria-live="polite"
          >
            <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border border-white/12 bg-black/55 px-5 py-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
              <PlanReadingVisual />
              <p className="text-center text-sm font-medium tracking-wide text-ivory">
                {dictionary.pricing.readingWithAi}
              </p>
              {draft.planDocumentName ? (
                <p className="truncate text-center text-[11px] text-ivory/55">
                  {draft.planDocumentName}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          className={`relative z-20 space-y-2.5 px-1 py-1 ${readingPlan ? "pointer-events-none select-none" : ""}`}
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[5.75rem_auto_minmax(0,1.25fr)] sm:gap-2.5">
            {draft.planDocumentName ? (
              <div
                className={`col-span-1 flex h-10 min-w-0 items-center gap-1.5 rounded-full border px-2.5 text-[10px] ${
                  readingPlan
                    ? "border-champagne/45 bg-champagne/10 text-ivory"
                    : "border-white/18 bg-white/5 text-ivory/85"
                }`}
              >
                {readingPlan ? (
                  <span className="doc-read-spinner h-3 w-3 shrink-0" aria-hidden="true" />
                ) : null}
                <span
                  className="truncate"
                  title={
                    readingPlan
                      ? dictionary.pricing.readingWithAi
                      : draft.planDocumentName
                  }
                >
                  {readingPlan
                    ? dictionary.pricing.readingWithAi
                    : draft.planDocumentName}
                </span>
                {!readingPlan ? (
                  <button
                    type="button"
                    onClick={clearTravelPlan}
                    className="ml-auto shrink-0 text-ivory/60 hover:text-ivory"
                    aria-label={dictionary.hero.removeStop}
                  >
                    −
                  </button>
                ) : null}
              </div>
            ) : (
              <label className="col-span-1 inline-flex h-10 cursor-pointer items-center justify-center gap-1 rounded-full border border-white/18 px-2 text-[10px] font-semibold tracking-wide text-ivory/90 hover:bg-white/8">
                <AttachmentIcon />
                <span className="truncate">{dictionary.hero.attachTravelPlan}</span>
                <input
                  ref={planInputRef}
                  type="file"
                  accept={documentTypes.join(",")}
                  className="sr-only"
                  disabled={readingPlan}
                  onChange={(event) => {
                    chooseTravelPlan(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
            )}

            <div
              className="relative col-span-1 grid h-10 grid-cols-2 rounded-full border border-white/18 bg-white/5 p-0.5 sm:w-max sm:min-w-[17.5rem] sm:col-auto"
              role="radiogroup"
              aria-label={dictionary.hero.tripModeLabel}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-burgundy shadow-[0_8px_18px_-12px_rgba(142,36,63,0.9)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  draft.tripMode === "roundTrip" ? "translate-x-[calc(100%+2px)]" : "translate-x-0"
                }`}
              />
              {(
                [
                  ["oneWay", dictionary.hero.oneWay],
                  ["roundTrip", dictionary.hero.roundTrip],
                ] as const
              ).map(([mode, label]) => {
                const active = draft.tripMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      patchDraft({
                        tripMode: mode,
                        returnAt: mode === "roundTrip" ? draft.returnAt : "",
                        arrivalAt: mode === "oneWay" ? draft.arrivalAt : "",
                      });
                      if (mode === "oneWay") clearFieldError(setInvalid, "returnAt");
                      else clearFieldError(setInvalid, "dropoff", "arrivalAt");
                    }}
                    className={`relative z-10 h-full whitespace-nowrap rounded-full px-2.5 text-[11px] font-semibold tracking-wide transition-colors duration-300 sm:px-3 sm:text-xs ${
                      active ? "text-white" : "text-ivory/75 hover:text-ivory"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <PassengerField
              className="col-span-2 sm:col-auto"
              value={draft.passengers}
              invalid={invalid.has("passengers")}
              maxTotal={BUS_MAX_PASSENGERS}
              copy={{
                label: dictionary.hero.passengerCount,
                ...dictionary.hero.passengerPicker,
              }}
              onChange={(passengers) => {
                patchDraft({ passengers });
                clearFieldError(setInvalid, "passengers");
              }}
            />
          </div>

          <TravelTypeField
            value={travelType}
            detail={travelTypeDetail}
            invalid={invalid.has("travelType")}
            detailInvalid={invalid.has("travelTypeOther")}
            copy={{
              label: dictionary.hero.travelTypeLabel,
              placeholder: dictionary.hero.travelTypePlaceholder,
              otherPlaceholder: dictionary.hero.travelTypeOtherPlaceholder,
              options: dictionary.hero.travelTypeOptions,
            }}
            onChange={(value) => {
              setTravelType(value);
              if (value !== "other") setTravelTypeDetail("");
              clearFieldError(setInvalid, "travelType", "travelTypeOther");
            }}
            onDetailChange={(value) => {
              setTravelTypeDetail(value);
              clearFieldError(setInvalid, "travelTypeOther");
            }}
          />

          {planError ? (
            <p className="text-[11px] text-red-200" role="alert">
              {planError}
            </p>
          ) : null}
          {invalid.has("travelType") || invalid.has("travelTypeOther") ? (
            <p className="text-[11px] text-red-200" role="alert">
              {invalid.has("travelTypeOther")
                ? dictionary.hero.travelTypeOtherError
                : dictionary.hero.travelTypeError}
            </p>
          ) : null}
        </div>

        <div
          className={`relative z-20 mt-2.5 space-y-2 overflow-visible px-2.5 py-2.5 ${readingPlan ? "pointer-events-none select-none" : ""}`}
        >
          <div className="relative space-y-2 overflow-visible">
            {needsDestination || draft.stops.length > 0 ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-5 bottom-5 left-[0.875rem] w-px -translate-x-1/2 bg-champagne/50"
              />
            ) : null}

            <div className="relative grid grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-x-2.5 gap-y-2 sm:grid-cols-[1.75rem_minmax(0,1fr)_minmax(0,1fr)]">
              <RouteMarker kind="start" />
              <label
                className={invalid.has("pickup") ? "relative z-40 overflow-visible" : ""}
              >
                <span className="sr-only">{dictionary.hero.route}</span>
                <input
                  value={draft.pickup}
                  placeholder={dictionary.hero.route}
                  aria-label={dictionary.hero.route}
                  aria-invalid={invalid.has("pickup") || undefined}
                  onChange={(event) => {
                    patchDraft({ pickup: event.target.value });
                    clearFieldError(setInvalid, "pickup");
                  }}
                  className={`${fieldClass(invalid.has("pickup"))} placeholder:normal-case placeholder:tracking-normal`}
                />
              </label>
              <div className={invalid.has("departureAt") ? "relative z-40 overflow-visible" : ""}>
                <DateTimeField
                  label={dictionary.hero.departureAt}
                  value={draft.departureAt}
                  hideLabel
                  invalid={invalid.has("departureAt")}
                  className="h-10 rounded-full"
                  onChange={(value) => {
                    patchDraft({
                      departureAt: value,
                      arrivalAt:
                        draft.arrivalAt && value && draft.arrivalAt < value
                          ? value
                          : draft.arrivalAt,
                      returnAt:
                        draft.returnAt && value && draft.returnAt < value
                          ? value
                          : draft.returnAt,
                    });
                    clearFieldError(setInvalid, "departureAt");
                  }}
                />
              </div>
            </div>

            {draft.stops.length > 0 ? (
              <div className="relative max-h-40 space-y-2 overflow-y-auto overflow-x-visible py-0.5">
                {draft.stops.map((stop, index) => (
                  <div
                    key={stop.id}
                    className="grid grid-cols-[1.75rem_minmax(0,1fr)_2.25rem] items-center gap-x-2.5"
                  >
                    <RouteMarker kind="stop" />
                    <label>
                      <span className="sr-only">
                        {dictionary.hero.stopPlaceholder} {index + 1}
                      </span>
                      <input
                        value={stop.place}
                        placeholder={`${dictionary.hero.stopPlaceholder} ${index + 1}`}
                        aria-label={`${dictionary.hero.stopPlaceholder} ${index + 1}`}
                        onChange={(event) => {
                          const place = event.target.value;
                          patchDraft({
                            stops: draft.stops.map((item) =>
                              item.id === stop.id ? { ...item, place } : item,
                            ),
                          });
                        }}
                        className={`${fieldClass()} placeholder:normal-case placeholder:tracking-normal`}
                      />
                    </label>
                    <button
                      type="button"
                      aria-label={dictionary.hero.removeStop}
                      onClick={() => {
                        patchDraft({
                          stops: draft.stops.filter((item) => item.id !== stop.id),
                        });
                      }}
                      className="grid h-10 w-9 place-items-center rounded-full border border-white/18 text-ivory/75 hover:bg-white/8"
                    >
                      −
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {needsDestination ? (
              <div className="relative grid grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-x-2.5 gap-y-2 sm:grid-cols-[1.75rem_minmax(0,1fr)_minmax(0,1fr)]">
                <RouteMarker kind="end" />
                <label
                  className={invalid.has("dropoff") ? "relative z-40 overflow-visible" : ""}
                >
                  <span className="sr-only">{dictionary.hero.destination}</span>
                  <input
                    value={draft.dropoff}
                    placeholder={dictionary.hero.destination}
                    aria-label={dictionary.hero.destination}
                    aria-invalid={invalid.has("dropoff") || undefined}
                    onChange={(event) => {
                      patchDraft({ dropoff: event.target.value });
                      clearFieldError(setInvalid, "dropoff");
                    }}
                    className={`${fieldClass(invalid.has("dropoff"))} placeholder:normal-case placeholder:tracking-normal`}
                  />
                </label>
                <div className={invalid.has("arrivalAt") ? "relative z-40 overflow-visible" : ""}>
                  <DateTimeField
                    label={dictionary.hero.arrivalAt}
                    value={draft.arrivalAt}
                    min={draft.departureAt || undefined}
                    hideLabel
                    invalid={invalid.has("arrivalAt")}
                    className="h-10 rounded-full"
                    onChange={(value) => {
                      patchDraft({ arrivalAt: value });
                      clearFieldError(setInvalid, "arrivalAt");
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="pl-[calc(1.75rem+0.625rem)]">
            <button
              type="button"
              onClick={() => patchDraft({ stops: [...draft.stops, newStop()] })}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-champagne/90 hover:text-champagne"
            >
              <span aria-hidden="true">+</span>
              {dictionary.hero.addStop}
            </button>
          </div>

          {needsReturn ? (
            <div className="grid grid-cols-1 gap-2 overflow-visible sm:grid-cols-[1.75rem_minmax(0,1fr)_minmax(0,1fr)] sm:gap-x-2.5">
              <div
                className={`sm:col-start-3 ${invalid.has("returnAt") ? "relative z-40 overflow-visible" : ""}`}
              >
                <DateTimeField
                  label={dictionary.hero.returnAt}
                  value={draft.returnAt}
                  min={draft.departureAt || undefined}
                  hideLabel
                  invalid={invalid.has("returnAt")}
                  className="h-10 rounded-full"
                  onChange={(value) => {
                    patchDraft({ returnAt: value });
                    clearFieldError(setInvalid, "returnAt");
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {invalid.size > 0 ? (
          <p role="alert" className="mt-2 text-[11px] text-red-200">
            {dictionary.hero.heroMissingFields}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={readingPlan}
          className={`mt-3 inline-flex h-11 w-full shrink-0 items-center justify-center gap-2.5 rounded-full px-5 text-sm font-semibold transition-[background-color,color] duration-300 disabled:opacity-50 ${
            formReady
              ? "field-ready-glow bg-leaf text-white hover:bg-leaf-deep"
              : "bg-burgundy text-white hover:bg-burgundy-deep"
          }`}
        >
          <span>{dictionary.hero.getOffer}</span>
          {formReady ? (
            <Image
              src="/brand/berro-travel-mark.png"
              alt=""
              width={36}
              height={36}
              className="field-ready-mark h-8 w-8 object-contain"
              aria-hidden="true"
            />
          ) : null}
        </button>
      </form>

      <OfferRequestDialog
        open={dialogOpen}
        phase={phase}
        onClose={closeDialog}
        onContactSubmit={submitContact}
      />
    </div>
  );
}

function normalizePlace(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function placesMatch(a: string, b: string) {
  return normalizePlace(a) === normalizePlace(b);
}

function AttachmentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" aria-hidden="true">
      <path
        d="M21.44 11.05l-8.49 8.49a5.25 5.25 0 01-7.42-7.42l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a1.75 1.75 0 01-2.47-2.47l8.49-8.48"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlanReadingVisual() {
  return (
    <div className="relative flex h-14 w-40 items-center justify-center" aria-hidden="true">
      <span className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-champagne/35" />
      <span className="plan-read-pulse absolute inset-x-6 top-1/2 h-px -translate-y-1/2 origin-left bg-champagne" />
      <span className="absolute left-4 flex h-8 w-8 items-center justify-center rounded-full bg-pine/20 text-pine ring-1 ring-pine/40">
        <LocationPinIcon className="h-4 w-4" />
      </span>
      <span className="absolute flex h-2.5 w-2.5 rounded-full border-2 border-champagne bg-night" />
      <span className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-full bg-burgundy text-white ring-1 ring-burgundy/50">
        <FlagMarkerIcon />
      </span>
      <span className="doc-read-spinner absolute -bottom-1 h-4 w-4" />
    </div>
  );
}

function RouteMarker({ kind }: { kind: "start" | "stop" | "end" }) {
  if (kind === "stop") {
    return (
      <span
        aria-hidden="true"
        className="relative z-10 mx-auto flex h-10 w-7 items-center justify-center"
      >
        <span className="h-2.5 w-2.5 rounded-full border-2 border-champagne bg-[#1a1a1e] shadow-[0_0_0_3px_rgba(12,12,14,0.65)]" />
      </span>
    );
  }

  if (kind === "start") {
    return (
      <span
        aria-hidden="true"
        className="relative z-10 mx-auto flex h-10 w-7 items-center justify-center text-pine drop-shadow-[0_0_0_3px_rgba(12,12,14,0.65)]"
      >
        <LocationPinIcon />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="relative z-10 mx-auto flex h-10 w-7 items-center justify-center"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-burgundy text-white shadow-[0_0_0_3px_rgba(12,12,14,0.65)]">
        <FlagMarkerIcon />
      </span>
    </span>
  );
}

function LocationPinIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2c-3.86 0-7 3.05-7 6.8 0 5.05 5.72 11.55 6.52 12.4a.7.7 0 001.0 0C13.28 20.35 19 13.85 19 8.8 19 5.05 15.86 2 12 2zm0 9.4A2.6 2.6 0 1112 6.8a2.6 2.6 0 010 5.2z" />
    </svg>
  );
}

function FlagMarkerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
      <path d="M6.5 3.5a.75.75 0 011.5 0V5h9.1c.7 0 1.1.8.7 1.4l-1.4 2.1 1.4 2.1c.4.6 0 1.4-.7 1.4H8v8.25a.75.75 0 01-1.5 0V3.5z" />
    </svg>
  );
}
