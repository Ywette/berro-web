import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

function isAuthPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up")
  );
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/staff/")) {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Sign-in required" }, { status: 401 });
    return;
  }

  if (/^\/(staff|employees|drivers|calendar)(\/|$)/.test(pathname)) {
    const { userId } = await auth();
    if (!userId) {
      const signIn = new URL("/sign-in", request.url);
      signIn.searchParams.set("redirect_url", pathname + request.nextUrl.search);
      return NextResponse.redirect(signIn, 303);
    }
    return;
  }

  if (isAuthPath(pathname)) {
    const { userId } = await auth();
    if (userId) {
      return NextResponse.redirect(new URL("/staff", request.url), 303);
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
