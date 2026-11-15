import { submitQuoteOrderFromFormData } from "@/lib/orders/submit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await submitQuoteOrderFromFormData(formData);
    if (!result.ok) {
      return Response.json(result, { status: 400 });
    }
    return Response.json(result);
  } catch (caught) {
    const message =
      caught instanceof Error && caught.message
        ? caught.message
        : "Could not save the order.";
    console.error("[api/orders]", message);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
