import { OrdersTableClient } from "@/components/staff/orders-table-client";
import { listEmployees } from "@/lib/data/employees";
import { listOrders } from "@/lib/data/orders";
import { listVehicles } from "@/lib/data/vehicles";
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

  const [employees, vehicles] = await Promise.all([
    listEmployees().catch(() => []),
    listVehicles().catch(() => []),
  ]);

  return (
    <OrdersTableClient
      initialOrders={orders}
      employees={employees}
      vehicles={vehicles}
      demoNote={hasSupabaseStaffEnv() ? null : dictionary.staffDashboard.demoNote}
    />
  );
}
