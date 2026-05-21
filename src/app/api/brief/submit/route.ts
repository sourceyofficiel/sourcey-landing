import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BriefSchema } from "@/types/brief";

/**
 * POST /api/brief/submit
 *
 * Reçoit le payload du formulaire 6 sections, valide via Zod, et persiste
 * en DB. Pas d'intégrations externes (Claude / Notion / Resend) — MVP.
 *
 * Le payload complet est stocké tel quel dans `Brief.data` (JSON). Les
 * colonnes existantes (productName, description, targetQuantity...) sont
 * remplies par mapping depuis ce JSON, pour rester compatibles avec
 * l'affichage admin / les listings existants.
 *
 * Note : les images sont en data-URL base64 dans le JSON. C'est OK pour
 * un volume MVP (qq centaines de briefs). Si on dépasse, switcher vers
 * Vercel Blob ou Cloudinary et stocker des URLs.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Tu dois être connecté pour soumettre un brief." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Payload JSON invalide." },
      { status: 400 }
    );
  }

  // Validation
  const parsed = BriefSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.issues
      .map((i) => i.path.join("."))
      .slice(0, 5)
      .join(", ");
    return NextResponse.json(
      { error: `Champs invalides : ${fields}` },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Mapping vers les colonnes existantes pour l'affichage admin
  const productName =
    `${data.marqueNom} — ${data.productCategory}`.slice(0, 200);

  try {
    const brief = await prisma.brief.create({
      data: {
        userId: user.id,
        productName,
        productType: data.productCategory,
        description: data.productDescription,
        targetQuantity: data.minQuantity,
        targetPrice: data.sellingPrice,
        targetDelivery: data.deliveryDelay,
        inspirationUrl: data.referenceUrls.find((u) => u.length > 0) ?? null,
        data: data as object, // stocke tout le payload structuré
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, briefId: brief.id });
  } catch (err) {
    console.error("[/api/brief/submit]", err);
    return NextResponse.json(
      { error: "Erreur serveur, réessaye dans un instant." },
      { status: 500 }
    );
  }
}
