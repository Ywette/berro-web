import type { OrderStatus } from "@/types/dashboard";

// The array retains activation order. "new" is the permanent starting stage.
function orderedStatuses(current: OrderStatus, completed: OrderStatus[]): OrderStatus[] {
  return ["new", ...new Set(completed.filter((stage) => stage !== "new" && stage !== "cancelled" && stage !== current)),
    ...(current === "new" || current === "cancelled" ? [] : [current])];
}

export function toggleOrderStatus(current: OrderStatus, completed: OrderStatus[], stage: OrderStatus) {
  const stages = orderedStatuses(current, completed);
  if (stage === "new") return { status: current, completedStatuses: stages };
  if (stages.includes(stage)) {
    const next = stages.filter((item) => item !== stage);
    return { status: stage === current ? next[next.length - 1] : current, completedStatuses: next };
  }
  return { status: stage, completedStatuses: [...stages, stage] };
}

export function setOrderStatus(current: OrderStatus, completed: OrderStatus[], stage: OrderStatus) {
  const stages = orderedStatuses(current, completed);
  if (stage === "cancelled") return { status: stage, completedStatuses: stages };
  if (stage === current) return { status: current, completedStatuses: stages };
  if (stage === "new") return { status: stage, completedStatuses: stages };
  return { status: stage, completedStatuses: [...stages.filter((item) => item !== stage), stage] };
}
