import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  isDriverStatus,
  type DriverAvailability,
  type DriverStatus,
} from "@/types/staff";

type AvailabilityRow = {
  status: string;
  note: string | null;
  updated_at: string;
};

export async function listDriverAvailability(): Promise<DriverAvailability[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("id, full_name, phone, driver_availability(status, note, updated_at)")
    .eq("role", "driver")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const availability = firstAvailability(row.driver_availability);

    return {
      id: row.id,
      fullName: row.full_name,
      phone: row.phone,
      status: availability?.status ?? "unavailable",
      note: availability?.note ?? null,
      updatedAt: availability?.updated_at ?? null,
    };
  });
}

function firstAvailability(
  value: AvailabilityRow | AvailabilityRow[] | null,
): { status: DriverStatus; note: string | null; updated_at: string } | null {
  const row = Array.isArray(value) ? value[0] : value;

  if (!row || !isDriverStatus(row.status)) {
    return null;
  }

  return {
    status: row.status,
    note: row.note,
    updated_at: row.updated_at,
  };
}
