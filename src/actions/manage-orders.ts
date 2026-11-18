"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { readOrderEdit } from "@/lib/orders/edit";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { staffOrderFromRow, type OrderRow } from "@/lib/supabase/order-map";
import { isOrderStatus, type OrderStatus } from "@/types/dashboard";
import { setOrderStatus, toggleOrderStatus } from "@/lib/orders/statuses";

export async function setOrderCancelled(id: string, version: string, cancel: boolean) {
  const user = await currentUser();
  if (!user) return { error: "signedOut" } as const;
  if (user.publicMetadata.role !== "staff" && user.publicMetadata.role !== "admin") return { error: "access" } as const;
  if (!id || !version || typeof cancel !== "boolean") return { error: "invalid" } as const;
  const db = createServiceSupabaseClient();
  if (!db) return { error: "failed" } as const;
  const { data: existing, error: readError } = await db.from("orders").select("*").eq("id", id).eq("updated_at", version).maybeSingle();
  if (readError || !existing) return { error: readError ? "failed" : "changed" } as const;
  const stages: OrderStatus[] = Array.isArray(existing.completed_statuses)
    ? existing.completed_statuses.filter((stage: string) => isOrderStatus(stage) && stage !== "cancelled") : [];
  if (cancel && isOrderStatus(existing.status) && existing.status !== "cancelled") {
    const index = stages.indexOf(existing.status);
    if (index >= 0) stages.splice(index, 1);
    stages.push(existing.status);
  }
  const status = cancel ? "cancelled" : stages.at(-1) ?? "new";
  const { data, error } = await db.from("orders").update({ status,
    ...(Object.hasOwn(existing, "completed_statuses") ? { completed_statuses: stages } : {}),
    updated_at: new Date().toISOString() })
    .eq("id", id).eq("updated_at", version).select("*").maybeSingle();
  if (error?.code === "23514") return { error: "cancelSetup" } as const;
  if (error || !data) return { error: error ? "failed" : "changed" } as const;
  revalidatePath("/staff/orders");
  revalidatePath("/staff/calendar");
  return { order: staffOrderFromRow(data as OrderRow) } as const;
}

export async function updateOrderAssignments(id: string, version: string, driverId: string | null, driverName: string | null, vehicleId: string | null) {
  const user = await currentUser();
  if (!user) return { error: "signedOut" } as const;
  if (user.publicMetadata.role !== "staff" && user.publicMetadata.role !== "admin") return { error: "access" } as const;
  if (!id || !version || [driverId, driverName, vehicleId].some((value) => value !== null && (typeof value !== "string" || value.length > 300))) return { error: "invalid" } as const;
  const db = createServiceSupabaseClient();
  if (!db) return { error: "failed" } as const;
  const { data, error } = await db.from("orders").update({
    assigned_driver_id: driverId, assigned_driver_name: driverId ? driverName : null,
    assigned_vehicle_id: vehicleId, updated_at: new Date().toISOString(),
  }).eq("id", id).eq("updated_at", version).select("*").maybeSingle();
  if (error) console.error("[orders] assignment update failed", error.code, error.message);
  if (error || !data) return { error: error ? "failed" : "changed" } as const;
  revalidatePath("/staff/orders");
  revalidatePath("/staff/calendar");
  return { order: staffOrderFromRow(data as OrderRow) } as const;
}

export async function updateOrderStatus(id: string, version: string, status: OrderStatus) {
  const user = await currentUser();
  if (!user) return { error: "signedOut" } as const;
  if (user.publicMetadata.role !== "staff" && user.publicMetadata.role !== "admin") {
    return { error: "access" } as const;
  }
  if (!id || !version || !isOrderStatus(status) || status === "cancelled") return { error: "invalid" } as const;
  const db = createServiceSupabaseClient();
  if (!db) return { error: "failed" } as const;
  const { data: existing, error: readError } = await db.from("orders")
    .select("*").eq("id", id).eq("updated_at", version).maybeSingle();
  if (readError || !existing) return { error: readError ? "failed" : "changed" } as const;
  if (existing.status === "cancelled") return { error: "invalid" } as const;
  if (!Object.hasOwn(existing, "completed_statuses")) return { error: "statusCollectionSetup" } as const;
  const current = isOrderStatus(existing.status) ? existing.status : "new";
  const next = toggleOrderStatus(current, Array.isArray(existing.completed_statuses) ? existing.completed_statuses.filter(isOrderStatus) : [], status);
  const { data, error } = await db.from("orders")
    .update({ status: next.status, completed_statuses: next.completedStatuses, updated_at: new Date().toISOString() })
    .eq("id", id).eq("updated_at", version).select("*").maybeSingle();
  if (error?.code === "23514" && /orders_status_check/.test(error.message)) {
    return { error: "statusSetup" } as const;
  }
  if (error) console.error("[orders] status update failed", error.code, error.message);
  if (error || !data) return { error: error ? "failed" : "changed" } as const;
  revalidatePath("/staff/orders");
  return { order: staffOrderFromRow(data as OrderRow) } as const;
}

export async function manageOrder(id: string, version: string, form: FormData | null) {
  const user = await currentUser();
  if (!user) return { error: "signedOut" } as const;
  const role = user.publicMetadata.role;
  if (role !== "staff" && role !== "admin") return { error: "access" } as const;
  const db = createServiceSupabaseClient();
  if (!db || !id || !version) return { error: "failed" } as const;
  if (form === null) {
    const { data, error } = await db.from("orders").delete().eq("id", id)
      .eq("updated_at", version).select("id").maybeSingle();
    if (error || !data) return { error: error ? "failed" : "changed" } as const;
    revalidatePath("/staff/orders");
    return { order: null } as const;
  }
  const edit = readOrderEdit(form);
  if (!edit) return { error: "invalid" } as const;
  const { data: original, error: readError } = await db.from("orders").select("*")
    .eq("id", id).eq("updated_at", version).maybeSingle();
  if (!original) return { error: readError ? "failed" : "changed" } as const;
  const hasStatusCollection = Object.hasOwn(original, "completed_statuses");
  if (!hasStatusCollection && edit.status !== original.status) {
    return { error: "statusCollectionSetup" } as const;
  }
  const changedRoute = original.origin !== edit.origin || original.destination !== edit.destination;
  const completed = setOrderStatus(isOrderStatus(original.status) ? original.status : "new",
    Array.isArray(original.completed_statuses) ? original.completed_statuses.filter(isOrderStatus) : [], edit.status).completedStatuses;
  function shiftDate(timestamp: string | null, day: string | null) {
    return timestamp && day ? day + new Date(timestamp).toISOString().slice(10) : null;
  }
  const { data, error } = await db.from("orders").update({
    status: edit.status, ...(hasStatusCollection ? { completed_statuses: completed } : {}),
    passenger_count: edit.passengerCount, origin: edit.origin,
    destination: edit.destination, requestor_name: edit.requestorName,
    requestor_company: edit.requestorCompany, requestor_email: edit.requestorEmail,
    requestor_phone: edit.requestorPhone, travel_type: edit.travelType,
    travel_type_detail: edit.travelTypeDetail, updated_at: new Date().toISOString(),
    ...(original.departure_on !== edit.departureOn ? { departure_on: edit.departureOn, departure_at: shiftDate(original.departure_at, edit.departureOn) } : {}),
    ...(original.return_on !== edit.returnOn ? { return_on: edit.returnOn, return_at: shiftDate(original.return_at, edit.returnOn) } : {}),
    ...(changedRoute ? { route_estimate: null } : {}),
  }).eq("id", id).eq("updated_at", version).select("*").maybeSingle();
  if (error || !data) return { error: error ? "failed" : "changed" } as const;
  revalidatePath("/staff/orders");
  return { order: staffOrderFromRow(data as OrderRow) } as const;
}
