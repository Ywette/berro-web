import type { OrderStatus, StaffOrder } from "@/types/dashboard";

export function filterOrders(orders: StaffOrder[], query: string, status: OrderStatus | "") {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return orders.filter((order) => {
    if (status && status !== "new" && order.status !== status &&
        !(order.completedStatuses ?? []).includes(status)) return false;
    const text = [order.reference, order.requestorName, order.requestorCompany, order.origin,
      order.destination, order.returnTo, ...(order.stops ?? []).map((stop) => stop.name)]
      .filter(Boolean).join(" ").toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
}
