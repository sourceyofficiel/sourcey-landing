import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("invitations")
    .select("*, inviter:profiles!invited_by(id, full_name, email)")
    .gt("expires_at", new Date().toISOString())
    .is("accepted_at", null)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invitations: data ?? [] });
}

/**
 * POST /api/invitations
 * Body: { email, role: 'prospector'|'admin' }
 * Admin only (RLS).
 */
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = (await req.json()) as { email?: string; role?: string };
  if (!body.email?.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }
  const role = body.role === "admin" ? "admin" : "prospector";
  const email = body.email.toLowerCase().trim();

  // Check si user déjà membre
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingProfile) {
    return NextResponse.json(
      { error: "Cet utilisateur fait déjà partie de l'équipe" },
      { status: 409 }
    );
  }

  // Remplace toute invitation pendante pour ce mail
  await supabase.from("invitations").delete().eq("email", email);

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      email,
      role,
      token,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    invitation: data,
    // L'admin partagera ce lien manuellement (pas d'email envoyé par défaut)
    inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/invite/${token}`,
  });
}
