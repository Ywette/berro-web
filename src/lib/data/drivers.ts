import { demoDrivers } from "@/lib/data/demo-dashboard";
import type { DriverAvailability } from "@/types/staff";

export async function listDriverAvailability(): Promise<DriverAvailability[]> {
  return demoDrivers;
}
