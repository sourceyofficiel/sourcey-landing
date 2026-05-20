import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      source?: string;
      accountTypeInterest?: string;
      ecomPlatform?: string;
      problemText?: string;
    };

    const email = body.email?.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    await prisma.waitlist.upsert({
      where: { email },
      update: {
        source: body.source ?? null,
        accountTypeInterest: body.accountTypeInterest ?? null,
        ecomPlatform: body.ecomPlatform ?? null,
        problemText: body.problemText ?? null,
      },
      create: {
        email,
        source: body.source ?? null,
        accountTypeInterest: body.accountTypeInterest ?? null,
        ecomPlatform: body.ecomPlatform ?? null,
        problemText: body.problemText ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/waitlist]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
