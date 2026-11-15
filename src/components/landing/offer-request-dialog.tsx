"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import { DateTimeField } from "@/components/landing/datetime-field";
import { parsePlanDocument } from "@/lib/plan-document/client";
import type { ExtractedPlanFields } from "@/lib/plan-document/types";
import {
  splitDateTime,
  toDatetimeLocalInput,
} from "@/lib/orders/route-points";
import type { QuoteTripMode } from "@/lib/orders/session-orders";
import type { QuoteTripKind } from "@/lib/quote-trips";

export type OfferTripDraft = {
  passengers: string;
  pickup: string;
  dropoff: string;
  tripMode: QuoteTripMode;
  departureAt: string;
  returnAt: string;
  comments: string;
  planDocumentName: string | null;
  planNote: string;
  trip?: QuoteTripKind;
};

type OfferRequestDialogProps = {
  open: boolean;
  phase: "options" | "contact" | "sent";
  draft: OfferTripDraft;
  onDraftChange: (patch: Partial<OfferTripDraft>) => void;
  onClose: () => void;
  onContinue: () => void;
  onContactSubmit: (contact: { name: string; email: string; phone: string }) => void;
};

const maxDocumentBytes = 4 * 1024 * 1024;
const documentTypes = [".pdf", ".doc", ".docx", ".txt"];
const BUS_MAX_PASSENGERS = 49;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OfferRequestDialog({
  open,
  phase,
  draft,
  onDraftChange,
  onClose,
  onContinue,
  onContactSubmit,
}: OfferRequestDialogProps) {
  const dictionary = useDictionary();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const planInputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const [fillOpen, setFillOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [readingPlan, setReadingPlan] = useState(false);
  const [planError, setPlanError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactInvalid, setContactInvalid] = useState<Set<"email" | "phone" | "contact">>(
    new Set(),
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setPlanError("");
    setContactInvalid(new Set());
    if (phase === "options") {
      setFillOpen(Boolean(draft.planDocumentName || draft.pickup || draft.passengers));
      setCommentsOpen(Boolean(draft.comments.trim()));
    }
  }, [open, phase]);

  function applyExtracted(fields: ExtractedPlanFields) {
    const departure = splitDateTime(fields.departure || fields.pickupDate);
    const returning = splitDateTime(fields.returnAt);
    const patch: Partial<OfferTripDraft> = {};

    if (fields.trip) patch.trip = fields.trip;
    if (fields.passengers) {
      patch.passengers = String(
        Math.min(BUS_MAX_PASSENGERS, Math.max(1, Math.round(fields.passengers))),
      );
    }
    if (fields.pickup) patch.pickup = fields.pickup;
    if (fields.dropoff) patch.dropoff = fields.dropoff;
    if (departure.date) {
      patch.departureAt = toDatetimeLocalInput(departure.date, departure.time);
    }
    if (returning.date) {
      patch.tripMode = "roundTrip";
      patch.returnAt = toDatetimeLocalInput(returning.date, returning.time);
    } else if (fields.trip === "Transfer" || (!returning.date && departure.date)) {
      patch.tripMode = "oneWay";
      patch.returnAt = "";
    }
    if (fields.name) setName(fields.name);
    if (fields.email) setEmail(fields.email);
    if (fields.phone) setPhone(fields.phone);

    onDraftChange(patch);
    setFillOpen(true);
  }

  async function readTravelPlan(file: File) {
    setReadingPlan(true);
    setPlanError("");
    try {
      const result = await parsePlanDocument(file, dictionary.locale);
      applyExtracted(result.fields);
      onDraftChange({
        planDocumentName: file.name,
        planNote:
          result.summary?.trim() ||
          dictionary.pricing.aiFilled(file.name),
      });
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
      onDraftChange({ planDocumentName: null, planNote: "" });
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
    onDraftChange({ planDocumentName: file.name });
    void readTravelPlan(file);
  }

  function clearDocument() {
    onDraftChange({ planDocumentName: null, planNote: "" });
    setPlanError("");
    if (planInputRef.current) planInputRef.current.value = "";
  }

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    const nextEmail = email.trim();
    const nextPhone = phone.trim();
    const errors = new Set<"email" | "phone" | "contact">();
    if (nextEmail && !emailPattern.test(nextEmail)) errors.add("email");
    if (!nextEmail && !nextPhone) errors.add("contact");
    if (errors.size > 0) {
      setContactInvalid(errors);
      return;
    }
    onContactSubmit({ name: nextName, email: nextEmail, phone: nextPhone });
  }

  const needsDestination = draft.tripMode === "oneWay";
  const needsReturn = draft.tripMode === "roundTrip";
  const inputClass = (bad = false) =>
    `h-11 w-full rounded-lg border bg-white px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 ${
      bad ? "border-red-600" : "border-transparent"
    }`;

  const title =
    phase === "sent"
      ? dictionary.hero.requestSentTitle
      : phase === "contact"
        ? dictionary.hero.contactDialogTitle
        : dictionary.hero.offerOptionsTitle;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="popup-enter m-auto w-[min(32rem,calc(100vw-1.5rem))] overflow-visible rounded-2xl border border-white/10 bg-card p-0 text-ivory shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9)] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="font-serif text-2xl tracking-wide">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={dictionary.hero.contactClose}
            className="grid h-8 w-8 place-items-center rounded-full text-ivory/70 hover:bg-white/10 hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        {phase === "sent" ? (
          <div className="mt-4">
            <p className="text-sm leading-6 text-ivory/80">{dictionary.hero.requestSentBody}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-burgundy px-4 text-sm font-semibold text-white hover:bg-burgundy-deep"
            >
              {dictionary.hero.contactClose}
            </button>
          </div>
        ) : null}

        {phase === "contact" ? (
          <form noValidate onSubmit={handleContactSubmit} className="mt-4 grid gap-3">
            <p className="text-sm leading-6 text-ivory/70">{dictionary.hero.contactDialogBody}</p>
            <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory/80">
              {dictionary.hero.name}
              <input
                value={name}
                autoComplete="name"
                onChange={(event) => setName(event.target.value)}
                className={inputClass()}
              />
            </label>
            <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory/80">
              {dictionary.hero.email}
              <input
                type="email"
                value={email}
                autoComplete="email"
                aria-invalid={contactInvalid.has("email") || contactInvalid.has("contact") || undefined}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setContactInvalid((current) => {
                    const next = new Set(current);
                    next.delete("email");
                    next.delete("contact");
                    return next;
                  });
                }}
                className={inputClass(contactInvalid.has("email") || contactInvalid.has("contact"))}
              />
            </label>
            <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory/80">
              {dictionary.hero.phone}
              <input
                type="tel"
                value={phone}
                autoComplete="tel"
                aria-invalid={contactInvalid.has("contact") || undefined}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setContactInvalid((current) => {
                    const next = new Set(current);
                    next.delete("contact");
                    return next;
                  });
                }}
                className={inputClass(contactInvalid.has("contact"))}
              />
            </label>
            {contactInvalid.size > 0 ? (
              <p role="alert" className="text-xs text-red-300">
                {contactInvalid.has("email")
                  ? dictionary.hero.email
                  : dictionary.hero.contactEmailOrPhone}
              </p>
            ) : null}
            <button
              type="submit"
              className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-lg bg-burgundy px-4 text-sm font-semibold text-white hover:bg-burgundy-deep"
            >
              {dictionary.hero.contactSubmit}
            </button>
          </form>
        ) : null}

        {phase === "options" ? (
          <div className="mt-4 grid gap-3">
            <p className="text-sm leading-6 text-ivory/70">{dictionary.hero.offerOptionsBody}</p>

            <section className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-3">
                <p className="min-w-0 flex-1 text-sm font-medium tracking-wide">
                  {dictionary.hero.offerAddDocument}
                </p>
                {draft.planDocumentName ? (
                  <button
                    type="button"
                    aria-label="-"
                    onClick={clearDocument}
                    className="grid h-8 w-8 place-items-center rounded-full border border-white/20 text-lg leading-none text-ivory hover:bg-white/10"
                  >
                    −
                  </button>
                ) : (
                  <label
                    className={`grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-white/20 text-lg leading-none text-ivory hover:bg-white/10 ${
                      readingPlan ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    {readingPlan ? <span className="doc-read-spinner h-3.5 w-3.5" /> : "+"}
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
              </div>
              {draft.planDocumentName ? (
                <p className="mt-2 truncate text-xs text-champagne/90" title={draft.planDocumentName}>
                  {draft.planDocumentName}
                </p>
              ) : (
                <p className="mt-2 text-xs text-ivory/50">{dictionary.hero.offerNoDocumentHint}</p>
              )}
              {planError ? (
                <p className="mt-2 text-xs text-red-300" role="alert">
                  {planError}
                </p>
              ) : null}
            </section>

            <section className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-3">
                <p className="min-w-0 flex-1 text-sm font-medium tracking-wide">
                  {dictionary.hero.offerFillInfo}
                </p>
                <button
                  type="button"
                  aria-expanded={fillOpen}
                  aria-label={fillOpen ? "-" : "+"}
                  onClick={() => setFillOpen((current) => !current)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/20 text-lg leading-none text-ivory hover:bg-white/10"
                >
                  {fillOpen ? "−" : "+"}
                </button>
              </div>

              {fillOpen ? (
                <div className="mt-3 grid gap-3">
                  <div
                    className="grid grid-cols-2 gap-1"
                    role="radiogroup"
                    aria-label={dictionary.hero.tripModeLabel}
                  >
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
                            onDraftChange({
                              tripMode: mode,
                              returnAt: mode === "roundTrip" ? draft.returnAt : "",
                            });
                          }}
                          className={`h-10 rounded-lg px-3 text-xs font-semibold tracking-wide transition ${
                            active
                              ? "bg-burgundy text-white"
                              : "border border-white/15 text-ivory/85 hover:bg-white/8"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory/80">
                    {dictionary.hero.passengerCount}
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={BUS_MAX_PASSENGERS}
                      value={draft.passengers}
                      placeholder={dictionary.hero.passengerSelect}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/[^\d]/g, "");
                        onDraftChange({
                          passengers:
                            digits === ""
                              ? ""
                              : String(Math.min(BUS_MAX_PASSENGERS, Math.max(1, Number(digits)))),
                        });
                      }}
                      className={inputClass()}
                    />
                  </label>
                  <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory/80">
                    {dictionary.hero.route}
                    <input
                      value={draft.pickup}
                      placeholder={dictionary.hero.routePlaceholder}
                      onChange={(event) => onDraftChange({ pickup: event.target.value })}
                      className={inputClass()}
                    />
                  </label>
                  {needsDestination ? (
                    <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory/80">
                      {dictionary.hero.destination}
                      <input
                        value={draft.dropoff}
                        placeholder={dictionary.hero.destinationPlaceholder}
                        onChange={(event) => onDraftChange({ dropoff: event.target.value })}
                        className={inputClass()}
                      />
                    </label>
                  ) : null}
                  <DateTimeField
                    label={dictionary.hero.departureAt}
                    value={draft.departureAt}
                    onChange={(value) => {
                      onDraftChange({
                        departureAt: value,
                        returnAt:
                          draft.returnAt && value && draft.returnAt < value
                            ? value
                            : draft.returnAt,
                      });
                    }}
                  />
                  {needsReturn ? (
                    <DateTimeField
                      label={dictionary.hero.returnAt}
                      value={draft.returnAt}
                      min={draft.departureAt || undefined}
                      onChange={(value) => onDraftChange({ returnAt: value })}
                    />
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-3">
                <p className="min-w-0 flex-1 text-sm font-medium tracking-wide">
                  {dictionary.hero.offerDescribeTrip}
                </p>
                <button
                  type="button"
                  aria-expanded={commentsOpen}
                  aria-label={commentsOpen ? "-" : "+"}
                  onClick={() => setCommentsOpen((current) => !current)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/20 text-lg leading-none text-ivory hover:bg-white/10"
                >
                  {commentsOpen ? "−" : "+"}
                </button>
              </div>
              {commentsOpen ? (
                <textarea
                  value={draft.comments}
                  onChange={(event) => onDraftChange({ comments: event.target.value })}
                  placeholder={dictionary.hero.offerCommentsPlaceholder}
                  rows={4}
                  className="mt-3 w-full resize-y rounded-lg border border-transparent bg-white px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                />
              ) : null}
            </section>

            <button
              type="button"
              onClick={onContinue}
              className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-lg bg-burgundy px-4 text-sm font-semibold text-white hover:bg-burgundy-deep"
            >
              {dictionary.hero.offerContinue}
            </button>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
      <path
        d="M5 5l10 10M15 5 5 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
