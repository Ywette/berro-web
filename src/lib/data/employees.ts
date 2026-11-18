import { demoEmployees } from "@/lib/data/demo-dashboard";
import type { Employee } from "@/types/staff";
import { listDriverRecords } from "@/lib/data/driver-records";

export async function listEmployees(): Promise<Employee[]> {
  const drivers = await listDriverRecords();
  if (drivers === null) return demoEmployees;
  return [
    ...drivers.map((driver): Employee => ({
      id: driver.id, fullName: driver.full_name, email: driver.email,
      phone: driver.phone, role: "driver", isActive: driver.is_active,
    })),
    ...demoEmployees.filter((employee) => employee.role !== "driver"),
  ];
}
