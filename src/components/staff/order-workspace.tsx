"use client";

import { useEffect, useRef, useState } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { manageOrder } from "@/actions/manage-orders";
import { OrderEditor } from "./order-editor";
import { OrderCalculationForm } from "./order-calculation";
import { mergeOrdersWithSession, readSessionOrders, writeSessionOrders } from "@/lib/orders/session-orders";
import { applyAssignmentPatches, assignEmployee, assignTransport } from "@/lib/staff/assignments";
import { applyLocalCalculations, removeLocalCalculation } from "@/lib/orders/local-calculations";
import type { FleetVehicle } from "@/lib/content/fleet";
import type { Employee } from "@/types/staff";
import { formatTravelTypeLabel } from "@/lib/quote-travel-types";
import { formatHeardAboutLabel } from "@/lib/quote-heard-about";
import { employeeChoices, vehicleChoices, vehicleLabel } from "@/lib/staff/availability";
import type { StaffOrder } from "@/types/dashboard";
import { formatTripDuration, tripDurationDays } from "@/lib/orders/trip-duration";
import { formatDate, formatRigaTimestamp } from "@/lib/content/format-date";
import { formatDuration } from "@/lib/quote";

export function OrderWorkspace({ id, initialOrder, userId, vehicles, employees, orders, confirmDelete, backUrl }: {
  id: string;
  initialOrder: StaffOrder | null;
  userId: string;
  vehicles: FleetVehicle[];
  employees: Employee[];
  orders: StaffOrder[];
  confirmDelete: boolean;
  backUrl: string;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const dictionary = useDictionary();
  const staff = dictionary.staffDashboard;
  const [order, setOrder] = useState(initialOrder);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calculationOpened, setCalculationOpened] = useState(false);
  const [calculationLocked, setCalculationLocked] = useState(Boolean(initialOrder?.calculation));
  const [error, setError] = useState("");
  const draftKey = `berro:order-draft:${userId}:${id}`;
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const merged = mergeOrdersWithSession(initialOrder ? [initialOrder] : []);
      const current = applyLocalCalculations(applyAssignmentPatches(merged)).find((item) => item.id === id) ?? null;
      setOrder(current);
      setCalculationLocked(Boolean(current?.calculation));
      setLoaded(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [id, initialOrder]);
  useEffect(() => {
    if (loaded && confirmDelete) ref.current?.showModal();
  }, [loaded, confirmDelete]);
  useEffect(() => {
    function syncEditMode() {
      setEditing(window.location.hash === "#edit");
    }
    window.addEventListener("hashchange", syncEditMode);
    const frame = requestAnimationFrame(syncEditMode);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", syncEditMode);
    };
  }, []);
  function closeDelete() {
    ref.current?.close();
    setError("");
    if (confirmDelete) {
      const url = new URL(window.location.href);
      url.searchParams.delete("delete");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }
  function saved(next: StaffOrder) {
    const session = readSessionOrders().filter((item) => item.id !== id);
    if (!next.updatedAt) session.unshift(next);
    writeSessionOrders(session);
    setOrder(applyLocalCalculations(applyAssignmentPatches([next]))[0]);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setEditing(false);
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
      try { removeLocalCalculation(id); } catch { /* The order is already deleted. */ }
      router.replace(backUrl);
    } catch { setError(staff.orderEdit.failed); }
    finally { setBusy(false); }
  }
  const back = <Link href={backUrl} className="text-sm underline">← {staff.ordersTitle}</Link>;
  if (!order) return <section>{back}<p className="mt-4">{loaded ? staff.orderMissing : dictionary.employees.loading}</p></section>;
  const vehicle = vehicles.find((item) => item.id === order.assignedVehicleId);
  const estimate = order.routeEstimate;
  const duration = order.tripDurationDays ?? tripDurationDays(order.departureOn, order.returnOn);
  const assignedOrders = loaded ? applyAssignmentPatches(mergeOrdersWithSession(orders)) : orders;
  const drivers = employeeChoices("driver", order, employees, assignedOrders);
  const availableVehicles = vehicleChoices(order, vehicles, assignedOrders);
  const contactDetails = [
    [staff.requestor, order.requestorName],
    [dictionary.hero.companyName, order.requestorCompany],
    [dictionary.hero.email, order.requestorEmail],
    [dictionary.hero.phone, order.requestorPhone],
    [dictionary.nav.language, order.requestLocale && ({ lv: "Latviešu", en: "English", fr: "Français", ru: "Русский" }[order.requestLocale] ?? order.requestLocale)],
    [dictionary.quote.heardAboutLabel, order.heardAbout && formatHeardAboutLabel(
      order.heardAbout, order.heardAboutDetail, dictionary.quote.heardAboutOptions,
    )],
  ] as const;
  const travelDetails = [
    [staff.orderedOn, order.createdAt && formatRigaTimestamp(order.createdAt)],
    [dictionary.hero.departureDate, order.departureOn && formatDate(order.departureOn)],
    [dictionary.hero.returnDate, order.returnOn && formatDate(order.returnOn)],
    [staff.tripDuration, formatTripDuration(duration, dictionary.locale, staff.tripDurationDays)],
    [staff.passengers, order.passengerCount],
    [dictionary.quote.travelTypeLabel, order.travelType && formatTravelTypeLabel(
      order.travelType, order.travelTypeDetail, dictionary.quote.travelTypeOptions,
    )],
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
              Google Maps · {estimate.distanceKm} km{estimate.durationMinutes !== null && ` · ${formatDuration(estimate.durationMinutes, dictionary.locale)}`}
            </a>
          )}
        </section>
        <div className="grid gap-6 border-t border-line pt-4 sm:grid-cols-2">
          {[contactDetails, travelDetails].map((column, index) => (
            <dl key={index} className="grid content-start gap-4">
              {column.map(([label, value]) => value != null && value !== "" && (
                <div key={label} className="min-w-0">
                  <dt className="text-sm text-mist">{label}</dt>
                  <dd className="whitespace-pre-line break-words">{value}</dd>
                </div>
              ))}
              {index === 1 && (
                <>
                  <div>
                    <dt><label htmlFor="order-driver" className="text-sm text-mist">{staff.orderDriver}</label></dt>
                    <dd>
                    <select id="order-driver" value={order.assignedDriverId ?? ""} disabled={!loaded}
                      onChange={(event) => {
                        const employee = employees.find((item) => item.id === event.target.value) ?? null;
                        setOrder(assignEmployee([order], order.id, "driver", employee)[0]);
                      }}
                      className="mt-1 block w-full rounded-lg border border-white/15 bg-night px-3 py-2 text-sm text-ivory [color-scheme:dark]">
                      <option value="">{staff.unassigned}</option>
                      {order.assignedDriverId && !drivers.some((item) => item.id === order.assignedDriverId) && (
                        <option value={order.assignedDriverId}>{order.assignedDriverName || order.assignedDriverId}</option>
                      )}
                      {drivers.map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}
                    </select>
                    </dd>
                  </div>
                  <div>
                    <dt><label htmlFor="order-vehicle" className="text-sm text-mist">{staff.orderTransport}</label></dt>
                    <dd>
                    <select id="order-vehicle" value={order.assignedVehicleId ?? ""} disabled={!loaded}
                      onChange={(event) => setOrder(assignTransport([order], order.id, event.target.value || null)[0])}
                      className="mt-1 block w-full rounded-lg border border-white/15 bg-night px-3 py-2 text-sm text-ivory [color-scheme:dark]">
                      <option value="">{staff.unassigned}</option>
                      {order.assignedVehicleId && !availableVehicles.some((item) => item.id === order.assignedVehicleId) && (
                        <option value={order.assignedVehicleId}>{vehicle ? vehicleLabel(vehicle) : order.assignedVehicleId}</option>
                      )}
                      {availableVehicles.map((item) => <option key={item.id} value={item.id}>{vehicleLabel(item)} · {item.passengers}</option>)}
                    </select>
                    </dd>
                  </div>
                </>
              )}
            </dl>
          ))}
        </div>
        {order.planDocument && (
          <div>
            <p className="text-sm text-mist">{dictionary.pricing.planDocument}</p>
            {order.planDocumentPath ? (
              <a href={`/api/staff/order-document?id=${encodeURIComponent(order.id)}`}
                target="_blank" rel="noopener noreferrer" className="break-all underline">
                {order.planDocument}
              </a>
            ) : <p className="break-all">{order.planDocument}</p>}
          </div>
        )}
        <div id="order-edit" hidden={!editing} className={editing ? undefined : "!hidden"}>
          {loaded && <OrderEditor key={draftKey} order={order} draftKey={draftKey} onSaved={saved} />}
        </div>
        <section className="border-t border-line pt-5">
          <h2>
            <button type="button" onClick={() => {
              setCalculationOpened(true);
              setCalculating((open) => !open);
              setEditing(false);
            }} aria-expanded={calculating} aria-controls="order-calculation"
              className="flex w-full items-center justify-between gap-4 text-left text-xl font-semibold">
              {staff.calculation}
              <span aria-hidden="true" className={calculating ? "rotate-180 transition-transform" : "transition-transform"}>⌄</span>
            </button>
          </h2>
          <div id="order-calculation" hidden={!calculating} className={calculating ? undefined : "!hidden"}>
            {calculationOpened && <OrderCalculationForm key={order.id} order={order} onSaved={saved} onLockChange={setCalculationLocked} />}
          </div>
        </section>
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <button type="button" className="mr-auto rounded-lg border border-rose-300/40 px-4 py-2 text-sm font-medium text-rose-200 hover:bg-rose-300/10" onClick={() => ref.current?.showModal()}>
            {staff.orderEdit.remove}
          </button>
          <button type="button" onClick={() => {
            const next = !editing;
            window.history.replaceState(null, "", window.location.pathname + window.location.search + (next ? "#edit" : ""));
            setEditing(next);
            if (next) setCalculating(false);
          }} className="rounded-lg border border-white/25 px-4 py-2 text-sm font-medium text-ivory hover:bg-white/10" aria-expanded={editing} aria-controls="order-edit">
            {editing ? staff.fleetFormClose : staff.editTransport}
          </button>
          <button type="submit" form={editing ? "edit" : "order-calculation-form"}
            disabled={!editing && (!calculating || calculationLocked)}
            className="rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-burgundy/80 disabled:opacity-50">
            {staff.saveOrderChanges}
          </button>
        </div>
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
