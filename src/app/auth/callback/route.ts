import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /auth/callback?code=…
 *
 * Endpoint atterrissant après le clic sur le magic link Supabase.
 * Échange le code one-time contre une session, set les cookies, redirige
 * vers /app (ou ?next=… si fourni).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/app";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
    console.error("[auth.callback] exchange error", error);
  }

  return NextResponse.redirect(
    new URL("/login?error=invalid_code", url.origin)
  );
}
