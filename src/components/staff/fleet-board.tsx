import { FleetBoardClient } from "@/components/staff/fleet-board-client";
import { listOrders } from "@/lib/data/orders";
import { listVehicles } from "@/lib/data/vehicles";
import { getDictionary, getLocale } from "@/lib/i18n/get-dictionary";
import { hasSupabaseStaffEnv } from "@/lib/supabase/staff";

export async function FleetBoard() {
  const [dictionary, locale] = await Promise.all([getDictionary(), getLocale()]);
  let vehicles;

  try {
    vehicles = await listVehicles();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : dictionary.staffDashboard.fleetLoadError;
    return (
      <p className="rounded-2xl bg-burgundy/15 px-5 py-4 text-sm text-rose-200" role="alert">
        {message}
      </p>
    );
  }

  const orders = await listOrders().catch(() => []);

  return (
    <div className="space-y-4">
      {!hasSupabaseStaffEnv() ? (
        <p className="rounded-2xl border border-line bg-card px-4 py-3 text-xs text-mist">
          {dictionary.staffDashboard.demoNote}
        </p>
      ) : null}
      <FleetBoardClient
        vehicles={vehicles}
        orders={orders}
        locale={locale}
        labels={{
          passengers: dictionary.fleet.passengers,
          fleetTitle: dictionary.staffDashboard.fleetTitle,
          plate: dictionary.staffDashboard.plate,
          capacity: dictionary.staffDashboard.capacity,
          insurance: dictionary.staffDashboard.insurance,
          inspection: dictionary.staffDashboard.inspection,
          readiness: dictionary.staffDashboard.readiness,
          readinessReady: dictionary.staffDashboard.readinessReady,
          readinessAttention: dictionary.staffDashboard.readinessAttention,
          readinessBlocked: dictionary.staffDashboard.readinessBlocked,
          noExpiry: dictionary.staffDashboard.noExpiry,
          fleetEmpty: dictionary.staffDashboard.fleetEmpty,
          availabilityRange: dictionary.staffDashboard.availabilityRange,
          availableFrom: dictionary.staffDashboard.availableFrom,
          availableTo: dictionary.staffDashboard.availableTo,
          clearRange: dictionary.staffDashboard.clearRange,
          rangeInvalid: dictionary.staffDashboard.rangeInvalid,
          noFleetInRange: dictionary.staffDashboard.noFleetInRange,
        }}
      />
    </div>
  );
}
