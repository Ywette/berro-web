import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  isEmployeeRole,
  type Employee,
} from "@/types/staff";

export async function listEmployees(): Promise<Employee[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("id, full_name, email, phone, role, is_active")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).flatMap((row) => {
    if (!isEmployeeRole(row.role)) {
      return [];
    }

    return [
      {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        isActive: row.is_active,
      },
    ];
  });
}
