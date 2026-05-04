import { NextResponse } from "next/server";
import { getAdminAuthState } from "@/lib/auth";
import { publishPage } from "@/lib/repository";

export const dynamic = "force-dynamic";

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

  return NextResponse.redirect(new URL(`/admin/content/${slug}?published=1`, request.url), { status: 303 });
}
