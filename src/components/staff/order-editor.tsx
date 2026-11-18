"use client";

import { useEffect, useState, type FormEvent } from "react";
import { manageOrder } from "@/actions/manage-orders";
import { useDictionary } from "@/components/i18n/locale-provider";
import { readOrderEdit } from "@/lib/orders/edit";
import { isQuoteTravelType, quoteTravelTypes } from "@/lib/quote-travel-types";
import { ORDER_STATUSES, type StaffOrder } from "@/types/dashboard";

export function OrderEditor({ order, draftKey, onSaved }: {
  order: StaffOrder;
  draftKey: string;
  onSaved: (order: StaffOrder) => void;
}) {
  const dictionary = useDictionary();
  const staff = dictionary.staffDashboard;
  const labels = staff.orderEdit;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [version, setVersion] = useState(order.updatedAt);
  const [draftStatus, setDraftStatus] = useState<"empty" | "saved" | "failed">("empty");
  const [ready, setReady] = useState(false);
  const purpose = draft.travelType ?? order.travelType ?? "";

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (raw) {
        const saved = JSON.parse(raw);
        setDraft(saved.fields);
        setVersion(saved.version);
        setDraftStatus("saved");
      }
    } catch { setDraftStatus("failed"); }
    setReady(true);
  }, [draftKey]);

  useEffect(() => {
    if (!busy && draftStatus !== "failed") return;
    function warn(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ""; }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy, draftStatus]);

  function change(name: string, value: string) {
    const fields = { ...draft, [name]: value };
    setDraft(fields);
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({ version, fields }));
      setDraftStatus("saved");
    } catch { setDraftStatus("failed"); }
  }

  function discard() {
    sessionStorage.removeItem(draftKey);
    setDraft({});
    setVersion(order.updatedAt);
    setDraftStatus("empty");
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      if (order.updatedAt) {
        if (version !== order.updatedAt) { setError(labels.changed); return; }
        const result = await manageOrder(order.id, order.updatedAt, form);
        if (result.error) setError(labels[result.error]);
        else if (result.order) { discard(); setVersion(result.order.updatedAt); onSaved(result.order); }
      } else {
        const edit = readOrderEdit(form);
        if (!edit) setError(labels.invalid);
        else { discard(); onSaved({ ...order, ...edit, routeEstimate: edit.origin === order.origin &&
          edit.destination === order.destination ? order.routeEstimate : null }); }
      }
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
    <form id="edit" onSubmit={submit} className="scroll-mt-24 space-y-5 border-t border-line pt-5">
        <h2 className="text-xl font-semibold">{staff.editTransport}</h2>
        <fieldset disabled={busy || !ready} className="grid gap-3 text-sm sm:grid-cols-2">
            {fields.map(([name, label, value, type]) => (
              <label key={name}>{label}<input className={inputClass} name={name} type={type} value={draft[name] ?? value ?? ""} onChange={(e) => change(name, e.target.value)}
                required={type === "number"} min={type === "number" ? 1 : undefined} /></label>
            ))}
            <label>{staff.state}<select name="status" className={inputClass} value={draft.status ?? order.status} onChange={(e) => change("status", e.target.value)}>
              {ORDER_STATUSES.map((status) => <option key={status} value={status}>{staff.orderStates[status]}</option>)}
            </select></label>
            <label>{dictionary.quote.travelTypeLabel}<select className={inputClass} name="travelType" value={purpose} onChange={(e) => change("travelType", e.target.value)}>
              <option value="">—</option>
              {order.travelType && !isQuoteTravelType(order.travelType) && <option>{order.travelType}</option>}
              {quoteTravelTypes.map((type) => <option key={type} value={type}>{dictionary.quote.travelTypeOptions[type]}</option>)}
            </select></label>
            {purpose === "other" && <label>{dictionary.quote.travelTypeOptions.other}<input className={inputClass}
              name="travelTypeDetail" value={draft.travelTypeDetail ?? order.travelTypeDetail ?? ""} onChange={(e) => change("travelTypeDetail", e.target.value)} /></label>}
          </fieldset>
        {error && <p role="alert" className="text-rose-200">{error}</p>}
        <p role="status" className="text-sm text-mist">{busy ? staff.savingTransport : draftStatus === "saved" ? staff.draftSaved : draftStatus === "failed" ? labels.failed : ""}</p>
        <div className="flex justify-end gap-3">
          {draftStatus !== "empty" && <button type="button" disabled={busy} onClick={discard}>{staff.discardDraft}</button>}
          <button type="submit" disabled={busy || !ready || draftStatus === "empty"} className="rounded-lg bg-burgundy px-3 py-2 text-white disabled:opacity-50">{labels.save}</button>
        </div>
    </form>
  );
}
