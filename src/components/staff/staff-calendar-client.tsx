"use client";

import { formatDate } from "@/lib/content/format-date";

import { useMemo, useState, type ReactNode } from "react";
import { useAssignedOrders } from "@/components/staff/use-assigned-orders";
import type { FleetVehicle } from "@/lib/content/fleet";
import { intlLocales, type Locale } from "@/lib/i18n/locale";
import {
  isEmployeeFree,
  isEmployeeScheduled,
  isVehicleFree,
  isVehicleScheduled,
  resolvedRange,
  vehicleLabel,
  type DateSpan,
} from "@/lib/staff/availability";
import type { StaffOrder } from "@/types/dashboard";
import type { Employee } from "@/types/staff";

type ResourceMode = "available" | "scheduled";

type Labels = {
  availabilityRange: string;
  startTime: string;
  endTime: string;
  clearRange: string;
  allEmployees: string;
  allTransports: string;
  availableStaff: string;
  scheduledStaff: string;
  availableVehicles: string;
  scheduledVehicles: string;
  viewStaffAvailable: string;
  viewStaffScheduled: string;
  viewFleetAvailable: string;
  viewFleetScheduled: string;
  noStaffInRange: string;
  noFleetInRange: string;
  noStaffScheduled: string;
  noFleetScheduled: string;
  monthPrev: string;
  monthNext: string;
  today: string;
  busy: string;
  free: string;
  employeesSection: string;
  fleetSection: string;
  roles: Record<Employee["role"], string>;
};

type StaffCalendarClientProps = {
  employees: Employee[];
  vehicles: FleetVehicle[];
  orders: StaffOrder[];
  locale: Locale;
  labels: Labels;
};

type CalendarAssignment = {
  kind: "employee" | "vehicle";
  resourceId: string;
  resourceName: string;
  reference: string;
};

export function StaffCalendarClient({
  employees,
  vehicles,
  orders,
  locale,
  labels,
}: StaffCalendarClientProps) {
  const [assignedOrders] = useAssignedOrders(orders);
  const [fleetModes, setFleetModes] = useState<ResourceMode[]>(["available"]);
  const [staffModes, setStaffModes] = useState<ResourceMode[]>(["available"]);
  const [range, setRange] = useState({ from: "", to: "" });
  const [times, setTimes] = useState({ start: "", end: "" });
  const [employeeId, setEmployeeId] = useState("all");
  const [vehicleId, setVehicleId] = useState("all");
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  });

  const year = cursor.getUTCFullYear();
  const month = cursor.getUTCMonth();
  const dateFilter = resolvedRange(range.from, range.to);
  const focusSpan = useMemo<DateSpan>(() => {
    if (range.from && range.to && range.from <= range.to) {
      return { start: range.from, end: range.to, startTime: times.start, endTime: times.end };
    }
    if (range.from && !range.to) {
      return { start: range.from, end: range.from, startTime: times.start, endTime: times.end };
    }
    return {
      start: toDayKey(new Date(Date.UTC(year, month, 1))),
      end: toDayKey(new Date(Date.UTC(year, month + 1, 0))),
    };
  }, [month, range.from, range.to, times.start, times.end, year]);

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
        .filter((vehicle) => vehicle.isActive)
        .sort((left, right) => vehicleLabel(left).localeCompare(vehicleLabel(right), locale)),
    [vehicles, locale],
  );

  const availableEmployees = useMemo(
    () =>
      assignableEmployees.filter((employee) =>
        isEmployeeFree(employee, focusSpan, assignedOrders),
      ),
    [assignableEmployees, assignedOrders, focusSpan],
  );

  const scheduledEmployees = useMemo(
    () =>
      assignableEmployees.filter((employee) =>
        isEmployeeScheduled(employee, focusSpan, assignedOrders),
      ),
    [assignableEmployees, assignedOrders, focusSpan],
  );

  const availableVehicles = useMemo(
    () => activeVehicles.filter((vehicle) => isVehicleFree(vehicle, focusSpan, assignedOrders)),
    [activeVehicles, assignedOrders, focusSpan],
  );

  const scheduledVehicles = useMemo(
    () =>
      activeVehicles.filter((vehicle) => isVehicleScheduled(vehicle, focusSpan, assignedOrders)),
    [activeVehicles, assignedOrders, focusSpan],
  );

  const listedEmployees = assignableEmployees.filter((employee) =>
    staffModes.length === 0 ||
    (staffModes.includes("available") && availableEmployees.includes(employee)) ||
    (staffModes.includes("scheduled") && scheduledEmployees.includes(employee)),
  );
  const listedVehicles = activeVehicles.filter((vehicle) =>
    fleetModes.length === 0 ||
    (fleetModes.includes("available") && availableVehicles.includes(vehicle)) ||
    (fleetModes.includes("scheduled") && scheduledVehicles.includes(vehicle)),
  );

  const resolvedEmployeeId =
    employeeId === "all" || listedEmployees.some((employee) => employee.id === employeeId)
      ? employeeId
      : "all";
  const resolvedVehicleId =
    vehicleId === "all" || listedVehicles.some((vehicle) => vehicle.id === vehicleId)
      ? vehicleId
      : "all";

  const visibleEmployeeIds = useMemo(() => {
    if (resolvedEmployeeId !== "all") return new Set([resolvedEmployeeId]);
    return new Set(listedEmployees.map((employee) => employee.id));
  }, [listedEmployees, resolvedEmployeeId]);

  const visibleVehicleIds = useMemo(() => {
    if (resolvedVehicleId !== "all") return new Set([resolvedVehicleId]);
    return new Set(listedVehicles.map((vehicle) => vehicle.id));
  }, [listedVehicles, resolvedVehicleId]);

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

  const assignmentsByDay = useMemo(() => {
    const map = new Map<string, CalendarAssignment[]>();

    for (const order of assignedOrders) {
      if (order.status === "cancelled") continue;
      if (!order.departureOn) continue;
      const end = order.returnOn ?? order.departureOn;

      if (staffModes.includes("scheduled")) {
        if (order.assignedDriverId && visibleEmployeeIds.has(order.assignedDriverId)) {
          for (const day of eachDay(order.departureOn, end)) {
            const list = map.get(day) ?? [];
            list.push({
              kind: "employee",
              resourceId: order.assignedDriverId,
              resourceName: order.assignedDriverName ?? order.assignedDriverId,
              reference: order.reference,
            });
            map.set(day, list);
          }
        }

        if (order.assignedGuideId && visibleEmployeeIds.has(order.assignedGuideId)) {
          for (const day of eachDay(order.departureOn, end)) {
            const list = map.get(day) ?? [];
            list.push({
              kind: "employee",
              resourceId: order.assignedGuideId,
              resourceName: order.assignedGuideName ?? order.assignedGuideId,
              reference: order.reference,
            });
            map.set(day, list);
          }
        }
      }

      if (
        fleetModes.includes("scheduled") &&
        order.assignedVehicleId &&
        visibleVehicleIds.has(order.assignedVehicleId)
      ) {
        const vehicle = vehicles.find((item) => item.id === order.assignedVehicleId);
        for (const day of eachDay(order.departureOn, end)) {
          const list = map.get(day) ?? [];
          list.push({
            kind: "vehicle",
            resourceId: order.assignedVehicleId,
            resourceName: vehicle ? vehicleLabel(vehicle) : order.assignedVehicleId,
            reference: order.reference,
          });
          map.set(day, list);
        }
      }
    }

    return map;
  }, [
    assignedOrders,
    fleetModes,
    staffModes,
    vehicles,
    visibleEmployeeIds,
    visibleVehicleIds,
  ]);

  const freeByDay = useMemo(() => {
    const map = new Map<string, { staff: number; fleet: number; staffReserved: number; fleetReserved: number }>();

    for (const day of days) {
      if (!day) continue;
      const key = toDayKey(day);
      const selectedEnd = range.to || range.from;
      const validTimes = !range.from || !selectedEnd ||
        `${range.from}T${times.start || "00:00"}` < `${selectedEnd}T${times.end || "24:00"}`;
      const span = {
        start: key,
        end: key,
        startTime: validTimes && key === range.from ? times.start : "",
        endTime: validTimes && key === selectedEnd ? times.end : "",
      };
      let staff = 0;
      let fleet = 0;
      let staffReserved = 0;
      let fleetReserved = 0;

      if (staffModes.includes("available") || staffModes.length === 0) {
        const pool =
          resolvedEmployeeId === "all"
            ? listedEmployees
            : listedEmployees.filter((employee) => employee.id === resolvedEmployeeId);
        staff = pool.filter((employee) => isEmployeeFree(employee, span, assignedOrders)).length;
        if (staffModes.length === 0) {
          staffReserved = pool.filter((employee) => isEmployeeScheduled(employee, span, assignedOrders)).length;
        }
      }

      if (fleetModes.includes("available") || fleetModes.length === 0) {
        const pool =
          resolvedVehicleId === "all"
            ? listedVehicles
            : listedVehicles.filter((vehicle) => vehicle.id === resolvedVehicleId);
        fleet = pool.filter((vehicle) => isVehicleFree(vehicle, span, assignedOrders)).length;
        if (fleetModes.length === 0) {
          fleetReserved = pool.filter((vehicle) => isVehicleScheduled(vehicle, span, assignedOrders)).length;
        }
      }

      map.set(key, { staff, fleet, staffReserved, fleetReserved });
    }

    return map;
  }, [
    assignedOrders,
    days,
    fleetModes,
    listedEmployees,
    listedVehicles,
    resolvedEmployeeId,
    resolvedVehicleId,
    range.from,
    range.to,
    times.start,
    times.end,
    staffModes,
  ]);

  const rangeStart = dateFilter.ok ? dateFilter.span.start : range.from || "";
  const rangeEnd = dateFilter.ok ? dateFilter.span.end : range.to || range.from || "";
  const selectedRangeLabel =
    range.from && range.to
      ? `${formatDate(rangeStart)} – ${formatDate(rangeEnd)}`
      : range.from
        ? formatDate(range.from)
        : null;

  const fleetButtons: { id: ResourceMode; label: string; count: number; countLabel: string }[] = [
    {
      id: "available",
      label: labels.viewFleetAvailable,
      count: availableVehicles.length,
      countLabel: labels.availableVehicles,
    },
    {
      id: "scheduled",
      label: labels.viewFleetScheduled,
      count: scheduledVehicles.length,
      countLabel: labels.scheduledVehicles,
    },
  ];

  const staffButtons: { id: ResourceMode; label: string; count: number; countLabel: string }[] = [
    {
      id: "available",
      label: labels.viewStaffAvailable,
      count: availableEmployees.length,
      countLabel: labels.availableStaff,
    },
    {
      id: "scheduled",
      label: labels.viewStaffScheduled,
      count: scheduledEmployees.length,
      countLabel: labels.scheduledStaff,
    },
  ];

  function selectDay(dayKey: string) {
    if (!range.from || (range.from && range.to)) {
      setRange({ from: dayKey, to: "" });
      return;
    }

    if (dayKey < range.from) {
      setRange({ from: dayKey, to: range.from });
      return;
    }

    setRange({ from: range.from, to: dayKey });
  }

  function clearRange() {
    setRange({ from: "", to: "" });
    setTimes({ start: "", end: "" });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-5">
        <div className="overflow-x-auto pb-1">
          <div className="grid min-w-[680px] grid-cols-4 gap-2" role="group" aria-label={labels.availabilityRange}>
            {fleetButtons.map((button) => (
              <ModeButton key={`fleet-${button.id}`} active={fleetModes.includes(button.id)}
                icon="bus" mode={button.id} label={button.label} count={button.count} countLabel={button.countLabel}
                onClick={() => {
                  setFleetModes((current) => current.includes(button.id)
                    ? current.filter((mode) => mode !== button.id) : [...current, button.id]);
                }} />
            ))}
            {staffButtons.map((button) => (
              <ModeButton key={`staff-${button.id}`} active={staffModes.includes(button.id)}
                icon="driver" mode={button.id} label={button.label} count={button.count} countLabel={button.countLabel}
                onClick={() => {
                  setStaffModes((current) => current.includes(button.id)
                    ? current.filter((mode) => mode !== button.id) : [...current, button.id]);
                }} />
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs text-mist">
            <span>{labels.fleetSection}</span>
            <select
              value={resolvedVehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
              className="h-10 rounded-lg border border-white/15 bg-night px-3 text-sm text-ivory [color-scheme:dark]"
            >
              <option value="all">{labels.allTransports}</option>
              {listedVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicleLabel(vehicle)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-xs text-mist">
            <span>{labels.employeesSection}</span>
            <select
              value={resolvedEmployeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              className="h-10 rounded-lg border border-white/15 bg-night px-3 text-sm text-ivory [color-scheme:dark]"
            >
              <option value="all">{labels.allEmployees}</option>
              {listedEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName} · {labels.roles[employee.role]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
            <span className="text-mist">{labels.availabilityRange}</span>
            {selectedRangeLabel ? (
              <>
                <span className="text-ivory">{selectedRangeLabel}</span>
                <button
                  type="button"
                  onClick={clearRange}
                  className="rounded-full border border-white/20 px-2.5 py-1 text-xs text-ivory/80 hover:border-white/50"
                >
                  {labels.clearRange}
                </button>
              </>
            ) : (
              <span className="text-ivory/60">—</span>
            )}
          </div>

          {range.from && (
            <div className="flex flex-wrap items-end gap-3">
              <label className="grid gap-1 text-xs text-mist">{labels.startTime}
                <input type="time" value={times.start}
                  onChange={(event) => setTimes((current) => ({ ...current, start: event.target.value }))}
                  className="h-10 rounded-lg border border-white/15 bg-night px-3 text-sm text-ivory [color-scheme:dark]" />
              </label>
              <label className="grid gap-1 text-xs text-mist">{labels.endTime}
                <input type="time" value={times.end}
                  onChange={(event) => setTimes((current) => ({ ...current, end: event.target.value }))}
                  className="h-10 rounded-lg border border-white/15 bg-night px-3 text-sm text-ivory [color-scheme:dark]" />
              </label>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-ivory/80 hover:border-white/40"
              onClick={() => setCursor(new Date(Date.UTC(year, month - 1, 1)))}
            >
              {labels.monthPrev}
            </button>
            <p className="min-w-36 text-center text-sm capitalize text-ivory">{monthLabel}</p>
            <button
              type="button"
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-ivory/80 hover:border-white/40"
              onClick={() => setCursor(new Date(Date.UTC(year, month + 1, 1)))}
            >
              {labels.monthNext}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wide text-mist">
          {weekdayLabels.map((label) => (
            <div key={label} className="px-1 py-2">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`pad-${index}`} className="min-h-24 rounded-xl bg-transparent" />;
            }

            const key = toDayKey(day);
            const assignments = assignmentsByDay.get(key) ?? [];
            const freeCounts = freeByDay.get(key) ?? { staff: 0, fleet: 0, staffReserved: 0, fleetReserved: 0 };
            const isToday = key === toDayKey(new Date());
            const inRange = isDayInRange(key, rangeStart, rangeEnd);
            const isEdge = key === rangeStart || key === rangeEnd;

            return (
              <button
                key={key}
                type="button"
                onClick={() => selectDay(key)}
                aria-pressed={inRange}
                className={dayCellClass({ isToday, inRange, isEdge })}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs text-ivory">{day.getUTCDate()}</span>
                  {isToday ? <span className="text-[10px] text-mist">{labels.today}</span> : null}
                </div>

                <div className="mt-2 space-y-1 text-left">
                  {fleetModes.length === 0 && (
                    <DayAvailability kind="bus" label={labels.fleetSection} free={freeCounts.fleet}
                      reserved={freeCounts.fleetReserved} freeLabel={labels.free} reservedLabel={labels.busy} />
                  )}
                  {staffModes.length === 0 && (
                    <DayAvailability kind="driver" label={labels.employeesSection} free={freeCounts.staff}
                      reserved={freeCounts.staffReserved} freeLabel={labels.free} reservedLabel={labels.busy} />
                  )}
                  {fleetModes.includes("available") ? (
                    <p className="rounded-md bg-champagne/15 px-1.5 py-1 text-[10px] text-champagne">
                      {freeCounts.fleet} {labels.availableVehicles}
                    </p>
                  ) : null}
                  {staffModes.includes("available") ? (
                    <p className="rounded-md bg-pine/15 px-1.5 py-1 text-[10px] text-pine">
                      {freeCounts.staff} {labels.availableStaff}
                    </p>
                  ) : null}

                  {assignments.slice(0, 3).map((item) => (
                    <p
                      key={`${item.kind}-${item.reference}-${item.resourceId}`}
                      className={
                        item.kind === "vehicle"
                          ? "truncate rounded-md bg-champagne/15 px-1.5 py-1 text-[10px] text-champagne"
                          : "truncate rounded-md bg-burgundy/20 px-1.5 py-1 text-[10px] text-rose-100"
                      }
                      title={`${item.resourceName} · ${item.reference}`}
                    >
                      {item.resourceName}
                    </p>
                  ))}
                  {assignments.length > 3 ? (
                    <p className="text-[10px] text-mist">+{assignments.length - 3}</p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {fleetModes.length > 0 && <ResourceList
          title={labels.fleetSection}
          count={listedVehicles.length}
          countLabel={
            fleetModes.length === 2 ? "" : fleetModes.includes("available") ? labels.availableVehicles : labels.scheduledVehicles
          }
          emptyLabel={fleetModes.includes("available") ? labels.noFleetInRange : labels.noFleetScheduled}
        >
          {listedVehicles.map((vehicle) => {
            const scheduled = isVehicleScheduled(vehicle, focusSpan, assignedOrders);
            return (
              <li
                key={vehicle.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-white/8 bg-night/40 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm text-ivory">{vehicleLabel(vehicle)}</p>
                  <p className="text-xs text-mist">{vehicle.passengers} pax</p>
                </div>
                <span className="text-[11px] text-mist">{scheduled ? labels.busy : labels.free}</span>
              </li>
            );
          })}
        </ResourceList>}

        {staffModes.length > 0 && <ResourceList
          title={labels.employeesSection}
          count={listedEmployees.length}
          countLabel={staffModes.length === 2 ? "" : staffModes.includes("available") ? labels.availableStaff : labels.scheduledStaff}
          emptyLabel={staffModes.includes("available") ? labels.noStaffInRange : labels.noStaffScheduled}
        >
          {listedEmployees.map((employee) => {
            const scheduled = isEmployeeScheduled(employee, focusSpan, assignedOrders);
            return (
              <li
                key={employee.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-white/8 bg-night/40 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm text-ivory">{employee.fullName}</p>
                  <p className="text-xs text-mist">{labels.roles[employee.role]}</p>
                </div>
                <span className="text-[11px] text-mist">{scheduled ? labels.busy : labels.free}</span>
              </li>
            );
          })}
        </ResourceList>}
      </div>
    </div>
  );
}

function ModeButton({
  active,
  icon,
  mode,
  label,
  count,
  countLabel,
  onClick,
}: {
  active: boolean;
  icon: "bus" | "driver";
  mode: ResourceMode;
  label: string;
  count: number;
  countLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-left transition ${
        mode === "available"
          ? active ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200" : "border-emerald-400/25 bg-night/40 text-emerald-300/70 hover:border-emerald-400/50"
          : active ? "border-rose-400/60 bg-rose-400/15 text-rose-200" : "border-rose-400/25 bg-night/40 text-rose-300/70 hover:border-rose-400/50"
      }`}
    >
      <span className="flex items-center gap-2 text-sm font-medium"><ResourceIcon kind={icon} />{label}</span>
      <span className="mt-1 block text-xs text-mist">
        {count} {countLabel}
      </span>
    </button>
  );
}

function ResourceIcon({ kind }: { kind: "bus" | "driver" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0"
      fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {kind === "bus" ? (
        <><rect x="4" y="3" width="16" height="16" rx="3" /><path d="M4 10h16M7 19v2m10-2v2M7.5 15h.01M16.5 15h.01" /></>
      ) : (
        <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-4 3.4-6 7-6s6.3 2 7 6" /></>
      )}
    </svg>
  );
}

function DayAvailability({ kind, label, free, reserved, freeLabel, reservedLabel }: {
  kind: "bus" | "driver";
  label: string;
  free: number;
  reserved: number;
  freeLabel: string;
  reservedLabel: string;
}) {
  const description = `${label}: ${free} ${freeLabel}, ${reserved} ${reservedLabel}`;
  return (
    <p title={description} aria-label={description} className="flex flex-wrap items-center gap-1 text-[10px]">
      <span className="text-mist"><ResourceIcon kind={kind} /></span>
      {free > 0 && <span className="rounded bg-emerald-400/20 px-1 text-emerald-200">{free} {freeLabel}</span>}
      {reserved > 0 && <span className="rounded bg-rose-400/20 px-1 text-rose-200">{reserved} {reservedLabel}</span>}
      {free === 0 && reserved === 0 && <span className="text-mist">—</span>}
    </p>
  );
}

function ResourceList({
  title,
  count,
  countLabel,
  emptyLabel,
  children,
}: {
  title: string;
  count: number;
  countLabel: string;
  emptyLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-ivory">{title}</h2>
        <p className="text-xs text-mist">
          {count} {countLabel}
        </p>
      </div>
      {count === 0 ? (
        <p className="text-sm text-mist">{emptyLabel}</p>
      ) : (
        <ul className="grid gap-2">{children}</ul>
      )}
    </section>
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
  const base = "min-h-24 rounded-xl p-2 text-left transition hover:border-white/30";
  if (isEdge) return `${base} border border-burgundy bg-burgundy/20`;
  if (inRange) return `${base} border border-burgundy/40 bg-burgundy/10`;
  if (isToday) return `${base} border border-ivory/30 bg-white/5`;
  return `${base} border border-white/8 bg-night/40`;
}

function isDayInRange(day: string, start: string, end: string) {
  if (!start) return false;
  if (!end) return day === start;
  return day >= start && day <= end;
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

function eachDay(start: string, end: string) {
  const days: string[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);

  while (cursor <= last) {
    days.push(toDayKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}
