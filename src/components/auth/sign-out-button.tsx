"use client";

import { signOut } from "@/actions/auth";
import { useDictionary } from "@/components/i18n/locale-provider";

export function SignOutButton() {
  const dictionary = useDictionary();

  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-ivory hover:border-white/50"
      >
        {dictionary.nav.signOut}
      </button>
    </form>
  );
}
