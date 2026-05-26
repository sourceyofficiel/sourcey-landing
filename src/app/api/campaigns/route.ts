import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*, brand:brands(id, name, slug)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ campaigns: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = (await req.json()) as {
    brand_id?: string;
    name?: string;
    objective?: string;
    budget_cents?: number;
    start_date?: string;
    end_date?: string;
  };
  if (!body.brand_id || !body.name?.trim()) {
    return NextResponse.json(
      { error: "brand_id et name requis" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      brand_id: body.brand_id,
      name: body.name.trim(),
      objective: body.objective ?? "ugc",
      budget_cents: body.budget_cents ?? 0,
      status: "draft",
      start_date: body.start_date ?? null,
      end_date: body.end_date ?? null,
      created_by: user.id,
    })
    .select("*, brand:brands(id, name, slug)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, campaign: data });
}
