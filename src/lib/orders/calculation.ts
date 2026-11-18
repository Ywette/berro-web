import type { OrderCalculation } from "@/types/dashboard";

export function calculationTotal(values: OrderCalculation): number {
  const fuel = values.kilometres * values.fuelConsumption / 100 * values.fuelPrice;
  return Math.round((fuel + values.driverCost + values.vehicleCost + values.extraExpenses) * 100) / 100;
}
