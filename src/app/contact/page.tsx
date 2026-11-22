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
    <section className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
      <div className="grid gap-10 lg:gap-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="grid gap-8">
            <CompanyDetails />
            <NewsletterForm />
          </div>

          <div className="grid gap-6">
            <Suspense fallback={null}>
              <QuotedRouteSummary searchParams={searchParams} />
            </Suspense>
            <div className="request-form border border-white/10 bg-card p-5 sm:p-6">
              <h2 className="mb-4 font-serif text-2xl tracking-wide text-ivory">
                {dictionary.contact.formTitle}
              </h2>
              <Suspense fallback={<ContactForm />}>
                <QuotedContactForm searchParams={searchParams} />
              </Suspense>
            </div>
          </div>
        </div>
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

async function QuotedRouteSummary({
  searchParams,
}: {
  searchParams: ContactPageProps["searchParams"];
}) {
  const [params, dictionary] = await Promise.all([searchParams, getDictionary()]);
  const pickup = first(params.pickup);
  const dropoff = first(params.dropoff);
  if (!pickup || !dropoff) return null;

  const route = await computeRoute(
    { place: first(params.pickupPlace), label: pickup },
    { place: first(params.dropoffPlace), label: dropoff },
    dictionary.locale,
  );
  if (!route) return null;

  return <RouteSummary pickup={pickup} dropoff={dropoff} route={route} dictionary={dictionary} />;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
