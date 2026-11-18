import { cache } from "react";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

export type SessionUser = {
  id: string;
  email: string | null;
  isStaff: boolean;
};

type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;

/** Clerk `publicMetadata.role` values that open the staff area. Set them in the Clerk Dashboard. */
const STAFF_ROLES = new Set(["staff", "admin"]);

/** Comma-separated `STAFF_EMAILS`, lowercased. Empty or missing means no one gets in by email. */
function staffEmails(): Set<string> {
  return new Set(
    (process.env.STAFF_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function verifiedEmails(user: ClerkUser): string[] {
  return user.emailAddresses
    .filter((address) => address.verification?.status === "verified")
    .map((address) => address.emailAddress.toLowerCase());
}

function isStaff(user: ClerkUser): boolean {
  const role = user.publicMetadata?.role;
  if (typeof role === "string" && STAFF_ROLES.has(role)) return true;
  const allowed = staffEmails();
  return verifiedEmails(user).some((email) => allowed.has(email));
}

export const getOptionalUser = cache(async (): Promise<SessionUser | null> => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const user = await currentUser();
  if (!user) {
    return null;
  }

  const email =
    user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;

  return { id: userId, email, isStaff: isStaff(user) };
});

/** Staff pages and server actions: signed-out users go to sign-in, everyone else who is not staff to /no-access. */
export async function requireUser() {
  const user = await getOptionalUser();
  if (!user) redirect("/sign-in");
  if (!user.isStaff) redirect("/no-access");
  return user;
}

/** Staff API routes: returns an error response to send back, or null when the caller is staff. */
export async function staffApiGuard(): Promise<Response | null> {
  const user = await getOptionalUser();
  if (!user) return Response.json({ ok: false, error: "Sign-in required" }, { status: 401 });
  if (!user.isStaff) return Response.json({ ok: false, error: "Staff access required" }, { status: 403 });
  return null;
}
