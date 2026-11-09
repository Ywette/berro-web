"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isDriverStatus } from "@/types/staff";

export type AvailabilityState = {
  error?: string;
  success?: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function updateDriverAvailability(
  _state: AvailabilityState,
  formData: FormData,
): Promise<AvailabilityState> {
  await requireUser();
  const dictionary = await getDictionary();

  const employeeId = String(formData.get("employeeId") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!uuidPattern.test(employeeId)) {
    return { error: dictionary.drivers.chooseDriver };
  }

  if (!isDriverStatus(status)) {
    return { error: dictionary.drivers.chooseStatus };
  }

  if (note.length > 240) {
    return { error: dictionary.drivers.noteTooLong };
  }

  const supabase = await createClient();
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("id, role, is_active")
    .eq("id", employeeId)
    .maybeSingle();

  if (employeeError) {
    return { error: employeeError.message };
  }

  if (!employee || employee.role !== "driver" || !employee.is_active) {
    return { error: dictionary.drivers.notDriver };
  }

  const { error } = await supabase.from("driver_availability").upsert(
    {
      employee_id: employeeId,
      status,
      note: note || null,
    },
    { onConflict: "employee_id" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/drivers");
  return { success: dictionary.drivers.saved };
}
