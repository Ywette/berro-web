"use client";

import { formatDate } from "@/lib/content/format-date";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import {
  orderFromQuoteInput,
  prependSessionOrder,
  quoteFieldErrors,
  readSessionOrders,
  type QuoteOrderInput,
} from "@/lib/orders/session-orders";
import type { StaffOrder } from "@/types/dashboard";

const syncMs = 2000;

export function CrmHandoff({
  input,
  savedReference,
}: {
  input: QuoteOrderInput;
  savedReference?: string;
}) {
  const dictionary = useDictionary();
  const [phase, setPhase] = useState<"syncing" | "done">("syncing");
  const [order, setOrder] = useState<StaffOrder | null>(null);

  const alreadySaved = Boolean(savedReference?.trim());
  const errors = useMemo(
    () => (alreadySaved ? [] : quoteFieldErrors(input, { requireContact: false })),
    [alreadySaved, input],
  );

  const contactHref = useMemo(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(input)) {
      if (value) params.set(key, value);
    }
    const query = params.toString();
    return query ? `/contact?${query}` : "/contact";
  }, [input]);

  useEffect(() => {
    if (alreadySaved) {
      const reference = savedReference!.trim();
      const existing = readSessionOrders().find((item) => item.reference === reference) ?? null;
      const timer = window.setTimeout(() => {
        setOrder(
          existing ?? {
            id: `ref-${reference}`,
            reference,
            origin: input.pickup?.trim() || "—",
            destination: input.dropoff?.trim() || "—",
            returnTo: null,
            passengerCount: Number(input.passengers) || 0,
            requestorName: input.name?.trim() || null,
            requestorCompany: null,
            requestorEmail: input.email?.trim() || null,
            requestorPhone: input.phone?.trim() || null,
            heardAbout: null,
            heardAboutDetail: null,
            travelType: input.travelType?.trim() || null,
            travelTypeDetail: input.travelTypeDetail?.trim() || null,
            planDocument: input.planDocument?.trim() || null,
            planDocumentPath: null,
            status: "new",
            departureOn: null,
            returnOn: null,
            stops: null,
            waitingMinutes: null,
            assignedDriverId: null,
            assignedDriverName: null,
            assignedGuideId: null,
            assignedGuideName: null,
            assignedVehicleId: null,
          },
        );
        setPhase("done");
      }, 400);
      return () => window.clearTimeout(timer);
    }

    if (errors.length > 0) return;
    const created = orderFromQuoteInput(input);
    const timer = window.setTimeout(() => {
      prependSessionOrder(created);
      setOrder(created);
      setPhase("done");
    }, syncMs);
    return () => window.clearTimeout(timer);
  }, [alreadySaved, errors, input, savedReference]);

  if (errors.length > 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <h1 className="font-serif text-3xl tracking-wide text-ivory sm:text-4xl">
          {dictionary.quote.incompleteTitle}
        </h1>
        <p className="mt-3 text-sm leading-6 text-mist">{dictionary.quote.incompleteBody}</p>
        <Link
          href="/#book"
          className="order-button mt-8"
        >
          {dictionary.quote.backToQuote}
        </Link>
      </div>
    );
  }

  if (phase === "syncing" || !order) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
        <span className="doc-read-spinner mb-5 h-8 w-8 border-[3px]" aria-hidden="true" />
        <h1 className="font-serif text-3xl tracking-wide text-ivory sm:text-4xl">
          {dictionary.crmDemo.syncTitle}
        </h1>
        <p className="mt-3 text-sm text-mist">{dictionary.crmDemo.syncBody}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 sm:py-16">
      <p className="text-sm text-pine">{dictionary.crmDemo.successEyebrow}</p>
      <h1 className="mt-2 font-serif text-4xl tracking-wide text-ivory sm:text-5xl">
        {dictionary.crmDemo.successTitle}
      </h1>
      <p className="mt-3 text-sm leading-6 text-mist">{dictionary.crmDemo.successBody}</p>

      <article className="mt-8 rounded-2xl border border-line bg-card p-5 sm:p-6">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-mist">{dictionary.staffDashboard.orderId}</dt>
            <dd className="mt-1 font-medium text-ivory">{order.reference}</dd>
          </div>
          <div>
            <dt className="text-mist">{dictionary.staffDashboard.state}</dt>
            <dd className="mt-1">
              <span className="inline-flex rounded-full bg-white/8 px-2.5 py-1 text-xs text-ivory/80">
                {dictionary.staffDashboard.orderStates.new}
              </span>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-mist">{dictionary.staffDashboard.route}</dt>
            <dd className="mt-1 text-ivory">
              {order.origin} → {order.destination}
              {order.returnTo ? ` → ${order.returnTo}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-mist">{dictionary.quote.departure}</dt>
            <dd className="mt-1 text-ivory">{formatDate(order.departureOn)}</dd>
          </div>
          <div>
            <dt className="text-mist">{dictionary.quote.return}</dt>
            <dd className="mt-1 text-ivory">{formatDate(order.returnOn)}</dd>
          </div>
          <div>
            <dt className="text-mist">{dictionary.staffDashboard.passengers}</dt>
            <dd className="mt-1 text-ivory">{order.passengerCount}</dd>
          </div>
          <div>
            <dt className="text-mist">{dictionary.quote.name}</dt>
            <dd className="mt-1 text-ivory">{order.requestorName}</dd>
          </div>
          <div>
            <dt className="text-mist">{dictionary.quote.email}</dt>
            <dd className="mt-1 text-ivory">{order.requestorEmail}</dd>
          </div>
          {order.planDocument ? (
            <div className="sm:col-span-2">
              <dt className="text-mist">{dictionary.pricing.planDocument}</dt>
              <dd className="mt-1 text-ivory">{order.planDocument}</dd>
            </div>
          ) : null}
          {order.stops && order.stops.length > 0 ? (
            <div className="sm:col-span-2">
              <dt className="text-mist">{dictionary.quote.stopsTitle}</dt>
              <dd className="mt-1 text-ivory">
                {order.stops
                  .map((stop) => `${stop.name} (${stop.waitMinutes} ${dictionary.quote.minutesShort})`)
                  .join(" · ")}
              </dd>
            </div>
          ) : null}
          {order.waitingMinutes ? (
            <div>
              <dt className="text-mist">{dictionary.quote.waitingTotal}</dt>
              <dd className="mt-1 text-ivory">
                {order.waitingMinutes} {dictionary.quote.minutesShort}
              </dd>
            </div>
          ) : null}
        </dl>
      </article>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={contactHref}
          className="order-button"
        >
          {dictionary.crmDemo.continueContact}
        </Link>
        <Link
          href="/staff/orders"
          className="rounded-full border border-white/25 px-5 py-2.5 text-sm text-ivory hover:border-white/60"
        >
          {dictionary.crmDemo.openOrders}
        </Link>
      </div>
    </div>
  );
}
