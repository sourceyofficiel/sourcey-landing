import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toProductSummary } from "@/lib/products";

/**
 * GET /api/products
 *   Query params:
 *     category=<key>      Filter by category
 *     q=<text>            Full-text search on title + pitch
 *     sort=popular|price-asc|price-desc|newest
 *     limit=<n>           Default 50
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const q = url.searchParams.get("q")?.toLowerCase();
    const sort = url.searchParams.get("sort") ?? "popular";
    const limit = Math.min(100, Number(url.searchParams.get("limit") ?? 50));

    const orderBy = (() => {
      switch (sort) {
        case "newest":
          return { createdAt: "desc" as const };
        case "price-asc":
        case "price-desc":
          // sqlite can't sort by JSON-derived value easily,
          // we sort in-memory below for these two cases.
          return { sourcedTimes: "desc" as const };
        case "popular":
        default:
          return { sourcedTimes: "desc" as const };
      }
    })();

    const products = await prisma.product.findMany({
      where: {
        ...(category && category !== "all" ? { category } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { shortPitch: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy,
      take: limit,
    });

    let summaries = products.map(toProductSummary);

    if (sort === "price-asc") {
      summaries = summaries.sort((a, b) => a.fromPrice - b.fromPrice);
    } else if (sort === "price-desc") {
      summaries = summaries.sort((a, b) => b.fromPrice - a.fromPrice);
    }

    return NextResponse.json({ products: summaries, total: summaries.length });
  } catch (e) {
    console.error("[GET /api/products]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
