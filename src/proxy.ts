import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Structural gate for the CMS.
 *
 * Every /api/admin route already calls getAdminAuthState(), which is what
 * enforces the KGNA_ADMIN_EMAILS allow-list. That check is applied by hand in
 * each route, so a route added later that forgets it would be reachable by
 * anyone. This makes anonymous access impossible regardless.
 *
 * Authorization still belongs to getAdminAuthState(): the allow-list is keyed
 * on the user's email, which is not on the session token here.
 *
 * /api/public/* is deliberately left open — it serves published page content
 * to the website.
 */
const isAdminPage = createRouteMatcher(["/admin(.*)"]);
const isAdminApi = createRouteMatcher(["/api/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // The API answers callers, not browsers, so keep returning the same 401 JSON
  // the routes already return rather than redirecting them to a sign-in page.
  if (isAdminApi(request)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized to access this page." },
        { status: 401 },
      );
    }
    return;
  }

  if (isAdminPage(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
    // Always run for Clerk's own frontend API routes.
    "/__clerk/(.*)",
  ],
};
