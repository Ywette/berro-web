import type { ExtractedPlanFields, PlanTripKind } from "@/lib/plan-document/types";

const openaiUrl = "https://api.openai.com/v1/chat/completions";
const defaultModel = "gpt-4o-mini";
const maxPromptChars = 12_000;

const tripKinds: PlanTripKind[] = ["One-Way", "Round Trip", "Hourly Charter"];

export type AiExtractResult = {
  fields: ExtractedPlanFields | null;
  summary: string;
  status: "ok" | "missing_key" | "empty" | "http" | "invalid" | "failed";
  detail?: string;
};

export async function extractPlanFieldsWithAi(
  text: string,
  locale: "en" | "lv" = "lv",
): Promise<AiExtractResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return { fields: null, summary: "", status: "missing_key" };

  const model = process.env.OPENAI_MODEL?.trim() || defaultModel;
  const document = text.replace(/\u0000/g, "").trim().slice(0, maxPromptChars);
  if (!document) return { fields: null, summary: "", status: "empty" };

  const summaryLanguage = locale === "en" ? "English" : "Latvian";

  try {
    const response = await fetch(openaiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You read a travel or excursion plan and prepare a coach booking form. Use only facts written in the document. Reply with JSON and no other text. Use null for anything the document does not state. Do not guess a time, phone, email, place, or passenger count. Dates are YYYY-MM-DD. Include HH:MM only when a clock time is written, as YYYY-MM-DDTHH:MM. trip is one of \"One-Way\", \"Round Trip\", \"Hourly Charter\", or null. If a return date or return place is present, prefer Round Trip. passengers is an integer from 1 to 80 or null. stops is an array of intermediate stops between pickup and dropoff; each item is {\"name\":\"...\",\"waitMinutes\":number}. If a stop is named but no pause is written, use waitMinutes 15. Do not list pickup or final dropoff as stops. If the same place appears more than once, keep one stop and use the longest wait. otherWaitingMinutes is waiting time from the plan that is not tied to a named stop (integer minutes), otherwise null. summary is one or two short sentences in the requested language that list what you prepared for the form, including stops/waiting if found, and what is still missing.",
          },
          {
            role: "user",
            content: `Write the summary in ${summaryLanguage}. Extract this JSON shape:\n{"summary":"","trip":null,"name":null,"email":null,"phone":null,"pickup":null,"dropoff":null,"departure":null,"returnAt":null,"passengers":null,"stops":[],"otherWaitingMinutes":null}\n\nDocument:\n${document}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!response.ok) {
      const detail = await readApiError(response);
      return { fields: null, summary: "", status: "http", detail };
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return { fields: null, summary: "", status: "invalid" };

    let parsed: unknown;
    try {
      parsed = JSON.parse(content) as unknown;
    } catch {
      return { fields: null, summary: "", status: "invalid" };
    }

    const summary = cleanText((parsed as Record<string, unknown>).summary, 320) ?? "";
    const fields = sanitizeFields(parsed);
    if (fields?.returnAt && !fields.trip) fields.trip = "Round Trip";
    if (fields && summary) fields.travelPlan = summary;

    return fields || summary
      ? { fields, summary, status: "ok" }
      : { fields: null, summary: "", status: "invalid" };
  } catch {
    return { fields: null, summary: "", status: "failed" };
  }
}

async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as {
      error?: { type?: string; code?: string; message?: string };
    };
    const type = body.error?.code || body.error?.type || "";
    const message = body.error?.message?.replace(/\s+/g, " ").slice(0, 180) ?? "";
    return [String(response.status), type, message].filter(Boolean).join(": ").slice(0, 220);
  } catch {
    return String(response.status);
  }
}

function sanitizeFields(value: unknown): ExtractedPlanFields | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const fields: ExtractedPlanFields = {};

  if (typeof raw.trip === "string" && tripKinds.includes(raw.trip as PlanTripKind)) {
    fields.trip = raw.trip as PlanTripKind;
  }

  const name = cleanText(raw.name, 80);
  if (name && name.length >= 2 && !/\d{3,}/.test(name)) fields.name = name;

  const email = cleanText(raw.email, 120);
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = email;

  const phone = cleanText(raw.phone, 40);
  if (phone && /[+\d][\d\s().-]{5,}/.test(phone)) fields.phone = phone;

  const pickup = cleanText(raw.pickup, 80);
  if (pickup) fields.pickup = pickup;
  const dropoff = cleanText(raw.dropoff, 80);
  if (dropoff) fields.dropoff = dropoff;

  const departure = normalizeWhen(raw.departure);
  if (departure) {
    fields.departure = departure;
    fields.pickupDate = departure.slice(0, 10);
  }
  const returnAt = normalizeWhen(raw.returnAt);
  if (returnAt) fields.returnAt = returnAt;

  const passengers = Number(raw.passengers);
  if (Number.isInteger(passengers) && passengers >= 1 && passengers <= 80) {
    fields.passengers = passengers;
  }

  const stops = sanitizeStops(raw.stops);
  if (stops) fields.stops = stops;

  const otherWaiting = Number(raw.otherWaitingMinutes);
  if (Number.isInteger(otherWaiting) && otherWaiting > 0 && otherWaiting <= 24 * 60) {
    fields.otherWaitingMinutes = otherWaiting;
  }

  return Object.keys(fields).length > 0 ? fields : null;
}

function sanitizeStops(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const stops: ExtractedPlanFields["stops"] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const name = cleanText(row.name, 80);
    if (!name) continue;
    const key = name.toLowerCase();
    const waitRaw = Number(row.waitMinutes);
    const waitMinutes =
      Number.isInteger(waitRaw) && waitRaw > 0 && waitRaw <= 24 * 60 ? waitRaw : 15;
    if (seen.has(key)) {
      const existing = stops.find((stop) => stop.name.toLowerCase() === key);
      if (existing) existing.waitMinutes = Math.max(existing.waitMinutes ?? 15, waitMinutes);
      continue;
    }
    seen.add(key);
    stops.push({ name, waitMinutes });
  }
  return stops.length > 0 ? stops : undefined;
}

function cleanText(value: unknown, max: number) {
  if (typeof value !== "string") return undefined;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text || text.toLowerCase() === "null") return undefined;
  return text.slice(0, max);
}

function normalizeWhen(value: unknown) {
  if (typeof value !== "string") return undefined;
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return undefined;
  }
  const dayText = `${match[1]}-${match[2]}-${match[3]}`;
  if (!match[4]) return dayText;
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (hour > 23 || minute > 59) return dayText;
  return `${dayText}T${match[4]}:${match[5]}`;
}
