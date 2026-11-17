import { locales, type Locale, type Localized } from "@/lib/i18n/locale";

export type LocalizedLines = Localized<string[]>;

/** Fill all locales with the same seed (used when migrating plain text). */
export function localizedFromSeed(seed = ""): Localized {
  const text = seed.trim();
  return { lv: text, en: text, fr: text, ru: text };
}

export function localizedLinesFromSeed(lines: string[] = []): LocalizedLines {
  const cleaned = lines.map((line) => line.trim()).filter(Boolean);
  return { lv: cleaned, en: cleaned, fr: cleaned, ru: cleaned };
}

export function parseLocalizedText(value: unknown, fallback = ""): Localized {
  if (typeof value === "string") {
    return localizedFromSeed(value || fallback);
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return localizedFromSeed(fallback);
  }
  const record = value as Record<string, unknown>;
  const lv =
    typeof record.lv === "string"
      ? record.lv
      : typeof record.LV === "string"
        ? record.LV
        : fallback;
  const en = typeof record.en === "string" ? record.en : lv;
  const fr = typeof record.fr === "string" ? record.fr : undefined;
  const ru = typeof record.ru === "string" ? record.ru : undefined;
  return { lv, en, fr, ru };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

export function parseLocalizedLines(value: unknown): LocalizedLines {
  if (Array.isArray(value)) {
    return localizedLinesFromSeed(asStringArray(value));
  }
  if (!value || typeof value !== "object") {
    return localizedLinesFromSeed([]);
  }
  const record = value as Record<string, unknown>;
  // Legacy: array-shaped values already handled; object of arrays.
  if (Array.isArray(record.lv) || Array.isArray(record.en)) {
    const lv = asStringArray(record.lv);
    const en = asStringArray(record.en).length > 0 ? asStringArray(record.en) : lv;
    const fr = asStringArray(record.fr);
    const ru = asStringArray(record.ru);
    return {
      lv,
      en,
      fr: fr.length > 0 ? fr : undefined,
      ru: ru.length > 0 ? ru : undefined,
    };
  }
  // Object of multiline strings.
  const fromText = parseLocalizedText(value);
  return {
    lv: splitLines(fromText.lv),
    en: splitLines(fromText.en),
    fr: fromText.fr ? splitLines(fromText.fr) : undefined,
    ru: fromText.ru ? splitLines(fromText.ru) : undefined,
  };
}

export function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function joinLines(lines: string[] | undefined): string {
  return (lines ?? []).join("\n");
}

/** Prefer active locale; fall back lv → en → first non-empty. */
export function pickLocalizedText(value: Localized | string | null | undefined, locale: Locale): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  const ordered: Locale[] =
    locale === "fr"
      ? ["fr", "en", "lv", "ru"]
      : locale === "ru"
        ? ["ru", "lv", "en", "fr"]
        : locale === "en"
          ? ["en", "lv", "fr", "ru"]
          : ["lv", "en", "fr", "ru"];
  for (const key of ordered) {
    const text = value[key];
    if (typeof text === "string" && text.trim()) return text;
  }
  return "";
}

export function pickLocalizedLines(
  value: LocalizedLines | string[] | null | undefined,
  locale: Locale,
): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  const ordered: Locale[] =
    locale === "fr"
      ? ["fr", "en", "lv", "ru"]
      : locale === "ru"
        ? ["ru", "lv", "en", "fr"]
        : locale === "en"
          ? ["en", "lv", "fr", "ru"]
          : ["lv", "en", "fr", "ru"];
  for (const key of ordered) {
    const lines = value[key];
    if (Array.isArray(lines) && lines.length > 0) return lines;
  }
  return [];
}

/**
 * Read localized text from FormData.
 * Prefer a single `field` value (staff writes one language) and mirror it to all locales.
 * Still accepts `field_lv` … `field_ru` if present.
 */
export function localizedTextFromForm(formData: FormData, field: string): Localized {
  const legacy = String(formData.get(field) ?? "").trim();
  const lv = String(formData.get(`${field}_lv`) ?? "").trim();
  const en = String(formData.get(`${field}_en`) ?? "").trim();
  const fr = String(formData.get(`${field}_fr`) ?? "").trim();
  const ru = String(formData.get(`${field}_ru`) ?? "").trim();

  // Single staff field: store the same text in every locale for now.
  if (legacy && !lv && !en && !fr && !ru) {
    return localizedFromSeed(legacy);
  }

  const primary = lv || legacy;
  return {
    lv: primary,
    en: en || primary,
    fr: fr || primary,
    ru: ru || primary,
  };
}

export function localizedLinesFromForm(formData: FormData, field: string): LocalizedLines {
  const text = localizedTextFromForm(formData, field);
  return {
    lv: splitLines(text.lv),
    en: splitLines(text.en),
    fr: text.fr ? splitLines(text.fr) : undefined,
    ru: text.ru ? splitLines(text.ru) : undefined,
  };
}

export const localeFieldLabels: Record<Locale, string> = {
  lv: "LV",
  en: "EN",
  fr: "FR",
  ru: "RU",
};

export function allLocales(): readonly Locale[] {
  return locales;
}
