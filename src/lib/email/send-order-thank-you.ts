import { Resend } from "resend";
import type { QuoteOrderInput } from "@/lib/orders/session-orders";
import type { StaffOrder } from "@/types/dashboard";

const facebookUrl = "https://www.facebook.com/TravelBerro/";
const instagramUrl = "https://www.instagram.com/berrotravel/";

function appUrl() {
  const raw = process.env.APP_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

function routeLine(order: StaffOrder) {
  const parts = [order.origin, order.destination];
  if (order.returnTo) parts.push(order.returnTo);
  return parts.join(" → ");
}

export async function sendOrderThankYouEmail(order: StaffOrder, input?: QuoteOrderInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = order.requestorEmail?.trim();

  if (!apiKey || !from) {
    return {
      ok: false as const,
      error: "Thank-you email is not configured. Add RESEND_API_KEY and CONTACT_FROM_EMAIL.",
    };
  }

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { ok: false as const, error: "Customer email is missing or invalid." };
  }

  const site = appUrl();
  const contactUrl = `${site}/contact`;
  const name = order.requestorName?.trim() || "traveller";
  const departure = order.departureOn || input?.departure || "—";
  const returning = order.returnOn || input?.returnAt || "—";

  const text = [
    `Hello ${name},`,
    "",
    "Thank you for your request — it is registered with Berro Travel.",
    `Your reference number is ${order.reference}.`,
    "",
    "Our team will review the details and get back to you with an offer.",
    "",
    "Request summary:",
    `• Route: ${routeLine(order)}`,
    `• Departure: ${departure}`,
    `• Return: ${returning}`,
    `• Passengers: ${order.passengerCount || "—"}`,
    "",
    "While you wait, stay close to Berro Travel:",
    `• Subscribe to news on our contact page: ${contactUrl}`,
    `• Facebook: ${facebookUrl}`,
    `• Instagram: ${instagramUrl}`,
    "",
    "Safe travels,",
    "Berro Travel team",
    "berro@berro.lv",
  ].join("\n");

  const html = `
    <div style="font-family:Georgia,serif;line-height:1.55;color:#1a1a1a;max-width:560px">
      <p>Hello ${escapeHtml(name)},</p>
      <p>
        Thank you for your request — <strong>it is registered</strong> with Berro Travel.
        Your reference number is <strong>${escapeHtml(order.reference)}</strong>.
      </p>
      <p>Our team will review the details and get back to you with an offer.</p>
      <p style="margin:24px 0 8px;font-size:14px;letter-spacing:0.04em;text-transform:uppercase;color:#666">
        Request summary
      </p>
      <ul style="padding-left:18px;margin:0 0 24px">
        <li>Route: ${escapeHtml(routeLine(order))}</li>
        <li>Departure: ${escapeHtml(String(departure))}</li>
        <li>Return: ${escapeHtml(String(returning))}</li>
        <li>Passengers: ${escapeHtml(String(order.passengerCount || "—"))}</li>
      </ul>
      <p>While you wait, stay close to Berro Travel:</p>
      <ul style="padding-left:18px;margin:0 0 24px">
        <li><a href="${contactUrl}">Subscribe to our news</a> on the contact page</li>
        <li><a href="${facebookUrl}">Follow us on Facebook</a></li>
        <li><a href="${instagramUrl}">Follow us on Instagram</a></li>
      </ul>
      <p>
        Safe travels,<br/>
        Berro Travel team<br/>
        <a href="mailto:berro@berro.lv">berro@berro.lv</a>
      </p>
    </div>
  `.trim();

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: process.env.CONTACT_TO_EMAIL?.trim() || undefined,
    subject: `Berro Travel — request ${order.reference} registered`,
    text,
    html,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
