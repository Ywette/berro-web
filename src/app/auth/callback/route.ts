import { NextResponse } from "next/server";

/** Legacy Supabase Auth callback — send people to Clerk sign-in. */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/sign-in`);
}
