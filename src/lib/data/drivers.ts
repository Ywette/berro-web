import { demoDrivers } from "@/lib/data/demo-dashboard";
import type { DriverAvailability } from "@/types/staff";
import { listDriverRecords } from "@/lib/data/driver-records";

export async function listDriverAvailability(): Promise<DriverAvailability[]> {
  const drivers = await listDriverRecords();
  if (drivers === null) return demoDrivers;
  return drivers.filter((driver) => driver.is_active).map((driver) => ({
    id: driver.id, fullName: driver.full_name, phone: driver.phone,
    status: driver.status, note: driver.note, updatedAt: driver.updated_at,
  }));
}
