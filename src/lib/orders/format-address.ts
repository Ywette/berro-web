// Address formatting is for display only; routing continues to use the original
// Google address and place ID.
const countryCodes = ["LV", "LT", "EE", "PL", "FI", "SE", "NO", "DK", "DE", "FR", "GB", "IE", "NL", "BE", "LU", "CZ", "SK", "AT", "CH", "IT", "ES", "PT", "IS", "UA", "BY", "RU", "MD", "RO", "BG", "HU", "HR", "SI", "RS", "BA", "ME", "MK", "AL", "GR", "TR", "US", "CA"];
const countryNames = new Map<string, string>();
for (const locale of ["lv", "en", "fr", "ru"]) {
  const display = new Intl.DisplayNames([locale], { type: "region" });
  for (const code of countryCodes) {
    const name = display.of(code);
    if (name && name !== code) countryNames.set(name.toLocaleLowerCase(), code);
  }
}

export function formatRouteAddress(address: string): string {
  const parts = address.split(",").map((part) => part.trim());
  const seen = new Set<string>();
  const result = parts.filter((part) => {
    const locality = part.match(/^(.*?)\s+pilsēta$/iu)?.[1]?.trim().toLocaleLowerCase();
    if (locality && seen.has(locality)) return false;
    seen.add(part.toLocaleLowerCase());
    return true;
  });
  const last = result.length - 1;
  if (last >= 0) result[last] = countryNames.get(result[last].toLocaleLowerCase()) ?? result[last];
  return result.join(", ");
}
