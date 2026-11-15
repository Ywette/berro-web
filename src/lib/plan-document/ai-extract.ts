import type { Locale } from "@/lib/i18n/locale";
import type { ExtractedPlanFields, PlanTripKind } from "@/lib/plan-document/types";
import { quoteTripKinds } from "@/lib/quote-trips";

const openaiUrl = "https://api.openai.com/v1/chat/completions";
const defaultModel = "gpt-4o-mini";
const maxPromptChars = 12_000;

const tripKinds: PlanTripKind[] = [...quoteTripKinds];

const summaryLanguages: Record<Locale, string> = {
  lv: "Latvian",
  en: "English",
  fr: "French",
  ru: "Russian",
};

export type AiExtractResult = {
  fields: ExtractedPlanFields | null;
  summary: string;
  status: "ok" | "missing_key" | "empty" | "http" | "invalid" | "failed";
  detail?: string;
};

export async function extractPlanFieldsWithAi(
  text: string,
  locale: Locale = "lv",
): Promise<AiExtractResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return { fields: null, summary: "", status: "missing_key" };

  const model = process.env.OPENAI_MODEL?.trim() || defaultModel;
  const document = text.replace(/\u0000/g, "").trim().slice(0, maxPromptChars);
  if (!document) return { fields: null, summary: "", status: "empty" };

  const summaryLanguage = summaryLanguages[locale];

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
            content: [
              "You extract fields for a Latvian coach booking form from a travel plan.",
              "Use only facts written in the document. Reply with JSON only.",
              "Use null for anything not stated. Do not invent contact details, places, times, or passenger counts.",
              "Field mapping:",
              '- pickup = departure place / "Izbraukšana no" / from / origin / lidosta pickup',
              '- dropoff = destination / "Galamērķis" / to / where the group travels for the trip (not the later return home unless that is the only destination)',
              '- departure = trip start date-time',
              '- returnAt = trip end / return date-time',
              '- trip is one of "Bus Rental", "Minibus Rental", "Transfer", "Excursions", or null; prefer Excursions for tour/excursion plans, Transfer for airport/point-to-point rides, Minibus Rental for smaller vans/VIP, Bus Rental for coach hire without a fixed tour',
              "Dates in the JSON must be YYYY-MM-DD. If a clock time is written, use YYYY-MM-DDTHH:MM (24h). Convert European dates such as 18.11.2026 or 18/11/2026.",
              "passengers is an integer 1-80 or null.",
              'stops = intermediate stops between pickup and destination as [{"name":"...","waitMinutes":number}]. Default waitMinutes to 15 when a stop is named without a pause. Do not list pickup or final destination as stops. Deduplicate the same place and keep the longest wait.',
              "otherWaitingMinutes = waiting minutes mentioned without a named stop, else null.",
              "summary = 1-2 short sentences in the requested language listing what you filled. Mention as missing only fields that are null in your JSON.",
            ].join(" "),
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
    if (fields?.returnAt && !fields.trip) fields.trip = "Excursions";
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

  const phone = cleanPhone(raw.phone);
  if (phone) fields.phone = phone;

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
  if (Number.isFinite(otherWaiting) && otherWaiting > 0 && otherWaiting <= 24 * 60) {
    fields.otherWaitingMinutes = Math.round(otherWaiting);
  }

  return Object.keys(fields).length > 0 ? fields : null;
}

function sanitizeStops(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const stops: NonNullable<ExtractedPlanFields["stops"]> = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const name = cleanText(row.name, 80);
    if (!name) continue;
    const key = name.toLowerCase();
    const waitRaw = Number(row.waitMinutes);
    const waitMinutes =
      Number.isFinite(waitRaw) && waitRaw > 0 && waitRaw <= 24 * 60 ? Math.round(waitRaw) : 15;
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

function cleanPhone(value: unknown) {
  const text = cleanText(value, 40);
  if (!text) return undefined;
  const digits = text.replace(/\D/g, "");
  if (digits.length < 6) return undefined;
  return text;
}

function cleanText(value: unknown, max: number) {
  if (typeof value !== "string") return undefined;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text || text.toLowerCase() === "null") return undefined;
  return text.slice(0, max);
}

function normalizeWhen(value: unknown) {
  if (typeof value !== "string") return undefined;
  const raw = value.trim();
  if (!raw || raw.toLowerCase() === "null") return undefined;

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s]+(\d{1,2}):(\d{2})(?::\d{2})?)?/);
  if (iso) return buildWhen(Number(iso[1]), Number(iso[2]), Number(iso[3]), iso[4], iso[5]);

  const european = raw.match(
    /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:[T\s]+(?:plkst\.?\s*)?(\d{1,2})[:.](\d{2}))?/i,
  );
  if (european) {
    return buildWhen(
      Number(european[3]),
      Number(european[2]),
      Number(european[1]),
      european[4],
      european[5],
    );
  }

  return undefined;
}

function buildWhen(
  year: number,
  month: number,
  day: number,
  hourText?: string,
  minuteText?: string,
) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return undefined;
  }
  const dayText = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (hourText == null || minuteText == null) return dayText;
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour > 23 || minute > 59) {
    return dayText;
  }
  return `${dayText}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
