"use client";

import { useMemo, useRef, useState } from "react";
import { DateTimeField } from "@/components/landing/datetime-field";
import { CalendarOrderSummary } from "@/components/staff/calendar-order-summary";
import { useAssignedOrders } from "@/components/staff/use-assigned-orders";
import { formatDate } from "@/lib/content/format-date";
import type { FleetVehicle } from "@/lib/content/fleet";
import { normalizeFleetKind } from "@/lib/fleet/kind";
import { intlLocales, type Locale } from "@/lib/i18n/locale";
import { splitDateTime } from "@/lib/orders/route-points";
import { orderAssignments } from "@/lib/staff/assignments";
import {
  isEmployeeFree,
  isEmployeeScheduled,
  isVehicleFree,
  isVehicleScheduled,
  rangeOverlapsOrder,
  resolvedRange,
  vehicleLabel,
  type DateSpan,
} from "@/lib/staff/availability";
import type { StaffOrder } from "@/types/dashboard";
import type { Employee } from "@/types/staff";

type ResourceMode = "available" | "scheduled";
type ResourceStatus = ResourceMode | "unavailable";
const resourceSelectClass = "h-11 w-full min-w-0 rounded-lg border border-staff-control bg-night px-3 text-sm text-ivory";
const fleetKinds = ["van", "coach", "car"] as const;
type FleetFilterKind = (typeof fleetKinds)[number];

function fleetFilterKind(vehicle: FleetVehicle): FleetFilterKind {
  const kind = normalizeFleetKind(vehicle.kind);
  if (kind === "coach") return "coach";
  return kind === "vip" || kind === "retro" ? "car" : "van";
}

type Labels = {
  availabilityRange: string;
  availableFrom: string;
  availableTo: string;
  rangeInvalid: string;
  wholeDay: string;
  clearRange: string;
  allEmployees: string;
  allTransports: string;
  viewStaffAvailable: string;
  viewStaffScheduled: string;
  viewFleetAvailable: string;
  viewFleetScheduled: string;
  monthPrev: string;
  monthNext: string;
  yearPrev: string;
  yearNext: string;
  today: string;
  busy: string;
  free: string;
  unavailable: string;
  employeesSection: string;
  fleetSection: string;
  fleetKinds: Record<FleetFilterKind, string>;
  orderSection: string;
  departureDate: string;
  orderReserved: string;
  orderReady: string;
  roles: Record<Employee["role"], string>;
};

type StaffCalendarClientProps = {
  employees: Employee[];
  vehicles: FleetVehicle[];
  orders: StaffOrder[];
  locale: Locale;
  labels: Labels;
};

type CalendarResource = {
  id: string;
  kind: "bus" | "driver" | "order";
  name: string;
  modes: ResourceMode[];
  bookings: StaffOrder[];
  statusOn: (span: DateSpan) => ResourceStatus | null;
};

type OrderGroup = {
  order: StaffOrder;
  orderResource: CalendarResource;
  vehicles: { resource: CalendarResource; drivers: CalendarResource[] }[];
  directDrivers: CalendarResource[];
};

export function StaffCalendarClient({
  employees,
  vehicles,
  orders,
  locale,
  labels,
}: StaffCalendarClientProps) {
  const [assignedOrders] = useAssignedOrders(orders);
  const [fleetModes, setFleetModes] = useState<ResourceMode[]>([]);
  const [staffModes, setStaffModes] = useState<ResourceMode[]>([]);
  const [orderModes, setOrderModes] = useState<ResourceMode[]>([]);
  const [summaryOrderIds, setSummaryOrderIds] = useState<string[]>([]);
  const summaryRef = useRef<HTMLDialogElement>(null);
  const [selectedFleetKinds, setSelectedFleetKinds] = useState<FleetFilterKind[]>([]);
  const [range, setRange] = useState({ from: "", to: "" });
  const [employeeId, setEmployeeId] = useState("all");
  const [vehicleId, setVehicleId] = useState("all");
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  });

  const year = cursor.getUTCFullYear();
  const month = cursor.getUTCMonth();
  const dateFilter = useMemo(() => {
    const from = splitDateTime(range.from);
    const to = splitDateTime(range.to);
    return resolvedRange(from.date, to.date, from.time, to.time);
  }, [range.from, range.to]);
  const selectedSpan = dateFilter.ok ? dateFilter.span : null;
  const invalidRange = !dateFilter.ok && dateFilter.invalid;
  const monthSpan = useMemo<DateSpan>(() => ({
    start: toDayKey(new Date(Date.UTC(year, month, 1))),
    end: toDayKey(new Date(Date.UTC(year, month + 1, 0))),
  }), [year, month]);
  const focusSpan = selectedSpan ?? monthSpan;

  const assignableEmployees = useMemo(
    () =>
      employees
        .filter((employee) => employee.isActive && employee.role === "driver")
        .sort((left, right) => left.fullName.localeCompare(right.fullName, locale)),
    [employees, locale],
  );

  const activeVehicles = useMemo(
    () =>
      vehicles
        .filter((vehicle) => vehicle.isActive && (
          selectedFleetKinds.length === 0 || selectedFleetKinds.includes(fleetFilterKind(vehicle))
        ))
        .sort((left, right) => vehicleLabel(left).localeCompare(vehicleLabel(right), locale)),
    [vehicles, locale, selectedFleetKinds],
  );

  const availableEmployees = useMemo(
    () =>
      invalidRange ? [] : assignableEmployees.filter((employee) =>
        isEmployeeFree(employee, focusSpan, assignedOrders),
      ),
    [assignableEmployees, assignedOrders, focusSpan, invalidRange],
  );

  const scheduledEmployees = useMemo(
    () =>
      invalidRange ? [] : assignableEmployees.filter((employee) =>
        isEmployeeScheduled(employee, focusSpan, assignedOrders),
      ),
    [assignableEmployees, assignedOrders, focusSpan, invalidRange],
  );

  const availableVehicles = useMemo(
    () => invalidRange ? [] : activeVehicles.filter((vehicle) => isVehicleFree(vehicle, focusSpan, assignedOrders)),
    [activeVehicles, assignedOrders, focusSpan, invalidRange],
  );

  const scheduledVehicles = useMemo(
    () =>
      invalidRange ? [] : activeVehicles.filter((vehicle) => isVehicleScheduled(vehicle, focusSpan, assignedOrders)),
    [activeVehicles, assignedOrders, focusSpan, invalidRange],
  );

  const resolvedEmployeeId =
    employeeId === "all" || assignableEmployees.some((employee) => employee.id === employeeId)
      ? employeeId
      : "all";

  const resolvedVehicleId =
    vehicleId === "all" || activeVehicles.some((vehicle) => vehicle.id === vehicleId)
      ? vehicleId
      : "all";

  const monthLabel = new Intl.DateTimeFormat(intlLocales[locale], {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(cursor);

  const days = useMemo(() => buildMonthDays(year, month), [year, month]);
  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(intlLocales[locale], {
      weekday: "short",
      timeZone: "UTC",
    });
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(Date.UTC(2024, 0, index + 1));
      return formatter.format(date);
    });
  }, [locale]);

  const calendarOrders = useMemo(
    () => assignedOrders.filter((order) => order.departureOn && order.status !== "cancelled"),
    [assignedOrders],
  );

  const orderGroups = useMemo<OrderGroup[]>(() => {
    if (invalidRange) return [];

    return calendarOrders.flatMap((order) => {
      const mode = order.status === "paid" ? "scheduled" : "available";
      if (!rangeOverlapsOrder(focusSpan, order)) return [];
      if (orderModes.length && !orderModes.includes(mode)) return [];

      const assignments = orderAssignments(order);
      const assignedVehicles = fleetModes.includes("scheduled") ? activeVehicles.filter((vehicle) =>
        assignments.vehicleIds.includes(vehicle.id) && (resolvedVehicleId === "all" || vehicle.id === resolvedVehicleId)) : [];
      const assignedDrivers = staffModes.includes("scheduled") ? assignments.drivers.filter((driver) =>
        resolvedEmployeeId === "all" || driver.id === resolvedEmployeeId) : [];
      if (!orderModes.length && !assignedVehicles.length && !assignedDrivers.length) return [];

      const orderResource: CalendarResource = {
        id: order.id,
        kind: "order",
        name: `${order.reference} · ${order.destination !== "—" ? order.destination : order.origin}`,
        modes: [mode],
        bookings: [order],
        statusOn: (span) => rangeOverlapsOrder(span, order) ? mode : null,
      };
      const scheduledResource = (id: string, kind: "bus" | "driver", name: string): CalendarResource => ({
        id,
        kind,
        name,
        modes: ["scheduled"],
        bookings: [order],
        statusOn: (span) => rangeOverlapsOrder(span, order) ? "scheduled" : null,
      });
      const drivers = assignedDrivers.map((driver) => ({
        vehicleId: driver.vehicleId,
        resource: scheduledResource(driver.id, "driver",
          assignableEmployees.find((employee) => employee.id === driver.id)?.fullName || driver.name || driver.id),
      }));

      return [{
        order,
        orderResource,
        vehicles: assignedVehicles.map((vehicle) => ({
          resource: scheduledResource(vehicle.id, "bus", vehicleLabel(vehicle)),
          drivers: drivers.filter((driver) => driver.vehicleId === vehicle.id).map((driver) => driver.resource),
        })),
        directDrivers: drivers.filter((driver) => !assignedVehicles.some((vehicle) => vehicle.id === driver.vehicleId))
          .map((driver) => driver.resource),
      }];
    });
  }, [activeVehicles, assignableEmployees, calendarOrders, fleetModes, focusSpan, invalidRange, orderModes, resolvedEmployeeId, resolvedVehicleId, staffModes]);

  const resources = useMemo<CalendarResource[]>(() => {
    if (invalidRange) return [];

    const showFleet = fleetModes.includes("available") || (
      fleetModes.length === 0 && (selectedFleetKinds.length > 0 || resolvedVehicleId !== "all")
    );
    const fleet = (showFleet ? activeVehicles : [])
      .filter((vehicle) => resolvedVehicleId === "all" || vehicle.id === resolvedVehicleId)
      .map((vehicle): CalendarResource => {
        const bookings = assignedOrders.filter((order) => orderAssignments(order).vehicleIds.includes(vehicle.id));
        return {
          id: vehicle.id,
          kind: "bus",
          name: vehicleLabel(vehicle),
          modes: fleetModes,
          bookings,
          statusOn: (span) => isVehicleScheduled(vehicle, span, bookings)
            ? "scheduled"
            : isVehicleFree(vehicle, span, bookings) ? "available" : "unavailable",
        };
      });

    const drivers = assignableEmployees
      .filter(() => !staffModes.includes("scheduled") || staffModes.includes("available"))
      .filter((employee) => employee.id === resolvedEmployeeId ||
        (resolvedEmployeeId === "all" && staffModes.length > 0))
      .map((employee): CalendarResource => {
        const bookings = assignedOrders.filter((order) => order.assignedGuideId === employee.id ||
          orderAssignments(order).drivers.some((driver) => driver.id === employee.id));
        return {
          id: employee.id,
          kind: "driver",
          name: employee.fullName,
          modes: staffModes,
          bookings,
          statusOn: (span) => isEmployeeScheduled(employee, span, bookings) ? "scheduled" : "available",
        };
      });

    return [...fleet, ...drivers].map((resource) => ({
      ...resource,
      modes: resource.modes.filter((mode) => mode !== "scheduled"),
    }));
  }, [activeVehicles, assignableEmployees, assignedOrders, fleetModes, invalidRange, resolvedEmployeeId, resolvedVehicleId, selectedFleetKinds.length, staffModes]);

  const freeResources = resources.filter((resource) => resource.statusOn(focusSpan) === "available");

  const rangeStart = selectedSpan?.start ?? "";
  const rangeEnd = selectedSpan?.end ?? "";

  function changeFleetKind(kind: FleetFilterKind, checked: boolean) {
    const nextKinds = checked ? [...selectedFleetKinds, kind] : selectedFleetKinds.filter((item) => item !== kind);
    setSelectedFleetKinds(nextKinds);
    if (nextKinds.length > 0 && vehicles.some((vehicle) =>
      vehicle.id === vehicleId && !nextKinds.includes(fleetFilterKind(vehicle)))) {
      setVehicleId("all");
    }
  }

  const fleetButtons: { id: ResourceMode; label: string; count: number }[] = [
    {
      id: "available",
      label: labels.viewFleetAvailable,
      count: availableVehicles.length,
    },
    {
      id: "scheduled",
      label: labels.viewFleetScheduled,
      count: scheduledVehicles.length,
    },
  ];

  const staffButtons: { id: ResourceMode; label: string; count: number }[] = [
    {
      id: "available",
      label: labels.viewStaffAvailable,
      count: availableEmployees.length,
    },
    {
      id: "scheduled",
      label: labels.viewStaffScheduled,
      count: scheduledEmployees.length,
    },
  ];

  const ordersInRange = invalidRange ? [] : calendarOrders.filter((order) => rangeOverlapsOrder(focusSpan, order));
  const paidOrders = ordersInRange.filter((order) => order.status === "paid").length;
  const orderButtons: { id: ResourceMode; label: string; count: number }[] = [
    { id: "available", label: labels.orderReserved, count: ordersInRange.length - paidOrders },
    { id: "scheduled", label: labels.orderReady, count: paidOrders },
  ];

  function openOrderSummary(bookings: StaffOrder[]) {
    if (bookings.length === 0) return;
    setSummaryOrderIds(bookings.map((order) => order.id));
    summaryRef.current?.showModal();
  }

  function selectDay(dayKey: string) {
    if (!range.from || (range.from && range.to)) {
      setRange({ from: dayKey, to: "" });
      return;
    }

    const fromDate = splitDateTime(range.from).date;
    if (dayKey < fromDate) {
      setRange({ from: dayKey, to: fromDate });
      return;
    }

    setRange({ from: range.from, to: dayKey });
  }

  function clearRange() {
    setRange({ from: "", to: "" });
  }

  function changeRangeDate(edge: "from" | "to", value: string) {
    setRange((current) => ({ ...current, [edge]: value }));
    if (value && (edge === "from" || !range.from)) {
      setCursor(new Date(`${value.slice(0, 7)}-01T00:00:00Z`));
    }
  }

  function moveCalendar(months: number) {
    setCursor((current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + months, 1)));
  }

  return (
    <div className="space-y-5">
      <div className="grid items-start gap-3 rounded-2xl border border-line bg-card p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[max-content_repeat(4,minmax(0,1fr))]">
        <fieldset className="grid min-w-0 gap-1">
          <legend className="sr-only">{labels.fleetSection}</legend>
          {fleetKinds.map((kind) => (
            <label key={kind} className="flex min-h-7 cursor-pointer items-center gap-2 text-sm text-ivory">
              <input
                type="checkbox"
                checked={selectedFleetKinds.includes(kind)}
                onChange={(event) => changeFleetKind(kind, event.target.checked)}
                className="size-4 shrink-0 accent-burgundy"
              />
              {labels.fleetKinds[kind]}
            </label>
          ))}
        </fieldset>
        <div className="grid min-w-0 gap-2" role="group" aria-label={labels.fleetSection}>
          {fleetButtons.map((button) => (
            <ModeButton key={`fleet-${button.id}`} active={fleetModes.includes(button.id)}
              icon="bus" mode={button.id} label={button.label} count={button.count}
              onClick={() => {
                setFleetModes((current) => current.includes(button.id)
                  ? current.filter((mode) => mode !== button.id) : [...current, button.id]);
              }} />
          ))}
        </div>
        <div className="grid min-w-0 gap-2" role="group" aria-label={labels.employeesSection}>
          {staffButtons.map((button) => (
            <ModeButton key={`staff-${button.id}`} active={staffModes.includes(button.id)}
              icon="driver" mode={button.id} label={button.label} count={button.count}
              onClick={() => {
                setStaffModes((current) => current.includes(button.id)
                  ? current.filter((mode) => mode !== button.id) : [...current, button.id]);
              }} />
          ))}
        </div>

        <div className="grid min-w-0 gap-2" role="group" aria-label={labels.orderSection}>
          {orderButtons.map((button) => (
            <ModeButton key={button.id} active={orderModes.includes(button.id)}
              icon="order" mode={button.id} label={button.label} count={button.count}
              onClick={() => {
                setOrderModes((current) => current.includes(button.id)
                  ? current.filter((mode) => mode !== button.id) : [...current, button.id]);
              }} />
          ))}
        </div>

        <div className="grid min-w-0 gap-2">
          <select
            aria-label={labels.fleetSection}
            value={resolvedVehicleId}
            onChange={(event) => setVehicleId(event.target.value)}
            className={resourceSelectClass}
          >
            <option value="all">{labels.allTransports}</option>
            {activeVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicleLabel(vehicle)}
              </option>
            ))}
          </select>

          <select
            aria-label={labels.employeesSection}
            value={resolvedEmployeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            className={resourceSelectClass}
          >
            <option value="all">{labels.allEmployees}</option>
            {assignableEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.fullName} · {labels.roles[employee.role]}
              </option>
            ))}
          </select>
        </div>
        <fieldset className="col-span-full min-w-0 space-y-2">
          <legend className="text-sm font-medium text-ivory">{labels.availabilityRange}</legend>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-44 max-w-full">
              <DateTimeField
                label={labels.availableFrom}
                value={range.from}
                onChange={(value) => changeRangeDate("from", value)}
                dateOnlyLabel={labels.wholeDay}
                minuteStep={1}
                appearance="dark"
                placeholder=""
                invalid={invalidRange}
              />
            </div>
            <div className="w-44 max-w-full">
              <DateTimeField
                label={labels.availableTo}
                value={range.to}
                onChange={(value) => changeRangeDate("to", value)}
                min={splitDateTime(range.from).date || undefined}
                dateOnlyLabel={labels.wholeDay}
                minuteStep={1}
                appearance="dark"
                placeholder=""
                invalid={invalidRange}
              />
            </div>
            {(range.from || range.to) && (
              <button type="button" onClick={clearRange}
                className="h-10 rounded-lg border border-staff-control px-3 text-xs text-ivory hover:border-staff-focus">
                {labels.clearRange}
              </button>
            )}
          </div>
          {invalidRange && <p role="alert" className="text-sm text-staff-danger">{labels.rangeInvalid}</p>}
        </fieldset>
      </div>

      <div className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-5">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <div className="flex shrink-0 gap-1.5">
            <MonthNavButton label={labels.yearPrev} glyph="«" onClick={() => moveCalendar(-12)} />
            <MonthNavButton label={labels.monthPrev} glyph="‹" onClick={() => moveCalendar(-1)} />
          </div>
          <p aria-live="polite" className="min-w-0 text-center text-base leading-tight font-semibold capitalize text-ivory sm:min-w-40">
            {monthLabel}
          </p>
          <div className="flex shrink-0 gap-1.5">
            <MonthNavButton label={labels.monthNext} glyph="›" onClick={() => moveCalendar(1)} />
            <MonthNavButton label={labels.yearNext} glyph="»" onClick={() => moveCalendar(12)} />
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 text-center text-[11px] uppercase tracking-wide text-mist">
              {weekdayLabels.map((label) => (
                <div key={label} className="px-1 py-2">{label}</div>
              ))}
            </div>

            <div className="divide-y divide-line rounded-xl border border-line">
              {Array.from({ length: days.length / 7 }, (_, index) => {
                const week = days.slice(index * 7, index * 7 + 7);
                return (
                  <div className="relative isolate" key={index}>
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 grid grid-cols-7 divide-x divide-line">
                      {week.map((day, column) => (
                        <div key={column} className={day && isDayInRange(toDayKey(day), rangeStart, rangeEnd) ? "bg-burgundy/10" : ""} />
                      ))}
                    </div>

                    <div className="grid grid-cols-7">
                      {week.map((day, column) => {
                        if (!day) return <div key={column} />;
                        const key = toDayKey(day);
                        const isToday = key === toDayKey(new Date());
                        const inRange = isDayInRange(key, rangeStart, rangeEnd);
                        const isEdge = key === rangeStart || key === rangeEnd;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => selectDay(key)}
                            aria-label={day.toLocaleDateString(intlLocales[locale], { dateStyle: "full", timeZone: "UTC" })}
                            aria-pressed={inRange}
                            className={dayCellClass({ isToday, inRange, isEdge })}
                          >
                            {day.getUTCDate()}
                            {isToday && <span className="ml-2 text-[10px] text-mist">{labels.today}</span>}
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid gap-y-1 pb-2">
                      {orderGroups.map((group) => {
                        if (!week.some((day) => {
                          if (!day) return false;
                          const key = toDayKey(day);
                          return (!selectedSpan || isDayInRange(key, selectedSpan.start, selectedSpan.end)) &&
                            rangeOverlapsOrder(daySpan(key, selectedSpan), group.order);
                        })) return null;

                        const rows = [
                          group.orderResource,
                          ...group.vehicles.flatMap(({ resource, drivers }) => [resource, ...drivers]),
                          ...group.directDrivers,
                        ];
                        return (
                          <div key={group.order.id} className="grid gap-y-1 rounded-lg border border-burgundy/40 bg-burgundy/5 py-1">
                            {rows.map((resource) => (
                              <ResourceWeek key={resource.kind + resource.id} resource={resource} week={week} selectedSpan={selectedSpan} labels={labels} onOpenOrders={openOrderSummary} />
                            ))}
                          </div>
                        );
                      })}
                      {resources.map((resource) => (
                        <ResourceWeek key={resource.kind + resource.id} resource={resource} week={week} selectedSpan={selectedSpan} labels={labels} onOpenOrders={openOrderSummary} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <CalendarOrderSummary
        dialogRef={summaryRef}
        orders={summaryOrderIds.flatMap((id) => assignedOrders.find((order) => order.id === id) ?? [])}
        employees={employees}
        vehicles={vehicles}
      />

      {(orderGroups.length > 0 || freeResources.length > 0) && (
        <section className="overflow-x-auto rounded-2xl border border-line bg-card p-4 sm:p-5">
          <div className="min-w-[740px]">
            <div className={`${flowGridClass} px-3 pb-3 text-sm font-semibold text-ivory`}>
              <h2>{labels.departureDate}</h2>
              <h2>{labels.orderSection}</h2>
              <h2>{labels.fleetSection}</h2>
              <h2>{labels.employeesSection}</h2>
            </div>
            <div className="divide-y divide-line border-t border-line">
              {orderGroups.map((group) => (
                <OrderFlow key={group.order.id} group={group} onOpen={() => openOrderSummary([group.order])} />
              ))}
              {freeResources.length > 0 && (
                <div className={`${flowGridClass} px-3 py-3`}>
                  <div className="col-start-3 grid content-start gap-2">
                    {freeResources.filter((resource) => resource.kind === "bus").map((resource) => (
                      <div key={resource.id} className={flowCardClass}>{resource.name} · {labels.free}</div>
                    ))}
                  </div>
                  <div className="grid content-start gap-2">
                    {freeResources.filter((resource) => resource.kind === "driver").map((resource) => (
                      <div key={resource.id} className={flowCardClass}>{resource.name} · {labels.free}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function MonthNavButton({ label, glyph, onClick }: { label: string; glyph: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-md border border-staff-control bg-card text-xl leading-none text-ivory shadow-sm hover:bg-staff-hover"
    >
      <span aria-hidden="true">{glyph}</span>
    </button>
  );
}

function ModeButton({
  active,
  icon,
  mode,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: CalendarResource["kind"];
  mode: ResourceMode;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 py-1.5 text-left transition ${
        mode === "available"
          ? active ? "border-staff-success-line bg-staff-success-surface text-staff-success" : "border-staff-success-line bg-night/40 text-staff-success hover:border-staff-success-line"
          : active ? "border-staff-danger-line bg-staff-danger-surface text-staff-danger" : "border-staff-danger-line bg-night/40 text-staff-danger hover:border-staff-danger-line"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2 text-sm font-medium"><ResourceIcon kind={icon} />{label}</span>
      <strong className="shrink-0 text-[1.75rem] leading-none font-bold tabular-nums">{count}</strong>
    </button>
  );
}

function ResourceIcon({ kind }: { kind: CalendarResource["kind"] }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0"
      fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {kind === "bus" ? (
        <><rect x="4" y="3" width="16" height="16" rx="3" /><path d="M4 10h16M7 19v2m10-2v2M7.5 15h.01M16.5 15h.01" /></>
      ) : kind === "order" ? (
        <><rect x="4" y="6" width="16" height="14" rx="2" /><path d="M8 6V4h8v2M9 10v6m6-6v6" /></>
      ) : (
        <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-4 3.4-6 7-6s6.3 2 7 6" /></>
      )}
    </svg>
  );
}

function ResourceWeek({
  resource,
  week,
  selectedSpan,
  labels,
  onOpenOrders,
}: {
  resource: CalendarResource;
  week: (Date | null)[];
  selectedSpan: DateSpan | null;
  labels: Labels;
  onOpenOrders: (orders: StaffOrder[]) => void;
}) {
  const runs: { start: number; end: number; mode: ResourceStatus }[] = [];
  week.forEach((day, column) => {
    if (!day) return;
    const key = toDayKey(day);
    if (selectedSpan && (key < selectedSpan.start || key > selectedSpan.end)) return;
    const mode = resource.statusOn(daySpan(key, selectedSpan));
    if (!mode || (resource.modes.length > 0 && (mode === "unavailable" || !resource.modes.includes(mode)))) return;
    const previous = runs.at(-1);
    if (previous?.mode === mode && previous.end === column - 1) {
      previous.end = column;
    } else {
      runs.push({ start: column, end: column, mode });
    }
  });
  if (runs.length === 0) return null;

  return (
    <div className="grid grid-cols-7">
      {runs.map(({ start, end, mode }) => {
        const available = mode === "available";
        const name = resource.name;
        const status = resource.kind === "order"
          ? (available ? labels.orderReserved : labels.orderReady)
          : (available ? labels.free : mode === "scheduled" ? labels.busy : labels.unavailable);
        const startDay = week[start];
        const endDay = week[end];
        const firstDate = formatDate(startDay ? toDayKey(startDay) : undefined);
        const lastDate = formatDate(endDay ? toDayKey(endDay) : undefined);
        const period = start === end ? firstDate : `${firstDate} – ${lastDate}`;
        const bookings = resource.kind === "order" || mode === "scheduled"
          ? resource.bookings.filter((order) => week.slice(start, end + 1).some((day) =>
              day && rangeOverlapsOrder(daySpan(toDayKey(day), selectedSpan), order),
            ))
          : [];
        const Bar = bookings.length > 0 ? "button" : "div";
        return (
          <Bar
            key={start}
            type={bookings.length > 0 ? "button" : undefined}
            onClick={bookings.length > 0 ? () => onOpenOrders(bookings) : undefined}
            title={`${name} · ${status} · ${period}`}
            style={{ gridColumn: `${start + 1} / ${end + 2}`, gridRow: 1 }}
            className={`mx-0.5 flex min-w-0 items-center gap-1 rounded border px-1.5 py-0.5 text-left text-xs ${bookings.length ? "cursor-pointer hover:underline" : ""} ${
              available ? "border-staff-success-line bg-staff-success-surface text-staff-success" :
                mode === "scheduled" ? "border-staff-danger-line bg-staff-danger-surface text-staff-danger" :
                  "border-staff-control bg-staff-subtle text-mist"
            }`}
          >
            <ResourceIcon kind={resource.kind} />
            <span className="truncate"><span className="font-semibold">{name}</span> · {status}</span>
          </Bar>
        );
      })}
    </div>
  );
}

const flowGridClass = "grid grid-cols-[8rem_repeat(3,minmax(0,1fr))] gap-x-8";
const flowCardClass = "relative min-w-0 rounded-lg border border-line bg-night px-3 py-2 text-sm break-words text-ivory";
const flowLinkClass = "before:absolute before:top-5 before:right-full before:w-8 before:border-t before:border-burgundy after:absolute after:top-[17px] after:right-full after:border-y-[4px] after:border-l-[5px] after:border-y-transparent after:border-l-burgundy";
const flowBranchClass = "relative before:absolute before:top-0 before:-left-4 before:h-full before:border-l before:border-burgundy first:before:top-5 first:before:h-[calc(100%-1.25rem)] last:before:h-5 only:before:hidden [&:not(:first-child)>div]:before:w-4";

function OrderFlow({ group, onOpen }: { group: OrderGroup; onOpen: () => void }) {
  return (
    <div className={`${flowGridClass} items-start px-3 py-3`}>
      <time dateTime={group.order.departureOn ?? undefined} className="py-2 text-sm tabular-nums text-mist">
        {formatDate(group.order.departureOn)}
      </time>
      <button type="button" onClick={onOpen} className="min-w-0 py-2 text-left text-sm break-words text-ivory underline-offset-4 hover:underline">
        {group.orderResource.name}
      </button>
      {group.vehicles.length > 0 && (
        <ul className="col-span-2 grid">
          {group.vehicles.map(({ resource, drivers }) => (
            <li key={resource.id} className={`${flowBranchClass} grid grid-cols-2 items-start gap-x-8 pb-2 last:pb-0`}>
              <div className={`${flowCardClass} ${flowLinkClass}`}>{resource.name}</div>
              <FlowDrivers drivers={drivers} />
            </li>
          ))}
          {group.directDrivers.length > 0 && (
            <li className={`${flowBranchClass} grid grid-cols-2 items-start gap-x-8`}>
              <div aria-hidden="true" className="relative mt-5 border-t border-burgundy before:absolute before:right-full before:-top-px before:border-t before:border-burgundy" />
              <FlowDrivers drivers={group.directDrivers} />
            </li>
          )}
        </ul>
      )}
      {group.vehicles.length === 0 && group.directDrivers.length > 0 && (
        <FlowDrivers drivers={group.directDrivers} crossVehicleColumn />
      )}
    </div>
  );
}

function FlowDrivers({ drivers, crossVehicleColumn = false }: { drivers: CalendarResource[]; crossVehicleColumn?: boolean }) {
  if (!drivers.length) return null;
  return (
    <ul className={crossVehicleColumn ? "col-start-4 grid" : "grid"}>
      {drivers.map((driver) => (
        <li key={driver.id} className={`${flowBranchClass} pb-2 last:pb-0 ${crossVehicleColumn ? "first:[&>div]:before:w-[calc(100%+4rem)]" : ""}`}>
          <div className={`${flowCardClass} ${flowLinkClass}`}>{driver.name}</div>
        </li>
      ))}
    </ul>
  );
}

function dayCellClass({
  isToday,
  inRange,
  isEdge,
}: {
  isToday: boolean;
  inRange: boolean;
  isEdge: boolean;
}) {
  const base = "min-h-10 rounded-md px-2 py-1 text-left text-xs text-ivory transition hover:border-staff-focus";
  if (isEdge) return `${base} border border-burgundy bg-burgundy/20`;
  if (inRange) return `${base} border border-burgundy/40 bg-burgundy/10`;
  if (isToday) return `${base} border border-ivory/30 bg-staff-subtle`;
  return `${base} border border-transparent hover:bg-staff-hover`;
}

function isDayInRange(day: string, start: string, end: string) {
  if (!start) return false;
  if (!end) return day === start;
  return day >= start && day <= end;
}

function daySpan(day: string, selectedSpan: DateSpan | null): DateSpan {
  return {
    start: day,
    end: day,
    startTime: day === selectedSpan?.start ? selectedSpan.startTime : undefined,
    endTime: day === selectedSpan?.end ? selectedSpan.endTime : undefined,
  };
}

function buildMonthDays(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const startPad = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: Array<Date | null> = Array.from({ length: startPad }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(Date.UTC(year, month, day)));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}
