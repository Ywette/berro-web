import { Resend } from "resend";

export type ContactMessage = {
  name: string;
  email: string;
  phone: string;
  message: string;
  subjectPrefix?: string;
  nameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
};

export async function sendContactEmail(input: ContactMessage) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    return {
      ok: false as const,
      error:
        "Email is not configured yet. Add RESEND_API_KEY, CONTACT_TO_EMAIL, and CONTACT_FROM_EMAIL.",
    };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: input.email,
    subject: `${input.subjectPrefix ?? "Berro Travel website message from"} ${input.name}`,
    text: [
      `${input.nameLabel ?? "Name"}: ${input.name}`,
      `${input.emailLabel ?? "Email"}: ${input.email}`,
      `${input.phoneLabel ?? "Phone"}: ${input.phone || "—"}`,
      "",
      input.message,
    ].join("\n"),
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}
