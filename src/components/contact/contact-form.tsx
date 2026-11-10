"use client";

import { useActionState } from "react";
import { sendContactMessage, type ContactState } from "@/actions/contact";
import { useDictionary } from "@/components/i18n/locale-provider";

const initialState: ContactState = {};

const fieldClass =
  "h-11 w-full rounded-lg border border-black/5 bg-white px-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-burgundy/30";

export function ContactForm({ defaultMessage = "" }: { defaultMessage?: string }) {
  const dictionary = useDictionary();
  const [state, action, pending] = useActionState(
    sendContactMessage,
    initialState,
  );

  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-ivory/80">{dictionary.contact.name}</span>
          <input
            name="name"
            required
            autoComplete="name"
            className={fieldClass}
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-ivory/80">{dictionary.contact.email}</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-ivory/80">{dictionary.contact.phone}</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            className={fieldClass}
          />
        </label>
      </div>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-ivory/80">{dictionary.contact.message}</span>
        <textarea
          name="message"
          required
          rows={5}
          defaultValue={defaultMessage}
          className="rounded-lg border border-black/5 bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-burgundy/30"
        />
      </label>
      {state.error ? (
        <p className="rounded-lg bg-burgundy/15 px-3 py-2 text-sm text-rose-200" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg bg-pine/15 px-3 py-2 text-sm text-pine" role="status">
          {state.success}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-lg bg-burgundy text-sm font-medium text-white hover:bg-burgundy-deep disabled:opacity-60"
      >
        {pending ? dictionary.contact.sending : dictionary.contact.send}
      </button>
    </form>
  );
}
