import { NextResponse } from "next/server";
import { getAdminAuthState } from "@/lib/auth";
import { listEditablePages } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAdminAuthState();
  if (auth.status === "not_configured") {
    return NextResponse.json(
      { error: "Clerk environment variables are not configured." },
      { status: 503 },
    );
  }

  if (auth.status === "not_authenticated") {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (auth.status === "not_authorized") {
    return NextResponse.json({ error: "This account is not allowed." }, { status: 403 });
  }

  try {
    const pages = await listEditablePages();
    return NextResponse.json(pages);
  } catch (error) {
    return NextResponse.json(
      { error: `Unable to load pages: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
