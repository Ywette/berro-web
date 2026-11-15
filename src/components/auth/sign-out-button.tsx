"use client";

import { useClerk } from "@clerk/nextjs";
import { useDictionary } from "@/components/i18n/locale-provider";

export function SignOutButton() {
  const dictionary = useDictionary();
  const { signOut } = useClerk();

  return (
    <button
      type="button"
      onClick={() => void signOut({ redirectUrl: "/" })}
      className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-ivory hover:border-white/50"
    >
      {dictionary.nav.signOut}
    </button>
  );
}
