import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeAppleCode, upsertOAuthUser } from "@/lib/oauth";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getIpFromHeaders,
  hashIp,
  logLoginAttempt,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/auth/oauth/apple/callback
 *
 * Apple impose response_mode=form_post → on reçoit le code en POST
 * (et non en GET comme Google). On parse le form body x-www-form-urlencoded.
 */
export async function POST(req: Request) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const formData = await req.formData();
  const code = formData.get("code")?.toString() ?? null;
  const state = formData.get("state")?.toString() ?? null;
  const error = formData.get("error")?.toString() ?? null;

  const ipHash = hashIp(getIpFromHeaders(req.headers));
  const userAgent = req.headers.get("user-agent") ?? undefined;

  if (error) {
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_denied", origin)
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_missing", origin)
    );
  }

  const cookieState = cookies().get("oauth_state")?.value;
  if (!cookieState || cookieState !== state) {
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_state", origin)
    );
  }
  cookies().delete("oauth_state");

  try {
    const userInfo = await exchangeAppleCode(code);
    if (!userInfo.email_verified) {
      return NextResponse.redirect(
        new URL("/auth/login?error=oauth_email_unverified", origin)
      );
    }

    // Apple ne renvoie le nom QUE la première fois (et seulement si l'user
    // accepte de le partager). Pour le récupérer, il faudrait parser le
    // form field "user" envoyé une seule fois — non implémenté ici.
    const { userId, created } = await upsertOAuthUser({
      provider: "apple",
      providerUserId: userInfo.sub,
      email: userInfo.email,
      emailVerified: true,
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { disabledAt: true },
    });
    if (user?.disabledAt) {
      return NextResponse.redirect(
        new URL("/auth/login?error=account_disabled", origin)
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date(), lastLoginIpHash: ipHash },
    });

    await logLoginAttempt({
      userId,
      email: userInfo.email,
      success: true,
      ipHash,
      userAgent,
      method: "apple",
    });

    await createSession(userId);

    return NextResponse.redirect(
      new URL(created ? "/app/bienvenue" : "/app", origin)
    );
  } catch (e) {
    console.error("[oauth.apple.callback]", e);
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_failed", origin)
    );
  }
}
