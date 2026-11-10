"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import type { FleetVehicle } from "@/lib/content/fleet";
import {
  mergeOrdersWithSession,
  removeSessionOrderByReference,
} from "@/lib/orders/session-orders";
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

function isSessionOrder(order: StaffOrder) {
  return order.id.startsWith("session-order-");
}

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

  useEffect(() => {
    removeSessionOrderByReference("ORD-0417");
    setOrders(applyAssignmentPatches(mergeOrdersWithSession(initialOrders)));
  }, [initialOrders]);

  function onDelete(reference: string) {
    removeSessionOrderByReference(reference);
    setOrders(applyAssignmentPatches(mergeOrdersWithSession(initialOrders)));
  }

  function onAssignEmployee(orderId: string, role: "driver" | "guide", employeeId: string) {
    const employee = employees.find((item) => item.id === employeeId) ?? null;
    setOrders(assignEmployee(orders, orderId, role, employee));
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
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-white/5 text-mist">
              <tr>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.orderId}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.route}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.passengers}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.requestor}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.state}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.assignedDriver}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.assignedGuide}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.assignedVehicle}</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">{dictionary.staffDashboard.deleteOrder}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const drivers = employeeChoices("driver", order, employees, orders);
                const guides = employeeChoices("guide", order, employees, orders);
                const transport = vehicleChoices(order, vehicles, orders);

                return (
                  <tr key={order.id} className="border-t border-line align-top">
                    <td className="px-4 py-3 font-medium text-ivory">{order.reference}</td>
                    <td className="px-4 py-3 text-ivory/90">
                      <p>
                        {order.origin} → {order.destination}
                        {order.returnTo ? ` → ${order.returnTo}` : ""}
                      </p>
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
                    <td className="px-4 py-3">{order.passengerCount}</td>
                    <td className="px-4 py-3">
                      <p className="text-ivory">{order.requestorName ?? "—"}</p>
                      <p className="mt-1 text-xs text-mist">{order.requestorEmail ?? "—"}</p>
                      <p className="text-xs text-mist">{order.requestorPhone ?? "—"}</p>
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
                        onChange={(value) => onAssignEmployee(order.id, "driver", value)}
                        options={drivers.map((employee) => ({
                          id: employee.id,
                          label: employee.fullName,
                        }))}
                        fallbackLabel={order.assignedDriverName}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <AssignmentSelect
                        label={dictionary.staffDashboard.assignedGuide}
                        value={order.assignedGuideId}
                        emptyLabel={dictionary.staffDashboard.unassigned}
                        onChange={(value) => onAssignEmployee(order.id, "guide", value)}
                        options={guides.map((employee) => ({
                          id: employee.id,
                          label: employee.fullName,
                        }))}
                        fallbackLabel={order.assignedGuideName}
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
                      {isSessionOrder(order) ? (
                        <button
                          type="button"
                          onClick={() => onDelete(order.reference)}
                          className="text-xs text-mist hover:text-rose-200"
                        >
                          {dictionary.staffDashboard.deleteOrder}
                        </button>
                      ) : null}
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
