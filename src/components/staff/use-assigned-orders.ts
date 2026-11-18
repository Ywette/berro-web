"use client";

import { useEffect, useState } from "react";
import { applyAssignmentPatches } from "@/lib/staff/assignments";
import { mergeOrdersWithSession } from "@/lib/orders/session-orders";
import type { StaffOrder } from "@/types/dashboard";
import { applyLocalCalculations } from "@/lib/orders/local-calculations";

export function useAssignedOrders(initialOrders: StaffOrder[]) {
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    function refresh() {
      setOrders(applyLocalCalculations(applyAssignmentPatches(mergeOrdersWithSession(initialOrders))));
    }
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [initialOrders]);

  return [orders, setOrders] as const;
}
