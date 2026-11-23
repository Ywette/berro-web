import { Resend } from "resend";
import { formatDate } from "@/lib/content/format-date";
import { formatWaterPrice } from "@/lib/content/format-price";
import { escapeHtml, orderEmailRoutePoints, orderEmailRouteTimeline } from "@/lib/email/order-route";
import { dictionaries } from "@/lib/i18n/dictionary";
import { formatDuration } from "@/lib/quote";
import type { QuoteOrderInput } from "@/lib/orders/session-orders";
import { formatTravelTypeLabel } from "@/lib/quote-travel-types";
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
  const travelType = formatTravelTypeLabel(
    order.travelType || (order.travelTypeDetail?.trim() ? "other" : null),
    order.travelTypeDetail,
    dictionaries.lv.quote.travelTypeOptions,
  );

  const excursion =
    input?.excursionTitle?.trim() ||
    (input?.excursionSlug?.trim() ? input.excursionSlug.trim() : null);

  const estimate = order.routeEstimate;
  const duration = estimate && formatDuration(estimate.durationMinutes, "lv");
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

  const introduction = [
    `Jauns piedāvājuma pieprasījums ${order.reference}`,
    "",
    `Pieteikuma numurs: ${order.reference}`,
    input?.locale ? `Pieteikuma valoda: ${input.locale.toUpperCase()}` : null,
    excursion ? `Ekskursija: ${excursion}` : null,
    `Brauciena veids: ${travelType}`,
  ].filter((line) => line !== null);

  const details = [
    mapsLabel || "Jāpārbauda maršruta aprēķins",
    `Izbraukšanas datums: ${formatDate(order.departureOn || input?.departure)}`,
    `Atgriešanās datums: ${formatDate(order.returnOn || input?.returnAt)}`,
    `Pasažieri: ${order.passengerCount || "—"}`,
    "",
    `Vārds: ${order.requestorName || "—"}`,
    `Uzņēmums: ${order.requestorCompany || "—"}`,
    `E-pasts: ${order.requestorEmail || "—"}`,
    `Tālrunis: ${order.requestorPhone || "—"}`,
    order.waterRequested ? `${dictionaries.lv.hero.waterPriceLabel}: ${formatWaterPrice(order.passengerCount, "lv")}` : null,
    order.requestNotes ? `${dictionaries.lv.hero.requestNotes}: ${order.requestNotes}` : null,
    order.planDocument ? `Brauciena plāns: ${order.planDocument}` : null,
  ].filter((line) => line !== null);

  const routePoints = orderEmailRoutePoints(order);
  const routeHtml = `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#f7f5f3;margin:12px 0">
  <tr><td style="padding:20px 16px">
    <p style="margin:0 0 12px;color:#777;font-size:13px;font-weight:bold">Maršruts</p>
    ${routePoints.length ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">${orderEmailRouteTimeline(routePoints)}</table>` : "—"}
  </td></tr></table>`;
  const routeText = `Maršruts: ${routePoints.join(" → ") || "—"}`;
  const detailsHtml = details.map((line) => {
    if (mapsLabel && mapsUrl && line === mapsLabel) {
      return `<a href="${escapeHtml(mapsUrl)}">${escapeHtml(mapsLabel)}</a>`;
    }
    return line ? escapeHtml(line).replace(/\r?\n/g, "<br>") : "&nbsp;";
  }).join("<br>");
  const html = `<div lang="lv" style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#242124">${introduction.map((line) => line ? escapeHtml(line) : "&nbsp;").join("<br>")}${routeHtml}${detailsHtml}<p><a href="${escapeHtml(staffOrdersUrl)}">Atvērt pieteikumu</a></p></div>`;
  const text = [
    ...introduction, "", routeText, "",
    ...details.map((line) => line === mapsLabel && mapsUrl ? `${line}\n${mapsUrl}` : line),
    "", `Atvērt pieteikumu: ${staffOrdersUrl}`,
  ].join("\n");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: order.requestorEmail || undefined,
    subject: `Berro Travel — jauns pieteikums ${order.reference}`,
    text,
    html,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}
