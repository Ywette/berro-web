import type { Metadata } from "next";
import { QuotePlanForm } from "@/components/landing/quote-plan-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.quote.planPageTitle };
}

type PlanPageProps = {
  searchParams: Promise<{
    trip?: string | string[];
    name?: string | string[];
    email?: string | string[];
    phone?: string | string[];
    passengers?: string | string[];
    pickup?: string | string[];
    pickupPlace?: string | string[];
    dropoff?: string | string[];
    dropoffPlace?: string | string[];
    departure?: string | string[];
    returnAt?: string | string[];
  }>;
};

export default async function PlanPage({ searchParams }: PlanPageProps) {
  const [dictionary, params] = await Promise.all([getDictionary(), searchParams]);

  return (
    <section className="mx-auto max-w-3xl px-5 py-12">
      <QuotePlanForm
        defaults={{
          trip: first(params.trip),
          name: first(params.name),
          email: first(params.email),
          phone: first(params.phone),
          passengers: first(params.passengers),
          pickup: first(params.pickup),
          pickupPlace: first(params.pickupPlace),
          dropoff: first(params.dropoff),
          dropoffPlace: first(params.dropoffPlace),
          departure: first(params.departure),
          returnAt: first(params.returnAt),
        }}
      />
    </section>
  );
}

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}
