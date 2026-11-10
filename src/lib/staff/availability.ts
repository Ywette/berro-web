import type { FleetVehicle } from "@/lib/content/fleet";
import type { StaffOrder } from "@/types/dashboard";
import type { Employee } from "@/types/staff";

export type DateSpan = { start: string; end: string };

export function orderSpan(order: StaffOrder): DateSpan | null {
  if (!order.departureOn || !isIsoDate(order.departureOn)) return null;
  const end =
    order.returnOn && isIsoDate(order.returnOn) && order.returnOn >= order.departureOn
      ? order.returnOn
      : order.departureOn;
  return { start: order.departureOn, end };
}

export function rangesOverlap(left: DateSpan, right: DateSpan) {
  return left.start <= right.end && right.start <= left.end;
}

export function resolvedRange(
  from: string,
  to: string,
): { ok: true; span: DateSpan } | { ok: false; invalid: boolean } {
  if (!from && !to) return { ok: false, invalid: false };
  if (from && to && from > to) return { ok: false, invalid: true };
  const start = from || to;
  const end = to || from;
  if (!isIsoDate(start) || !isIsoDate(end)) return { ok: false, invalid: false };
  return { ok: true, span: { start, end } };
}

export function isEmployeeFree(employee: Employee, span: DateSpan, orders: StaffOrder[]) {
  if (!employee.isActive) return false;
  if (employee.role !== "driver" && employee.role !== "guide") return false;
  return !orders.some((order) => occupiesEmployee(order, employee.id, span));
}

export function employeeChoices(
  role: "driver" | "guide",
  order: StaffOrder,
  employees: Employee[],
  orders: StaffOrder[],
) {
  const span = orderSpan(order);
  const others = orders.filter((item) => item.id !== order.id);

  return employees
    .filter((employee) => {
      if (employee.role !== role || !employee.isActive) return false;
      if (role === "driver" && order.assignedGuideId === employee.id) return false;
      if (role === "guide" && order.assignedDriverId === employee.id) return false;
      const assignedId = role === "driver" ? order.assignedDriverId : order.assignedGuideId;
      if (assignedId === employee.id) return true;
      if (!span) return true;
      return isEmployeeFree(employee, span, others);
    })
    .sort((left, right) => left.fullName.localeCompare(right.fullName, "lv"));
}

export function isVehicleFree(vehicle: FleetVehicle, span: DateSpan, orders: StaffOrder[]) {
  if (!vehicle.isActive || !documentsCover(vehicle, span.end)) return false;
  return !orders.some((order) => occupiesVehicle(order, vehicle.id, span));
}

export function vehicleChoices(order: StaffOrder, vehicles: FleetVehicle[], orders: StaffOrder[]) {
  const span = orderSpan(order);
  const others = orders.filter((item) => item.id !== order.id);
  const coveredThrough = span?.end ?? todayIso();

  return vehicles
    .filter((vehicle) => {
      if (vehicle.id === order.assignedVehicleId) return true;
      if (!vehicle.isActive || vehicle.passengers < order.passengerCount) return false;
      if (!documentsCover(vehicle, coveredThrough)) return false;
      if (!span) return true;
      return isVehicleFree(vehicle, span, others);
    })
    .sort((left, right) => vehicleLabel(left).localeCompare(vehicleLabel(right), "lv"));
}

export function vehicleLabel(vehicle: FleetVehicle) {
  return vehicle.plate ? `${vehicle.name} · ${vehicle.plate}` : vehicle.name;
}

function occupiesEmployee(order: StaffOrder, employeeId: string, span: DateSpan) {
  if (order.assignedDriverId !== employeeId && order.assignedGuideId !== employeeId) return false;
  const trip = orderSpan(order);
  return trip ? rangesOverlap(trip, span) : false;
}

function occupiesVehicle(order: StaffOrder, vehicleId: string, span: DateSpan) {
  if (order.assignedVehicleId !== vehicleId) return false;
  const trip = orderSpan(order);
  return trip ? rangesOverlap(trip, span) : false;
}

function documentsCover(vehicle: FleetVehicle, day: string) {
  const insuranceOk = !vehicle.insuranceExpiresOn || vehicle.insuranceExpiresOn >= day;
  const inspectionOk = !vehicle.inspectionExpiresOn || vehicle.inspectionExpiresOn >= day;
  return insuranceOk && inspectionOk;
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
