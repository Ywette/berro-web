"use client";

import { useState } from "react";
import { AvailabilityForm } from "@/components/drivers/availability-form";
import { DriverCalendar } from "@/components/staff/driver-calendar";
import type { StaffOrder } from "@/types/dashboard";
import type { DriverAvailability, DriverStatus, Employee } from "@/types/staff";

type Section = "personnel" | "availability";

type Labels = {
  personnel: string;
  availability: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  active: string;
  yes: string;
  no: string;
  empty: string;
  noPhone: string;
  monthPrev: string;
  monthNext: string;
  today: string;
  busy: string;
  free: string;
  noDrivers: string;
  statuses: Record<DriverStatus, string>;
  showAvailabilityForm: boolean;
};

const statusTone: Record<DriverStatus, string> = {
  available: "bg-pine/15 text-pine",
  on_trip: "bg-burgundy/20 text-rose-200",
  off_duty: "bg-white/8 text-mist",
  unavailable: "bg-white/5 text-ivory/70",
};

export function EmployeesSections({
  drivers,
  employees,
  orders,
  locale,
  labels,
}: {
  drivers: DriverAvailability[];
  employees: Employee[];
  orders: StaffOrder[];
  locale: "lv" | "en";
  labels: Labels;
}) {
  const [section, setSection] = useState<Section>("personnel");
  const driversById = new Map(drivers.map((driver) => [driver.id, driver]));
  const driverEmployees = employees.filter((employee) => employee.role === "driver");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <SectionButton
          active={section === "personnel"}
          label={labels.personnel}
          onClick={() => setSection("personnel")}
        />
        <SectionButton
          active={section === "availability"}
          label={labels.availability}
          onClick={() => setSection("availability")}
        />
      </div>

      {section === "personnel" ? (
        driverEmployees.length === 0 ? (
          <p className="rounded-2xl border border-line bg-card px-5 py-6 text-sm text-mist">
            {labels.empty}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-card">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-white/5 text-mist">
                <tr>
                  <th className="px-4 py-3 font-medium">{labels.name}</th>
                  <th className="px-4 py-3 font-medium">{labels.phone}</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">{labels.email}</th>
                  <th className="px-4 py-3 font-medium">{labels.status}</th>
                  <th className="px-4 py-3 font-medium">{labels.active}</th>
                </tr>
              </thead>
              <tbody>
                {driverEmployees.map((employee) => {
                  const availability = driversById.get(employee.id);
                  const status = availability?.status ?? "unavailable";

                  return (
                    <tr key={employee.id} className="border-t border-line">
                      <td className="px-4 py-3 font-medium text-ivory">{employee.fullName}</td>
                      <td className="px-4 py-3 text-mist">
                        {employee.phone ?? labels.noPhone}
                      </td>
                      <td className="hidden px-4 py-3 text-mist md:table-cell">
                        {employee.email ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs ${statusTone[status]}`}
                        >
                          {labels.statuses[status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-mist">
                        {employee.isActive ? labels.yes : labels.no}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="space-y-5">
          <DriverCalendar
            drivers={drivers}
            orders={orders}
            locale={locale}
            labels={{
              monthPrev: labels.monthPrev,
              monthNext: labels.monthNext,
              today: labels.today,
              busy: labels.busy,
              free: labels.free,
              noDrivers: labels.noDrivers,
              statuses: labels.statuses,
            }}
          />
          {labels.showAvailabilityForm && drivers.length > 0 ? (
            <AvailabilityForm drivers={drivers} />
          ) : null}
        </div>
      )}
    </div>
  );
}

function SectionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "rounded-full bg-ivory px-4 py-2 text-sm font-medium text-night"
          : "rounded-full border border-white/15 px-4 py-2 text-sm text-ivory/80 hover:border-white/40 hover:text-white"
      }
    >
      {label}
    </button>
  );
}
