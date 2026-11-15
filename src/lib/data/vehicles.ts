import type { FleetVehicle } from "@/lib/content/fleet";
import {
  deleteFleetVehicle,
  insertFleetVehicle,
  readFleetStore,
  updateFleetVehicle,
} from "@/lib/fleet/store";

export async function listVehicles(): Promise<FleetVehicle[]> {
  return readFleetStore();
}

export async function createVehicle(vehicle: FleetVehicle): Promise<FleetVehicle> {
  return insertFleetVehicle(vehicle);
}

export async function updateVehicle(vehicle: FleetVehicle): Promise<FleetVehicle | null> {
  return updateFleetVehicle(vehicle);
}

export async function removeVehicle(id: string): Promise<boolean> {
  return deleteFleetVehicle(id);
}
