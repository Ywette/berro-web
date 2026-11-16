const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Letters (any language), spaces, hyphen, apostrophe — no digits. */
const namePattern = /^[\p{L}][\p{L}\s'-]{0,78}[\p{L}]$|^[\p{L}]{2}$/u;
/** Optional leading +, then digits only. */
const phonePattern = /^\+?[0-9]{8,15}$/;

export function sanitizeContactName(value: string) {
  return value.replace(/\d+/g, "");
}

export function sanitizeContactPhone(value: string) {
  const trimmed = value.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "").slice(0, 15);
  if (!digits) return hasPlus ? "+" : "";
  return hasPlus ? `+${digits}` : digits;
}

export function isValidContactName(value: string) {
  const name = value.trim();
  return name.length >= 2 && name.length <= 80 && namePattern.test(name) && !/\d/.test(name);
}

export function isValidContactEmail(value: string) {
  const email = value.trim();
  return email.length > 0 && email.length <= 160 && emailPattern.test(email);
}

export function isValidContactPhone(value: string, options?: { required?: boolean }) {
  const phone = value.trim();
  if (!phone) return options?.required !== true;
  return phonePattern.test(phone);
}
