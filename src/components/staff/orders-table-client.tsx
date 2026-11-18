"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAssignedOrders } from "./use-assigned-orders";
import { useDictionary } from "@/components/i18n/locale-provider";
import { intlLocales } from "@/lib/i18n/locale";
import { formatDate } from "@/lib/content/format-date";
import { filterOrders } from "@/lib/orders/filter";
import { ORDER_STATUSES, isOrderStatus, type OrderStatus, type StaffOrder } from "@/types/dashboard";

const statusTone: Record<OrderStatus, string> = {
  new: "border-sky-300/25 bg-sky-300/10 text-sky-100",
  calculated: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  transport: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  sent: "border-violet-300/25 bg-violet-300/10 text-violet-100",
  approved: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  paid: "border-teal-300/25 bg-teal-300/10 text-teal-100",
};

export function OrdersTableClient({ initialOrders, demoNote }: {
  initialOrders: StaffOrder[];
  demoNote: string | null;
}) {
  const dictionary = useDictionary();
  const staff = dictionary.staffDashboard;
  const labels = staff.ordersList;
  const [orders] = useAssignedOrders(initialOrders);
  const searchParams = useSearchParams();
  const router = useRouter();
  const table = useRef<HTMLDivElement>(null);
  const query = searchParams.get("q") ?? "";
  const requestedStatus = searchParams.get("status");
  const status = requestedStatus && isOrderStatus(requestedStatus) ? requestedStatus : "";
  const priceFormat = new Intl.NumberFormat(intlLocales[dictionary.locale], { style: "currency", currency: "EUR" });

  function setFilter(key: string, value: string) {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    window.history.replaceState(null, "", url);
  }

  function rememberPosition() {
    sessionStorage.setItem("staff-orders-position", JSON.stringify([window.scrollY, table.current?.scrollLeft ?? 0]));
  }

  useEffect(() => {
    const stored = sessionStorage.getItem("staff-orders-position");
    if (!stored) return;
    const frame = requestAnimationFrame(() => {
      try {
        const [top, left] = JSON.parse(stored);
        window.scrollTo(0, top);
        if (table.current) table.current.scrollLeft = left;
      } catch { /* Ignore an invalid saved position. */ }
      sessionStorage.removeItem("staff-orders-position");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const filtered = useMemo(() => filterOrders(orders, query, status), [orders, query, status]);

  function detailsUrl(order: StaffOrder) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (status) params.set("status", status);
    const back = params.size ? `/staff/orders?${params}` : "/staff/orders";
    return `/staff/orders/${encodeURIComponent(order.id)}?back=${encodeURIComponent(back)}`;
  }

  function route(order: StaffOrder) {
    return `${order.origin || "—"} → ${order.destination || "—"}`;
  }

  function date(order: StaffOrder) {
    const time = order.departureAt?.match(/T(\d{2}:\d{2})/)?.[1];
    return `${formatDate(order.departureOn)}${time ? ` · ${time}` : ""}`;
  }

  function badge(order: StaffOrder) {
    return <span className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone[order.status]}`}>{staff.orderStates[order.status]}</span>;
  }

  function actions(order: StaffOrder) {
    const orderUrl = detailsUrl(order);
    return (
      <div className="flex items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
        {order.planDocumentPath && (
          <a href={`/api/staff/order-document?id=${encodeURIComponent(order.id)}`} target="_blank" rel="noopener noreferrer"
            aria-label={`${dictionary.pricing.planDocument} · ${order.reference}`} title={dictionary.pricing.planDocument}
            className="grid min-h-10 min-w-10 place-items-center rounded-lg text-mist hover:bg-white/10 hover:text-white">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 11.5 12 20.5a6 6 0 0 1-8.5-8.5l9-9a4 4 0 0 1 5.7 5.7l-9 9a2 2 0 0 1-2.8-2.8l8.5-8.5" /></svg>
          </a>
        )}
        <Link href={orderUrl + "#edit"} onNavigate={rememberPosition}
          aria-label={`${staff.editTransport} · ${order.reference}`} title={staff.editTransport}
          className="grid min-h-10 min-w-10 place-items-center rounded-lg text-ivory/80 hover:bg-white/10 hover:text-white">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 5 4 4M4 20l4.5-.9L20 7.6a2.1 2.1 0 0 0 0-3l-.6-.6a2.1 2.1 0 0 0-3 0L4.9 15.5 4 20Z" /></svg>
        </Link>
        <Link href={orderUrl + "&delete=1"} onNavigate={rememberPosition}
          aria-label={`${staff.deleteOrder} · ${order.reference}`} title={staff.deleteOrder}
          className="grid min-h-10 min-w-10 place-items-center rounded-lg text-rose-200 hover:bg-rose-300/10">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 13h12l1-13M9 7V4h6v3" /></svg>
        </Link>
      </div>
    );
  }

  return (
    <div ref={table} className="space-y-5">
      {demoNote && <p className="rounded-xl border border-line bg-card px-4 py-3 text-xs text-mist">{demoNote}</p>}
      <div className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-5">
        <label className="block">
          <span className="sr-only">{labels.search}</span>
          <input type="search" value={query} onChange={(event) => setFilter("q", event.target.value)}
            placeholder={labels.placeholder} className="h-11 w-full rounded-xl border border-white/15 bg-night px-4 text-sm text-ivory outline-none placeholder:text-mist focus:border-rose-300/70" />
        </label>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={staff.state}>
          <button type="button" aria-pressed={!status} onClick={() => setFilter("status", "")} className={`min-h-10 rounded-full border px-4 text-xs font-medium ${!status ? "border-burgundy bg-burgundy text-white" : "border-white/15 text-mist hover:text-white"}`}>{labels.all}</button>
          {ORDER_STATUSES.map((item) => <button key={item} type="button" aria-pressed={status === item} onClick={() => setFilter("status", item)} className={`min-h-10 rounded-full border px-4 text-xs font-medium ${status === item ? "border-burgundy bg-burgundy text-white" : "border-white/15 text-mist hover:text-white"}`}>{staff.orderStates[item]}</button>)}
          {(query || status) && <button type="button" onClick={() => { const url = new URL(window.location.href); url.searchParams.delete("q"); url.searchParams.delete("status"); window.history.replaceState(null, "", url); }} className="min-h-10 px-2 text-xs text-ivory underline">{labels.reset}</button>}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card p-6 text-sm text-mist">{orders.length ? labels.empty : staff.ordersEmpty}</p>
      ) : (
        <>
          <div className="hidden rounded-2xl border border-line bg-card md:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="border-b border-line text-xs text-mist">
                <tr>
                  <th className="w-[17%] px-3 py-4 font-medium lg:w-[12%]">{staff.orderId}</th>
                  <th className="hidden w-[15%] px-3 py-4 font-medium lg:table-cell">{staff.requestor}</th>
                  <th className="w-[17%] px-3 py-4 font-medium lg:w-[15%]">{dictionary.hero.departureAt}</th>
                  <th className="w-[25%] px-3 py-4 font-medium lg:w-[23%]">{staff.route}</th>
                  <th className="hidden w-[7%] px-3 py-4 font-medium lg:table-cell">{staff.passengers}</th>
                  <th className="w-[16%] px-3 py-4 font-medium lg:w-[12%]">{staff.state}</th>
                  <th className="w-[15%] px-3 py-4 font-medium lg:w-[10%]">{staff.orderPrice}</th>
                  <th className="w-32 px-3 py-4 font-medium"><span className="sr-only">{labels.actions}</span></th>
                </tr>
              </thead>
              <tbody>{filtered.map((order) => {
                const url = detailsUrl(order);
                return <tr key={order.id} onClick={(event) => {
                  if ((event.target as HTMLElement).closest("a,button,select,summary,details")) return;
                  rememberPosition(); router.push(url);
                }} className="cursor-pointer border-b border-line last:border-0 hover:bg-white/[0.035]">
                  <td className="px-3 py-4 align-top"><Link href={url} onNavigate={rememberPosition} className="font-semibold text-ivory hover:underline">{order.reference}</Link><p className="mt-1 break-words text-xs text-mist lg:hidden">{order.requestorName || "—"}</p></td>
                  <td className="hidden break-words px-3 py-4 align-top text-ivory lg:table-cell">{order.requestorName || "—"}{order.requestorCompany && <p className="mt-1 text-xs text-mist">{order.requestorCompany}</p>}</td>
                  <td className="break-words px-3 py-4 align-top">{date(order)}</td>
                  <td className="break-words px-3 py-4 align-top text-ivory/90">{route(order)}{Boolean(order.stops?.length) && <p className="mt-1 text-xs text-mist">+ {order.stops!.length} {labels.stops}</p>}</td>
                  <td className="hidden px-3 py-4 align-top lg:table-cell">{order.passengerCount}</td>
                  <td className="px-3 py-4 align-top">{badge(order)}</td>
                  <td className="break-words px-3 py-4 align-top">{order.price != null ? priceFormat.format(order.price) : "—"}</td>
                  <td className="px-2 py-2 align-top">{actions(order)}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">{filtered.map((order) => {
            const url = detailsUrl(order);
            return <article key={order.id} className="rounded-2xl border border-line bg-card p-4">
              <div className="flex items-start justify-between gap-3"><div><Link href={url} onNavigate={rememberPosition} className="font-semibold text-ivory underline-offset-4 hover:underline">{order.reference}</Link><p className="mt-1 text-sm text-mist">{order.requestorName || "—"}</p></div>{badge(order)}</div>
              <p className="mt-4 break-words font-medium text-ivory">{route(order)}</p>
              {Boolean(order.stops?.length) && <p className="mt-1 text-xs text-mist">+ {order.stops!.length} {labels.stops}</p>}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-mist"><span>{date(order)}</span><span>{order.passengerCount} {staff.passengers.toLocaleLowerCase()}</span>{order.price != null && <span className="font-medium text-ivory">{priceFormat.format(order.price)}</span>}</div>
              <div className="mt-4 flex items-center gap-2 border-t border-line pt-3"><Link href={url} onNavigate={rememberPosition} className="flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/20 px-3 text-sm font-medium text-ivory hover:bg-white/10">{labels.open}</Link>{actions(order)}</div>
            </article>;
          })}</div>
        </>
      )}
    </div>
  );
}
