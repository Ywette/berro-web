"use client";

import { useActionState, useState, type FormEvent } from "react";
import { sendContactMessage, type ContactState } from "@/actions/contact";
import { useDictionary } from "@/components/i18n/locale-provider";
import {
  isValidContactEmail,
  isValidContactName,
  isValidContactPhone,
  sanitizeContactName,
  sanitizeContactPhone,
} from "@/lib/contact/validation";

const initialState: ContactState = {};

const fieldClass =
  "h-11 w-full rounded-full border border-black/5 bg-white px-3.5 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-burgundy/30";

const areaClass =
  "w-full rounded-3xl border border-black/5 bg-white px-3.5 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-burgundy/30";

const MESSAGE_MAX_LENGTH = 2000;
const MESSAGE_MIN_LENGTH = 10;

type FieldKey = "name" | "email" | "phone" | "message";

function fieldClassFor(invalid: boolean) {
  return `${fieldClass} ${invalid ? "field-error-blink border-transparent" : ""}`;
}

export function ContactForm({ defaultMessage = "" }: { defaultMessage?: string }) {
  const dictionary = useDictionary();
  const [state, action, pending] = useActionState(sendContactMessage, initialState);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(defaultMessage);
  const [invalid, setInvalid] = useState<Set<FieldKey>>(new Set());

  function clearError(...keys: FieldKey[]) {
    setInvalid((current) => {
      if (keys.every((key) => !current.has(key))) return current;
      const next = new Set(current);
      for (const key of keys) next.delete(key);
      return next;
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const nextInvalid = new Set<FieldKey>();
    if (!isValidContactName(name)) nextInvalid.add("name");
    if (!isValidContactEmail(email)) nextInvalid.add("email");
    if (!isValidContactPhone(phone)) nextInvalid.add("phone");
    if (
      message.trim().length < MESSAGE_MIN_LENGTH ||
      message.length > MESSAGE_MAX_LENGTH
    ) {
      nextInvalid.add("message");
    }
    if (nextInvalid.size > 0) {
      event.preventDefault();
      setInvalid(nextInvalid);
    }
  }

  const firstError =
    invalid.has("name")
      ? dictionary.contact.nameError
      : invalid.has("email")
        ? dictionary.contact.emailError
        : invalid.has("phone")
          ? dictionary.contact.phoneError
          : invalid.has("message")
            ? dictionary.contact.messageError
            : state.error;

  return (
    <form action={action} noValidate onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-ivory/80">{dictionary.contact.name}</span>
          <input
            name="name"
            required
            autoComplete="name"
            value={name}
            aria-invalid={invalid.has("name") || undefined}
            onChange={(event) => {
              setName(sanitizeContactName(event.target.value));
              clearError("name");
            }}
            className={fieldClassFor(invalid.has("name"))}
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-ivory/80">{dictionary.contact.phone}</span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={dictionary.contact.phonePlaceholder}
            value={phone}
            aria-invalid={invalid.has("phone") || undefined}
            onChange={(event) => {
              setPhone(sanitizeContactPhone(event.target.value));
              clearError("phone");
            }}
            className={fieldClassFor(invalid.has("phone"))}
          />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-ivory/80">{dictionary.contact.email}</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          aria-invalid={invalid.has("email") || undefined}
          onChange={(event) => {
            setEmail(event.target.value);
            clearError("email");
          }}
          className={fieldClassFor(invalid.has("email"))}
        />
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="flex items-baseline justify-between gap-3 font-medium text-ivory/80">
          <span>{dictionary.contact.message}</span>
          <span
            className={`text-[11px] font-normal tabular-nums ${
              message.length >= MESSAGE_MAX_LENGTH ? "text-rose-200" : "text-mist"
            }`}
            aria-live="polite"
          >
            {dictionary.contact.messageCount(message.length, MESSAGE_MAX_LENGTH)}
          </span>
        </span>
        <textarea
          name="message"
          required
          rows={5}
          maxLength={MESSAGE_MAX_LENGTH}
          value={message}
          aria-invalid={invalid.has("message") || undefined}
          onChange={(event) => {
            setMessage(event.target.value.slice(0, MESSAGE_MAX_LENGTH));
            clearError("message");
          }}
          className={`${areaClass} ${invalid.has("message") ? "field-error-blink border-transparent" : ""}`}
        />
      </label>

      {firstError ? (
        <p className="rounded-full bg-burgundy/15 px-4 py-2 text-sm text-rose-200" role="alert">
          {firstError}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-full bg-pine/15 px-4 py-2 text-sm text-pine" role="status">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-full bg-burgundy px-5 text-sm font-medium text-white hover:bg-burgundy-deep disabled:opacity-60"
      >
        {pending ? dictionary.contact.sending : dictionary.contact.send}
      </button>
    </form>
  );
}
