"use client";

import { useEffect, useRef, useState } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { manageOrder } from "@/actions/manage-orders";
import { OrderEditor } from "./order-editor";
import { mergeOrdersWithSession, readSessionOrders, writeSessionOrders } from "@/lib/orders/session-orders";
import { applyAssignmentPatches } from "@/lib/staff/assignments";
import type { FleetVehicle } from "@/lib/content/fleet";
import { formatTravelTypeLabel } from "@/lib/quote-travel-types";
import { vehicleLabel } from "@/lib/staff/availability";
import type { StaffOrder } from "@/types/dashboard";

export function OrderWorkspace({ id, initialOrder, userId, vehicles, confirmDelete }: {
  id: string;
  initialOrder: StaffOrder | null;
  userId: string;
  vehicles: FleetVehicle[];
  confirmDelete: boolean;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const dictionary = useDictionary();
  const staff = dictionary.staffDashboard;
  const [order, setOrder] = useState(initialOrder);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const draftKey = `berro:order-draft:${userId}:${id}`;
  useEffect(() => {
    const merged = mergeOrdersWithSession(initialOrder ? [initialOrder] : []);
    setOrder(applyAssignmentPatches(merged).find((item) => item.id === id) ?? null);
    setLoaded(true);
  }, [id, initialOrder]);
  useEffect(() => {
    if (loaded && confirmDelete) ref.current?.showModal();
  }, [loaded, confirmDelete]);
  function closeDelete() {
    ref.current?.close();
    setError("");
    if (confirmDelete) router.replace(`/staff/orders/${encodeURIComponent(id)}`, { scroll: false });
  }
  function saved(next: StaffOrder) {
    const session = readSessionOrders().filter((item) => item.id !== id);
    if (!next.updatedAt) session.unshift(next);
    writeSessionOrders(session);
    setOrder(applyAssignmentPatches([next])[0]);
  }
  async function remove() {
    if (!order || busy) return;
    setBusy(true);
    try {
      if (order.updatedAt) {
        const result = await manageOrder(id, order.updatedAt, null);
        if (result.error) { setError(staff.orderEdit[result.error]); return; }
      }
      writeSessionOrders(readSessionOrders().filter((item) => item.id !== id));
      if (id.startsWith("demo-order-")) sessionStorage.setItem(`hidden-${id}`, "1");
      sessionStorage.removeItem(draftKey);
      router.replace("/staff/orders");
    } catch { setError(staff.orderEdit.failed); }
    finally { setBusy(false); }
  }
  const back = <Link href="/staff/orders" className="text-sm underline">? {staff.ordersTitle}</Link>;
  if (!order) return <section>{back}<p className="mt-4">{loaded ? staff.orderMissing : dictionary.employees.loading}</p></section>;
  const vehicle = vehicles.find((item) => item.id === order.assignedVehicleId);
  const estimate = order.routeEstimate;
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
    <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-line bg-card p-5 text-ivory sm:p-7">
        {back}
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{order.reference}</h1>
            <p className="text-sm text-mist">{staff.orderStates[order.status]}</p>
          </div>

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
        <OrderEditor order={order} draftKey={draftKey} onSaved={saved} />
        <button type="button" className="text-sm text-rose-200 underline" onClick={() => ref.current?.showModal()}>{staff.orderEdit.remove}</button>
        <dialog ref={ref} aria-labelledby="delete-order-title" onCancel={(event) => { event.preventDefault(); if (!busy) closeDelete(); }}
          className="m-auto w-[min(32rem,94vw)] space-y-5 rounded-xl border border-line bg-card p-6 text-ivory backdrop:bg-black/70">
          <h2 id="delete-order-title" className="text-lg font-semibold">{staff.orderEdit.remove}</h2>
          <p>{staff.orderEdit.confirm} {order.reference}.</p>
          {error && <p role="alert">{error}</p>}
          <div className="flex justify-end gap-4">
            <button type="button" disabled={busy} onClick={closeDelete}>{staff.fleetFormClose}</button>
            <button type="button" disabled={busy} onClick={remove} className="rounded-lg bg-burgundy px-3 py-2">{staff.orderEdit.remove}</button>
          </div>
        </dialog>
    </article>
  );
}
