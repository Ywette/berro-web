import type { FleetVehicle } from "@/lib/content/fleet";
import { demoVehicles } from "@/lib/data/demo-dashboard";
import { createStaffClient, hasSupabaseStaffEnv } from "@/lib/supabase/staff";

type VehicleRow = {
  id: string;
  name: string;
  plate: string | null;
  passengers: number;
  image_path: string | null;
  insurance_expires_on: string | null;
  inspection_expires_on: string | null;
  readiness_note: string | null;
  is_active: boolean;
};

export async function listVehicles(): Promise<FleetVehicle[]> {
  if (!hasSupabaseStaffEnv()) {
    return demoVehicles;
  }

  const supabase = createStaffClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select(
      "id, name, plate, passengers, image_path, insurance_expires_on, inspection_expires_on, readiness_note, is_active",
    )
    .order("name", { ascending: true })
    .order("plate", { ascending: true });

  if (error) {
    if (isMissingRelation(error.message)) {
      return demoVehicles;
    }
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return demoVehicles;
  }

  return (data as VehicleRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    passengers: row.passengers,
    image: row.image_path ?? "/fleet/coach-white.jpg",
    plate: row.plate,
    insuranceExpiresOn: row.insurance_expires_on,
    inspectionExpiresOn: row.inspection_expires_on,
    readinessNote: row.readiness_note,
    isActive: row.is_active,
  }));
}

function isMissingRelation(message: string) {
  return /relation .* does not exist|could not find the table/i.test(message);
}
