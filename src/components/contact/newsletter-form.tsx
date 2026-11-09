"use client";

import { useActionState } from "react";
import { subscribeToNews, type ContactState } from "@/actions/contact";
import { useDictionary } from "@/components/i18n/locale-provider";

const initialState: ContactState = {};

const topics = ["minibus", "coach", "excursions"] as const;

const fieldClass =
  "h-11 w-full rounded-lg border border-black/5 bg-white px-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-burgundy/30";

export function NewsletterForm() {
  const dictionary = useDictionary();
  const [state, action, pending] = useActionState(subscribeToNews, initialState);

  return (
    <form action={action} className="grid gap-4 border-t border-white/10 pt-8">
      <div>
        <h2 className="font-serif text-2xl tracking-wide text-ivory">{dictionary.contact.newsletterTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-mist">{dictionary.contact.newsletterBody}</p>
      </div>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium text-ivory/80">{dictionary.contact.newsletterInterest}</legend>
        <div className="mt-1 grid gap-2">
          {topics.map((topic) => (
            <label key={topic} className="flex cursor-pointer items-center gap-3 text-sm text-ivory/90">
              <input
                type="checkbox"
                name={topic}
                className="h-4 w-4 rounded border-white/30 bg-transparent text-burgundy focus:ring-burgundy/40"
              />
              {dictionary.contact.newsletterTopics[topic]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-ivory/80">{dictionary.contact.email}</span>
        <input name="email" type="email" required autoComplete="email" className={fieldClass} />
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
        className="h-11 justify-self-start rounded-lg border border-white/25 px-5 text-sm font-medium text-ivory hover:border-white/60 disabled:opacity-60"
      >
        {pending ? dictionary.contact.newsletterSubmitting : dictionary.contact.newsletterSubmit}
      </button>
    </form>
  );
}
