import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.nav.members };
}

type LoginPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const dictionary = await getDictionary();

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[minmax(0,0.9fr)_24rem] lg:items-start">
      <div>
        <h1 className="font-serif text-5xl tracking-wide">{dictionary.login.title}</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-mist">{dictionary.login.body}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-card p-6">
        <Suspense fallback={null}>
          <LoginAlert searchParams={searchParams} />
        </Suspense>
        <LoginForm />
      </div>
    </section>
  );
}

async function LoginAlert({
  searchParams,
}: {
  searchParams: LoginPageProps["searchParams"];
}) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  if (error !== "auth") {
    return null;
  }

  return (
    <p className="mb-4 rounded-lg bg-burgundy/15 px-3 py-2 text-sm text-rose-200" role="alert">
      {(await getDictionary()).login.linkExpired}
    </p>
  );
}
