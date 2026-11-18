import { requireUser } from "@/lib/auth/session";
import { createSignedPlanUrl } from "@/lib/orders/store";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  await requireUser();
  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) return Response.json({ error: "Missing order id" }, { status: 400 });

  const db = createServiceSupabaseClient();
  if (!db) return Response.json({ error: "Storage unavailable" }, { status: 503 });
  const { data, error } = await db.from("orders").select("plan_document_path").eq("id", id).maybeSingle();
  if (error) return Response.json({ error: "Could not load order" }, { status: 500 });
  if (!data?.plan_document_path) return Response.json({ error: "Document not found" }, { status: 404 });

  const url = await createSignedPlanUrl(data.plan_document_path, 300);
  if (!url) return Response.json({ error: "Could not open document" }, { status: 500 });
  return new Response(null, { status: 302, headers: { Location: url, "Cache-Control": "private, no-store" } });
}
