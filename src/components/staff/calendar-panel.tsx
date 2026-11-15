import { StaffCalendarClient } from "@/components/staff/staff-calendar-client";
import { listEmployees } from "@/lib/data/employees";
import { listOrders } from "@/lib/data/orders";
import { listVehicles } from "@/lib/data/vehicles";
import { getDictionary, getLocale } from "@/lib/i18n/get-dictionary";

export async function CalendarPanel() {
  const [dictionary, locale] = await Promise.all([getDictionary(), getLocale()]);

  let employees: Awaited<ReturnType<typeof listEmployees>> = [];
  let vehicles: Awaited<ReturnType<typeof listVehicles>> = [];
  let orders: Awaited<ReturnType<typeof listOrders>> = [];
  let loadError: string | null = null;

  try {
    [employees, vehicles, orders] = await Promise.all([listEmployees(), listVehicles(), listOrders()]);
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : dictionary.staffDashboard.ordersLoadError;
  }

  if (loadError) {
    return (
      <p className="rounded-2xl bg-burgundy/15 px-5 py-4 text-sm text-rose-200" role="alert">
        {loadError}
      </p>
    );
  }

  return (
    <StaffCalendarClient
      employees={employees}
      vehicles={vehicles}
      orders={orders}
      locale={locale}
      labels={{
        availabilityRange: dictionary.staffDashboard.availabilityRange,
        clearRange: dictionary.staffDashboard.clearRange,
        allEmployees: dictionary.staffDashboard.allEmployees,
        allTransports: dictionary.staffDashboard.allTransports,
        availableStaff: dictionary.staffDashboard.availableStaff,
        scheduledStaff: dictionary.staffDashboard.scheduledStaff,
        availableVehicles: dictionary.staffDashboard.availableVehicles,
        scheduledVehicles: dictionary.staffDashboard.scheduledVehicles,
        viewStaffAvailable: dictionary.staffDashboard.viewStaffAvailable,
        viewStaffScheduled: dictionary.staffDashboard.viewStaffScheduled,
        viewFleetAvailable: dictionary.staffDashboard.viewFleetAvailable,
        viewFleetScheduled: dictionary.staffDashboard.viewFleetScheduled,
        noStaffInRange: dictionary.staffDashboard.noStaffInRange,
        noFleetInRange: dictionary.staffDashboard.noFleetInRange,
        noStaffScheduled: dictionary.staffDashboard.noStaffScheduled,
        noFleetScheduled: dictionary.staffDashboard.noFleetScheduled,
        monthPrev: dictionary.staffDashboard.monthPrev,
        monthNext: dictionary.staffDashboard.monthNext,
        today: dictionary.staffDashboard.today,
        busy: dictionary.staffDashboard.busy,
        free: dictionary.staffDashboard.free,
        employeesSection: dictionary.staffDashboard.employees,
        fleetSection: dictionary.staffDashboard.fleet,
        roles: dictionary.roles,
      }}
    />
  );
}
