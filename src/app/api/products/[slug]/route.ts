import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toProductDetail, toProductSummary } from "@/lib/products";

/**
 * GET /api/products/[slug]
 *   Returns full product detail + 3 related (same category) products.
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
    });
    if (!product) {
      return NextResponse.json(
        { error: "Produit introuvable" },
        { status: 404 }
      );
    }

    const related = await prisma.product.findMany({
      where: {
        category: product.category,
        slug: { not: product.slug },
      },
      orderBy: { sourcedTimes: "desc" },
      take: 3,
    });

    return NextResponse.json({
      product: toProductDetail(product),
      related: related.map(toProductSummary),
    });
  } catch (e) {
    console.error("[GET /api/products/[slug]]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
