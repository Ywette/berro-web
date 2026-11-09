import { OrdersTableClient } from "@/components/staff/orders-table-client";
import { listOrders } from "@/lib/data/orders";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hasSupabaseStaffEnv } from "@/lib/supabase/staff";

export async function OrdersTable() {
  const dictionary = await getDictionary();
  let orders;

  try {
    orders = await listOrders();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : dictionary.staffDashboard.ordersLoadError;
    return (
      <p className="rounded-2xl bg-burgundy/15 px-5 py-4 text-sm text-rose-200" role="alert">
        {message}
      </p>
    );
  }

  return (
    <OrdersTableClient
      initialOrders={orders}
      demoNote={hasSupabaseStaffEnv() ? null : dictionary.staffDashboard.demoNote}
    />
  );
}
