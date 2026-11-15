import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FleetVehicle } from "@/lib/content/fleet";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "fleet-transports.json");

async function ensureStore(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(STORE_PATH, "utf8");
  } catch {
    await writeFile(STORE_PATH, "[]\n", "utf8");
  }
}

export async function readFleetStore(): Promise<FleetVehicle[]> {
  await ensureStore();
  const raw = await readFile(STORE_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw) as FleetVehicle[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeFleetStore(vehicles: FleetVehicle[]): Promise<void> {
  await ensureStore();
  await writeFile(STORE_PATH, `${JSON.stringify(vehicles, null, 2)}\n`, "utf8");
}

export async function insertFleetVehicle(vehicle: FleetVehicle): Promise<FleetVehicle> {
  const vehicles = await readFleetStore();
  vehicles.unshift(vehicle);
  await writeFleetStore(vehicles);
  return vehicle;
}

export async function updateFleetVehicle(vehicle: FleetVehicle): Promise<FleetVehicle | null> {
  const vehicles = await readFleetStore();
  const index = vehicles.findIndex((item) => item.id === vehicle.id);
  if (index < 0) return null;
  vehicles[index] = vehicle;
  await writeFleetStore(vehicles);
  return vehicle;
}

export async function deleteFleetVehicle(id: string): Promise<boolean> {
  const vehicles = await readFleetStore();
  const next = vehicles.filter((vehicle) => vehicle.id !== id);
  if (next.length === vehicles.length) return false;
  await writeFleetStore(next);
  return true;
}
