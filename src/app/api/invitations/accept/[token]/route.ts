import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/invitations/accept/[token]
 *
 * L'user vient de s'inscrire (signUp côté client). Cette route :
 *   1. Vérifie qu'il est bien connecté
 *   2. Trouve l'invitation par token
 *   3. Vérifie que l'email connecté matche celui de l'invitation
 *   4. Update le profile (role + full_name)
 *   5. Marque l'invitation comme acceptée
 *
 * Utilise le service_role pour bypass RLS sur les profiles (sinon
 * l'user prospector ne pourrait pas s'auto-passer admin).
 */
export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Tu dois être connecté pour accepter l'invitation" },
      { status: 401 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    full_name?: string | null;
  };

  const admin = createAdminClient();

  const { data: invitation } = await admin
    .from("invitations")
    .select("*")
    .eq("token", params.token)
    .maybeSingle();

  if (!invitation) {
    return NextResponse.json(
      { error: "Invitation introuvable" },
      { status: 404 }
    );
  }
  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Invitation expirée" }, { status: 410 });
  }
  if (invitation.accepted_at) {
    return NextResponse.json(
      { error: "Invitation déjà acceptée" },
      { status: 410 }
    );
  }
  if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
    return NextResponse.json(
      { error: "L'email du compte ne correspond pas à l'invitation" },
      { status: 403 }
    );
  }

  // Le trigger handle_new_user a déjà créé une ligne profiles. On la met à
  // jour avec le rôle de l'invitation + le full_name.
  await admin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email!,
      role: invitation.role,
      full_name: body.full_name ?? null,
      is_active: true,
    },
    { onConflict: "id" }
  );

  await admin
    .from("invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

  return NextResponse.json({ ok: true });
}
