import type { StaffOrder } from "@/types/dashboard";

const STORAGE_KEY = "berro-staff-assignments";

type AssignmentPatch = {
  driverId: string | null;
  driverName: string | null;
  guideId: string | null;
  guideName: string | null;
  vehicleId: string | null;
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
    };
  });
}

export function assignEmployee(
  orders: StaffOrder[],
  orderId: string,
  role: "driver" | "guide",
  employee: { id: string; fullName: string } | null,
): StaffOrder[] {
  const next = orders.map((order) => {
    if (order.id !== orderId) return order;
    if (role === "driver") {
      return {
        ...order,
        assignedDriverId: employee?.id ?? null,
        assignedDriverName: employee?.fullName ?? null,
      };
    }
    return {
      ...order,
      assignedGuideId: employee?.id ?? null,
      assignedGuideName: employee?.fullName ?? null,
    };
  });
  const updated = next.find((order) => order.id === orderId);
  if (updated) remember(updated);
  return next;
}

export function assignTransport(
  orders: StaffOrder[],
  orderId: string,
  vehicleId: string | null,
): StaffOrder[] {
  const next = orders.map((order) =>
    order.id === orderId ? { ...order, assignedVehicleId: vehicleId } : order,
  );
  const updated = next.find((order) => order.id === orderId);
  if (updated) remember(updated);
  return next;
}

function remember(order: StaffOrder) {
  const patches = readPatches();
  patches[order.id] = {
    driverId: order.assignedDriverId,
    driverName: order.assignedDriverName,
    guideId: order.assignedGuideId,
    guideName: order.assignedGuideName,
    vehicleId: order.assignedVehicleId,
  };
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
