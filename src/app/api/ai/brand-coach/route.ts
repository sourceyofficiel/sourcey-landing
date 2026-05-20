import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toProductSummary } from "@/lib/products";
import { agents } from "@/lib/data/agents";
import { brandCoach, AI_ENABLED } from "@/lib/ai";

export const dynamic = "force-dynamic";

interface CoachInput {
  brandName?: string;
  description?: string;
  category?: string;
  audience?: string;
  budget?: string;
  goal?: string;
}

/**
 * POST /api/ai/brand-coach
 *   Returns: { positioning, products, agent, strategy }
 *   Mocked rule-based, swap for GPT-4 call later.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CoachInput;
    const description = (body.description ?? "").toLowerCase();
    if (!description || description.length < 15) {
      return NextResponse.json(
        { error: "Décris ta marque en au moins 15 caractères" },
        { status: 400 }
      );
    }

    // Try real GPT-4 first if configured, fall back to deterministic mock.
    const realAdvice = AI_ENABLED
      ? await brandCoach(description, {
          audience: body.audience,
          budget: body.budget,
          goal: body.goal,
        })
      : null;
    if (!realAdvice) await new Promise((r) => setTimeout(r, 1400));

    const detectedCategory =
      realAdvice?.detectedCategory ??
      body.category ??
      detectCategory(description);
    const positioning = realAdvice?.positioning ?? derivePositioning(description, body);
    const products = await prisma.product.findMany({
      where: { category: detectedCategory },
      orderBy: { sourcedTimes: "desc" },
      take: 5,
    });

    const CATEGORY_TO_AGENT: Record<string, string> = {
      mode: "chen-mei",
      maison: "li-wei",
      electronique: "wang-jun",
      beaute: "zhang-lin",
      sport: "liu-hao",
      bijouterie: "huang-yan",
      enfant: "xu-fang",
      cuisine: "zhao-qiang",
    };
    const agentSlug = CATEGORY_TO_AGENT[detectedCategory] ?? "li-wei";
    const agent = agents.find((a) => a.slug === agentSlug);

    const strategy = realAdvice?.strategy ?? generateStrategy(body, detectedCategory);

    return NextResponse.json({
      positioning,
      detectedCategory,
      detectedCategoryLabel: categoryLabelOf(detectedCategory),
      products: products.map(toProductSummary),
      agent: agent
        ? {
            slug: agent.slug,
            fullName: agent.fullName,
            city: agent.city,
            avatar: agent.avatar,
            tagline: agent.tagline ?? null,
            specialties: agent.specialties,
            rating: agent.rating,
            missions: agent.missions,
          }
        : null,
      strategy,
      poweredBy: AI_ENABLED && realAdvice ? "gpt-4o" : "mock",
    });
  } catch (e) {
    console.error("[/api/ai/brand-coach]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

function detectCategory(text: string): string {
  if (/bougie|déco|maison|lampe|vase|bougie/.test(text)) return "maison";
  if (/hoodie|t-?shirt|vêtement|streetwear|mode/.test(text)) return "mode";
  if (/cosmétique|crème|soin|beauté|skincare/.test(text)) return "beaute";
  if (/usb|tech|chargeur|électronique|gadget/.test(text)) return "electronique";
  if (/yoga|sport|fitness|gym/.test(text)) return "sport";
  if (/bijou|collier|bracelet|montre/.test(text)) return "bijouterie";
  if (/bébé|enfant|jouet|peluche/.test(text)) return "enfant";
  if (/cuisine|café|ustensile|mug/.test(text)) return "cuisine";
  return "maison";
}

function categoryLabelOf(c: string): string {
  return (
    {
      mode: "Mode & textile",
      beaute: "Beauté & cosmétique",
      electronique: "Électronique & tech",
      maison: "Maison & déco",
      sport: "Sport & outdoor",
      bijouterie: "Bijouterie",
      enfant: "Jouets & enfants",
      cuisine: "Cuisine",
    } as Record<string, string>
  )[c] ?? c;
}

interface Positioning {
  archetype: string;
  toneOfVoice: string[];
  visualMood: string[];
  competitorReference: string;
  uniqueAngle: string;
}

function derivePositioning(text: string, input: CoachInput): Positioning {
  const isPremium =
    /premium|luxe|haut de gamme|qualité/.test(text) ||
    (input.budget ?? "").includes("50k+");
  const isEco = /bio|éco|durable|sustainable|écologique|recyclé/.test(text);
  const isMinimalist = /minimal|épuré|sobre|nordique|scandinave/.test(text);
  const isBold = /streetwear|bold|coloré|audacieux/.test(text);

  const archetypes: string[] = [];
  if (isPremium) archetypes.push("Premium");
  if (isEco) archetypes.push("Éco-responsable");
  if (isMinimalist) archetypes.push("Minimaliste");
  if (isBold) archetypes.push("Statement");
  if (archetypes.length === 0) archetypes.push("DTC accessible");

  return {
    archetype: archetypes.join(" · "),
    toneOfVoice: isPremium
      ? ["Confiant", "Refined", "Intimiste"]
      : isBold
        ? ["Direct", "Énergique", "Brut"]
        : ["Authentique", "Chaleureux", "Honnête"],
    visualMood: isMinimalist
      ? ["Espace blanc", "Photos studio", "Typo serif"]
      : isBold
        ? ["Couleurs saturées", "Editorial", "Mood streetwear"]
        : isEco
          ? ["Naturel", "Lumière douce", "Matières brutes"]
          : ["Lifestyle warm", "Photos contextuelles", "Palette chaude"],
    competitorReference: isPremium
      ? "Aesop, Le Labo, COS"
      : isEco
        ? "Patagonia, Veja, Allbirds"
        : isBold
          ? "Carhartt WIP, Glossier Bold, Telfar"
          : "Glossier, Cuyana, Pact",
    uniqueAngle: isEco
      ? "Transparence supply chain + matières sourcées localement"
      : isPremium
        ? "Édition limitée + storytelling artisanal"
        : isBold
          ? "Personnalité de marque assumée, communauté avant produit"
          : "Qualité visible, prix juste, livraison sans drama",
  };
}

interface StrategyItem {
  title: string;
  text: string;
  priority: "now" | "next" | "later";
}

function generateStrategy(input: CoachInput, category: string): StrategyItem[] {
  const out: StrategyItem[] = [];
  const isFirstLaunch =
    !input.goal || input.goal.toLowerCase().includes("lance");

  out.push({
    title: "Commande 2-3 samples avant tout",
    text: `Pour valider la qualité physique avant de t'engager. Notre agent ${
      category === "beaute" ? "Zhang Lin (Shanghai)" : "à recommander"
    } peut t'envoyer un kit échantillons à 35-80€ tout compris.`,
    priority: "now",
  });

  if (isFirstLaunch) {
    out.push({
      title: "Lance avec 1 produit, pas 5",
      text: "Les marques DTC qui réussissent ont presque toutes démarré avec UN seul produit star. Identifie celui qui exprime le mieux ta vision, et concentre tout dessus pendant 90 jours.",
      priority: "now",
    });
    out.push({
      title: "MOQ pédagogique : commence petit",
      text: "Pour ton premier batch, vise 100-300 unités. Ça suffit pour valider le produit-marché sans engloutir ton cash. Tu pourras passer à 1000+ une fois que tu as tes premières ventes.",
      priority: "next",
    });
  } else {
    out.push({
      title: "Sécurise un agent dédié sur ta catégorie",
      text: `Avec le plan Pro (79€/mois), tu débloques un agent attitré qui connaît ton univers. Pour les marques en croissance comme la tienne, ça change les délais et la qualité de matchs.`,
      priority: "now",
    });
    out.push({
      title: "Active le Match IA pour ton prochain produit",
      text: "Plutôt que de chercher seul, balance une photo ou décris ton idée sur Match IA — tu auras 3 fournisseurs comparés en 5 secondes.",
      priority: "next",
    });
  }

  out.push({
    title: "Réserve un Photoshoot pro avant le lancement",
    text: "Plus 80% des e-coms premium se font flinguer par des photos amateur. Notre service Photoshoot (à partir de 200€) te livre 12 photos studio + ambiance en 7 jours. Indispensable pour ton site + tes ads Meta.",
    priority: "next",
  });

  out.push({
    title: "Pense ton packaging dès le 1er prototype",
    text: "Le packaging est ce que ton client touche en premier. Avant de finaliser ton produit, prends 500€ pour un design custom — c'est ce qui te différencie d'Amazon génériques.",
    priority: "later",
  });

  return out;
}
