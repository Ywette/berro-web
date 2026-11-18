import { Resend } from "resend";
import { formatDate } from "@/lib/content/format-date";
import type { QuoteOrderInput } from "@/lib/orders/session-orders";
import type { StaffOrder } from "@/types/dashboard";

function appUrl() {
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const configured = process.env.APP_URL?.trim();
  const useProductionHost = process.env.VERCEL_ENV === "production" && productionHost &&
    (!configured || /^https?:\/\/localhost(?=[:/]|$)/i.test(configured));
  const raw = useProductionHost
    ? `https://${productionHost}`
    : configured || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

function ordersInbox() {
  return process.env.ORDERS_TO_EMAIL?.trim() || process.env.CONTACT_TO_EMAIL?.trim() || null;
}

function routeLine(order: StaffOrder) {
  const parts = [order.origin, ...(order.stops ?? []).map((stop) => stop.name), order.destination];
  if (order.returnTo) parts.push(order.returnTo);
  return parts.join(" → ");
}

export async function sendNewOrderEmail(order: StaffOrder, input?: QuoteOrderInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = ordersInbox();
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    return {
      ok: false as const,
      error:
        "Order email is not configured. Add RESEND_API_KEY, CONTACT_FROM_EMAIL, and ORDERS_TO_EMAIL or CONTACT_TO_EMAIL.",
    };
  }

  const staffOrdersUrl = `${appUrl()}/staff/orders/${encodeURIComponent(order.id)}`;
  const travelType =
    order.travelTypeDetail?.trim()
      ? `${order.travelType ?? "other"}: ${order.travelTypeDetail.trim()}`
      : order.travelType || "—";

  const excursion =
    input?.excursionTitle?.trim() ||
    (input?.excursionSlug?.trim() ? input.excursionSlug.trim() : null);

  const lines = [
    `New quote request ${order.reference}`,
    "",
    `Reference: ${order.reference}`,
    input?.locale ? `Request language: ${input.locale.toUpperCase()}` : null,
    excursion ? `Excursion: ${excursion}` : null,
    `Travel type: ${travelType}`,
    `Route: ${routeLine(order)}`,
    order.routeEstimate ? `Google Maps driving estimate: ${order.routeEstimate.distanceKm} km${order.routeEstimate.durationMinutes === null ? "" : `, ${order.routeEstimate.durationMinutes} min`}\n${order.routeEstimate.mapsUrl}` : "Route estimate needs review",
    `Departure: ${formatDate(order.departureOn || input?.departure)}`,
    `Return: ${formatDate(order.returnOn || input?.returnAt)}`,
    `Passengers: ${order.passengerCount || "—"}`,
    "",
    `Name: ${order.requestorName || "—"}`,
    `Company: ${order.requestorCompany || "—"}`,
    `Email: ${order.requestorEmail || "—"}`,
    `Phone: ${order.requestorPhone || "—"}`,
    order.planDocument ? `Plan document: ${order.planDocument}` : null,
    "",
    `Open order: ${staffOrdersUrl}`,
  ].filter((line) => line !== null);

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: order.requestorEmail || undefined,
    subject: `Berro Travel — new order ${order.reference}`,
    text: lines.join("\n"),
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}
