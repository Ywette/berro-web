"use client";

import { useMemo, useState } from "react";
import type { StaffOrder } from "@/types/dashboard";
import type { DriverAvailability } from "@/types/staff";

type Labels = {
  monthPrev: string;
  monthNext: string;
  today: string;
  busy: string;
  free: string;
  noDrivers: string;
  statuses: Record<DriverAvailability["status"], string>;
};

type DriverCalendarProps = {
  drivers: DriverAvailability[];
  orders: StaffOrder[];
  locale: "lv" | "en";
  labels: Labels;
};

export function DriverCalendar({ drivers, orders, locale, labels }: DriverCalendarProps) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  });

  const year = cursor.getUTCFullYear();
  const month = cursor.getUTCMonth();
  const monthLabel = new Intl.DateTimeFormat(locale === "lv" ? "lv-LV" : "en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(cursor);

  const days = useMemo(() => buildMonthDays(year, month), [year, month]);
  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale === "lv" ? "lv-LV" : "en-GB", {
      weekday: "short",
      timeZone: "UTC",
    });
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(Date.UTC(2024, 0, index + 1));
      return formatter.format(date);
    });
  }, [locale]);

  const assignmentsByDay = useMemo(() => {
    const map = new Map<string, { driverId: string; driverName: string; reference: string }[]>();

    for (const order of orders) {
      if (!order.assignedDriverId || !order.departureOn) {
        continue;
      }

      const end = order.returnOn ?? order.departureOn;
      for (const day of eachDay(order.departureOn, end)) {
        const list = map.get(day) ?? [];
        list.push({
          driverId: order.assignedDriverId,
          driverName: order.assignedDriverName ?? order.assignedDriverId,
          reference: order.reference,
        });
        map.set(day, list);
      }
    }

    return map;
  }, [orders]);

  if (drivers.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-card px-5 py-6 text-sm text-mist">
        {labels.noDrivers}
      </p>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-end gap-2">
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
          const isToday = key === toDayKey(new Date());

          return (
            <div
              key={key}
              className={
                isToday
                  ? "min-h-24 rounded-xl border border-ivory/30 bg-white/5 p-2"
                  : "min-h-24 rounded-xl border border-white/8 bg-night/40 p-2"
              }
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs text-ivory">{day.getUTCDate()}</span>
                {isToday ? (
                  <span className="text-[10px] text-mist">{labels.today}</span>
                ) : null}
              </div>
              <ul className="mt-2 space-y-1">
                {assignments.slice(0, 3).map((item) => (
                  <li
                    key={`${item.reference}-${item.driverId}`}
                    className="truncate rounded-md bg-burgundy/20 px-1.5 py-1 text-[10px] text-rose-100"
                    title={`${item.driverName} · ${item.reference}`}
                  >
                    {item.driverName} · {item.reference}
                  </li>
                ))}
                {assignments.length > 3 ? (
                  <li className="text-[10px] text-mist">+{assignments.length - 3}</li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {drivers.map((driver) => {
          const busyThisMonth = orders.some(
            (order) =>
              order.assignedDriverId === driver.id &&
              order.departureOn &&
              overlapsMonth(order.departureOn, order.returnOn ?? order.departureOn, year, month),
          );

          return (
            <div key={driver.id} className="rounded-xl border border-white/8 bg-night/50 px-3 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-ivory">{driver.fullName}</p>
                <span className="text-[11px] text-mist">
                  {busyThisMonth ? labels.busy : labels.free}
                </span>
              </div>
              <p className="mt-1 text-xs text-mist">{labels.statuses[driver.status]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
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

function overlapsMonth(start: string, end: string, year: number, month: number) {
  const monthStart = new Date(Date.UTC(year, month, 1));
  const monthEnd = new Date(Date.UTC(year, month + 1, 0));
  const rangeStart = new Date(`${start}T00:00:00Z`);
  const rangeEnd = new Date(`${end}T00:00:00Z`);
  return rangeStart <= monthEnd && rangeEnd >= monthStart;
}
