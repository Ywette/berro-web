import type { OrderCalculation, StaffOrder } from "@/types/dashboard";

const prefix = "berro-order-calculation:";

export function saveLocalCalculation(id: string, calculation: OrderCalculation, price: number) {
  localStorage.setItem(prefix + id, JSON.stringify({ calculation, price }));
}

export function removeLocalCalculation(id: string) {
  localStorage.removeItem(prefix + id);
}

export function applyLocalCalculations(orders: StaffOrder[]): StaffOrder[] {
  return orders.map((order) => {
    try {
      const raw = localStorage.getItem(prefix + order.id);
      if (!raw) return order;
      const saved = JSON.parse(raw);
      if (!saved.calculation || typeof saved.price !== "number" || !Number.isFinite(saved.price)) return order;
      return { ...order, calculation: saved.calculation, price: saved.price };
    } catch {
      return order;
    }
  });
}
