"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import { mergeOrdersWithSession } from "@/lib/orders/session-orders";
import type { OrderStatus, StaffOrder } from "@/types/dashboard";

const statusTone: Record<OrderStatus, string> = {
  new: "bg-white/8 text-ivory/80",
  in_progress: "bg-burgundy/20 text-rose-200",
  sent: "bg-white/10 text-mist",
  approved: "bg-pine/15 text-pine",
  paid: "bg-pine/25 text-pine",
};

export function OrdersTableClient({
  initialOrders,
  demoNote,
}: {
  initialOrders: StaffOrder[];
  demoNote: string | null;
}) {
  const dictionary = useDictionary();
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    setOrders(mergeOrdersWithSession(initialOrders));
  }, [initialOrders]);

  return (
    <div className="space-y-4">
      {demoNote ? (
        <p className="rounded-2xl border border-line bg-card px-4 py-3 text-xs text-mist">{demoNote}</p>
      ) : null}

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card px-5 py-6 text-sm text-mist">
          {dictionary.staffDashboard.ordersEmpty}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/5 text-mist">
              <tr>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.orderId}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.route}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.passengers}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.requestor}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.state}</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">
                  {dictionary.staffDashboard.assignedDriver}
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-line align-top">
                  <td className="px-4 py-3 font-medium text-ivory">{order.reference}</td>
                  <td className="px-4 py-3 text-ivory/90">
                    <p>
                      {order.origin} → {order.destination}
                      {order.returnTo ? ` → ${order.returnTo}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-mist">
                      {order.returnTo ? null : dictionary.staffDashboard.oneWay}
                      {order.departureOn ? (
                        <span>
                          {order.returnTo ? "" : " · "}
                          {order.departureOn}
                          {order.returnOn && order.returnOn !== order.departureOn
                            ? ` → ${order.returnOn}`
                            : ""}
                        </span>
                      ) : null}
                    </p>
                  </td>
                  <td className="px-4 py-3">{order.passengerCount}</td>
                  <td className="px-4 py-3">
                    <p className="text-ivory">{order.requestorName ?? "—"}</p>
                    <p className="mt-1 text-xs text-mist">{order.requestorEmail ?? "—"}</p>
                    <p className="text-xs text-mist">{order.requestorPhone ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs ${statusTone[order.status]}`}
                    >
                      {dictionary.staffDashboard.orderStates[order.status]}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-mist lg:table-cell">
                    {order.assignedDriverName ?? dictionary.staffDashboard.unassigned}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
