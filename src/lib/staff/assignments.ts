import type { OrderAssignments, StaffOrder } from "@/types/dashboard";

const STORAGE_KEY = "berro-staff-assignments";

type AssignmentPatch = {
  driverId: string | null;
  driverName: string | null;
  guideId: string | null;
  guideName: string | null;
  vehicleId: string | null;
  assignments?: OrderAssignments;
};

export function applyAssignmentPatches(orders: StaffOrder[]): StaffOrder[] {
  const patches = readPatches();
  if (Object.keys(patches).length === 0) return orders;

  return orders.map((order) => {
    const patch = patches[order.id];
    if (!patch) return order;
    return {
      ...order,
      assignedDriverId: patch.driverId,
      assignedDriverName: patch.driverName,
      assignedGuideId: patch.guideId,
      assignedGuideName: patch.guideName,
      assignedVehicleId: patch.vehicleId,
      assignments: patch.assignments ?? order.assignments,
    };
  });
}

export function orderAssignments(order: StaffOrder): OrderAssignments {
  return order.assignments ?? {
    vehicleIds: order.assignedVehicleId ? [order.assignedVehicleId] : [],
    drivers: order.assignedDriverId ? [{
      id: order.assignedDriverId,
      name: order.assignedDriverName,
      vehicleId: order.assignedVehicleId,
    }] : [],
  };
}

export function withOrderAssignments(order: StaffOrder, assignments: OrderAssignments): StaffOrder {
  return {
    ...order,
    assignments,
    assignedDriverId: assignments.drivers[0]?.id ?? null,
    assignedDriverName: assignments.drivers[0]?.name ?? null,
    assignedVehicleId: assignments.vehicleIds[0] ?? null,
  };
}

export function rememberOrderAssignments(order: StaffOrder) {
  const patches = readPatches();
  patches[order.id] = {
    driverId: order.assignedDriverId,
    driverName: order.assignedDriverName,
    guideId: order.assignedGuideId,
    guideName: order.assignedGuideName,
    vehicleId: order.assignedVehicleId,
    assignments: order.assignments,
  };
  writePatches(patches);
}

export function clearAssignmentPatch(orderId: string) {
  const patches = readPatches();
  delete patches[orderId];
  writePatches(patches);
}

function readPatches(): Record<string, AssignmentPatch> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, AssignmentPatch>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writePatches(patches: Record<string, AssignmentPatch>) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(patches));
}
