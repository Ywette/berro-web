"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
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
  heardAbout: QuoteHeardAboutSource;
  heardAboutDetail?: string;
};

type OfferRequestDialogProps = {
  open: boolean;
  phase: "contact" | "sent";
  onClose: () => void;
  onContactSubmit: (contact: OfferContactSubmit) => void;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OfferRequestDialog({
  open,
  phase,
  onClose,
  onContactSubmit,
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
  const [contactInvalid, setContactInvalid] = useState<
    Set<"email" | "phone" | "contact" | "heardAbout" | "heardAboutOther">
  >(new Set());

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setContactInvalid(new Set());
    if (phase === "contact") {
      setName("");
      setCompany("");
      setEmail("");
      setPhone("");
      setHeardAbout("");
      setHeardAboutDetail("");
    }
  }, [open, phase]);

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    const nextCompany = company.trim();
    const nextEmail = email.trim();
    const nextPhone = phone.trim();
    const nextDetail = heardAboutDetail.trim();
    const errors = new Set<"email" | "phone" | "contact" | "heardAbout" | "heardAboutOther">();
    if (nextEmail && !emailPattern.test(nextEmail)) errors.add("email");
    if (!nextEmail && !nextPhone) errors.add("contact");
    if (!isQuoteHeardAboutSource(heardAbout)) errors.add("heardAbout");
    if (heardAbout === "other" && nextDetail.length < 2) errors.add("heardAboutOther");
    if (errors.size > 0 || !isQuoteHeardAboutSource(heardAbout)) {
      setContactInvalid(errors);
      return;
    }
    onContactSubmit({
      name: nextName,
      company: nextCompany,
      email: nextEmail,
      phone: nextPhone,
      heardAbout,
      heardAboutDetail: heardAbout === "other" ? nextDetail : undefined,
    });
  }

  const inputClass = (bad = false) =>
    `h-11 w-full rounded-lg border bg-white px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 ${
      bad ? "field-error-blink relative z-20" : "border-transparent"
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
        ) : (
          <form noValidate onSubmit={handleContactSubmit} className="mt-4 grid gap-3">
            <p className="text-sm leading-6 text-ivory/70">{dictionary.hero.contactDialogBody}</p>

            <div className="grid gap-3 sm:grid-cols-2">
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
                {dictionary.hero.companyName}
                <input
                  value={company}
                  autoComplete="organization"
                  onChange={(event) => setCompany(event.target.value)}
                  className={inputClass()}
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
              <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory/80">
                {dictionary.hero.email}
                <input
                  type="email"
                  value={email}
                  autoComplete="email"
                  aria-invalid={
                    contactInvalid.has("email") || contactInvalid.has("contact") || undefined
                  }
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setContactInvalid((current) => {
                      const next = new Set(current);
                      next.delete("email");
                      next.delete("contact");
                      return next;
                    });
                  }}
                  className={inputClass(
                    contactInvalid.has("email") || contactInvalid.has("contact"),
                  )}
                />
              </label>
            </div>

            <fieldset className="grid gap-2">
              <legend className="text-[11px] font-medium tracking-wide text-ivory/80">
                {dictionary.hero.heardAboutLabel}
              </legend>
              <div
                className={`grid grid-cols-1 gap-2 rounded-xl sm:grid-cols-2 ${
                  contactInvalid.has("heardAbout") ? "field-error-blink p-1" : ""
                }`}
              >
                {quoteHeardAboutSources.map((source) => (
                  <label
                    key={source}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-ivory/90 hover:bg-white/8"
                  >
                    <input
                      type="radio"
                      name="heardAbout"
                      value={source}
                      checked={heardAbout === source}
                      aria-invalid={contactInvalid.has("heardAbout") || undefined}
                      onChange={() => {
                        setHeardAbout(source);
                        setContactInvalid((current) => {
                          const next = new Set(current);
                          next.delete("heardAbout");
                          next.delete("heardAboutOther");
                          return next;
                        });
                      }}
                      className="h-4 w-4 border-white/30 bg-transparent text-burgundy focus:ring-burgundy/40"
                    />
                    <span className="leading-snug">{dictionary.hero.heardAboutOptions[source]}</span>
                  </label>
                ))}
              </div>
              {heardAbout === "other" ? (
                <input
                  value={heardAboutDetail}
                  placeholder={dictionary.hero.heardAboutOtherPlaceholder}
                  aria-label={dictionary.hero.heardAboutOptions.other}
                  aria-invalid={contactInvalid.has("heardAboutOther") || undefined}
                  onChange={(event) => {
                    setHeardAboutDetail(event.target.value);
                    setContactInvalid((current) => {
                      const next = new Set(current);
                      next.delete("heardAboutOther");
                      return next;
                    });
                  }}
                  className={inputClass(contactInvalid.has("heardAboutOther"))}
                />
              ) : null}
            </fieldset>

            {contactInvalid.size > 0 ? (
              <p role="alert" className="text-xs text-red-300">
                {contactInvalid.has("heardAboutOther")
                  ? dictionary.hero.heardAboutOtherError
                  : contactInvalid.has("heardAbout")
                    ? dictionary.hero.heardAboutError
                    : contactInvalid.has("email")
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
