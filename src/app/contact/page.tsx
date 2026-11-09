import { Suspense } from "react";
import type { Metadata } from "next";
import { CompanyDetails } from "@/components/contact/company-details";
import { ContactForm } from "@/components/contact/contact-form";
import { NewsletterForm } from "@/components/contact/newsletter-form";
import { RouteSummary } from "@/components/contact/route-summary";
import { computeRoute } from "@/lib/places/server";
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
    pickupPlace?: string | string[];
    dropoff?: string | string[];
    dropoffPlace?: string | string[];
    departure?: string | string[];
    returnAt?: string | string[];
    passengers?: string | string[];
    planDocument?: string | string[];
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const dictionary = await getDictionary();

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2 lg:items-start">
      <div className="grid gap-8 lg:order-1">
        <CompanyDetails />
        <NewsletterForm />
        <div className="rounded-2xl border border-white/10 bg-card p-5">
          <h2 className="mb-4 font-serif text-2xl tracking-wide text-ivory">{dictionary.contact.formTitle}</h2>
          <Suspense fallback={<ContactForm />}>
            <QuotedContactForm searchParams={searchParams} />
          </Suspense>
        </div>
      </div>

      <Suspense
        fallback={
          <aside className="lg:order-2">
            <h1 className="font-serif text-5xl tracking-wide text-ivory">{dictionary.contact.title}</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-mist">{dictionary.contact.body}</p>
          </aside>
        }
      >
        <ContactAside searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function QuotedContactForm({
  searchParams,
}: {
  searchParams: ContactPageProps["searchParams"];
}) {
  const [params, dictionary] = await Promise.all([searchParams, getDictionary()]);
  const pickup = first(params.pickup);
  const dropoff = first(params.dropoff);
  const route =
    pickup && dropoff
      ? await computeRoute(
          { place: first(params.pickupPlace), label: pickup },
          { place: first(params.dropoffPlace), label: dropoff },
          dictionary.locale,
        )
      : null;

  return (
    <ContactForm
      defaultMessage={quoteMessage(
        {
          trip: first(params.trip),
          pickup,
          dropoff,
          departure: first(params.departure),
          returnAt: first(params.returnAt),
          passengers: first(params.passengers),
          planDocument: first(params.planDocument),
        },
        dictionary,
        route,
      )}
    />
  );
}

async function ContactAside({
  searchParams,
}: {
  searchParams: ContactPageProps["searchParams"];
}) {
  const [params, dictionary] = await Promise.all([searchParams, getDictionary()]);
  const pickup = first(params.pickup);
  const dropoff = first(params.dropoff);
  const route =
    pickup && dropoff
      ? await computeRoute(
          { place: first(params.pickupPlace), label: pickup },
          { place: first(params.dropoffPlace), label: dropoff },
          dictionary.locale,
        )
      : null;

  return (
    <aside className="lg:order-2 lg:sticky lg:top-28">
      <h1 className="font-serif text-5xl tracking-wide text-ivory">{dictionary.contact.title}</h1>
      <p className="mt-4 max-w-md text-sm leading-6 text-mist">{dictionary.contact.body}</p>
      {route && pickup && dropoff ? (
        <RouteSummary pickup={pickup} dropoff={dropoff} route={route} dictionary={dictionary} />
      ) : null}
    </aside>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
