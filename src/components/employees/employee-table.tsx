import { hasSupabaseEnv } from "@/lib/env";
import { requireUser } from "@/lib/auth/session";
import { listEmployees } from "@/lib/data/employees";
import { SetupNotice } from "@/components/layout/setup-notice";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { EmployeeRole } from "@/types/staff";

export async function EmployeeTable() {
  const dictionary = await getDictionary();

  if (!hasSupabaseEnv()) {
    return (
      <SetupNotice
        title={dictionary.employees.connectTitle}
        body={dictionary.employees.connectBody}
      />
    );
  }

  await requireUser();

  let employees;

  try {
    employees = await listEmployees();
  } catch (error) {
    const message = error instanceof Error ? error.message : dictionary.employees.loadError;
    return (
      <p className="rounded-2xl bg-burgundy/15 px-5 py-4 text-sm text-rose-200" role="alert">
        {message}
      </p>
    );
  }

  if (employees.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-card px-5 py-6 text-sm text-mist">
        {dictionary.employees.empty}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-mist">
          <tr>
            <th className="px-4 py-3 font-medium">{dictionary.employees.name}</th>
            <th className="px-4 py-3 font-medium">{dictionary.employees.role}</th>
            <th className="px-4 py-3 font-medium">{dictionary.employees.phone}</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">{dictionary.employees.email}</th>
            <th className="px-4 py-3 font-medium">{dictionary.employees.active}</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-t border-line">
              <td className="px-4 py-3 font-medium">{employee.fullName}</td>
              <td className="px-4 py-3">{dictionary.roles[employee.role as EmployeeRole]}</td>
              <td className="px-4 py-3">{employee.phone ?? "—"}</td>
              <td className="hidden px-4 py-3 md:table-cell">{employee.email ?? "—"}</td>
              <td className="px-4 py-3">{employee.isActive ? dictionary.employees.yes : dictionary.employees.no}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
