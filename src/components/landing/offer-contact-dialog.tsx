"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";

export type OfferContactValues = {
  name: string;
  email: string;
  phone: string;
};

type OfferContactDialogProps = {
  open: boolean;
  initial: OfferContactValues;
  phase: "contact" | "sent";
  onClose: () => void;
  onSubmit: (values: OfferContactValues) => void;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OfferContactDialog({
  open,
  initial,
  phase,
  onClose,
  onSubmit,
}: OfferContactDialogProps) {
  const dictionary = useDictionary();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [invalid, setInvalid] = useState<Set<"email" | "phone" | "contact">>(new Set());

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setName(initial.name);
    setEmail(initial.email);
    setPhone(initial.phone);
    setInvalid(new Set());
  }, [open, initial.name, initial.email, initial.phone]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    const nextEmail = email.trim();
    const nextPhone = phone.trim();
    const errors = new Set<"email" | "phone" | "contact">();

    if (nextEmail && !emailPattern.test(nextEmail)) errors.add("email");
    if (!nextEmail && !nextPhone) errors.add("contact");
    if (errors.size > 0) {
      setInvalid(errors);
      return;
    }

    onSubmit({ name: nextName, email: nextEmail, phone: nextPhone });
  }

  const inputClass = (bad: boolean) =>
    `h-11 w-full rounded-lg border bg-white px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 ${
      bad ? "border-red-600" : "border-transparent"
    }`;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="popup-enter m-auto w-[min(26rem,calc(100vw-1.5rem))] rounded-2xl border border-white/10 bg-card p-0 text-ivory shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9)] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="font-serif text-2xl tracking-wide">
            {phase === "sent"
              ? dictionary.hero.requestSentTitle
              : dictionary.hero.contactDialogTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={dictionary.hero.contactClose}
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
          <form noValidate onSubmit={handleSubmit} className="mt-4 grid gap-3">
            <p className="text-sm leading-6 text-ivory/70">{dictionary.hero.contactDialogBody}</p>

            <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory/80">
              {dictionary.hero.name}
              <input
                value={name}
                autoComplete="name"
                onChange={(event) => setName(event.target.value)}
                className={inputClass(false)}
              />
            </label>

            <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory/80">
              {dictionary.hero.email}
              <input
                type="email"
                value={email}
                autoComplete="email"
                aria-invalid={invalid.has("email") || invalid.has("contact") || undefined}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setInvalid((current) => {
                    const next = new Set(current);
                    next.delete("email");
                    next.delete("contact");
                    return next;
                  });
                }}
                className={inputClass(invalid.has("email") || invalid.has("contact"))}
              />
            </label>

            <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory/80">
              {dictionary.hero.phone}
              <input
                type="tel"
                value={phone}
                autoComplete="tel"
                aria-invalid={invalid.has("contact") || undefined}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setInvalid((current) => {
                    const next = new Set(current);
                    next.delete("contact");
                    return next;
                  });
                }}
                className={inputClass(invalid.has("contact"))}
              />
            </label>

            {invalid.size > 0 ? (
              <p role="alert" className="text-xs text-red-300">
                {invalid.has("email")
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
