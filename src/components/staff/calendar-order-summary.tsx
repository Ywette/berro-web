"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import { formatDate } from "@/lib/content/format-date";
import type { FleetVehicle } from "@/lib/content/fleet";
import { formatRouteAddress } from "@/lib/orders/format-address";
import { vehicleLabel } from "@/lib/staff/availability";
import type { StaffOrder } from "@/types/dashboard";
import type { Employee } from "@/types/staff";

function bookingDate(day: string | null, timestamp?: string | null) {
  const time = timestamp?.match(/T(\d{2}:\d{2})/)?.[1];
  return day ? [formatDate(day), time].filter(Boolean).join(" ") : "—";
}

export function CalendarOrderSummary({
  dialogRef,
  orders,
  employees,
  vehicles,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  orders: StaffOrder[];
  employees: Employee[];
  vehicles: FleetVehicle[];
}) {
  const dictionary = useDictionary();
  const staff = dictionary.staffDashboard;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="calendar-order-summary-title"
      className="popup-enter m-auto max-h-[85dvh] w-[min(36rem,calc(100%-2rem))] overflow-y-auto rounded-2xl border border-line bg-card p-4 text-ivory shadow-xl backdrop:bg-black/60 sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="calendar-order-summary-title" className="text-lg font-semibold">{staff.calendarOrderSummary}</h2>
        <button type="button" onClick={() => dialogRef.current?.close()}
          className="rounded-full border border-staff-control px-3 py-1.5 text-sm hover:bg-staff-hover">
          {dictionary.blog.close}
        </button>
      </div>
      <ul className="mt-4 grid gap-3">
        {orders.map((order) => {
          const vehicle = vehicles.find((item) => item.id === order.assignedVehicleId);
          const driverName = order.assignedDriverName || employees.find((item) => item.id === order.assignedDriverId)?.fullName;
          const route = [order.origin, ...(order.stops ?? []).map((stop) => stop.name), order.destination, order.returnTo]
            .filter((place): place is string => Boolean(place && place !== "—"))
            .map(formatRouteAddress).join(" → ");
          return (
            <li key={order.id} className="rounded-xl border border-line bg-panel p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/staff/orders/${encodeURIComponent(order.id)}`} className="font-semibold underline underline-offset-2">
                  {order.reference}
                </Link>
                <span className="rounded-full bg-staff-subtle px-2 py-1 text-xs">{staff.orderStates[order.status]}</span>
              </div>
              {route && <p className="mt-2 text-sm break-words">{route}</p>}
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {[
                  [staff.availableFrom, bookingDate(order.departureOn, order.departureAt)],
                  [staff.availableTo, bookingDate(order.returnOn, order.returnAt)],
                  [staff.passengers, order.passengerCount],
                  [staff.assignedDriver, driverName || staff.unassigned],
                  [staff.assignedVehicle, vehicle ? vehicleLabel(vehicle) : staff.unassigned],
                ].map(([label, value]) => (
                  <div className="min-w-0" key={label}>
                    <dt className="text-xs text-mist">{label}</dt>
                    <dd className="break-words">{value}</dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>
    </dialog>
  );
}
