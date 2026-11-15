"use server";

import {
  submitQuoteOrderFromFormData,
  type SubmitQuoteOrderState,
} from "@/lib/orders/submit";

export type { SubmitQuoteOrderState };

/** @deprecated Prefer `submitQuoteOrder` from `@/lib/orders/client` (API route). */
export async function submitQuoteOrder(formData: FormData): Promise<SubmitQuoteOrderState> {
  return submitQuoteOrderFromFormData(formData);
}
