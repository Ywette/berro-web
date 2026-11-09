"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "@/actions/auth";
import { useDictionary } from "@/components/i18n/locale-provider";

const initialState: SignInState = {};

const fieldClass =
  "h-11 w-full rounded-lg border border-black/5 bg-white px-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-burgundy/30";

export function LoginForm() {
  const dictionary = useDictionary();
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-ivory/80">{dictionary.login.email}</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldClass}
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-ivory/80">{dictionary.login.password}</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={fieldClass}
        />
      </label>
      {state.error ? (
        <p className="rounded-lg bg-burgundy/15 px-3 py-2 text-sm text-rose-200" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-lg bg-burgundy text-sm font-medium text-white hover:bg-burgundy-deep disabled:opacity-60"
      >
        {pending ? dictionary.login.signingIn : dictionary.login.signIn}
      </button>
    </form>
  );
}
