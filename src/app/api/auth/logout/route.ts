import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

/**
 * POST /api/auth/logout
 * Clear le cookie de session.
 */
export async function POST() {
  destroySession();
  return NextResponse.json({ ok: true });
}
