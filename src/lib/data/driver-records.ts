import "server-only";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { isDriverStatus, type DriverStatus } from "@/types/staff";

export type DriverRecord = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  status: DriverStatus;
  note: string | null;
  updated_at: string | null;
};

// null means Supabase is not configured; an empty array means no drivers exist.
export async function listDriverRecords(): Promise<DriverRecord[] | null> {
  const db = createServiceSupabaseClient();
  if (!db) return null;
  const { data, error } = await db.from("drivers")
    .select("id, full_name, email, phone, is_active, status, note, updated_at")
    .order("full_name");
  if (error) {
    console.error("[drivers] supabase read failed", error.message);
    throw new Error("Could not load drivers. Check the drivers table and server database configuration.");
  }
  return (data ?? []).map((row) => ({ ...row, status: isDriverStatus(row.status) ? row.status : "unavailable" }));
}
