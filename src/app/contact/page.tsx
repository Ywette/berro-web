import { Suspense } from "react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { quoteMessage } from "@/lib/quote";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.nav.contact };
}

type ContactPageProps = {
  searchParams: Promise<{
    trip?: string | string[];
    pickup?: string | string[];
    dropoff?: string | string[];
    departure?: string | string[];
    returnAt?: string | string[];
    passengers?: string | string[];
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const dictionary = await getDictionary();

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 lg:grid-cols-2">
      <div>
        <p className="text-xs tracking-[0.22em] text-burgundy uppercase">{dictionary.nav.contact}</p>
        <h1 className="mt-3 font-serif text-5xl tracking-wide text-ivory">{dictionary.contact.title}</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-mist">{dictionary.contact.body}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-card p-5">
        <Suspense fallback={<ContactForm />}>
          <QuotedContactForm searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}

async function QuotedContactForm({
  searchParams,
}: {
  searchParams: ContactPageProps["searchParams"];
}) {
  const [params, dictionary] = await Promise.all([searchParams, getDictionary()]);
  const message = quoteMessage({
    trip: first(params.trip),
    pickup: first(params.pickup),
    dropoff: first(params.dropoff),
    departure: first(params.departure),
    returnAt: first(params.returnAt),
    passengers: first(params.passengers),
  }, dictionary);

  return <ContactForm defaultMessage={message} />;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
