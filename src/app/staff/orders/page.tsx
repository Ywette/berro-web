import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrdersTable } from "@/components/staff/orders-table";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.staffDashboard.ordersTitle };
}

export default async function StaffOrdersPage({ searchParams }: PageProps<"/staff/orders">) {
  const dictionary = await getDictionary();

  return (
    <Suspense fallback={<p className="text-sm text-mist">{dictionary.employees.loading}</p>}>
      <LegacyOrderLink searchParams={searchParams} />
      <OrdersTable />
    </Suspense>
  );
}

/** Older staff emails link to /staff/orders?order=<id>; send them to the order page. */
async function LegacyOrderLink({ searchParams }: { searchParams: PageProps<"/staff/orders">["searchParams"] }) {
  const order = (await searchParams).order;
  const id = Array.isArray(order) ? order[0] : order;
  if (id) redirect(`/staff/orders/${encodeURIComponent(id)}`);
  return null;
}
