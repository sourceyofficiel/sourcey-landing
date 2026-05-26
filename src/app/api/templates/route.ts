import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("message_templates")
    .select("*, brand:brands(id, name)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ templates: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = (await req.json()) as {
    name?: string;
    channel?: string;
    subject?: string;
    body?: string;
    brand_id?: string;
    is_shared?: boolean;
  };
  if (!body.name?.trim() || !body.channel || !body.body?.trim()) {
    return NextResponse.json(
      { error: "name, channel et body requis" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("message_templates")
    .insert({
      name: body.name.trim(),
      channel: body.channel,
      subject: body.subject?.trim() || null,
      body: body.body.trim(),
      brand_id: body.brand_id ?? null,
      is_shared: body.is_shared ?? true,
      created_by: user.id,
    })
    .select("*, brand:brands(id, name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, template: data });
}
