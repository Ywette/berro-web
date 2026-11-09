import { EmployeesSections } from "@/components/staff/employees-sections";
import { listDriverAvailability } from "@/lib/data/drivers";
import { listEmployees } from "@/lib/data/employees";
import { listOrders } from "@/lib/data/orders";
import { getDictionary, getLocale } from "@/lib/i18n/get-dictionary";
import { hasSupabaseStaffEnv } from "@/lib/supabase/staff";

export async function EmployeesPanel() {
  const [dictionary, locale] = await Promise.all([getDictionary(), getLocale()]);

  let drivers: Awaited<ReturnType<typeof listDriverAvailability>> = [];
  let employees: Awaited<ReturnType<typeof listEmployees>> = [];
  let orders: Awaited<ReturnType<typeof listOrders>> = [];
  let loadError: string | null = null;

  try {
    [drivers, employees, orders] = await Promise.all([
      listDriverAvailability(),
      listEmployees(),
      listOrders(),
    ]);
  } catch (error) {
    loadError = error instanceof Error ? error.message : dictionary.drivers.loadError;
  }

  return (
    <div className="space-y-5">
      {!hasSupabaseStaffEnv() ? (
        <p className="rounded-2xl border border-line bg-card px-4 py-3 text-xs text-mist">
          {dictionary.staffDashboard.demoNote}
        </p>
      ) : null}

      {loadError ? (
        <p className="rounded-2xl bg-burgundy/15 px-5 py-4 text-sm text-rose-200" role="alert">
          {loadError}
        </p>
      ) : (
        <EmployeesSections
          drivers={drivers}
          employees={employees}
          orders={orders}
          locale={locale}
          labels={{
            personnel: dictionary.staffDashboard.driversPersonnel,
            availability: dictionary.staffDashboard.driversAvailability,
            name: dictionary.employees.name,
            phone: dictionary.employees.phone,
            email: dictionary.employees.email,
            status: dictionary.drivers.status,
            active: dictionary.employees.active,
            yes: dictionary.employees.yes,
            no: dictionary.employees.no,
            empty: dictionary.drivers.empty,
            noPhone: dictionary.drivers.noPhone,
            monthPrev: dictionary.staffDashboard.monthPrev,
            monthNext: dictionary.staffDashboard.monthNext,
            today: dictionary.staffDashboard.today,
            busy: dictionary.staffDashboard.busy,
            free: dictionary.staffDashboard.free,
            noDrivers: dictionary.staffDashboard.noDrivers,
            statuses: dictionary.statuses,
            showAvailabilityForm: hasSupabaseStaffEnv(),
          }}
        />
      )}
    </div>
  );
}
