import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { OrdersTable } from "@/components/staff/orders-table";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.staffDashboard.ordersTitle };
}

export default async function StaffOrdersPage({searchParams}: PageProps<"/staff/orders">) {
  const dictionary = await getDictionary();

  return (
    <Suspense fallback={<p className="text-sm text-mist">{dictionary.employees.loading}</p>}>
      <OrdersList searchParams={searchParams} />
    </Suspense>
  );
}

async function OrdersList({ searchParams }: Pick<PageProps<"/staff/orders">, "searchParams">) {
  const { order } = await searchParams;
  if (typeof order === "string" && order) redirect(`/staff/orders/${encodeURIComponent(order)}`);
  return <OrdersTable />;
}
