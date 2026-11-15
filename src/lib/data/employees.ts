import { demoEmployees } from "@/lib/data/demo-dashboard";
import type { Employee } from "@/types/staff";

export async function listEmployees(): Promise<Employee[]> {
  return demoEmployees;
}
