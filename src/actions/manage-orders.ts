"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { readOrderEdit } from "@/lib/orders/edit";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { staffOrderFromRow, type OrderRow } from "@/lib/supabase/order-map";
import { isOrderStatus, type OrderStatus } from "@/types/dashboard";

export async function updateOrderStatus(id: string, version: string, status: OrderStatus) {
  const user = await currentUser();
  if (!user) return { error: "signedOut" } as const;
  if (user.publicMetadata.role !== "staff" && user.publicMetadata.role !== "admin") {
    return { error: "access" } as const;
  }
  if (!id || !version || !isOrderStatus(status)) return { error: "invalid" } as const;
  const db = createServiceSupabaseClient();
  if (!db) return { error: "failed" } as const;
  const { data, error } = await db.from("orders")
    .update({ status, updated_at: new Date().toISOString() })
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
  const { data: original, error: readError } = await db.from("orders").select("origin,destination,departure_at,return_at,departure_on,return_on")
    .eq("id", id).eq("updated_at", version).maybeSingle();
  if (!original) return { error: readError ? "failed" : "changed" } as const;
  const changedRoute = original.origin !== edit.origin || original.destination !== edit.destination;
  function shiftDate(timestamp: string | null, day: string | null) {
    return timestamp && day ? day + new Date(timestamp).toISOString().slice(10) : null;
  }
  const { data, error } = await db.from("orders").update({
    status: edit.status, passenger_count: edit.passengerCount, origin: edit.origin,
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
