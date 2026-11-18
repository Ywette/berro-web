import { isOrderStatus, type StaffOrder } from "@/types/dashboard";

export function readOrderEdit(form: FormData) {
  const text = (key: string) => String(form.get(key) ?? "").trim();
  const passengers = Number(text("passengers"));
  const status = text("status");
  const origin = text("origin");
  const destination = text("destination");
  const departureOn = text("departureOn") || null;
  const returnOn = text("returnOn") || null;
  for (const day of [departureOn, returnOn]) {
    if (day && (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(Date.parse(day)) ||
      new Date(day).toISOString().slice(0, 10) !== day)) return null;
  }
  if (departureOn && returnOn && returnOn < departureOn) return null;
  if (!isOrderStatus(status) || !Number.isSafeInteger(passengers) || passengers < 1 ||
      passengers > 2147483647 || (!origin && !destination)) return null;
  return {
    status, departureOn, returnOn, passengerCount: passengers, origin: origin || "—", destination: destination || "—",
    requestorName: text("name") || null, requestorEmail: text("email") || null,
    requestorPhone: text("phone") || null, requestorCompany: text("company") || null,
    travelType: text("travelType") || null,
    travelTypeDetail: text("travelType") === "other" ? text("travelTypeDetail") || null : null,
  } satisfies Partial<StaffOrder>;
}
