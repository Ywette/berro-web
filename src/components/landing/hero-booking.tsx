"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import {
  OfferRequestDialog,
  type OfferTripDraft,
} from "@/components/landing/offer-request-dialog";
import {
  orderFromQuoteInput,
  prependSessionOrder,
  type QuoteOrderInput,
} from "@/lib/orders/session-orders";
import type { QuoteTripKind } from "@/lib/quote-trips";

type ServiceId = "bus" | "minibus" | "transfer";

const serviceTrip: Record<ServiceId, QuoteTripKind> = {
  bus: "Bus Rental",
  minibus: "Minibus Rental",
  transfer: "Transfer",
};

function parseService(value: string | null): ServiceId {
  if (value === "transfer" || value === "minibus" || value === "bus") return value;
  if (value === "excursions") return "minibus";
  return "bus";
}

function serviceFromTrip(trip: QuoteTripKind | undefined): ServiceId | null {
  if (trip === "Bus Rental") return "bus";
  if (trip === "Minibus Rental") return "minibus";
  if (trip === "Transfer") return "transfer";
  if (trip === "Excursions") return "minibus";
  return null;
}

const emptyDraft = (): OfferTripDraft => ({
  passengers: "",
  pickup: "",
  dropoff: "",
  tripMode: "oneWay",
  departureAt: "",
  returnAt: "",
  comments: "",
  planDocumentName: null,
  planNote: "",
});

export function HeroBooking() {
  const dictionary = useDictionary();
  const searchParams = useSearchParams();
  const [service, setService] = useState<ServiceId>("bus");
  const [draft, setDraft] = useState<OfferTripDraft>(emptyDraft);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [phase, setPhase] = useState<"options" | "contact" | "sent">("options");

  useEffect(() => {
    setService(parseService(searchParams.get("service")));
  }, [searchParams]);

  function patchDraft(patch: Partial<OfferTripDraft>) {
    if (patch.trip) {
      const matched = serviceFromTrip(patch.trip);
      if (matched) setService(matched);
    }
    setDraft((current) => ({ ...current, ...patch }));
  }

  function buildQuoteInput(contact: {
    name: string;
    email: string;
    phone: string;
  }): QuoteOrderInput {
    const needsDestination = draft.tripMode === "oneWay";
    const needsReturn = draft.tripMode === "roundTrip";
    const resolvedDropoff = needsDestination
      ? draft.dropoff.trim() || draft.pickup.trim()
      : draft.dropoff.trim() || draft.pickup.trim();

    return {
      trip: draft.trip || serviceTrip[service],
      tripMode: draft.tripMode,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      pickup: draft.pickup.trim(),
      dropoff: resolvedDropoff,
      departure: draft.departureAt || undefined,
      returnAt: needsReturn ? draft.returnAt || undefined : undefined,
      passengers: draft.passengers || undefined,
      planDocument: draft.planDocumentName || draft.planNote || draft.comments || undefined,
    };
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPhase("options");
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setPhase("options");
  }

  function submitContact(contact: { name: string; email: string; phone: string }) {
    const order = orderFromQuoteInput(buildQuoteInput(contact));
    prependSessionOrder(order);
    setPhase("sent");
  }

  return (
    <div className="w-full">
      <form noValidate onSubmit={onSubmit}>
        <button
          type="submit"
          className="inline-flex h-12 w-full max-w-sm items-center justify-center gap-2 rounded-full bg-burgundy px-6 text-sm font-semibold whitespace-nowrap text-white shadow-[0_20px_50px_-24px_rgba(0,0,0,0.9)] hover:bg-burgundy-deep"
        >
          <SearchIcon />
          {dictionary.hero.getOffer}
        </button>
      </form>

      <OfferRequestDialog
        open={dialogOpen}
        phase={phase}
        draft={draft}
        onDraftChange={patchDraft}
        onClose={closeDialog}
        onContinue={() => setPhase("contact")}
        onContactSubmit={submitContact}
      />
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
