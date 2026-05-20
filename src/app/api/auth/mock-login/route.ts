import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { welcomeEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Mocked login/signup endpoint — sets a cookie pointing to the demo user.
 * Real NextAuth integration lands in Phase 2 of the roadmap.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      fullName?: string | null;
      plan?: string;
      signup?: boolean;
    };

    const email = body.email?.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // In demo mode we always log into the seeded demo user.
    // The submitted email/fullName/plan is captured in the Waitlist table
    // so you have a trace of who tried to sign up.
    if (body.signup) {
      await prisma.waitlist.upsert({
        where: { email },
        update: {
          source: "mock-signup",
          accountTypeInterest: body.plan ?? null,
        },
        create: {
          email,
          source: "mock-signup",
          accountTypeInterest: body.plan ?? null,
        },
      });
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
      welcomeEmail({
        to: email,
        fullName: body.fullName ?? undefined,
        loginUrl: `${origin}/app/inbox`,
      }).catch((e) => console.error("[welcome email]", e));
    }

    const demoUser = await prisma.user.findUnique({
      where: { email: "demo@sourcey.fr" },
      select: { id: true, email: true, fullName: true, plan: true },
    });
    if (!demoUser) {
      return NextResponse.json(
        { error: "Utilisateur démo introuvable — relance `npm run db:seed`" },
        { status: 500 }
      );
    }

    const res = NextResponse.json({ ok: true, user: demoUser });
    res.cookies.set("sourcey_demo_user_id", demoUser.id, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  } catch (e) {
    console.error("[/api/auth/mock-login]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
