import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enterpriseLeadNotification } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Body {
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  monthlyVolume?: string;
  budgetRange?: string;
  categories?: string[];
  message?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const companyName = body.companyName?.trim();
    const contactName = body.contactName?.trim();
    const email = body.email?.trim().toLowerCase();

    if (!companyName) {
      return NextResponse.json(
        { error: "Le nom de l'entreprise est obligatoire" },
        { status: 400 }
      );
    }
    if (!contactName) {
      return NextResponse.json(
        { error: "Votre nom est obligatoire" },
        { status: 400 }
      );
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Email invalide" },
        { status: 400 }
      );
    }
    if (!body.monthlyVolume) {
      return NextResponse.json(
        { error: "Le volume mensuel estimé est obligatoire" },
        { status: 400 }
      );
    }
    if (!body.budgetRange) {
      return NextResponse.json(
        { error: "Le budget mensuel envisagé est obligatoire" },
        { status: 400 }
      );
    }

    await prisma.enterpriseLead.create({
      data: {
        companyName,
        contactName,
        email,
        phone: body.phone?.trim() || null,
        monthlyVolume: body.monthlyVolume,
        budgetRange: body.budgetRange,
        categories: body.categories?.length
          ? JSON.stringify(body.categories)
          : null,
        message: body.message?.trim() || null,
        status: "new",
      },
    });

    // Notify the sales inbox (no-op if RESEND_API_KEY not set)
    const inbox = process.env.SALES_INBOX_EMAIL ?? "enterprise@sourcey.fr";
    enterpriseLeadNotification({
      to: inbox,
      companyName,
      contactName,
      email,
      monthlyVolume: body.monthlyVolume,
      budgetRange: body.budgetRange,
      message: body.message ?? null,
    }).catch((e) => console.error("[enterprise-leads email]", e));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/enterprise-leads]", e);
    return NextResponse.json(
      { error: "Erreur serveur, réessayez dans un instant" },
      { status: 500 }
    );
  }
}
