import { NextResponse } from "next/server";
import { runCleanup } from "@/lib/sites-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const summary = await runCleanup();
  return NextResponse.json(summary);
}
