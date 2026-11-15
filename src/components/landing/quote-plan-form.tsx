"use client";

import { useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/components/i18n/locale-provider";
import { DateTimeInput } from "@/components/landing/datetime-field";
import { PlaceField } from "@/components/landing/place-field";
import { QuoteSummaryDialog } from "@/components/landing/quote-summary-dialog";
import { parsePlanDocument } from "@/lib/plan-document/client";
import type { ExtractedPlanFields } from "@/lib/plan-document/types";
import { formatDistance, formatDuration } from "@/lib/quote";
import {
  defaultRoutePoints,
  fromDatetimeLocalInput,
  insertRoutePoint,
  removeRoutePoint,
  routePointsToQuote,
  splitDateTime,
  toDatetimeLocalInput,
  type RoutePoint,
} from "@/lib/orders/route-points";
import { encodeStops, totalWaitingMinutes } from "@/lib/orders/stops";
import { quoteFieldErrors, type QuoteOrderInput, type QuoteRequiredField } from "@/lib/orders/session-orders";
import type { TripRoute } from "@/lib/places/types";
import {
  isQuoteHeardAboutSource,
  quoteHeardAboutSources,
  type QuoteHeardAboutSource,
} from "@/lib/quote-heard-about";
import { isQuoteTripKind, quoteTripKinds, type QuoteTripKind } from "@/lib/quote-trips";

const trips = quoteTripKinds;
type Trip = QuoteTripKind;

const maxDocumentBytes = 4 * 1024 * 1024;
const documentTypes = [".pdf", ".doc", ".docx", ".txt"];

type PlanDocument = { name: string; size: number };

export type QuotePlanDefaults = {
  trip?: string;
  name?: string;
  email?: string;
  phone?: string;
  passengers?: string;
  pickup?: string;
  pickupPlace?: string;
  dropoff?: string;
  dropoffPlace?: string;
  departure?: string;
  returnAt?: string;
};

type QuotePlanFormProps = {
  formId?: string;
  defaults?: QuotePlanDefaults;
};

export function QuotePlanForm({ formId = "plan-book", defaults }: QuotePlanFormProps = {}) {
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
  const [trip, setTrip] = useState<Trip>(isQuoteTripKind(defaults?.trip) ? defaults.trip : "Bus Rental");
  const [name, setName] = useState(defaults?.name ?? "");
  const [email, setEmail] = useState(defaults?.email ?? "");
  const [phone, setPhone] = useState(defaults?.phone ?? "");
  const [heardAbout, setHeardAbout] = useState<QuoteHeardAboutSource | "">("");
  const [heardAboutDetail, setHeardAboutDetail] = useState("");
  const [heardAboutError, setHeardAboutError] = useState(false);
  const [heardAboutOtherError, setHeardAboutOtherError] = useState(false);
  const [passengers, setPassengers] = useState(defaults?.passengers ?? "");
  const [planText, setPlanText] = useState("");
  const [planDocument, setPlanDocument] = useState<PlanDocument | null>(null);
  const [documentNote, setDocumentNote] = useState("");
  const [documentError, setDocumentError] = useState("");
  const [reading, setReading] = useState(false);
  const [invalid, setInvalid] = useState<Set<QuoteRequiredField>>(new Set());
  const [points, setPoints] = useState<RoutePoint[]>(() =>
    defaultRoutePoints({
      pickup: defaults?.pickup,
      dropoff: defaults?.dropoff,
      departureDate: initialDeparture.date,
      departureTime: initialDeparture.time,
      returnDate: initialReturn.date,
      returnTime: initialReturn.time,
    }).map((point, index) =>
      index === 0
        ? { ...point, placeId: defaults?.pickupPlace ?? point.placeId }
        : index === 1
          ? { ...point, placeId: defaults?.dropoffPlace ?? point.placeId }
          : point,
    ),
  );
  const [otherWaitingMinutes, setOtherWaitingMinutes] = useState(0);
  const [stopsFromPlan, setStopsFromPlan] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState<QuoteOrderInput | null>(null);
  const [routePreview, setRoutePreview] = useState<TripRoute | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  const mapped = useMemo(() => routePointsToQuote(points), [points]);
  const waitingMinutes = mapped.waitingMinutes + otherWaitingMinutes;

  const uncertainties = useMemo(() => {
    const items: string[] = [];
    if (!name.trim()) items.push(dictionary.quote.name);
    if (!email.trim()) items.push(dictionary.quote.email);
    if (!passengers.trim()) items.push(dictionary.quote.passengers);
    if (!mapped.pickup) items.push(dictionary.quote.routeStart);
    if (!mapped.dropoff) items.push(dictionary.quote.routeEnd);
    if (!mapped.departure) items.push(dictionary.quote.departure);
    if (!stopsFromPlan && points.length <= 2 && waitingMinutes === 0) {
      items.push(dictionary.quote.stopsTitle);
    }
    return items;
  }, [name, email, passengers, mapped, trip, stopsFromPlan, points.length, waitingMinutes, dictionary.quote]);

  function clearInvalid(field: QuoteRequiredField) {
    setInvalid((current) => {
      if (!current.has(field)) return current;
      const next = new Set(current);
      next.delete(field);
      return next;
    });
  }

  function updatePoint(id: string, patch: Partial<RoutePoint>) {
    setPoints((current) => current.map((point) => (point.id === id ? { ...point, ...patch } : point)));
    setRoutePreview(null);
  }

  function buildInput(): QuoteOrderInput {
    return {
      trip,
      name,
      email,
      phone,
      heardAbout: isQuoteHeardAboutSource(heardAbout) ? heardAbout : undefined,
      heardAboutDetail:
        heardAbout === "other" && heardAboutDetail.trim().length >= 2
          ? heardAboutDetail.trim()
          : undefined,
      pickup: mapped.pickup,
      dropoff: mapped.dropoff,
      departure: mapped.departure,
      returnAt: mapped.returnAt,
      passengers,
      stops: encodeStops(mapped.stops),
      otherWaitingMinutes: otherWaitingMinutes > 0 ? String(otherWaitingMinutes) : "",
      waitingMinutes: waitingMinutes > 0 ? String(waitingMinutes) : "",
      planDocument: planDocument?.name,
    };
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reading) return;

    const input = buildInput();
    const errors = quoteFieldErrors(input);
    const missingHeardAbout = !isQuoteHeardAboutSource(heardAbout);
    const missingOtherDetail =
      heardAbout === "other" && heardAboutDetail.trim().length < 2;
    setHeardAboutError(missingHeardAbout);
    setHeardAboutOtherError(missingOtherDetail);
    if (errors.length > 0 || missingHeardAbout || missingOtherDetail) {
      setInvalid(new Set(errors));
      return;
    }

    setSummaryDraft(input);
    setSummaryOpen(true);
  }

  function confirmSummary() {
    if (!summaryDraft) return;
    const waiting = totalWaitingMinutes(mapped.stops, otherWaitingMinutes);
    const input: QuoteOrderInput = {
      ...summaryDraft,
      stops: encodeStops(mapped.stops),
      otherWaitingMinutes: otherWaitingMinutes > 0 ? String(otherWaitingMinutes) : "",
      waitingMinutes: waiting > 0 ? String(waiting) : "",
    };
    if (planDocument) input.planDocument = planDocument.name;
    if (planText.trim()) input.planDocument = input.planDocument || "travel-plan.txt";

    const params = new URLSearchParams({ trip });
    for (const [key, value] of Object.entries(input)) {
      if (key !== "trip" && value) params.set(key, value);
    }
    if (mapped.pickupPlace) params.set("pickupPlace", mapped.pickupPlace);
    if (mapped.dropoffPlace) params.set("dropoffPlace", mapped.dropoffPlace);
    if (planText.trim()) params.set("travelPlan", planText.trim().slice(0, 2000));
    setSummaryOpen(false);
    router.push(`/order-received?${params.toString()}`);
  }

  async function readDocument(file: File) {
    setReading(true);
    setDocumentError("");
    setDocumentNote("");

    try {
      const result = await parsePlanDocument(file, dictionary.locale);
      const { populated, nextPoints } = applyExtracted(result.fields);
      if (result.text && !planText.trim()) setPlanText(result.text.slice(0, 4000));
      const summary = result.summary?.trim();
      setDocumentNote(
        summary ||
          (populated
            ? dictionary.pricing.aiFilled(file.name)
            : dictionary.quote.documentIncomplete),
      );
      void refreshRoute(nextPoints);
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

  async function createRouteFromPlan() {
    const text = planText.trim();
    if (!text && !planDocument) {
      setDocumentError(dictionary.quote.planTextPlaceholder);
      return;
    }
    const file = new File([text || " "], planDocument?.name || "travel-plan.txt", {
      type: "text/plain",
    });
    if (text) {
      setReading(true);
      setDocumentError("");
      try {
        const result = await parsePlanDocument(file, dictionary.locale);
        const { nextPoints } = applyExtracted(result.fields);
        setDocumentNote(result.summary?.trim() || dictionary.pricing.aiDemoNote);
        await refreshRoute(nextPoints);
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : dictionary.pricing.documentReadError;
        setDocumentError(message);
      } finally {
        setReading(false);
      }
      return;
    }
    if (planDocument) {
      // Document already attached; re-read is not available without the File — ask user to re-upload or use text.
      setDocumentNote(dictionary.pricing.aiDemoNote);
      await refreshRoute();
    }
  }

  function applyExtracted(fields: ExtractedPlanFields) {
    const filled = new Set<QuoteRequiredField>();
    const departure = splitDateTime(fields.departure || fields.pickupDate);
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
    if (fields.passengers) {
      setPassengers(String(fields.passengers));
      filled.add("passengers");
    }
    if (fields.travelPlan) setPlanText((current) => current || fields.travelPlan || "");

    const nextPoints: RoutePoint[] = defaultRoutePoints({
      pickup: fields.pickup,
      dropoff: fields.dropoff,
      departureDate: departure.date,
      departureTime: departure.time,
      returnDate: returning.date || departure.date,
      returnTime: returning.time,
    });

    if (fields.pickup) filled.add("pickup");
    if (fields.dropoff) filled.add("dropoff");
    if (departure.date) filled.add("departure");
    if (returning.date) filled.add("return");

    if (fields.stops?.length) {
      const middle = fields.stops.map((stop) => ({
        id: crypto.randomUUID(),
        place: stop.name,
        placeId: "",
        date: departure.date,
        time: "",
        waitMinutes: stop.waitMinutes ?? 15,
      }));
      nextPoints.splice(1, 0, ...middle);
      setStopsFromPlan(true);
    }

    setPoints(nextPoints);

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

    return {
      populated: filled.size > 0 || Boolean(fields.stops?.length),
      nextPoints,
    };
  }

  async function refreshRoute(sourcePoints: RoutePoint[] = points) {
    const from = sourcePoints[0];
    const to = sourcePoints[sourcePoints.length - 1];
    if (!from?.place.trim() || !to?.place.trim()) {
      setRouteError(dictionary.quote.routeNeedsPlaces);
      setRoutePreview(null);
      return;
    }

    setRouteLoading(true);
    setRouteError("");
    try {
      const response = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: from.place,
          fromPlace: from.placeId,
          to: to.place,
          toPlace: to.placeId,
          locale: dictionary.locale,
        }),
      });
      const data = (await response.json()) as { route?: TripRoute | null; message?: string };
      if (!response.ok) {
        setRouteError(data.message || dictionary.quote.routeNeedsPlaces);
        setRoutePreview(null);
        return;
      }
      setRoutePreview(data.route ?? null);
    } catch {
      setRouteError(dictionary.quote.routeNeedsPlaces);
      setRoutePreview(null);
    } finally {
      setRouteLoading(false);
    }
  }

  return (
    <form
      id={formId}
      noValidate
      onSubmit={onSubmit}
      className="rounded-2xl border border-white/20 bg-white/5 p-4 shadow-[0_30px_80px_-36px_rgba(0,0,0,0.85)] backdrop-blur-md sm:p-5"
    >
      <QuoteSection
        index={1}
        title={dictionary.quote.sectionContact}
        hint={dictionary.quote.sectionContactHint}
        icon={<PersonIcon />}
      >
        <div className="grid grid-cols-2 gap-3">
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
        <fieldset className="mt-4 grid gap-2">
          <legend className="text-sm font-medium text-ivory/85">{dictionary.quote.heardAboutLabel}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {quoteHeardAboutSources.map((source) => (
              <label
                key={source}
                className="flex cursor-pointer items-center gap-3 text-sm text-ivory/90"
              >
                <input
                  type="radio"
                  name="heardAbout"
                  value={source}
                  checked={heardAbout === source}
                  aria-invalid={heardAboutError || undefined}
                  onChange={() => {
                    setHeardAbout(source);
                    setHeardAboutError(false);
                    setHeardAboutOtherError(false);
                  }}
                  className="h-4 w-4 border-white/30 bg-transparent text-burgundy focus:ring-burgundy/40"
                />
                {dictionary.quote.heardAboutOptions[source]}
              </label>
            ))}
          </div>
          {heardAbout === "other" ? (
            <input
              value={heardAboutDetail}
              placeholder={dictionary.quote.heardAboutOtherPlaceholder}
              aria-label={dictionary.quote.heardAboutOptions.other}
              aria-invalid={heardAboutOtherError || undefined}
              onChange={(event) => {
                setHeardAboutDetail(event.target.value);
                setHeardAboutOtherError(false);
              }}
              className={controlClass(heardAboutOtherError)}
            />
          ) : null}
          {heardAboutError || heardAboutOtherError ? (
            <p role="alert" className="text-xs text-red-300">
              {heardAboutOtherError
                ? dictionary.quote.heardAboutOtherError
                : dictionary.quote.heardAboutError}
            </p>
          ) : null}
        </fieldset>
      </QuoteSection>

      <QuoteSection
        index={2}
        title={dictionary.quote.sectionPlan}
        hint={dictionary.quote.sectionPlanHint}
        icon={<DocIcon />}
      >
        <textarea
          name="travelPlan"
          value={planText}
          onChange={(event) => setPlanText(event.target.value)}
          placeholder={dictionary.quote.planTextPlaceholder}
          rows={4}
          className="w-full resize-y rounded-md border border-black/5 bg-white px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-burgundy/30"
        />
        <div className="mt-3">
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
        </div>
      </QuoteSection>

      <QuoteSection
        index={3}
        title={dictionary.quote.sectionRoute}
        hint={dictionary.quote.sectionRouteHint}
        icon={<RouteIcon />}
      >
        <div className="mb-3 flex flex-wrap items-center gap-1">
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

        <div className="grid gap-3">
          {points.map((point, index) => {
            const label =
              index === 0
                ? dictionary.quote.routeStart
                : index === points.length - 1
                  ? dictionary.quote.routeEnd
                  : `${dictionary.quote.routePoint} ${index}`;
            return (
              <div
                key={point.id}
                className="rounded-xl border border-white/10 bg-black/20 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs text-ivory/60">{label}</p>
                  {points.length > 2 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setRoutePreview(null);
                        setPoints((current) => removeRoutePoint(current, point.id));
                      }}
                      className="text-xs text-ivory/55 hover:text-white"
                    >
                      {dictionary.quote.removeRoutePoint}
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1.2fr)_5.5rem]">
                  <PlaceField
                    key={`${point.id}-${point.place}`}
                    name={`point-${point.id}`}
                    label={label}
                    placeholder={label}
                    inputClassName={controlClass(
                      (index === 0 && invalid.has("pickup")) ||
                        (index === points.length - 1 && invalid.has("dropoff")),
                    )}
                    defaultText={point.place}
                    defaultPlaceId={point.placeId}
                    invalid={
                      (index === 0 && invalid.has("pickup")) ||
                      (index === points.length - 1 && invalid.has("dropoff"))
                    }
                    onPlaceChange={(place, placeId) => {
                      updatePoint(point.id, { place, placeId });
                      if (index === 0) clearInvalid("pickup");
                      if (index === points.length - 1) clearInvalid("dropoff");
                    }}
                  />
                  <Field
                    label={
                      index === 0
                        ? dictionary.quote.departureAt
                        : index === points.length - 1
                          ? dictionary.quote.returnAt
                          : dictionary.quote.departureTime
                    }
                    invalid={
                      (index === 0 && invalid.has("departure")) ||
                      (index === points.length - 1 && invalid.has("return"))
                    }
                  >
                    <DateTimeInput
                      value={toDatetimeLocalInput(point.date, point.time)}
                      invalid={
                        (index === 0 && invalid.has("departure")) ||
                        (index === points.length - 1 && invalid.has("return"))
                      }
                      onChange={(value) => {
                        const next = fromDatetimeLocalInput(value);
                        updatePoint(point.id, { date: next.date, time: next.time });
                        if (index === 0) clearInvalid("departure");
                        if (index === points.length - 1) clearInvalid("return");
                      }}
                    />
                  </Field>
                  <Field label={dictionary.quote.pauseAtPoint}>
                    <input
                      type="number"
                      min={0}
                      max={24 * 60}
                      step={5}
                      value={point.waitMinutes}
                      disabled={index === 0}
                      onChange={(event) =>
                        updatePoint(point.id, { waitMinutes: Number(event.target.value) || 0 })
                      }
                      className={controlClass(false)}
                    />
                  </Field>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            setRoutePreview(null);
            setPoints((current) => insertRoutePoint(current, Math.max(1, current.length - 1)));
          }}
          className="mt-3 rounded-full border border-white/25 px-3 py-1.5 text-xs text-ivory hover:border-white/55"
        >
          {dictionary.quote.addRoutePoint}
        </button>
      </QuoteSection>

      <QuoteSection
        index={4}
        title={dictionary.quote.sectionCheck}
        hint={dictionary.quote.sectionCheckHint}
        icon={<CalcIcon />}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void refreshRoute()}
            disabled={routeLoading}
            className="rounded-full border border-white/30 px-3 py-1.5 text-xs text-ivory hover:border-white/60 disabled:opacity-60"
          >
            {routeLoading ? dictionary.quote.checkingRoute : dictionary.quote.checkRoute}
          </button>
        </div>

        <dl className="mt-3 grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[11px] text-ivory/50">{dictionary.quote.distance}</dt>
            <dd className="mt-1 text-ivory">
              {routePreview
                ? formatDistance(routePreview, dictionary.locale) || "—"
                : "—"}
              {routePreview?.estimated ? (
                <span className="mt-1 block text-[11px] text-ivory/45">{dictionary.quote.estimatedRoute}</span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-ivory/50">{dictionary.quote.drivingTime}</dt>
            <dd className="mt-1 text-ivory">
              {routePreview ? formatDuration(routePreview.durationMinutes) || "—" : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-ivory/50">{dictionary.quote.waitingFromRoute}</dt>
            <dd className="mt-1 text-ivory">
              {waitingMinutes} {dictionary.quote.minutesShort}
            </dd>
          </div>
        </dl>

        {routeError ? <p className="mt-2 text-xs text-red-300">{routeError}</p> : null}

        {uncertainties.length > 0 ? (
          <div className="mt-3 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-50">
            <p className="font-medium">{dictionary.quote.routeUnclear}</p>
            <p className="mt-1 text-amber-50/80">{uncertainties.join(" · ")}</p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-pine">{dictionary.pricing.ready}</p>
        )}
      </QuoteSection>

      <QuoteSection
        index={5}
        title={dictionary.quote.sectionSubmit}
        hint={dictionary.quote.sectionSubmitHint}
        icon={<SendIcon />}
      >
        {invalid.size > 0 ? (
          <p role="alert" className="mb-3 text-xs text-red-300">
            {dictionary.quote.missingFields}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={reading}
            onClick={() => void createRouteFromPlan()}
            className="h-10 rounded-md border border-white/30 px-3 text-sm font-medium text-ivory hover:border-white/60 hover:bg-white/5 disabled:opacity-60"
          >
            {dictionary.quote.buildRoute}
          </button>
          <button
            type="submit"
            disabled={reading}
            className="h-10 rounded-md bg-burgundy px-3 text-sm font-medium text-white hover:bg-burgundy-deep disabled:opacity-60"
          >
            {dictionary.quote.search}
          </button>
        </div>
      </QuoteSection>

      {summaryDraft ? (
        <QuoteSummaryDialog
          open={summaryOpen}
          draft={summaryDraft}
          tripLabel={tripLabels[trip]}
          stops={mapped.stops}
          otherWaitingMinutes={otherWaitingMinutes}
          stopsMissingFromPlan={!stopsFromPlan && mapped.stops.length === 0}
          onStopsChange={(stops) => {
            // Keep middle points aligned with summary edits: rebuild from ends + stops.
            setPoints((current) => {
              const first = current[0] ?? defaultRoutePoints()[0];
              const last = current[current.length - 1] ?? defaultRoutePoints()[1];
              return [
                first,
                ...stops.map((stop) => ({
                  id: stop.id,
                  place: stop.name,
                  placeId: "",
                  date: first.date,
                  time: "",
                  waitMinutes: stop.waitMinutes,
                })),
                { ...last, waitMinutes: last.waitMinutes },
              ];
            });
          }}
          onClose={() => setSummaryOpen(false)}
          onConfirm={confirmSummary}
        />
      ) : null}
    </form>
  );
}

function QuoteSection({
  index,
  title,
  hint,
  icon,
  children,
}: {
  index: number;
  title: string;
  hint: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={`${index === 1 ? "" : "mt-5 border-t border-white/10 pt-5"}`}>
      <div className="mb-3 flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-ivory/80">
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-ivory">
            <span className="text-ivory/45">{index}. </span>
            {title}
          </h3>
          <p className="mt-0.5 text-[11px] leading-5 text-ivory/55">{hint}</p>
        </div>
      </div>
      {children}
    </section>
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

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19c1.6-3.2 4-4.8 6.5-4.8S17 15.8 18.5 19" strokeLinecap="round" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4M9 12h6M9 16h6" strokeLinecap="round" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="12" r="2" />
      <circle cx="8" cy="18" r="2" />
      <path d="M8 6h6a3 3 0 0 1 0 6h-2a3 3 0 0 0 0 6H10" strokeLinecap="round" />
    </svg>
  );
}

function CalcIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 8h8M8 12h2M12 12h2M16 12h1M8 16h2M12 16h2M16 16h1" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 11.5 20 4l-6.5 16-2.2-6.3L4 11.5Z" strokeLinejoin="round" />
    </svg>
  );
}
