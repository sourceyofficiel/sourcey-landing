import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-mock";
import { SERVICES } from "@/lib/data/services";

/**
 * POST /api/services/order
 *   Body: { type, tier, brief, references? }
 *   Creates a ServiceOrder with status="awaiting_quote".
 */
export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = (await req.json()) as {
      type?: string;
      tier?: "basic" | "standard" | "premium";
      brief?: string;
      references?: string[];
    };

    if (!body.type || !(body.type in SERVICES)) {
      return NextResponse.json(
        { error: "Type de service invalide" },
        { status: 400 }
      );
    }
    const service = SERVICES[body.type as keyof typeof SERVICES];
    const tierDef = service.tiers.find((t) => t.key === body.tier);
    if (!tierDef) {
      return NextResponse.json(
        { error: "Niveau de service invalide" },
        { status: 400 }
      );
    }
    const brief = body.brief?.trim();
    if (!brief || brief.length < 20) {
      return NextResponse.json(
        { error: "Le brief doit faire au moins 20 caractères" },
        { status: 400 }
      );
    }

    const order = await prisma.serviceOrder.create({
      data: {
        userId,
        type: body.type,
        tier: body.tier!,
        brief,
        references: body.references?.length
          ? JSON.stringify(body.references)
          : null,
        estimatedPrice: tierDef.price,
        status: "awaiting_quote",
      },
    });

    return NextResponse.json({ order });
  } catch (e) {
    console.error("[/api/services/order]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * GET /api/services/order
 *   Returns all service orders for the current user.
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const orders = await prisma.serviceOrder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  } catch (e) {
    console.error("[GET /api/services/order]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
