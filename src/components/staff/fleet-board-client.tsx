"use client";

import { useState } from "react";
import { DateRangeFilter } from "@/components/staff/date-range-filter";
import { useAssignedOrders } from "@/components/staff/use-assigned-orders";
import type { FleetVehicle } from "@/lib/content/fleet";
import { formatPostDate } from "@/lib/content/format-date";
import { isVehicleFree, resolvedRange } from "@/lib/staff/availability";
import { dateExpiryState, vehicleReadiness, type StaffOrder } from "@/types/dashboard";

type Labels = {
  passengers: string;
  fleetTitle: string;
  plate: string;
  capacity: string;
  insurance: string;
  inspection: string;
  readiness: string;
  readinessReady: string;
  readinessAttention: string;
  readinessBlocked: string;
  noExpiry: string;
  fleetEmpty: string;
  availabilityRange: string;
  availableFrom: string;
  availableTo: string;
  clearRange: string;
  rangeInvalid: string;
  noFleetInRange: string;
};

export function FleetBoardClient({
  vehicles,
  orders,
  locale,
  labels,
}: {
  vehicles: FleetVehicle[];
  orders: StaffOrder[];
  locale: "lv" | "en";
  labels: Labels;
}) {
  const [range, setRange] = useState({ from: "", to: "" });
  const [assignedOrders] = useAssignedOrders(orders);
  const dateFilter = resolvedRange(range.from, range.to);
  const visible = dateFilter.ok
    ? vehicles.filter((vehicle) => isVehicleFree(vehicle, dateFilter.span, assignedOrders))
    : vehicles;

  const readinessLabel = {
    ready: labels.readinessReady,
    attention: labels.readinessAttention,
    blocked: labels.readinessBlocked,
  } as const;

  const readinessTone = {
    ready: "bg-pine/15 text-pine",
    attention: "bg-burgundy/20 text-rose-200",
    blocked: "bg-white/8 text-mist",
  } as const;

  return (
    <div className="space-y-4">
      <DateRangeFilter
        from={range.from}
        to={range.to}
        onChange={setRange}
        labels={{
          title: labels.availabilityRange,
          from: labels.availableFrom,
          to: labels.availableTo,
          clear: labels.clearRange,
          invalid: labels.rangeInvalid,
        }}
      />

      {vehicles.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card px-5 py-6 text-sm text-mist">
          {labels.fleetEmpty}
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card px-5 py-6 text-sm text-mist">
          {labels.noFleetInRange}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/5 text-mist">
              <tr>
                <th className="px-4 py-3 font-medium">{labels.fleetTitle}</th>
                <th className="px-4 py-3 font-medium">{labels.plate}</th>
                <th className="px-4 py-3 font-medium">{labels.capacity}</th>
                <th className="px-4 py-3 font-medium">{labels.insurance}</th>
                <th className="px-4 py-3 font-medium">{labels.inspection}</th>
                <th className="px-4 py-3 font-medium">{labels.readiness}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((vehicle) => {
                const readiness = vehicleReadiness(
                  vehicle.insuranceExpiresOn,
                  vehicle.inspectionExpiresOn,
                );
                const insuranceState = dateExpiryState(vehicle.insuranceExpiresOn);
                const inspectionState = dateExpiryState(vehicle.inspectionExpiresOn);

                return (
                  <tr key={vehicle.id} className="border-t border-line align-middle">
                    <td className="px-4 py-3 font-medium text-ivory">{vehicle.name}</td>
                    <td className="px-4 py-3 text-mist">{vehicle.plate ?? "—"}</td>
                    <td className="px-4 py-3 text-mist">
                      {vehicle.passengers} {labels.passengers.toLowerCase()}
                    </td>
                    <td className="px-4 py-3">
                      <ExpiryDate
                        value={vehicle.insuranceExpiresOn}
                        state={insuranceState}
                        locale={locale}
                        emptyLabel={labels.noExpiry}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ExpiryDate
                        value={vehicle.inspectionExpiresOn}
                        state={inspectionState}
                        locale={locale}
                        emptyLabel={labels.noExpiry}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs ${readinessTone[readiness]}`}
                      >
                        {readinessLabel[readiness]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ExpiryDate({
  value,
  state,
  locale,
  emptyLabel,
}: {
  value: string | null;
  state: ReturnType<typeof dateExpiryState>;
  locale: "lv" | "en";
  emptyLabel: string;
}) {
  if (!value) {
    return <span className="text-mist">{emptyLabel}</span>;
  }

  const label = formatPostDate(value, locale);

  if (state === "attention") {
    return (
      <span className="inline-block border border-red-500 px-1.5 py-0.5 text-rose-200">
        {label}
      </span>
    );
  }

  if (state === "blocked") {
    return <span className="text-rose-300/90 line-through">{label}</span>;
  }

  return <span className="text-ivory/85">{label}</span>;
}
