import type { Locale } from "@/lib/i18n/locale";

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : date;
}

export function formatPostDate(date: string, locale: Locale) {
  void locale;
  return formatDate(date);
}

export function formatRigaTimestamp(value: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Riga", day: "2-digit", month: "2-digit", year: "numeric",
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get("day")}-${get("month")}-${get("year")}`;
}
