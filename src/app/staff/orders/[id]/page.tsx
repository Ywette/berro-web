import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderPageClient } from "@/components/staff/order-page-client";
import { getOrder } from "@/lib/data/orders";
import { listVehicles } from "@/lib/data/vehicles";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({ params }: PageProps<"/staff/orders/[id]">): Promise<Metadata> {
  const [{ id }, dictionary] = await Promise.all([params, getDictionary()]);
  const order = await getOrder(decodeURIComponent(id)).catch(() => null);
  return { title: order ? order.reference : dictionary.staffDashboard.ordersTitle };
}

export default function StaffOrderPage({ params }: PageProps<"/staff/orders/[id]">) {
  return (
    <Suspense fallback={<div className="mx-auto min-h-[50vh] max-w-3xl" />}>
      <StaffOrder params={params} />
    </Suspense>
  );
}

async function StaffOrder({ params }: { params: PageProps<"/staff/orders/[id]">["params"] }) {
  const [{ id }, dictionary] = await Promise.all([params, getDictionary()]);
  let order;
  try {
    order = await getOrder(decodeURIComponent(id));
  } catch (error) {
    const message = error instanceof Error ? error.message : dictionary.staffDashboard.ordersLoadError;
    return <p className="rounded-2xl bg-burgundy/15 px-5 py-4 text-sm text-rose-200" role="alert">{message}</p>;
  }
  if (!order) {
    return <p className="rounded-2xl border border-line bg-card px-5 py-6 text-sm text-mist">{dictionary.staffDashboard.orderPage.notFound}</p>;
  }

  const vehicles = order.assignedVehicleId ? await listVehicles().catch(() => []) : [];
  return (
    <OrderPageClient
      key={order.updatedAt ?? order.id}
      initialOrder={order}
      vehicle={vehicles.find((vehicle) => vehicle.id === order.assignedVehicleId)}
    />
  );
}
