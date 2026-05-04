import { NextRequest, NextResponse } from "next/server";
import { getPublicPage } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const page = await getPublicPage(slug);

  if (!page) {
    return NextResponse.json({ error: "Page not found." }, { status: 404 });
  }

  return NextResponse.json(page);
}
