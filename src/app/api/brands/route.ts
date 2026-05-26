import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ brands: data ?? [] });
}

/**
 * POST /api/brands
 * Body: { name, description, brand_context, logo_url }
 * Admin only (RLS).
 */
export async function POST(req: Request) {
  const supabase = createClient();
  const body = (await req.json()) as {
    name?: string;
    description?: string;
    brand_context?: string;
    logo_url?: string;
  };
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name requis" }, { status: 400 });
  }
  const slug = body.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  const { data, error } = await supabase
    .from("brands")
    .insert({
      name: body.name.trim(),
      slug,
      description: body.description?.trim() || null,
      brand_context: body.brand_context?.trim() || null,
      logo_url: body.logo_url?.trim() || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, brand: data });
}
