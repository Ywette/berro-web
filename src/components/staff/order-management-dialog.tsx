"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { OrderEditFields } from "@/components/staff/order-edit-fields";
import { useDictionary } from "@/components/i18n/locale-provider";
import { applyOrderChange } from "@/lib/orders/apply-change";
import type { StaffOrder } from "@/types/dashboard";

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
      const result = await applyOrderChange(order, form);
      if (result.error) setError(labels[result.error]);
      else onSaved(result.order);
    } catch {
      setError(labels.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog ref={ref} aria-labelledby="manage-order-title" onCancel={(e) => { e.preventDefault(); if (!busy) onClose(); }}
      className="m-auto max-h-[90dvh] w-[min(38rem,94vw)] overflow-auto rounded-2xl border border-line bg-card p-6 text-ivory backdrop:bg-black/70">
      <form onSubmit={submit} className="space-y-5">
        <h2 id="manage-order-title" className="text-xl font-semibold">{mode === "edit" ? staff.editTransport : labels.remove} · {order.reference}</h2>
        {mode === "delete" ? <p>{labels.confirm} {order.reference}.</p> : (
          <OrderEditFields order={order} disabled={busy} />
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
