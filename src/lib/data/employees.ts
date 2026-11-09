import { demoEmployees } from "@/lib/data/demo-dashboard";
import { createStaffClient, hasSupabaseStaffEnv } from "@/lib/supabase/staff";
import {
  isEmployeeRole,
  type Employee,
} from "@/types/staff";

export async function listEmployees(): Promise<Employee[]> {
  if (!hasSupabaseStaffEnv()) {
    return demoEmployees;
  }

  const supabase = createStaffClient();
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
