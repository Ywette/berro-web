import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type SessionUser = {
  id: string;
  email: string | null;
};

export const getOptionalUser = cache(async (): Promise<SessionUser | null> => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    null;

  return { id: userId, email };
});

export async function requireUser() {
  const user = await getOptionalUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}
