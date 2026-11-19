import { totalWaitingMinutes } from "@/lib/orders/stops";

export function earliestArrival(
  departure: string | undefined,
  drivingMinutes: number | null | undefined,
  stops: Parameters<typeof totalWaitingMinutes>[0] = [],
) {
  if (!departure || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(departure)) return undefined;
  const start = Date.parse(`${departure}:00Z`);
  if (!Number.isFinite(start) || new Date(start).toISOString().slice(0, 16) !== departure) return undefined;
  if (drivingMinutes == null) return departure;

  const arrival = start + (Math.max(0, drivingMinutes) + totalWaitingMinutes(stops)) * 60_000;
  const pickerStep = 5 * 60_000;
  return new Date(Math.ceil(arrival / pickerStep) * pickerStep).toISOString().slice(0, 16);
}
