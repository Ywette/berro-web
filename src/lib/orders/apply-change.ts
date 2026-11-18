import { manageOrder } from "@/actions/manage-orders";
import { readOrderEdit } from "@/lib/orders/edit";
import type { StaffOrder } from "@/types/dashboard";

export type OrderChangeError = "signedOut" | "access" | "changed" | "failed" | "invalid";

/** Saves an edit (form) or deletes (null) an order. Orders without updatedAt are demo/session orders kept in the browser. */
export async function applyOrderChange(
  order: StaffOrder,
  form: FormData | null,
): Promise<{ order: StaffOrder | null; error?: undefined } | { error: OrderChangeError }> {
  if (order.updatedAt) {
    const result = await manageOrder(order.id, order.updatedAt, form);
    return result.error ? { error: result.error } : { order: result.order };
  }
  if (!form) return { order: null };
  const edit = readOrderEdit(form);
  if (!edit) return { error: "invalid" };
  return {
    order: {
      ...order,
      ...edit,
      routeEstimate:
        edit.origin === order.origin && edit.destination === order.destination ? order.routeEstimate : null,
    },
  };
}
