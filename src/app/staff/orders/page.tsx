import { Suspense } from "react";
import type { Metadata } from "next";
import { OrdersTable } from "@/components/staff/orders-table";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.staffDashboard.ordersTitle };
}

export default async function StaffOrdersPage() {
  const dictionary = await getDictionary();

  return (
    <Suspense fallback={<p className="text-sm text-mist">{dictionary.employees.loading}</p>}>
      <OrdersTable />
    </Suspense>
  );
}
