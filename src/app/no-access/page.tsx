import type { Metadata } from "next";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.login.noAccessTitle, robots: { index: false } };
}

export default async function NoAccessPage() {
  const dictionary = await getDictionary();

  return (
    <section className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-5 px-5 py-16 text-center">
      <h1 className="text-2xl font-semibold text-ivory">{dictionary.login.noAccessTitle}</h1>
      <p className="text-sm text-ivory/70">{dictionary.login.noAccessBody}</p>
      <SignOutButton />
    </section>
  );
}
