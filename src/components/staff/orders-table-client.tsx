"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import Link from "next/link";
import { useDictionary } from "@/components/i18n/locale-provider";
import { intlLocales } from "@/lib/i18n/locale";
import type { FleetVehicle } from "@/lib/content/fleet";
import {
  mergeOrdersWithSession,
} from "@/lib/orders/session-orders";
import { formatHeardAboutLabel } from "@/lib/quote-heard-about";
import { formatTravelTypeLabel } from "@/lib/quote-travel-types";
import { assignEmployee, assignTransport, applyAssignmentPatches } from "@/lib/staff/assignments";
import { employeeChoices, vehicleChoices, vehicleLabel } from "@/lib/staff/availability";
import type { OrderStatus, StaffOrder } from "@/types/dashboard";
import type { Employee } from "@/types/staff";

const statusTone: Record<OrderStatus, string> = {
  new: "bg-white/8 text-ivory/80",
  in_progress: "bg-burgundy/20 text-rose-200",
  sent: "bg-white/10 text-mist",
  approved: "bg-pine/15 text-pine",
  paid: "bg-pine/25 text-pine",
};

const selectClass =
  "w-full min-w-40 rounded-lg border border-white/15 bg-night px-2 py-1.5 text-sm text-ivory [color-scheme:dark]";

export function OrdersTableClient({
  initialOrders,
  employees,
  vehicles,
  demoNote,
}: {
  initialOrders: StaffOrder[];
  employees: Employee[];
  vehicles: FleetVehicle[];
  demoNote: string | null;
}) {
  const dictionary = useDictionary();
  const [orders, setOrders] = useState(initialOrders);
  const table = useRef<HTMLDivElement>(null);
  const locale = intlLocales[dictionary.locale];
  const dateFormat = new Intl.DateTimeFormat(locale, { timeZone: "Europe/Riga" });
  const priceFormat = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });

  function rememberPosition() {
    sessionStorage.setItem("staff-orders-position", JSON.stringify([window.scrollY, table.current?.scrollLeft ?? 0]));
  }

  useEffect(() => {
    const stored = sessionStorage.getItem("staff-orders-position");
    if (!stored) return;
    const frame = requestAnimationFrame(() => {
      const [top, left] = JSON.parse(stored);
      window.scrollTo(0, top);
      if (table.current) table.current.scrollLeft = left;
      sessionStorage.removeItem("staff-orders-position");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    setOrders(applyAssignmentPatches(mergeOrdersWithSession(initialOrders)));
  }, [initialOrders]);

  function onAssignDriver(orderId: string, employeeId: string) {
    const employee = employees.find((item) => item.id === employeeId) ?? null;
    setOrders(assignEmployee(orders, orderId, "driver", employee));
  }

  function onAssignTransport(orderId: string, vehicleId: string) {
    setOrders(assignTransport(orders, orderId, vehicleId || null));
  }

  return (
    <div className="space-y-4">
      {demoNote ? (
        <p className="rounded-2xl border border-line bg-card px-4 py-3 text-xs text-mist">{demoNote}</p>
      ) : null}

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card px-5 py-6 text-sm text-mist">
          {dictionary.staffDashboard.ordersEmpty}
        </p>
      ) : (
        <div ref={table} className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-white/5 text-mist">
              <tr>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.orderId}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.orderedOn}</th>
                <th className="px-4 py-3 font-medium">{dictionary.hero.departureDate}</th>
                <th className="px-4 py-3 font-medium">{dictionary.quote.travelTypeLabel}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.passengers}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.orderPrice}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.route}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.requestor}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.state}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.assignedDriver}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.assignedVehicle}</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">{dictionary.staffDashboard.deleteOrder}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const orderUrl = `/staff/orders/${encodeURIComponent(order.id)}`;
                const drivers = employeeChoices("driver", order, employees, orders);
                const transport = vehicleChoices(order, vehicles, orders);

                return (
                  <tr key={order.id} className="border-t border-line align-top">
                    <td className="px-4 py-3 font-medium text-ivory">
                      <Link href={orderUrl} onNavigate={rememberPosition}
                        className="cursor-pointer underline decoration-ivory/50 underline-offset-4 hover:decoration-ivory">
                        {order.reference}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{order.createdAt ? dateFormat.format(new Date(order.createdAt)) : "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3">{order.departureOn ? dateFormat.format(new Date(order.departureOn)) : "—"}</td>
                    <td className="px-4 py-3">{order.travelType ? formatTravelTypeLabel(order.travelType, order.travelTypeDetail, dictionary.quote.travelTypeOptions) : "—"}</td>
                    <td className="px-4 py-3">{order.passengerCount}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {order.price != null ? priceFormat.format(order.price) : (
                        <Link href={`/staff/calculation?order=${encodeURIComponent(order.id)}`}
                          className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-white/10">
                          {dictionary.staffDashboard.calculatePrice}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ivory/90">
                      <p>
                        {[order.origin, ...(order.stops ?? []).map((stop) => stop.name), order.destination].join(" \u2192 ")}
                        {order.returnTo ? ` → ${order.returnTo}` : ""}
                      </p>
                      {order.routeEstimate ? (
                        <a className="text-xs underline" href={order.routeEstimate.mapsUrl} target="_blank" rel="noreferrer">
                          Google Maps · {order.routeEstimate.distanceKm} km
                          {order.routeEstimate.durationMinutes !== null && ` · ${order.routeEstimate.durationMinutes} min`}
                        </a>
                      ) : (
                        <p className="text-xs text-mist">{dictionary.locale === "lv" ? "Maršruts jāprecizē" : "Route needs review"}</p>
                      )}
                      <p className="mt-1 text-xs text-mist">
                        {order.returnTo ? null : dictionary.staffDashboard.oneWay}
                        {order.departureOn ? (
                          <span>
                            {order.returnTo ? "" : " · "}
                            {order.departureOn}
                            {order.returnOn && order.returnOn !== order.departureOn
                              ? ` → ${order.returnOn}`
                              : ""}
                          </span>
                        ) : null}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ivory">{order.requestorName ?? "—"}</p>
                      {order.requestorCompany ? (
                        <p className="mt-1 text-xs text-mist">{order.requestorCompany}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-mist">{order.requestorEmail ?? "—"}</p>
                      <p className="text-xs text-mist">{order.requestorPhone ?? "—"}</p>
                      {order.planDocument ? (
                        <p className="mt-1 text-xs text-mist">
                          {dictionary.pricing.planDocument}: {order.planDocument}
                          {order.planDocumentPath ? " ✓" : ""}
                        </p>
                      ) : null}
                      {order.heardAbout ? (
                        <p className="mt-1 text-xs text-mist">
                          {dictionary.quote.heardAboutLabel}:{" "}
                          {formatHeardAboutLabel(
                            order.heardAbout,
                            order.heardAboutDetail,
                            dictionary.quote.heardAboutOptions,
                          )}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs ${statusTone[order.status]}`}
                      >
                        {dictionary.staffDashboard.orderStates[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <AssignmentSelect
                        label={dictionary.staffDashboard.assignedDriver}
                        value={order.assignedDriverId}
                        emptyLabel={dictionary.staffDashboard.unassigned}
                        onChange={(value) => onAssignDriver(order.id, value)}
                        options={drivers.map((employee) => ({
                          id: employee.id,
                          label: employee.fullName,
                        }))}
                        fallbackLabel={order.assignedDriverName}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <AssignmentSelect
                        label={dictionary.staffDashboard.assignedVehicle}
                        value={order.assignedVehicleId}
                        emptyLabel={dictionary.staffDashboard.unassigned}
                        onChange={(value) => onAssignTransport(order.id, value)}
                        options={transport.map((vehicle) => ({
                          id: vehicle.id,
                          label: `${vehicleLabel(vehicle)} · ${vehicle.passengers}`,
                        }))}
                        fallbackLabel={
                          vehicles.find((vehicle) => vehicle.id === order.assignedVehicleId)
                            ? null
                            : order.assignedVehicleId
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-3">
                        <Link href={orderUrl + "#edit"} onNavigate={rememberPosition}
                          className="text-sm underline">{dictionary.staffDashboard.editTransport}</Link>
                        <Link href={orderUrl + "?delete=1"} onNavigate={rememberPosition}
                          className="text-sm text-rose-200 underline">{dictionary.staffDashboard.deleteOrder}</Link>
                      </div>
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

function AssignmentSelect({
  label,
  value,
  emptyLabel,
  options,
  fallbackLabel,
  onChange,
}: {
  label: string;
  value: string | null;
  emptyLabel: string;
  options: { id: string; label: string }[];
  fallbackLabel: string | null;
  onChange: (value: string) => void;
}) {
  const known = !value || options.some((option) => option.id === value);

  return (
    <select
      aria-label={label}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      className={selectClass}
    >
      <option value="">{emptyLabel}</option>
      {!known && value ? <option value={value}>{fallbackLabel || value}</option> : null}
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
