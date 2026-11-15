import { createServiceSupabaseClient } from "@/lib/supabase/server";

const TABLE = "newsletter_subscribers";

export type NewsletterTopic = "destinations" | "openExcursions" | "blog";

export type NewsletterSubscribeInput = {
  email: string;
  topics: NewsletterTopic[];
  locale?: string | null;
};

export async function upsertNewsletterSubscriber(
  input: NewsletterSubscribeInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const email = input.email.trim().toLowerCase();
  const { error } = await supabase.from(TABLE).upsert(
    {
      email,
      topics: input.topics,
      locale: input.locale ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );

  if (error) {
    console.error("[newsletter] upsert failed", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
