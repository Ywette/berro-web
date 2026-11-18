import type { OrderCalculation } from "@/types/dashboard";

export function calculationTotal(values: OrderCalculation): number {
  return Math.round((values.vehicleCost + values.extraExpenses) * 100) / 100;
}
