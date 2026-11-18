"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { sendOrderOffer } from "@/actions/send-order-offer";
import { useDictionary } from "@/components/i18n/locale-provider";
import { OrderEditFields } from "@/components/staff/order-edit-fields";
import { OrderSummary } from "@/components/staff/order-summary";
import type { FleetVehicle } from "@/lib/content/fleet";
import { applyOrderChange } from "@/lib/orders/apply-change";
import type { StaffOrder } from "@/types/dashboard";

type Notice = { tone: "ok" | "error"; text: string } | null;

const buttonClass = "rounded-lg border border-line px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50";
const primaryClass = "rounded-lg bg-burgundy px-4 py-2 text-sm text-white disabled:opacity-50";

/** Order opened in its own tab: summary first, with Edit, Calculate and Send to customer. */
export function OrderPageClient({ initialOrder, vehicle }: { initialOrder: StaffOrder; vehicle?: FleetVehicle }) {
  const dictionary = useDictionary();
  const staff = dictionary.staffDashboard;
  const labels = staff.orderPage;
  const [order, setOrder] = useState(initialOrder);
  const [mode, setMode] = useState<"summary" | "edit" | "confirmSend">("summary");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const result = await applyOrderChange(order, new FormData(event.currentTarget));
      if (result.error) setNotice({ tone: "error", text: staff.orderEdit[result.error] });
      else if (result.order) {
        setOrder(result.order);
        setMode("summary");
      }
    } catch {
      setNotice({ tone: "error", text: staff.orderEdit.failed });
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    if (busy || !order.updatedAt) return;
    setBusy(true);
    setNotice(null);
    try {
      const result = await sendOrderOffer(order.id, order.updatedAt);
      if (result.error) {
        const text = result.error in labels ? labels[result.error as keyof typeof labels] : staff.orderEdit[result.error as keyof typeof staff.orderEdit];
        setNotice({ tone: "error", text });
      } else {
        setOrder(result.order);
        setNotice({ tone: "ok", text: `${labels.sent} ${result.order.requestorEmail}` });
      }
    } catch {
      setNotice({ tone: "error", text: labels.emailFailed });
    } finally {
      setBusy(false);
      setMode("summary");
    }
  }

  function startSend() {
    setNotice(null);
    if (!order.updatedAt) return setNotice({ tone: "error", text: labels.demo });
    if (order.price == null) return setNotice({ tone: "error", text: labels.noPrice });
    if (!order.requestorEmail?.trim()) return setNotice({ tone: "error", text: labels.noEmail });
    setMode("confirmSend");
  }

  return (
    <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-line bg-card p-5 text-ivory sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{order.reference}</h1>
          <p className="text-sm text-mist">{staff.orderStates[order.status]}</p>
        </div>
        <Link href="/staff/orders" className="text-sm text-mist underline">{labels.allOrders}</Link>
      </header>

      {mode === "edit" ? (
        <form onSubmit={save} className="space-y-5">
          <OrderEditFields order={order} disabled={busy} />
          {notice && <NoticeLine notice={notice} />}
          <div className="flex justify-end gap-3">
            <button type="button" disabled={busy} onClick={() => { setNotice(null); setMode("summary"); }} className={buttonClass}>
              {labels.cancel}
            </button>
            <button type="submit" disabled={busy} className={primaryClass}>{staff.orderEdit.save}</button>
          </div>
        </form>
      ) : (
        <>
          <OrderSummary order={order} vehicle={vehicle} />
          {notice && <NoticeLine notice={notice} />}
          {mode === "confirmSend" ? (
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4">
              <p className="mr-auto text-sm">{labels.sendConfirm} <strong>{order.requestorEmail}</strong>?</p>
              <button type="button" disabled={busy} onClick={() => setMode("summary")} className={buttonClass}>{labels.cancel}</button>
              <button type="button" disabled={busy} onClick={send} className={primaryClass}>
                {busy ? labels.sending : labels.confirmSend}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-4">
              <button type="button" onClick={() => { setNotice(null); setMode("edit"); }} className={buttonClass}>{labels.edit}</button>
              <Link href={`/staff/calculation?order=${encodeURIComponent(order.id)}`} className={buttonClass}>{labels.calculate}</Link>
              <button type="button" onClick={startSend} className={primaryClass}>{labels.send}</button>
            </div>
          )}
        </>
      )}
    </article>
  );
}

function NoticeLine({ notice }: { notice: NonNullable<Notice> }) {
  return (
    <p role={notice.tone === "error" ? "alert" : "status"}
      className={notice.tone === "error" ? "text-sm text-rose-200" : "text-sm text-pine"}>
      {notice.text}
    </p>
  );
}
