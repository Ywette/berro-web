import { Suspense } from "react";
import type { Metadata } from "next";
import { CrmHandoff } from "@/components/crm/crm-handoff";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { QuoteOrderInput } from "@/lib/orders/session-orders";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.crmDemo.pageTitle };
}

type OrderReceivedPageProps = {
  searchParams: Promise<{
    reference?: string | string[];
    trip?: string | string[];
    tripMode?: string | string[];
    name?: string | string[];
    email?: string | string[];
    phone?: string | string[];
    travelType?: string | string[];
    travelTypeDetail?: string | string[];
    pickup?: string | string[];
    dropoff?: string | string[];
    departure?: string | string[];
    returnAt?: string | string[];
    passengers?: string | string[];
    planDocument?: string | string[];
    stops?: string | string[];
    otherWaitingMinutes?: string | string[];
    waitingMinutes?: string | string[];
  }>;
};

export default function OrderReceivedPage({ searchParams }: OrderReceivedPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[50vh] items-center justify-center px-5">
          <span className="doc-read-spinner h-8 w-8 border-[3px]" aria-hidden="true" />
        </div>
      }
    >
      <OrderReceivedContent searchParams={searchParams} />
    </Suspense>
  );
}

async function OrderReceivedContent({
  searchParams,
}: {
  searchParams: OrderReceivedPageProps["searchParams"];
}) {
  const params = await searchParams;
  const reference = first(params.reference);
  const input: QuoteOrderInput = {
    trip: first(params.trip),
    tripMode: first(params.tripMode),
    name: first(params.name),
    email: first(params.email),
    phone: first(params.phone),
    travelType: first(params.travelType),
    travelTypeDetail: first(params.travelTypeDetail),
    pickup: first(params.pickup),
    dropoff: first(params.dropoff),
    departure: first(params.departure),
    returnAt: first(params.returnAt),
    passengers: first(params.passengers),
    planDocument: first(params.planDocument),
    stops: first(params.stops),
    otherWaitingMinutes: first(params.otherWaitingMinutes),
    waitingMinutes: first(params.waitingMinutes),
  };

  return <CrmHandoff input={input} savedReference={reference} />;
}

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}
