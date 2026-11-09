import { clerkMiddleware } from "@clerk/nextjs/server";

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/staff") ||
    pathname.startsWith("/employees") ||
    pathname.startsWith("/drivers")
  );
}

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

  if (isProtectedPath(pathname)) {
    await auth.protect({
      unauthenticatedUrl: new URL("/sign-in", request.url).toString(),
    });
    return;
  }

  if (isAuthPath(pathname)) {
    const { userId } = await auth();
    if (userId) {
      return Response.redirect(new URL("/staff", request.url));
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
