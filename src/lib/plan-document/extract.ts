import { catalog } from "@/lib/places/catalog";
import type { ExtractedPlanFields, PlanDocumentResult, PlanTripKind } from "@/lib/plan-document/types";

const maxTextChars = 20_000;

const passengerPatterns = [
  /(?:passengers?|pax|pasažier[iu](?:em)?|cilvēk(?:i|iem)?|persons?)\s*[:\-]?\s*(\d{1,3})\b/i,
  /\b(\d{1,3})\s*(?:passengers?|pax|pasažier|cilvēk)/i,
  /\bgroup\s+of\s+(\d{1,3})\b/i,
  /\bgrupa\s+(\d{1,3})\b/i,
];

const datePatterns = [
  /\b(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?\b/,
  /\b(\d{1,2})[./](\d{1,2})[./](\d{4})(?:\s+(\d{1,2}):(\d{2}))?\b/,
];

const routePatterns = [
  /(?:from|no|pickup|izbraukšan(?:a|as vieta)?)\s*[:\-]?\s*([^\n,;→\-]+?)\s*(?:to|uz|→|->|–|-|drop(?:off)?|galamērķ(?:is|a)?)\s*[:\-]?\s*([^\n,;]+)/i,
  /(?:route|maršruts)\s*[:\-]?\s*([^\n→\-]+?)\s*(?:→|->|–|-|to|uz)\s*([^\n]+)/i,
];

export function extractPlanFields(rawText: string): PlanDocumentResult {
  const text = rawText.replace(/\u0000/g, "").trim().slice(0, maxTextChars);
  const warnings: string[] = [];
  const fields: ExtractedPlanFields = {};

  if (!text) {
    return { fields, text: "", warnings: ["empty"] };
  }

  fields.travelPlan = text;

  const trip = detectTripKind(text);
  if (trip) {
    fields.trip = trip;
  }

  const name = detectName(text);
  if (name) fields.name = name;

  const email = detectEmail(text);
  if (email) fields.email = email;

  const passengers = detectPassengers(text);
  if (passengers !== null) {
    fields.passengers = passengers;
  } else {
    warnings.push("passengers");
  }

  const places = detectPlaces(text);
  if (places.pickup) {
    fields.pickup = places.pickup;
  }
  if (places.dropoff) {
    fields.dropoff = places.dropoff;
  }
  if (!places.pickup || !places.dropoff) {
    warnings.push("places");
  }

  const dates = detectDates(text);
  if (dates[0]) {
    fields.departure = dates[0].dateTime;
    fields.pickupDate = dates[0].date;
  } else {
    warnings.push("departure");
  }

  const tripKind = fields.trip ?? (dates[1] ? "Round Trip" : undefined);
  if (!fields.trip && tripKind) {
    fields.trip = tripKind;
  }

  if (tripKind === "Round Trip") {
    if (dates[1]) {
      fields.returnAt = dates[1].dateTime;
    } else {
      warnings.push("return");
    }
  }

  return { fields, text, warnings };
}

function detectTripKind(text: string): PlanTripKind | undefined {
  const lower = text.toLowerCase().normalize("NFC");

  const labeled = lower.match(
    /(?:trip\s*type|brauciena\s*veids|trip|brauciens|service|pakalpojums)\s*[:\-–]?\s*([^\n,;.]+)/i,
  );
  if (labeled?.[1]) {
    const fromLabel = classifyTripPhrase(labeled[1]);
    if (fromLabel) return fromLabel;
  }

  // Prefer hourly before round/one-way — plans often mention "return" loosely.
  if (
    /hourly(?:\s+charter)?|by\s+the\s+hour|per\s+hour|pa\s*stund|stundu\s*noma|stundas?\s+noma|noma\s+pa\s+stund/.test(
      lower,
    )
  ) {
    return "Hourly Charter";
  }

  if (
    /round\s*trip|return\s+trip|turp\s+un\s+atpaka[ļl]|turp\s*\/\s*atpaka[ļl]|turp-atpaka[ļl]|and\s+back|there\s+and\s+back|with\s+return|ar\s+atgrie[šs]anos/.test(
      lower,
    )
  ) {
    return "Round Trip";
  }

  if (
    /one[-\s]?way|one\s+direction|single\s+direction|vien[aā]\s+virzien[aā]|vienvirziena|only\s+outbound|tikai\s+turp/.test(
      lower,
    )
  ) {
    return "One-Way";
  }

  return undefined;
}

function classifyTripPhrase(phrase: string): PlanTripKind | undefined {
  const value = phrase.toLowerCase().normalize("NFC").trim();
  if (
    /hourly|stundu|pa\s*stund|by\s+the\s+hour|per\s+hour/.test(value)
  ) {
    return "Hourly Charter";
  }
  if (
    /round|turp|atpaka|return\s*trip|and\s+back/.test(value)
  ) {
    return "Round Trip";
  }
  if (
    /one[-\s]?way|one\s+direction|vien[aā]|single|oneway/.test(value)
  ) {
    return "One-Way";
  }
  return undefined;
}

function detectName(text: string) {
  const labeled = text.match(
    /(?:^|[^\p{L}])(?:contact\s*name|full\s*name|client\s*name|passenger\s*name|kontaktpersona|klienta\s*vārds|klients|vārds|name)\s*[:\-–]\s*([^\n@]{2,80})/iu,
  );
  if (!labeled) return undefined;
  const name = labeled[1].replace(/[,;].*$/, "").replace(/\s+/g, " ").trim();
  if (name.length < 2 || name.length > 80 || /\d{3,}/.test(name)) return undefined;
  return name;
}

function detectEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
}

function detectPassengers(text: string): number | null {
  for (const pattern of passengerPatterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const value = Number(match[1]);
    if (Number.isFinite(value) && value > 0 && value <= 80) {
      return value;
    }
  }
  return null;
}

function detectPlaces(text: string): { pickup?: string; dropoff?: string } {
  for (const pattern of routePatterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const pickup = resolvePlaceName(match[1]);
    const dropoff = resolvePlaceName(match[2]);
    if (pickup || dropoff) {
      return { pickup, dropoff };
    }
  }

  const found: string[] = [];
  const lower = text.toLowerCase();
  for (const place of catalog) {
    const names = [place.name.lv, place.name.en, ...Object.values(place.name)];
    const hit = names.some((name) => {
      const needle = name.toLowerCase();
      return needle.length >= 4 && lower.includes(needle);
    });
    if (hit) {
      found.push(place.name.lv);
    }
  }

  const unique = [...new Set(found)];
  if (unique.length >= 2) {
    return { pickup: unique[0], dropoff: unique[1] };
  }
  if (unique.length === 1) {
    return { pickup: unique[0] };
  }
  return {};
}

function resolvePlaceName(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[.]+$/, "").trim().replace(/\s+/g, " ");
  if (cleaned.length < 2 || cleaned.length > 80) return undefined;

  const lower = cleaned.toLowerCase();
  for (const place of catalog) {
    const names = [place.name.lv, place.name.en];
    if (names.some((name) => name.toLowerCase() === lower || lower.includes(name.toLowerCase()))) {
      return place.name.lv;
    }
  }
  return cleaned;
}

function detectDates(text: string): Array<{ date: string; dateTime: string }> {
  const results: Array<{ date: string; dateTime: string }> = [];

  for (const pattern of datePatterns) {
    const global = new RegExp(pattern.source, "g");
    let match: RegExpExecArray | null;
    while ((match = global.exec(text)) !== null && results.length < 2) {
      const parsed = normalizeDateMatch(match);
      if (!parsed) continue;
      if (results.some((item) => item.dateTime === parsed.dateTime)) continue;
      results.push(parsed);
    }
    if (results.length >= 2) break;
  }

  return results;
}

function normalizeDateMatch(match: RegExpMatchArray): { date: string; dateTime: string } | null {
  let year: number;
  let month: number;
  let day: number;
  let hour = 9;
  let minute = 0;

  if (match[0].includes("-") && match[1].length === 4) {
    year = Number(match[1]);
    month = Number(match[2]);
    day = Number(match[3]);
    if (match[4]) hour = Number(match[4]);
    if (match[5]) minute = Number(match[5]);
  } else {
    day = Number(match[1]);
    month = Number(match[2]);
    year = Number(match[3]);
    if (match[4]) hour = Number(match[4]);
    if (match[5]) minute = Number(match[5]);
  }

  if (!isValidDateParts(year, month, day, hour, minute)) {
    return null;
  }

  const date = `${year}-${pad(month)}-${pad(day)}`;
  const dateTime = `${date}T${pad(hour)}:${pad(minute)}`;
  return { date, dateTime };
}

function isValidDateParts(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
) {
  if (year < 2020 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (hour < 0 || hour > 23) return false;
  if (minute < 0 || minute > 59) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
