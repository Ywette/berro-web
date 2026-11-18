import { Resend } from "resend";
import { formatDate } from "@/lib/content/format-date";
import { formatDuration } from "@/lib/quote";
import { formatRouteAddress } from "@/lib/orders/format-address";
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
  return parts.map(formatRouteAddress).join(" → ");
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
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

  const estimate = order.routeEstimate;
  const duration = estimate && formatDuration(estimate.durationMinutes);
  const mapsLabel = estimate
    ? `Google Maps · ${estimate.distanceKm} km${duration ? ` · ${duration}` : ""}`
    : null;
  let mapsUrl: string | null = null;
  if (estimate) {
    try {
      const parsed = new URL(estimate.mapsUrl);
      if (parsed.protocol === "https:" && parsed.hostname === "www.google.com" && parsed.pathname.startsWith("/maps/")) {
        mapsUrl = parsed.toString();
      }
    } catch {
      // The route summary remains readable if its link is unavailable.
    }
  }

  const lines = [
    `New quote request ${order.reference}`,
    "",
    `Reference: ${order.reference}`,
    input?.locale ? `Request language: ${input.locale.toUpperCase()}` : null,
    excursion ? `Excursion: ${excursion}` : null,
    `Travel type: ${travelType}`,
    `Route: ${routeLine(order)}`,
    mapsLabel || "Route estimate needs review",
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

  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#242124">${lines.map((line) => {
    if (mapsLabel && mapsUrl && line === mapsLabel) {
      return `<a href="${escapeHtml(mapsUrl)}">${escapeHtml(mapsLabel)}</a>`;
    }
    if (line === `Open order: ${staffOrdersUrl}`) {
      return `<a href="${escapeHtml(staffOrdersUrl)}">Open order</a>`;
    }
    return line ? escapeHtml(line) : "&nbsp;";
  }).join("<br>")}</div>`;
  const text = lines.map((line) => line === mapsLabel && mapsUrl
    ? `${line}\n${mapsUrl}` : line).join("\n");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: order.requestorEmail || undefined,
    subject: `Berro Travel — new order ${order.reference}`,
    text,
    html,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}
