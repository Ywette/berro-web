import { createClient } from "@supabase/supabase-js";

export function getSupabaseStaffEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey };
}

export function hasSupabaseStaffEnv() {
  return getSupabaseStaffEnv() !== null;
}

/** Server-only client for staff data. Call only after Clerk `requireUser()`. */
export function createStaffClient() {
  const env = getSupabaseStaffEnv();

  if (!env) {
    throw new Error(
      "Supabase staff access needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
