"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { manageOrder } from "@/actions/manage-orders";
import { useDictionary } from "@/components/i18n/locale-provider";
import { readOrderEdit } from "@/lib/orders/edit";
import { isQuoteTravelType, quoteTravelTypes } from "@/lib/quote-travel-types";
import { ORDER_STATUSES, type StaffOrder } from "@/types/dashboard";

export function OrderManagementDialog({ order, mode, onClose, onSaved }: {
  order: StaffOrder;
  mode: "edit" | "delete";
  onClose: () => void;
  onSaved: (order: StaffOrder | null) => void;
}) {
  const dictionary = useDictionary();
  const staff = dictionary.staffDashboard;
  const labels = staff.orderEdit;
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [purpose, setPurpose] = useState(order.travelType ?? "");
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = mode === "edit" ? new FormData(event.currentTarget) : null;
    setBusy(true);
    setError("");
    try {
      if (order.updatedAt) {
        const result = await manageOrder(order.id, order.updatedAt, form);
        if (result.error) setError(labels[result.error]);
        else onSaved(result.order);
      } else if (form) {
        const edit = readOrderEdit(form);
        if (!edit) setError(labels.invalid);
        else onSaved({ ...order, ...edit, routeEstimate: edit.origin === order.origin &&
          edit.destination === order.destination ? order.routeEstimate : null });
      } else onSaved(null);
    } catch {
      setError(labels.failed);
    } finally {
      setBusy(false);
    }
  }

  const fields = [
    ["origin", dictionary.pricing.fields.pickupLocation, order.origin, "text"],
    ["destination", dictionary.pricing.fields.dropoffLocation, order.destination, "text"],
    ["departureOn", dictionary.hero.departureDate, order.departureOn, "date"],
    ["returnOn", dictionary.hero.returnDate, order.returnOn, "date"],
    ["passengers", staff.passengers, order.passengerCount, "number"],
    ["name", staff.requestor, order.requestorName, "text"],
    ["company", dictionary.hero.companyName, order.requestorCompany, "text"],
    ["email", dictionary.hero.email, order.requestorEmail, "email"],
    ["phone", dictionary.hero.phone, order.requestorPhone, "tel"],
  ] as const;
  const inputClass = "mt-1 block w-full rounded-lg border border-line bg-night p-2 text-ivory [color-scheme:dark]";
  return (
    <dialog ref={ref} aria-labelledby="manage-order-title" onCancel={(e) => { e.preventDefault(); if (!busy) onClose(); }}
      className="m-auto max-h-[90dvh] w-[min(38rem,94vw)] overflow-auto rounded-2xl border border-line bg-card p-6 text-ivory backdrop:bg-black/70">
      <form onSubmit={submit} className="space-y-5">
        <h2 id="manage-order-title" className="text-xl font-semibold">{mode === "edit" ? staff.editTransport : labels.remove} · {order.reference}</h2>
        {mode === "delete" ? <p>{labels.confirm} {order.reference}.</p> : (
          <fieldset disabled={busy} className="grid gap-3 text-sm sm:grid-cols-2">
            {fields.map(([name, label, value, type]) => (
              <label key={name}>{label}<input className={inputClass} name={name} type={type} defaultValue={value ?? ""}
                required={type === "number"} min={type === "number" ? 1 : undefined} /></label>
            ))}
            <label>{staff.state}<select name="status" className={inputClass} defaultValue={order.status}>
              {ORDER_STATUSES.map((status) => <option key={status} value={status}>{staff.orderStates[status]}</option>)}
            </select></label>
            <label>{dictionary.quote.travelTypeLabel}<select className={inputClass} name="travelType" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              <option value="">—</option>
              {order.travelType && !isQuoteTravelType(order.travelType) && <option>{order.travelType}</option>}
              {quoteTravelTypes.map((type) => <option key={type} value={type}>{dictionary.quote.travelTypeOptions[type]}</option>)}
            </select></label>
            {purpose === "other" && <label>{dictionary.quote.travelTypeOptions.other}<input className={inputClass}
              name="travelTypeDetail" defaultValue={order.travelTypeDetail ?? ""} /></label>}
          </fieldset>
        )}
        {error && <p role="alert" className="text-rose-200">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" disabled={busy} onClick={onClose} className="rounded-lg border border-line px-3 py-2">{staff.fleetFormClose}</button>
          <button type="submit" disabled={busy} className="rounded-lg bg-burgundy px-3 py-2 text-white">{mode === "edit" ? labels.save : labels.remove}</button>
        </div>
      </form>
    </dialog>
  );
}
