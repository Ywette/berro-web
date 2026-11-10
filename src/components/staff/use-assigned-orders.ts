"use client";

import { useEffect, useState } from "react";
import { applyAssignmentPatches } from "@/lib/staff/assignments";
import { mergeOrdersWithSession } from "@/lib/orders/session-orders";
import type { StaffOrder } from "@/types/dashboard";

export function useAssignedOrders(initialOrders: StaffOrder[]) {
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    setOrders(applyAssignmentPatches(mergeOrdersWithSession(initialOrders)));
  }, [initialOrders]);

  return [orders, setOrders] as const;
}
