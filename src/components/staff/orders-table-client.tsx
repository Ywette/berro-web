"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAssignedOrders } from "./use-assigned-orders";
import { useDictionary } from "@/components/i18n/locale-provider";
import { formatDate } from "@/lib/content/format-date";
import { filterOrders } from "@/lib/orders/filter";
import { formatRouteAddress } from "@/lib/orders/format-address";
import { ORDER_STATUSES, isOrderStatus, type OrderStatus, type StaffOrder } from "@/types/dashboard";

const stageOrder: OrderStatus[] = ["new", "transport", "calculated", "sent", "approved", "paid"];

function StageIcon({ status }: { status: OrderStatus }) {
  const paths: Record<OrderStatus, React.ReactNode> = {
    new: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    transport: <><rect x="4" y="3" width="16" height="16" rx="3" /><path d="M4 10h16M7 19v2m10-2v2M8 15h.01M16 15h.01" /></>,
    calculated: <><path d="M18 5.5A7 7 0 0 0 7 12a7 7 0 0 0 11 6.5M4 10h10M4 14h10" /></>,
    sent: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    approved: <path d="m4 12 5 5L20 6" />,
    paid: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M5 9h1m12 6h1" /></>,
    cancelled: <path d="M6 6l12 12M18 6 6 18" />,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">{paths[status]}</svg>;
}

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
    return `${formatRouteAddress(order.origin || "—")} → ${formatRouteAddress(order.destination || "—")}`;
  }

  function date(order: StaffOrder) {
    const time = order.departureAt?.match(/T(\d{2}:\d{2})/)?.[1];
    return `${formatDate(order.departureOn)}${time ? ` · ${time}` : ""}`;
  }

  function badge(order: StaffOrder) {
    const completed = new Set(["new", order.status, ...(order.completedStatuses ?? [])]);
    return <div className="flex flex-wrap gap-1" aria-label={staff.state}>
      {order.status === "cancelled" && <span className="rounded-lg border border-staff-danger-line bg-staff-danger-surface px-2 py-1 text-xs text-staff-danger">{staff.orderStates.cancelled}</span>}
      {stageOrder.map((stage) => {
        const active = completed.has(stage);
        const stageName = stage === "sent" ? staff.stageSent : staff.orderStates[stage];
        const label = `${stageName} · ${active ? staff.stageComplete : staff.stagePending}`;
        return <span key={stage} title={label} aria-label={label} role="img"
          className={`grid h-8 w-8 place-items-center rounded-lg border ${active
            ? "border-staff-success-line bg-staff-success-surface text-staff-success"
            : "border-line bg-staff-subtle text-mist"}`}>
          <StageIcon status={stage} />
        </span>;
      })}
    </div>;
  }

  function actions(order: StaffOrder) {
    const orderUrl = detailsUrl(order);
    return (
      <div className="flex items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
        {order.planDocumentPath && (
          <a href={`/api/staff/order-document?id=${encodeURIComponent(order.id)}`} target="_blank" rel="noopener noreferrer"
            aria-label={`${dictionary.pricing.planDocument} · ${order.reference}`} title={dictionary.pricing.planDocument}
            className="grid min-h-10 min-w-10 place-items-center rounded-lg text-mist hover:bg-staff-hover hover:text-ivory">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 11.5 12 20.5a6 6 0 0 1-8.5-8.5l9-9a4 4 0 0 1 5.7 5.7l-9 9a2 2 0 0 1-2.8-2.8l8.5-8.5" /></svg>
          </a>
        )}
        <Link href={orderUrl + "#edit"} onNavigate={rememberPosition}
          aria-label={`${staff.editTransport} · ${order.reference}`} title={staff.editTransport}
          className="grid min-h-10 min-w-10 place-items-center rounded-lg text-ivory hover:bg-staff-hover hover:text-ivory">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 5 4 4M4 20l4.5-.9L20 7.6a2.1 2.1 0 0 0 0-3l-.6-.6a2.1 2.1 0 0 0-3 0L4.9 15.5 4 20Z" /></svg>
        </Link>
        <Link href={orderUrl + "&delete=1"} onNavigate={rememberPosition}
          aria-label={`${staff.deleteOrder} · ${order.reference}`} title={staff.deleteOrder}
          className="grid min-h-10 min-w-10 place-items-center rounded-lg text-staff-danger hover:bg-staff-danger-surface">
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
            placeholder={labels.placeholder} className="h-11 w-full rounded-xl border border-staff-control bg-night px-4 text-sm text-ivory outline-none placeholder:text-mist focus:border-staff-danger-line" />
        </label>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={staff.state}>
          <button type="button" aria-pressed={!status} onClick={() => setFilter("status", "")} className={`min-h-10 rounded-full border px-4 text-xs font-medium ${!status ? "border-burgundy bg-burgundy text-staff-on-accent" : "border-staff-control text-mist hover:text-ivory"}`}>{labels.all}</button>
          {ORDER_STATUSES.map((item) => <button key={item} type="button" aria-pressed={status === item} onClick={() => setFilter("status", item)} className={`min-h-10 rounded-full border px-4 text-xs font-medium ${status === item ? "border-burgundy bg-burgundy text-staff-on-accent" : "border-staff-control text-mist hover:text-ivory"}`}>{staff.orderStates[item]}</button>)}
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
                  <th className="w-[25%] px-3 py-4 font-medium lg:w-[23%]">{staff.state}</th>
                  <th className="w-32 px-3 py-4 font-medium"><span className="sr-only">{labels.actions}</span></th>
                </tr>
              </thead>
              <tbody>{filtered.map((order) => {
                const url = detailsUrl(order);
                return <tr key={order.id} onClick={(event) => {
                  if ((event.target as HTMLElement).closest("a,button,select,summary,details")) return;
                  rememberPosition(); router.push(url);
                }} className="cursor-pointer border-b border-line last:border-0 hover:bg-staff-hover">
                  <td className="px-3 py-4 align-top"><Link href={url} onNavigate={rememberPosition} className="font-semibold text-ivory hover:underline">{order.reference}</Link><p className="mt-1 break-words text-xs text-mist lg:hidden">{order.requestorName || "—"}</p></td>
                  <td className="hidden break-words px-3 py-4 align-top text-ivory lg:table-cell">{order.requestorName || "—"}{order.requestorCompany && <p className="mt-1 text-xs text-mist">{order.requestorCompany}</p>}</td>
                  <td className="break-words px-3 py-4 align-top">{date(order)}</td>
                  <td className="break-words px-3 py-4 align-top text-ivory">{route(order)}{Boolean(order.stops?.length) && <p className="mt-1 text-xs text-mist">+ {order.stops!.length} {labels.stops}</p>}</td>
                  <td className="hidden px-3 py-4 align-top lg:table-cell">{order.passengerCount}</td>
                  <td className="px-3 py-4 align-top">{badge(order)}</td>
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
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-mist"><span>{date(order)}</span><span>{order.passengerCount} {staff.passengers.toLocaleLowerCase()}</span></div>
              <div className="mt-4 flex items-center gap-2 border-t border-line pt-3"><Link href={url} onNavigate={rememberPosition} className="flex min-h-11 flex-1 items-center justify-center rounded-xl border border-staff-control px-3 text-sm font-medium text-ivory hover:bg-staff-hover">{labels.open}</Link>{actions(order)}</div>
            </article>;
          })}</div>
        </>
      )}
    </div>
  );
}
