export const DEFAULT_STOP_WAIT_MINUTES = 15;

export type QuoteStop = {
  id: string;
  name: string;
  waitMinutes: number;
};

export type PlanStopInput = {
  name: string;
  waitMinutes?: number | null;
};

export function normalizeStopName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function createStop(
  name: string,
  waitMinutes: number = DEFAULT_STOP_WAIT_MINUTES,
  id = createStopId(),
): QuoteStop {
  return {
    id,
    name: name.trim(),
    waitMinutes: sanitizeWaitMinutes(waitMinutes),
  };
}

export function mergeStops(existing: QuoteStop[], incoming: PlanStopInput[]): QuoteStop[] {
  const map = new Map<string, QuoteStop>();

  for (const stop of existing) {
    const key = normalizeStopName(stop.name);
    if (!key) continue;
    map.set(key, stop);
  }

  for (const stop of incoming) {
    const key = normalizeStopName(stop.name ?? "");
    if (!key) continue;
    const wait = sanitizeWaitMinutes(
      stop.waitMinutes == null ? DEFAULT_STOP_WAIT_MINUTES : Number(stop.waitMinutes),
    );
    const previous = map.get(key);
    if (previous) {
      map.set(key, {
        ...previous,
        waitMinutes: Math.max(previous.waitMinutes, wait),
      });
    } else {
      map.set(key, createStop(stop.name, wait));
    }
  }

  return [...map.values()];
}

/** Sum stop pauses + plan waiting that is not already attributed to a named stop. */
export function totalWaitingMinutes(stops: QuoteStop[], otherWaitingMinutes = 0) {
  const fromStops = stops.reduce((sum, stop) => sum + Math.max(0, stop.waitMinutes), 0);
  return fromStops + Math.max(0, Math.round(otherWaitingMinutes));
}

export function formatWaitingHours(totalMinutes: number) {
  const hours = totalMinutes / 60;
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(2).replace(/\.?0+$/, "");
}

export function encodeStops(stops: QuoteStop[]) {
  return JSON.stringify(
    stops
      .filter((stop) => normalizeStopName(stop.name))
      .map((stop) => ({ name: stop.name.trim(), waitMinutes: sanitizeWaitMinutes(stop.waitMinutes) })),
  );
}

export function decodeStops(value: string | undefined): QuoteStop[] {
  if (!value?.trim()) return [];
  try {
    const parsed = JSON.parse(value) as PlanStopInput[];
    if (!Array.isArray(parsed)) return [];
    return mergeStops([], parsed);
  } catch {
    return [];
  }
}

function sanitizeWaitMinutes(value: number) {
  if (!Number.isFinite(value) || value < 0) return DEFAULT_STOP_WAIT_MINUTES;
  return Math.min(24 * 60, Math.round(value));
}

function createStopId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `stop-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
