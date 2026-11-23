"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import { formatWaterPrice } from "@/lib/content/format-price";
import { ORDER_REQUEST_NOTES_MAX_LENGTH } from "@/lib/orders/session-orders";
import {
  isValidContactEmail,
  isValidContactName,
  isValidContactPhone,
  sanitizeContactName,
  sanitizeContactPhone,
} from "@/lib/contact/validation";
import {
  isQuoteHeardAboutSource,
  quoteHeardAboutSources,
  type QuoteHeardAboutSource,
} from "@/lib/quote-heard-about";

export type OfferContactSubmit = {
  name: string;
  company: string;
  email: string;
  phone: string;
  heardAbout?: QuoteHeardAboutSource;
  heardAboutDetail?: string;
  waterRequested: boolean;
  requestNotes?: string;
};

type OfferRequestDialogProps = {
  passengerCount: number;
  open: boolean;
  phase: "contact" | "sent";
  onClose: () => void;
  onContactSubmit: (contact: OfferContactSubmit) => void | Promise<void>;
  submittingLabel?: string;
};

type ContactFieldError =
  | "name"
  | "email"
  | "phone"
  | "contact"
  | "heardAboutOther";

export function OfferRequestDialog({
  passengerCount,
  open,
  phase,
  onClose,
  onContactSubmit,
  submittingLabel,
}: OfferRequestDialogProps) {
  const dictionary = useDictionary();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [heardAbout, setHeardAbout] = useState<QuoteHeardAboutSource | "">("");
  const [heardAboutDetail, setHeardAboutDetail] = useState("");
  const [waterRequested, setWaterRequested] = useState(false);
  const [requestNotes, setRequestNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [contactInvalid, setContactInvalid] = useState<Set<ContactFieldError>>(new Set());

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setContactInvalid(new Set());
    setSubmitError("");
    setSubmitting(false);
    if (phase === "contact") {
      setName("");
      setCompany("");
      setEmail("");
      setPhone("");
      setHeardAbout("");
      setHeardAboutDetail("");
      setWaterRequested(false);
      setRequestNotes("");
    }
  }, [open, phase]);

  function clearContactError(...keys: ContactFieldError[]) {
    setContactInvalid((current) => {
      if (keys.every((key) => !current.has(key))) return current;
      const next = new Set(current);
      for (const key of keys) next.delete(key);
      return next;
    });
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const nextName = sanitizeContactName(name).trim();
    const nextCompany = company.trim();
    const nextEmail = email.trim();
    const nextPhone = sanitizeContactPhone(phone).trim();
    const nextDetail = heardAboutDetail.trim();
    const errors = new Set<ContactFieldError>();

    if (nextName && !isValidContactName(nextName)) errors.add("name");
    if (nextEmail && !isValidContactEmail(nextEmail)) errors.add("email");
    if (nextPhone && !isValidContactPhone(nextPhone, { required: true })) errors.add("phone");
    if (!nextEmail && !nextPhone) errors.add("contact");
    if (heardAbout === "other" && nextDetail.length < 2) errors.add("heardAboutOther");
    if (errors.size > 0) {
      setContactInvalid(errors);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await onContactSubmit({
        name: nextName,
        company: nextCompany,
        email: nextEmail,
        phone: nextPhone,
        heardAbout: isQuoteHeardAboutSource(heardAbout) ? heardAbout : undefined,
        heardAboutDetail:
          heardAbout === "other" && nextDetail.length >= 2 ? nextDetail : undefined,
        waterRequested,
        requestNotes: requestNotes.trim() || undefined,
      });
    } catch (caught) {
      setSubmitError(
        caught instanceof Error && caught.message
          ? caught.message
          : dictionary.hero.contactSubmitError,
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = (bad = false) =>
    `h-10 w-full rounded-full border bg-white/95 px-3.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 ${
      bad ? "field-error-blink" : "border-transparent"
    }`;

  const title =
    phase === "sent" ? dictionary.hero.requestSentTitle : dictionary.hero.contactDialogTitle;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="request-form popup-enter m-auto w-[min(32rem,calc(100vw-1.5rem))] overflow-visible border border-white/10 bg-card p-0 text-ivory shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9)] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
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
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-burgundy px-4 text-sm font-semibold text-white hover:bg-burgundy-deep"
            >
              {dictionary.hero.contactClose}
            </button>
          </div>
        ) : (
          <form noValidate onSubmit={handleContactSubmit} className="mt-4 grid gap-3">
            <p className="text-sm leading-6 text-ivory/70">{dictionary.hero.contactDialogBody}</p>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block min-w-0">
                <span className="sr-only">{dictionary.hero.name}</span>
                <input
                  value={name}
                  autoComplete="name"
                  placeholder={dictionary.hero.name}
                  aria-invalid={contactInvalid.has("name") || undefined}
                  onChange={(event) => {
                    setName(sanitizeContactName(event.target.value));
                    clearContactError("name");
                  }}
                  className={inputClass(contactInvalid.has("name"))}
                />
              </label>
              <label className="block min-w-0">
                <span className="sr-only">{dictionary.hero.companyName}</span>
                <input
                  value={company}
                  autoComplete="organization"
                  placeholder={dictionary.hero.companyName}
                  onChange={(event) => setCompany(event.target.value)}
                  className={inputClass()}
                />
              </label>
              <label className="block min-w-0">
                <span className="sr-only">{dictionary.hero.phone}</span>
                <input
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  autoComplete="tel"
                  placeholder={dictionary.contact.phonePlaceholder}
                  aria-invalid={
                    contactInvalid.has("phone") || contactInvalid.has("contact") || undefined
                  }
                  onChange={(event) => {
                    setPhone(sanitizeContactPhone(event.target.value));
                    clearContactError("phone", "contact");
                  }}
                  className={inputClass(
                    contactInvalid.has("phone") || contactInvalid.has("contact"),
                  )}
                />
              </label>
              <label className="block min-w-0">
                <span className="sr-only">{dictionary.hero.email}</span>
                <input
                  type="email"
                  value={email}
                  autoComplete="email"
                  placeholder={dictionary.hero.email}
                  aria-invalid={
                    contactInvalid.has("email") || contactInvalid.has("contact") || undefined
                  }
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearContactError("email", "contact");
                  }}
                  className={inputClass(
                    contactInvalid.has("email") || contactInvalid.has("contact"),
                  )}
                />
              </label>
            </div>

            <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory/80">
              {dictionary.hero.heardAboutLabel}
              <select
                name="heardAbout"
                value={heardAbout}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setHeardAbout(isQuoteHeardAboutSource(value) ? value : "");
                  if (value !== "other") setHeardAboutDetail("");
                  clearContactError("heardAboutOther");
                }}
                className={inputClass()}
              >
                <option value="">{dictionary.hero.heardAboutPlaceholder}</option>
                {quoteHeardAboutSources.map((source) => (
                  <option key={source} value={source}>{dictionary.hero.heardAboutOptions[source]}</option>
                ))}
              </select>
            </label>
            {heardAbout === "other" && (
              <input
                value={heardAboutDetail}
                placeholder={dictionary.hero.heardAboutOtherPlaceholder}
                aria-label={dictionary.hero.heardAboutOptions.other}
                aria-invalid={contactInvalid.has("heardAboutOther") || undefined}
                onChange={(event) => {
                  setHeardAboutDetail(event.target.value);
                  clearContactError("heardAboutOther");
                }}
                className={inputClass(contactInvalid.has("heardAboutOther"))}
              />
            )}

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ivory">
              <input
                type="checkbox"
                checked={waterRequested}
                onChange={(event) => setWaterRequested(event.currentTarget.checked)}
                className="size-4 shrink-0 accent-burgundy"
              />
              {dictionary.hero.requestWater}
            </label>
            {waterRequested && (
              <p role="status" className="text-sm font-medium text-ivory">
                {dictionary.hero.waterPriceLabel}: {formatWaterPrice(passengerCount, dictionary.locale)}
              </p>
            )}

            <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory/80">
              {dictionary.hero.requestNotes}
              <textarea
                value={requestNotes}
                onChange={(event) => setRequestNotes(event.currentTarget.value)}
                rows={3}
                maxLength={ORDER_REQUEST_NOTES_MAX_LENGTH}
                className="w-full resize-y rounded-xl border border-transparent bg-white/95 px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-burgundy/30"
              />
            </label>

            {contactInvalid.size > 0 ? (
              <p role="alert" className="text-xs text-red-300">
                {contactInvalid.has("heardAboutOther")
                  ? dictionary.hero.heardAboutOtherError
                  : contactInvalid.has("name")
                    ? dictionary.contact.nameError
                    : contactInvalid.has("phone")
                      ? dictionary.contact.phoneError
                      : contactInvalid.has("email")
                        ? dictionary.contact.emailError
                        : dictionary.hero.contactEmailOrPhone}
              </p>
            ) : null}
            {submitError ? (
              <p role="alert" className="text-xs text-red-300">
                {submitError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="order-button mt-1 w-full"
            >
              {submitting
                ? submittingLabel || dictionary.hero.contactSubmitting
                : dictionary.hero.contactSubmit}
            </button>
          </form>
        )}
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
