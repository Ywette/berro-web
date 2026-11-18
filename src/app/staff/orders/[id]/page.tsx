import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";
import { getOrder, listOrders } from "@/lib/data/orders";
import { listEmployees } from "@/lib/data/employees";
import { listVehicles } from "@/lib/data/vehicles";
import { OrderWorkspace } from "@/components/staff/order-workspace";

type Props = PageProps<"/staff/orders/[id]">;

export default function OrderPage(props: Props) {
  return <Suspense fallback={null}><OrderContent {...props} /></Suspense>;
}

async function OrderContent({ params, searchParams }: Props) {
  const [{ id }, query, user] = await Promise.all([params, searchParams, requireUser()]);
  const [order, vehicles, employees, orders] = await Promise.all([
    getOrder(id), listVehicles().catch(() => []), listEmployees().catch(() => []), listOrders(),
  ]);
  const back = typeof query.back === "string" && /^\/staff\/orders(?:\?|$)/.test(query.back)
    ? query.back : "/staff/orders";
  return <OrderWorkspace key={id} id={id} initialOrder={order} userId={user.id}
    vehicles={vehicles} employees={employees} orders={orders} confirmDelete={query.delete === "1"} backUrl={back} />;
}
