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
    [employees, vehicles, orders] = await Promise.all([
      listEmployees(), listVehicles(), listOrders(),
    ]);
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : dictionary.staffDashboard.ordersLoadError;
  }

  if (loadError) {
    return (
      <p className="rounded-2xl bg-burgundy/15 px-5 py-4 text-sm text-staff-danger" role="alert">
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
        availableFrom: dictionary.staffDashboard.availableFrom,
        availableTo: dictionary.staffDashboard.availableTo,
        rangeInvalid: dictionary.staffDashboard.rangeInvalid,
        wholeDay: dictionary.staffDashboard.wholeDay,
        clearRange: dictionary.staffDashboard.clearRange,
        allEmployees: dictionary.staffDashboard.calendarAllDrivers,
        allTransports: dictionary.staffDashboard.allTransports,
        viewStaffAvailable: dictionary.staffDashboard.viewStaffAvailable,
        viewStaffScheduled: dictionary.staffDashboard.viewStaffScheduled,
        viewFleetAvailable: dictionary.staffDashboard.viewFleetAvailable,
        viewFleetScheduled: dictionary.staffDashboard.viewFleetScheduled,
        monthPrev: dictionary.staffDashboard.monthPrev,
        monthNext: dictionary.staffDashboard.monthNext,
        yearPrev: dictionary.staffDashboard.yearPrev,
        yearNext: dictionary.staffDashboard.yearNext,
        today: dictionary.staffDashboard.today,
        busy: dictionary.staffDashboard.busy,
        free: dictionary.staffDashboard.free,
        unavailable: dictionary.statuses.unavailable,
        employeesSection: dictionary.staffDashboard.calendarDrivers,
        fleetSection: dictionary.staffDashboard.fleet,
        fleetKinds: dictionary.staffDashboard.calendarFleetKinds,
        orderSection: dictionary.staffDashboard.ordersTitle,
        departureDate: dictionary.quote.departureDate,
        orderReserved: dictionary.staffDashboard.calendarOrderReserved,
        orderReady: dictionary.staffDashboard.calendarOrderReady,
        roles: dictionary.roles,
      }}
    />
  );
}
