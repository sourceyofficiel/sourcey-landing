import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/auth/me
 * Returns the currently authenticated user (or null).
 * Useful for debug & client-side hooks.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user, authenticated: Boolean(user) });
  } catch (e) {
    return NextResponse.json(
      {
        user: null,
        authenticated: false,
        error: e instanceof Error ? e.message : "unknown",
      },
      { status: 200 }
    );
  }
}

export const dynamic = "force-dynamic";
