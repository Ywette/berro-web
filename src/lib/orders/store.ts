import { sendNewOrderEmail } from "@/lib/email/send-order-email";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import {
  orderFromQuoteInput,
  type QuoteOrderInput,
} from "@/lib/orders/session-orders";
import type { StaffOrder } from "@/types/dashboard";

export const ORDER_PLANS_BUCKET = "order-plans";
export const ORDERS_TABLE = "orders";

const maxPlanBytes = 4 * 1024 * 1024;
const allowedExtensions = new Set([".pdf", ".doc", ".docx", ".txt"]);

export type SaveOrderResult =
  | { ok: true; order: StaffOrder }
  | { ok: false; error: string };

function sanitizeFileName(name: string) {
  const base = name.replace(/[/\\?%*:|"<>]/g, "_").trim() || "plan";
  return base.slice(0, 180);
}

function extensionOf(name: string) {
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index).toLowerCase() : "";
}

export async function uploadOrderPlanDocument(
  orderId: string,
  file: File,
): Promise<{ path: string; name: string } | { error: string }> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const name = sanitizeFileName(file.name);
  const extension = extensionOf(name);
  if (!allowedExtensions.has(extension)) {
    return { error: "Unsupported document type." };
  }
  if (file.size > maxPlanBytes) {
    return { error: "Document is too large (max 4 MB)." };
  }

  const path = `${orderId}/${Date.now()}-${name}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(ORDER_PLANS_BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    console.error("[orders] plan upload failed", error.message);
    return { error: error.message };
  }

  return { path, name };
}

export function staffOrderToRow(order: StaffOrder, input: QuoteOrderInput) {
  return {
    id: order.id,
    reference: order.reference,
    origin: order.origin,
    destination: order.destination,
    return_to: order.returnTo,
    passenger_count: order.passengerCount,
    requestor_name: order.requestorName,
    requestor_company: order.requestorCompany,
    requestor_email: order.requestorEmail,
    requestor_phone: order.requestorPhone,
    heard_about: order.heardAbout,
    heard_about_detail: order.heardAboutDetail,
    travel_type: order.travelType,
    travel_type_detail: order.travelTypeDetail,
    trip: input.trip?.trim() || null,
    trip_mode:
      input.tripMode === "oneWay" || input.tripMode === "roundTrip" ? input.tripMode : null,
    status: order.status,
    departure_on: order.departureOn,
    return_on: order.returnOn,
    departure_at: toTimestamptz(input.departure),
    return_at: toTimestamptz(input.returnAt),
    stops: order.stops ?? [],
    waiting_minutes: order.waitingMinutes,
    plan_document: order.planDocument,
    plan_document_path: order.planDocumentPath,
    assigned_driver_id: order.assignedDriverId,
    assigned_driver_name: order.assignedDriverName,
    assigned_guide_id: order.assignedGuideId,
    assigned_guide_name: order.assignedGuideName,
    assigned_vehicle_id: order.assignedVehicleId,
    updated_at: new Date().toISOString(),
  };
}

function toTimestamptz(value: string | undefined) {
  const match = value?.trim().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:00.000Z`;
}

export async function insertOrder(
  input: QuoteOrderInput,
  planFile?: File | null,
): Promise<SaveOrderResult> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const order = orderFromQuoteInput(input);

  if (planFile && planFile.size > 0) {
    const uploaded = await uploadOrderPlanDocument(order.id, planFile);
    if ("error" in uploaded) {
      return { ok: false, error: uploaded.error };
    }
    order.planDocument = uploaded.name;
    order.planDocumentPath = uploaded.path;
  } else if (input.planDocument?.trim()) {
    order.planDocument = input.planDocument.trim();
  }

  const { error } = await supabase.from(ORDERS_TABLE).insert(staffOrderToRow(order, input));
  if (error) {
    console.error("[orders] insert failed", error.message);
    return { ok: false, error: error.message };
  }

  const emailed = await sendNewOrderEmail(order, input);
  if (!emailed.ok) {
    console.error("[orders] notification email failed", emailed.error);
  }

  return { ok: true, order };
}

export async function createSignedPlanUrl(
  path: string,
  expiresInSeconds = 60 * 60,
): Promise<string | null> {
  const supabase = createServiceSupabaseClient();
  if (!supabase || !path.trim()) return null;
  const { data, error } = await supabase.storage
    .from(ORDER_PLANS_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error) {
    console.error("[orders] signed url failed", error.message);
    return null;
  }
  return data.signedUrl;
}
