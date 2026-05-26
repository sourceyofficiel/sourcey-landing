import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/influencers/[id]
 * Retourne l'influenceur + ses analyses IA + ses prospections.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const [{ data: influencer }, { data: analyses }, { data: prospections }] =
      await Promise.all([
        supabase
          .from("influencers")
          .select("*")
          .eq("id", params.id)
          .maybeSingle(),
        supabase
          .from("ai_analyses")
          .select("*, brand:brands(id, name, slug)")
          .eq("influencer_id", params.id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("prospections")
          .select(
            "*, campaign:campaigns(id, name, brand_id), assignee:profiles!assigned_to(id, full_name, email)"
          )
          .eq("influencer_id", params.id)
          .order("created_at", { ascending: false }),
      ]);

    if (!influencer) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      influencer,
      analyses: analyses ?? [],
      prospections: prospections ?? [],
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    console.error("[influencer.get]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/influencers/[id]
 * Met à jour les champs éditables.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const allowed = [
      "display_name",
      "handle_tiktok",
      "handle_instagram",
      "handle_youtube",
      "profile_url",
      "followers_count",
      "niche",
      "country",
      "language",
      "contact_email",
      "contact_phone",
      "pricing_min_cents",
      "pricing_max_cents",
      "engagement_rate",
      "global_status",
      "notes",
    ];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }
    update.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("influencers")
      .update(update)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, influencer: data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/influencers/[id]
 * Supprime un influenceur (cascade les prospections, analyses, messages).
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { error } = await supabase
      .from("influencers")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
