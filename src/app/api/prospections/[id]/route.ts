import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("prospections")
    .select(
      "*, influencer:influencers(*), campaign:campaigns(id, name, brand_id, brand:brands(id, name)), assignee:profiles!assigned_to(id, full_name, email), messages:prospection_messages(*)"
    )
    .eq("id", params.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ prospection: data });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const body = (await req.json()) as Record<string, unknown>;
  const allowed = [
    "status",
    "channel",
    "agreed_price_cents",
    "expected_deliverables",
    "first_contacted_at",
    "last_interaction_at",
  ];
  const update: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) update[k] = body[k];
  update.updated_at = new Date().toISOString();

  // Auto-set first_contacted_at quand on passe à "contacted"
  if (body.status === "contacted") {
    const { data: current } = await supabase
      .from("prospections")
      .select("first_contacted_at")
      .eq("id", params.id)
      .maybeSingle();
    if (!current?.first_contacted_at) {
      update.first_contacted_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("prospections")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log activité selon le statut
  if (body.status === "contacted") {
    await logActivity("prospection.contact", params.id);
  } else if (body.status === "accepted") {
    await logActivity("prospection.accept", params.id);
  } else if (body.status === "refused") {
    await logActivity("prospection.refuse", params.id);
  }

  return NextResponse.json({ ok: true, prospection: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("prospections")
    .delete()
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
