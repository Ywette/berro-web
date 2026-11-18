"use client";

import { useEffect, useState, type FormEvent } from "react";
import { manageOrder } from "@/actions/manage-orders";
import { useDictionary } from "@/components/i18n/locale-provider";
import { readOrderEdit } from "@/lib/orders/edit";
import { isQuoteTravelType, quoteTravelTypes } from "@/lib/quote-travel-types";
import { ORDER_STATUSES, type StaffOrder } from "@/types/dashboard";
import { setOrderStatus } from "@/lib/orders/statuses";

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
  const [initial] = useState(() => {
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.fields && typeof saved.fields === "object" &&
            Object.values(saved.fields).every((value) => typeof value === "string")) {
          return { fields: saved.fields as Record<string, string>, version: saved.version as string | undefined, status: "saved" as const };
        }
      }
    } catch { /* A blocked store is reported when the first edit is made. */ }
    return { fields: {}, version: order.updatedAt, status: "empty" as const };
  });
  const [draft, setDraft] = useState<Record<string, string>>(initial.fields);
  const [version, setVersion] = useState(initial.version);
  const [draftStatus, setDraftStatus] = useState<"empty" | "saved" | "failed">(initial.status);
  const purpose = draft.travelType ?? order.travelType ?? "";

  useEffect(() => {
    if (!busy && draftStatus !== "failed" && !error) return;
    function warn(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ""; }
    window.addEventListener("beforeunload", warn);
    function warnOnLink(event: MouseEvent) {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!link || link.getAttribute("target") === "_blank" || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (!window.confirm(staff.leaveOrder)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    document.addEventListener("click", warnOnLink, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", warnOnLink, true);
    };
  }, [busy, draftStatus, error, staff.leaveOrder]);

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
        else { discard(); onSaved({ ...order, ...edit, ...setOrderStatus(order.status, order.completedStatuses ?? [], edit.status), routeEstimate: edit.origin === order.origin &&
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
        <fieldset disabled={busy} className="grid gap-3 text-sm sm:grid-cols-2">
            {fields.map(([name, label, value, type]) => (
              <label key={name}>{label}<input className={inputClass} name={name} type={type} value={draft[name] ?? value ?? ""} onChange={(e) => change(name, e.target.value)}
                required={type === "number"} min={type === "number" ? 1 : undefined} /></label>
            ))}
            <label>{staff.state}<select name="status" className={inputClass} value={draft.status ?? order.status} onChange={(e) => change("status", e.target.value)}>
              {ORDER_STATUSES.filter((status) => order.status === "cancelled" ? status === "cancelled" : status !== "cancelled").map((status) => <option key={status} value={status}>{staff.orderStates[status]}</option>)}
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
        </div>
    </form>
  );
}
