"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { sendOrderOfferEmail } from "@/lib/email/send-order-offer";
import { ORDERS_TABLE } from "@/lib/orders/store";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { staffOrderFromRow, type OrderRow } from "@/lib/supabase/order-map";

/** Emails the offer to the customer and moves a new / in-progress order to "sent". */
export async function sendOrderOffer(id: string, version: string) {
  const user = await currentUser();
  if (!user) return { error: "signedOut" } as const;
  const role = user.publicMetadata.role;
  if (role !== "staff" && role !== "admin") return { error: "access" } as const;
  const db = createServiceSupabaseClient();
  if (!db || !id || !version) return { error: "failed" } as const;

  const { data: row, error: readError } = await db.from(ORDERS_TABLE).select("*")
    .eq("id", id).eq("updated_at", version).maybeSingle();
  if (!row) return { error: readError ? "failed" : "changed" } as const;
  const order = staffOrderFromRow(row as OrderRow);

  const sent = await sendOrderOfferEmail(order);
  if (!sent.ok) {
    if (sent.message) console.error("[orders] offer email failed", sent.message);
    return { error: sent.reason } as const;
  }

  const nextStatus = order.status === "new" || order.status === "in_progress" ? "sent" : order.status;
  const { data, error } = await db.from(ORDERS_TABLE)
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", id).select("*").maybeSingle();
  revalidatePath("/staff/orders");
  // The email is already out; if the status update fails, still report success with the order we have.
  if (error || !data) return { order: order, statusSaved: false } as const;
  return { order: staffOrderFromRow(data as OrderRow), statusSaved: true } as const;
}
