import type { TransportKind } from "@/lib/content/transport/types";

const KIND_ALIASES: Record<string, TransportKind> = {
  van: "van",
  minibus: "van",
  mikroautobuss: "van",
  mikroautobusi: "van",
  coach: "coach",
  autobuss: "coach",
  autobusi: "coach",
  autobus: "coach",
  vip: "vip",
  auto: "vip",
  car: "vip",
  "car rental": "vip",
  "auto noma": "vip",
  retro: "retro",
  retroauto: "retro",
  "retro auto": "retro",
  "retro-auto": "retro",
};

/** Map DB / form / label variants onto the four fleet kinds. */
export function normalizeFleetKind(value: unknown): TransportKind {
  if (typeof value !== "string") return "van";
  const key = value.trim().toLowerCase().replace(/\s+/g, " ");
  if (!key) return "van";
  return KIND_ALIASES[key] ?? (isTransportKind(key) ? key : "van");
}

function isTransportKind(value: string): value is TransportKind {
  return value === "van" || value === "minibus" || value === "coach" || value === "vip" || value === "retro";
}

/** Autoparks section membership after normalization. */
export function fleetKindMatchesSection(
  kind: TransportKind | string,
  sectionKinds: readonly string[],
): boolean {
  const normalized = normalizeFleetKind(kind);
  // Treat legacy "minibus" the same as van / Mikroautobuss.
  const candidates = normalized === "van" ? ["van", "minibus"] : [normalized];
  return candidates.some((item) => sectionKinds.includes(item));
}
