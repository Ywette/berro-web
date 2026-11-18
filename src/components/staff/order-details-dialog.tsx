"use client";

import { useEffect, useRef } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import type { FleetVehicle } from "@/lib/content/fleet";
import { formatTravelTypeLabel } from "@/lib/quote-travel-types";
import { vehicleLabel } from "@/lib/staff/availability";
import type { StaffOrder } from "@/types/dashboard";

export function OrderDetailsDialog({ order, vehicle, onClose, onManage }: {
  order: StaffOrder;
  vehicle?: FleetVehicle;
  onClose: () => void;
  onManage: (mode: "edit" | "delete") => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const dictionary = useDictionary();
  const staff = dictionary.staffDashboard;
  const estimate = order.routeEstimate;

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  const details = [
    [staff.passengers, order.passengerCount],
    [dictionary.hero.departureDate, order.departureOn],
    [dictionary.hero.returnDate, order.returnOn],
    [dictionary.quote.travelTypeLabel, order.travelType && formatTravelTypeLabel(
      order.travelType, order.travelTypeDetail, dictionary.quote.travelTypeOptions,
    )],
    [staff.requestor, [order.requestorName, order.requestorCompany, order.requestorEmail, order.requestorPhone].filter(Boolean).join("\n")],
    [staff.assignedDriver, order.assignedDriverName ?? staff.unassigned],
    [staff.assignedVehicle, vehicle ? vehicleLabel(vehicle) : order.assignedVehicleId ?? staff.unassigned],
    [dictionary.pricing.planDocument, order.planDocument],
  ] as const;

  return (
    <dialog ref={ref} aria-labelledby="order-dialog-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="m-auto max-h-[90dvh] w-[min(40rem,94vw)] overflow-auto rounded-2xl border border-line bg-card p-0 text-ivory shadow-xl backdrop:bg-black/70">
      <div className="space-y-5 p-5 sm:p-7">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 id="order-dialog-title" className="text-xl font-semibold">{order.reference}</h2>
            <p className="text-sm text-mist">{staff.orderStates[order.status]}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-3 py-1.5 text-sm">
            {dictionary.staffDashboard.fleetFormClose}
          </button>
        </header>
        <section>
          <h3 className="text-sm text-mist">{staff.route}</h3>
          <ol className="my-2 list-decimal space-y-1 pl-5">
            {[order.origin, ...(order.stops ?? []).map((stop) => stop.name), order.destination, order.returnTo]
              .filter(Boolean).map((place, index) => <li key={index}>{place}</li>)}
          </ol>
          {estimate && (
            <a href={estimate.mapsUrl} target="_blank" rel="noreferrer" className="text-sm underline">
              Google Maps · {estimate.distanceKm} km{estimate.durationMinutes !== null && ` · ${estimate.durationMinutes} min`}
            </a>
          )}
        </section>
        <dl className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
          {details.map(([label, value]) => value != null && value !== "" && (
            <div key={label} className="min-w-0">
              <dt className="text-sm text-mist">{label}</dt>
              <dd className="whitespace-pre-line break-words">{value}</dd>
            </div>
          ))}
        </dl>
        <footer className="flex justify-end gap-4">
          <button type="button" onClick={() => onManage("edit")} className="underline">{staff.editTransport}</button>
          <button type="button" onClick={() => onManage("delete")} className="text-rose-200 underline">{staff.deleteOrder}</button>
        </footer>
      </div>
    </dialog>
  );
}
