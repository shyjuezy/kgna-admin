import { NextResponse } from "next/server";
import { listPublicPages } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pages = await listPublicPages();
    return NextResponse.json(pages);
  } catch (error) {
    return NextResponse.json(
      { error: `Unable to load public pages: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
