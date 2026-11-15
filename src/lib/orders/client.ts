import type { SubmitQuoteOrderState } from "@/lib/orders/submit";

export async function submitQuoteOrder(formData: FormData): Promise<SubmitQuoteOrderState> {
  const response = await fetch("/api/orders", {
    method: "POST",
    body: formData,
  });

  let data: SubmitQuoteOrderState | null = null;
  try {
    data = (await response.json()) as SubmitQuoteOrderState;
  } catch {
    data = null;
  }

  if (!response.ok || !data) {
    return {
      ok: false,
      error:
        data && "error" in data && data.error
          ? data.error
          : "Could not save the request. Please try again.",
    };
  }

  return data;
}
