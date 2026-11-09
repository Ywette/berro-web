import { cookies } from "next/headers";
import { dictionaries, LOCALE_COOKIE, parseLocale, type Dictionary, type Locale } from "@/lib/i18n/dictionary";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  return parseLocale(jar.get(LOCALE_COOKIE)?.value);
}

export async function getDictionary(): Promise<Dictionary> {
  const locale = await getLocale();
  return dictionaries[locale];
}
