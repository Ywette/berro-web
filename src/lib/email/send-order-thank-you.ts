import { Resend } from "resend";
import { formatDate } from "@/lib/content/format-date";
import { parseLocale } from "@/lib/i18n/locale";
import type { QuoteOrderInput } from "@/lib/orders/session-orders";
import type { StaffOrder } from "@/types/dashboard";

const copy = {
  lv: {
    subject: "Pieteikums saņemts", hello: "Labdien", greeting: "Labdien!",
    thanks: "Paldies par Jūsu pieteikumu!",
    message: "Esam saņēmuši Jūsu pieprasījumu. Mūsu komanda izskatīs informāciju un sazināsies ar Jums, lai sagatavotu piedāvājumu.",
    reference: "Pieteikuma numurs", summary: "Pieteikuma informācija", route: "Maršruts",
    departure: "Izbraukšanas datums", returning: "Atgriešanās datums", passengers: "Pasažieri",
    contact: "Ja vēlaties precizēt informāciju, atbildiet uz šo e-pastu vai rakstiet mums.",
    regards: "Ar cieņu", team: "Berro Travel komanda",
  },
  en: {
    subject: "Request received", hello: "Dear", greeting: "Hello,",
    thanks: "Thank you for your request.",
    message: "We have received your request. Our team will review the details and contact you to prepare an offer.",
    reference: "Request reference", summary: "Request details", route: "Route",
    departure: "Departure date", returning: "Return date", passengers: "Passengers",
    contact: "If you would like to add or clarify any details, reply to this email or contact us.",
    regards: "Kind regards", team: "The Berro Travel team",
  },
  fr: {
    subject: "Demande reçue", hello: "Bonjour", greeting: "Bonjour,",
    thanks: "Nous vous remercions pour votre demande.",
    message: "Nous avons bien reçu votre demande. Notre équipe examinera les informations et vous contactera pour préparer une offre.",
    reference: "Référence de la demande", summary: "Détails de la demande", route: "Itinéraire",
    departure: "Date de départ", returning: "Date de retour", passengers: "Passagers",
    contact: "Pour ajouter ou préciser des informations, répondez à cet e-mail ou contactez-nous.",
    regards: "Cordialement", team: "L’équipe Berro Travel",
  },
  ru: {
    subject: "Заявка получена", hello: "Здравствуйте", greeting: "Здравствуйте!",
    thanks: "Благодарим Вас за заявку.",
    message: "Мы получили Ваш запрос. Наша команда рассмотрит информацию и свяжется с Вами для подготовки предложения.",
    reference: "Номер заявки", summary: "Информация о заявке", route: "Маршрут",
    departure: "Дата отправления", returning: "Дата возвращения", passengers: "Пассажиры",
    contact: "Если Вы хотите дополнить или уточнить информацию, ответьте на это письмо или свяжитесь с нами.",
    regards: "С уважением", team: "Команда Berro Travel",
  },
} as const;

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function siteUrl() {
  const configured = process.env.APP_URL?.trim();
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const raw = process.env.VERCEL_ENV === "production" && productionHost &&
    (!configured || /^https?:\/\/localhost(?=[:/]|$)/i.test(configured))
    ? `https://${productionHost}` : configured || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export async function sendOrderThankYouEmail(order: StaffOrder, input?: QuoteOrderInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = order.requestorEmail?.trim();
  if (!apiKey || !from) return { ok: false as const, error: "Thank-you email is not configured." };
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { ok: false as const, error: "Customer email is missing or invalid." };
  }

  const language = parseLocale(input?.locale ?? order.requestLocale);
  const t = copy[language];
  const name = order.requestorName?.trim();
  const greeting = name ? `${t.hello} ${name},` : t.greeting;
  const route = [order.origin, ...(order.stops ?? []).map((stop) => stop.name),
    order.destination, order.returnTo].filter((place) => place && place !== "—").join(" → ");
  const rows = [
    [t.route, route],
    [t.departure, order.departureOn && formatDate(order.departureOn)],
    [t.returning, order.returnOn && formatDate(order.returnOn)],
    [t.passengers, String(order.passengerCount)],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  const text = [
    greeting, "", t.thanks, t.message, `${t.reference}: ${order.reference}`, "",
    t.summary, ...rows.map(([label, value]) => `${label}: ${value}`), "",
    t.contact, "", t.regards, t.team, "berro@berro.lv",
  ].join("\n");
  const rowsHtml = rows.map(([label, value]) =>
    `<tr><td style="padding:8px 12px;color:#666;font-size:14px;vertical-align:top">${escapeHtml(label)}</td><td style="padding:8px 12px;color:#242124;font-size:14px;vertical-align:top">${escapeHtml(value)}</td></tr>`
  ).join("");
  const logo = escapeHtml(`${siteUrl()}/brand/berro-travel-logo-white.png`);
  const html = `<!doctype html><html lang="${language}"><body style="margin:0;padding:0;background:#f3f1ef;font-family:Arial,sans-serif;color:#242124">
<table role="presentation" style="width:100%;border-collapse:collapse;background:#f3f1ef"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" style="width:100%;max-width:600px;border-collapse:collapse;background:#ffffff">
<tr><td style="padding:25px 30px;background:#171419"><img src="${logo}" width="168" alt="Berro Travel" style="display:block;max-width:100%;height:auto"></td></tr>
<tr><td style="padding:32px 30px">
<p style="margin:0 0 18px;font-size:16px">${escapeHtml(greeting)}</p>
<h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:26px;font-weight:normal;color:#242124">${escapeHtml(t.thanks)}</h1>
<p style="margin:0 0 20px;line-height:1.6">${escapeHtml(t.message)}</p>
<p style="margin:0 0 24px;color:#84263f"><strong>${escapeHtml(t.reference)}: ${escapeHtml(order.reference)}</strong></p>
<h2 style="font-size:16px;margin:0 0 10px">${escapeHtml(t.summary)}</h2>
<table role="presentation" style="width:100%;border-collapse:collapse;background:#f7f5f3">${rowsHtml}</table>
<p style="margin:24px 0;line-height:1.6">${escapeHtml(t.contact)}</p>
<p style="margin:0;line-height:1.6">${escapeHtml(t.regards)},<br><strong>${escapeHtml(t.team)}</strong><br><a href="mailto:berro@berro.lv" style="color:#84263f">berro@berro.lv</a></p>
</td></tr></table></td></tr></table></body></html>`;
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from, to, replyTo: process.env.CONTACT_TO_EMAIL?.trim() || undefined,
    subject: `Berro Travel — ${t.subject} · ${order.reference}`, text, html,
  });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}
