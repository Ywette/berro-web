import type { FleetVehicle } from "@/lib/content/fleet";
import { readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import { buildFleetSeed } from "@/lib/fleet/seed";
import { pickLocalizedText } from "@/lib/i18n/localized-content";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import {
  fleetVehicleFromRow,
  fleetVehicleToRow,
  normalizeFleetVehicle,
  type FleetVehicleRow,
} from "@/lib/supabase/fleet-map";

const STORE_FILE = "fleet-transports.json";
const TABLE = "fleet_vehicles";

async function readFleetFileFallback(): Promise<FleetVehicle[]> {
  const raw = await readJsonFile(STORE_FILE);
  if (!raw) return buildFleetSeed();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return buildFleetSeed();
    const normalized = parsed
      .map(normalizeFleetVehicle)
      .filter((item): item is FleetVehicle => item !== null);
    return normalized.length > 0 ? normalized : buildFleetSeed();
  } catch {
    return buildFleetSeed();
  }
}

export async function readFleetStore(): Promise<FleetVehicle[]> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return readFleetFileFallback();

  const { data, error } = await supabase.from(TABLE).select("*");

  if (error) {
    console.error("[fleet] supabase read failed", error.message);
    return readFleetFileFallback();
  }

  const rows = (data ?? []) as FleetVehicleRow[];
  return rows
    .map(fleetVehicleFromRow)
    .sort((a, b) =>
      pickLocalizedText(a.name, "lv").localeCompare(pickLocalizedText(b.name, "lv"), "lv"),
    );
}

export async function writeFleetStore(vehicles: FleetVehicle[]): Promise<void> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    await writeJsonFile(STORE_FILE, `${JSON.stringify(vehicles, null, 2)}\n`);
    return;
  }

  const { error: deleteError } = await supabase
    .from(TABLE)
    .delete()
    .neq("id", "__never__");
  if (deleteError) throw new Error(deleteError.message);

  if (vehicles.length === 0) return;
  const { error } = await supabase.from(TABLE).insert(vehicles.map(fleetVehicleToRow));
  if (error) throw new Error(error.message);
}

export async function insertFleetVehicle(vehicle: FleetVehicle): Promise<FleetVehicle> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    const vehicles = await readFleetFileFallback();
    vehicles.unshift(vehicle);
    await writeJsonFile(STORE_FILE, `${JSON.stringify(vehicles, null, 2)}\n`);
    return vehicle;
  }

  const { error } = await supabase.from(TABLE).upsert(fleetVehicleToRow(vehicle), {
    onConflict: "id",
  });
  if (error) throw new Error(error.message);
  return vehicle;
}

export async function updateFleetVehicle(vehicle: FleetVehicle): Promise<FleetVehicle | null> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    const vehicles = await readFleetFileFallback();
    const index = vehicles.findIndex((item) => item.id === vehicle.id);
    if (index < 0) return null;
    vehicles[index] = vehicle;
    await writeJsonFile(STORE_FILE, `${JSON.stringify(vehicles, null, 2)}\n`);
    return vehicle;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...fleetVehicleToRow(vehicle), updated_at: new Date().toISOString() })
    .eq("id", vehicle.id)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return fleetVehicleFromRow(data as FleetVehicleRow);
}

export async function deleteFleetVehicle(id: string): Promise<boolean> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    const vehicles = await readFleetFileFallback();
    const next = vehicles.filter((vehicle) => vehicle.id !== id);
    if (next.length === vehicles.length) return false;
    await writeJsonFile(STORE_FILE, `${JSON.stringify(next, null, 2)}\n`);
    return true;
  }

  const { data, error } = await supabase.from(TABLE).delete().eq("id", id).select("id");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}
