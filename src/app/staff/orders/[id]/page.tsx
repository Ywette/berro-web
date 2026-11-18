import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";
import { getOrder } from "@/lib/data/orders";
import { listVehicles } from "@/lib/data/vehicles";
import { OrderWorkspace } from "@/components/staff/order-workspace";

type Props = PageProps<"/staff/orders/[id]">;

export default function OrderPage(props: Props) {
  return <Suspense fallback={null}><OrderContent {...props} /></Suspense>;
}

async function OrderContent({ params, searchParams }: Props) {
  const [{ id }, query, user] = await Promise.all([params, searchParams, requireUser()]);
  const [order, vehicles] = await Promise.all([getOrder(id), listVehicles().catch(() => [])]);
  return <OrderWorkspace key={id} id={id} initialOrder={order} userId={user.id}
    vehicles={vehicles} confirmDelete={query.delete === "1"} />;
}
