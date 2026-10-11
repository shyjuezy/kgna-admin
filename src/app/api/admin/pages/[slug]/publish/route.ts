import { NextResponse } from "next/server";
import { getAdminAuthState } from "@/lib/auth";
import { publishPage } from "@/lib/repository";

export const dynamic = "force-dynamic";

/**
 * The website caches CMS content for a day so its page views don't keep the
 * Neon compute awake; this clears that cache so a publish shows up straight
 * away. A failure never fails the publish (the content is already saved and
 * the website picks it up within the day), but it is reported back so the
 * editor isn't left wondering why the site hasn't changed.
 */
async function refreshWebsite(): Promise<boolean> {
  const siteUrl = process.env.PUBLIC_SITE_URL;
  const secret = process.env.CMS_REVALIDATE_SECRET;
  if (!siteUrl || !secret) {
    return false;
  }

  try {
    const response = await fetch(new URL("/api/revalidate", siteUrl), {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const auth = await getAdminAuthState();
  if (auth.status !== "ok") {
    const status = auth.status === "not_configured" ? 503 : auth.status === "not_authorized" ? 403 : 401;
    return NextResponse.json({ error: "Unauthorized to access this page." }, { status });
  }

  const { slug } = await context.params;
  const page = await publishPage(slug);
  if (!page) {
    return NextResponse.json({ error: "Page not found." }, { status: 404 });
  }

  const refreshed = await refreshWebsite();
  const destination = new URL(`/admin/content/${slug}`, request.url);
  destination.searchParams.set("published", "1");
  if (!refreshed) {
    destination.searchParams.set("refresh", "failed");
  }

  return NextResponse.redirect(destination, { status: 303 });
}
