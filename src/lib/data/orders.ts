import { demoOrders } from "@/lib/data/demo-dashboard";
import { ORDERS_TABLE } from "@/lib/orders/store";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { staffOrderFromRow, type OrderRow } from "@/lib/supabase/order-map";
import type { StaffOrder } from "@/types/dashboard";

export async function getOrder(id: string) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return demoOrders.find((order) => order.id === id) ?? null;
  const { data, error } = await supabase.from(ORDERS_TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("Could not load order.");
  return data ? staffOrderFromRow(data as OrderRow) : null;
}

export async function listOrders(): Promise<StaffOrder[]> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return demoOrders;

  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[orders] supabase read failed", error.message);
    throw new Error("Could not load orders.");
  }

  const rows = (data ?? []) as OrderRow[];
  return rows.map(staffOrderFromRow);
}
