import { demoOrders } from "@/lib/data/demo-dashboard";
import type { StaffOrder } from "@/types/dashboard";

export async function listOrders(): Promise<StaffOrder[]> {
  return demoOrders;
}
