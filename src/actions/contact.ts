"use server";

import { sendContactEmail } from "@/lib/email/send-contact-email";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export type ContactState = {
  error?: string;
  success?: string;
};

export async function sendContactMessage(
  _state: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const dictionary = await getDictionary();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (name.length < 2 || name.length > 80) {
    return { error: dictionary.contact.nameError };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
    return { error: dictionary.contact.emailError };
  }

  if (phone.length > 40) {
    return { error: dictionary.contact.phoneError };
  }

  if (message.length < 10 || message.length > 2000) {
    return { error: dictionary.contact.messageError };
  }

  const result = await sendContactEmail({
    name,
    email,
    phone,
    message,
    subjectPrefix: dictionary.contact.emailSubject,
    nameLabel: dictionary.contact.name,
    emailLabel: dictionary.contact.email,
    phoneLabel: dictionary.contact.phone,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  return {
    success: dictionary.contact.sent,
  };
}
