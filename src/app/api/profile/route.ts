import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-mock";

export const dynamic = "force-dynamic";

/**
 * GET /api/profile
 *   Returns the current user (without sensitive fields).
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        companyName: true,
        phone: true,
        ecomPlatform: true,
        monthlyVolume: true,
        bio: true,
        plan: true,
        createdAt: true,
      },
    });
    if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (e) {
    console.error("[GET /api/profile]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * PATCH /api/profile
 *   Updates editable profile fields. Plan changes routed elsewhere.
 */
export async function PATCH(req: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = (await req.json()) as Partial<{
      fullName: string;
      companyName: string;
      phone: string;
      ecomPlatform: string;
      monthlyVolume: string;
      bio: string;
      avatarUrl: string;
    }>;

    const data: Record<string, string | null> = {};
    const fields: (keyof typeof body)[] = [
      "fullName",
      "companyName",
      "phone",
      "ecomPlatform",
      "monthlyVolume",
      "bio",
      "avatarUrl",
    ];
    for (const f of fields) {
      if (f in body) {
        const v = (body[f] ?? "").toString().trim();
        data[f] = v.length > 0 ? v : null;
      }
    }

    // Basic length guards
    if (data.fullName && data.fullName.length > 80) {
      return NextResponse.json({ error: "Nom trop long" }, { status: 400 });
    }
    if (data.bio && data.bio.length > 500) {
      return NextResponse.json({ error: "Bio trop longue (500 max)" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        companyName: true,
        phone: true,
        ecomPlatform: true,
        monthlyVolume: true,
        bio: true,
        plan: true,
      },
    });

    return NextResponse.json({ user });
  } catch (e) {
    console.error("[PATCH /api/profile]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
