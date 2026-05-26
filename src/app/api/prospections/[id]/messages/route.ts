import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = (await req.json()) as {
    direction?: "sent" | "received";
    channel?: string;
    subject?: string;
    body?: string;
  };
  if (!body.body?.trim() || !body.direction || !body.channel) {
    return NextResponse.json(
      { error: "body, direction, channel requis" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("prospection_messages")
    .insert({
      prospection_id: params.id,
      author_id: user.id,
      direction: body.direction,
      channel: body.channel,
      subject: body.subject ?? null,
      body: body.body.trim(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Maj last_interaction_at + statut si applicable
  await supabase
    .from("prospections")
    .update({
      last_interaction_at: new Date().toISOString(),
      status: body.direction === "received" ? "negotiating" : undefined,
    })
    .eq("id", params.id);

  return NextResponse.json({ ok: true, message: data });
}
