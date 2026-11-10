import { demoOrders } from "@/lib/data/demo-dashboard";
import { createStaffClient, hasSupabaseStaffEnv } from "@/lib/supabase/staff";
import { isOrderStatus, type StaffOrder } from "@/types/dashboard";

type OrderRow = {
  id: string;
  reference: string;
  origin: string;
  destination: string;
  return_to: string | null;
  passenger_count: number;
  requestor_name: string | null;
  requestor_email: string | null;
  requestor_phone: string | null;
  status: string;
  departure_on: string | null;
  return_on: string | null;
  assigned_driver_id: string | null;
  assigned_vehicle_id: string | null;
  assigned_driver: { full_name: string } | { full_name: string }[] | null;
};

export async function listOrders(): Promise<StaffOrder[]> {
  if (!hasSupabaseStaffEnv()) {
    return demoOrders;
  }

  const supabase = createStaffClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, reference, origin, destination, return_to, passenger_count, requestor_name, requestor_email, requestor_phone, status, departure_on, return_on, assigned_driver_id, assigned_vehicle_id, assigned_driver:employees!orders_assigned_driver_id_fkey(full_name)",
    )
    .order("departure_on", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingRelation(error.message)) {
      return demoOrders;
    }
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return demoOrders;
  }

  return (data as OrderRow[]).flatMap((row) => {
    if (!isOrderStatus(row.status)) {
      return [];
    }

    const employee = Array.isArray(row.assigned_driver)
      ? row.assigned_driver[0]
      : row.assigned_driver;

    return [
      {
        id: row.id,
        reference: row.reference,
        origin: row.origin,
        destination: row.destination,
        returnTo: row.return_to,
        passengerCount: row.passenger_count,
        requestorName: row.requestor_name,
        requestorEmail: row.requestor_email,
        requestorPhone: row.requestor_phone,
        status: row.status,
        departureOn: row.departure_on,
        returnOn: row.return_on,
        stops: null,
        waitingMinutes: null,
        assignedDriverId: row.assigned_driver_id,
        assignedDriverName: employee?.full_name ?? null,
        assignedGuideId: null,
        assignedGuideName: null,
        assignedVehicleId: row.assigned_vehicle_id,
      },
    ];
  });
}

function isMissingRelation(message: string) {
  return /relation .* does not exist|could not find the table/i.test(message);
}
