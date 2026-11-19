import { isOrderStatus, type StaffOrder } from "@/types/dashboard";
import { tripDurationDays } from "@/lib/orders/trip-duration";

export type OrderRow = {
  id: string;
  reference: string;
  request_locale?: string | null;
  excursion_slug?: string | null;
  excursion_title?: string | null;
  created_at: string;
  updated_at: string;
  price?: number | null;
  calculation?: StaffOrder["calculation"];
  route_estimate?: StaffOrder["routeEstimate"];
  origin: string;
  destination: string;
  return_to: string | null;
  passenger_count: number;
  requestor_name: string | null;
  requestor_company: string | null;
  requestor_email: string | null;
  requestor_phone: string | null;
  heard_about: string | null;
  heard_about_detail: string | null;
  travel_type: string | null;
  travel_type_detail: string | null;
  plan_document: string | null;
  plan_document_path: string | null;
  status: string;
  completed_statuses?: string[] | null;
  departure_on: string | null;
  departure_at?: string | null;
  return_on: string | null;
  return_at?: string | null;
  trip_duration_days?: number | null;
  stops: Array<{ name: string; waitMinutes?: number; wait_minutes?: number }> | null;
  waiting_minutes: number | null;
  assigned_driver_id: string | null;
  assigned_driver_name: string | null;
  assigned_guide_id: string | null;
  assigned_guide_name: string | null;
  assigned_vehicle_id: string | null;
};

export function staffOrderFromRow(row: OrderRow): StaffOrder {
  const stops = Array.isArray(row.stops)
    ? row.stops.map((stop) => ({
        name: stop.name,
        waitMinutes: Number(stop.waitMinutes ?? stop.wait_minutes ?? 0) || 0,
      }))
    : null;

  return {
    id: row.id,
    reference: row.reference,
    requestLocale: row.request_locale ?? null,
    excursionSlug: row.excursion_slug ?? null,
    excursionTitle: row.excursion_title ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    price: row.price ?? null,
    calculation: row.calculation ?? null,
    routeEstimate: row.route_estimate,
    origin: row.origin,
    destination: row.destination,
    returnTo: row.return_to,
    passengerCount: Number(row.passenger_count) || 0,
    requestorName: row.requestor_name,
    requestorCompany: row.requestor_company,
    requestorEmail: row.requestor_email,
    requestorPhone: row.requestor_phone,
    heardAbout: row.heard_about,
    heardAboutDetail: row.heard_about_detail,
    travelType: row.travel_type,
    travelTypeDetail: row.travel_type_detail,
    planDocument: row.plan_document,
    planDocumentPath: row.plan_document_path,
    status: isOrderStatus(row.status) ? row.status : "new",
    completedStatuses: Array.from(new Set([
      "new" as const,
      ...(Array.isArray(row.completed_statuses) ? row.completed_statuses.filter(isOrderStatus) : []),
      ...(isOrderStatus(row.status) && row.status !== "cancelled" ? [row.status] : []),
    ])),
    departureOn: row.departure_on,
    departureAt: row.departure_at ?? null,
    returnOn: row.return_on,
    returnAt: row.return_at ?? null,
    tripDurationDays: row.trip_duration_days ?? tripDurationDays(row.departure_on, row.return_on),
    stops,
    waitingMinutes: row.waiting_minutes,
    assignedDriverId: row.assigned_driver_id,
    assignedDriverName: row.assigned_driver_name,
    assignedGuideId: row.assigned_guide_id,
    assignedGuideName: row.assigned_guide_name,
    assignedVehicleId: row.assigned_vehicle_id,
  };
}
