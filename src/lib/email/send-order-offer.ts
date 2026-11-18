import { Resend } from "resend";
import { formatTravelTypeLabel } from "@/lib/quote-travel-types";
import { en } from "@/lib/i18n/dictionary";
import type { StaffOrder } from "@/types/dashboard";

export type OfferEmailResult = { ok: true } | { ok: false; reason: "notConfigured" | "noEmail" | "noPrice" | "emailFailed"; message?: string };

function routeLine(order: StaffOrder) {
  const parts = [order.origin, ...(order.stops ?? []).map((stop) => stop.name), order.destination];
  if (order.returnTo) parts.push(order.returnTo);
  return parts.filter(Boolean).join(" → ");
}

export function isValidCustomerEmail(value: string | null | undefined) {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()));
}

/** Emails the customer the order summary and price. */
export async function sendOrderOfferEmail(order: StaffOrder): Promise<OfferEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) return { ok: false, reason: "notConfigured" };
  if (order.price == null) return { ok: false, reason: "noPrice" };
  const to = order.requestorEmail?.trim();
  if (!to || !isValidCustomerEmail(to)) return { ok: false, reason: "noEmail" };

  const name = order.requestorName?.trim() || "traveller";
  const price = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(order.price);
  const purpose = order.travelType
    ? formatTravelTypeLabel(order.travelType, order.travelTypeDetail, en.quote.travelTypeOptions)
    : null;
  const rows: Array<[string, string]> = [
    ["Route", routeLine(order)],
    ["Departure", order.departureOn ?? "—"],
    ["Return", order.returnOn ?? "—"],
    ["Passengers", String(order.passengerCount || "—")],
    ...(purpose ? [["Trip type", purpose] as [string, string]] : []),
    ["Price", price],
  ];

  const text = [
    `Hello ${name},`,
    "",
    `Thank you for your request ${order.reference}. Here is our offer:`,
    "",
    ...rows.map(([label, value]) => `• ${label}: ${value}`),
    "",
    "To confirm the trip or ask for changes, simply reply to this email.",
    "",
    "Kind regards,",
    "Berro Travel team",
    "berro@berro.lv",
  ].join("\n");

  const html = `
    <div style="font-family:Georgia,serif;line-height:1.55;color:#1a1a1a;max-width:560px">
      <p>Hello ${escapeHtml(name)},</p>
      <p>Thank you for your request <strong>${escapeHtml(order.reference)}</strong>. Here is our offer:</p>
      <table style="border-collapse:collapse;margin:16px 0 24px">
        ${rows.map(([label, value]) => `<tr><td style="padding:4px 16px 4px 0;color:#666">${escapeHtml(label)}</td><td style="padding:4px 0">${label === "Price" ? `<strong>${escapeHtml(value)}</strong>` : escapeHtml(value)}</td></tr>`).join("")}
      </table>
      <p>To confirm the trip or ask for changes, simply reply to this email.</p>
      <p>Kind regards,<br/>Berro Travel team<br/><a href="mailto:berro@berro.lv">berro@berro.lv</a></p>
    </div>
  `.trim();

  const { error } = await new Resend(apiKey).emails.send({
    from,
    to,
    replyTo: process.env.CONTACT_TO_EMAIL?.trim() || undefined,
    subject: `Berro Travel — offer for request ${order.reference}`,
    text,
    html,
  });
  if (error) return { ok: false, reason: "emailFailed", message: error.message };
  return { ok: true };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
