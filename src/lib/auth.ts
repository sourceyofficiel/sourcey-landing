import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Helper auth pour les Server Components.
 *
 * Récupère le user connecté + son profil (rôle, full_name, etc.) en une
 * seule requête. Redirige vers /login si non auth.
 *
 * Usage :
 *   const { user, profile } = await requireUser();
 *   if (profile.role !== "admin") notFound();
 */
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // L'user a un compte auth mais pas encore de ligne dans profiles —
    // typiquement après un premier login via invitation. On lui en crée une.
    const { data: created } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name ?? null,
        role: "prospector",
      })
      .select()
      .single();
    return { user, profile: created };
  }

  return { user, profile };
}

/**
 * Variante qui n'oblige pas l'auth — retourne null si pas connecté.
 * Utile pour les pages publiques qui adaptent leur affichage.
 */
export async function getOptionalUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return { user, profile };
}

/**
 * Garde-fou admin : redirige vers /app si l'user n'est pas admin.
 * À appeler en top du Server Component d'une page admin only.
 */
export async function requireAdmin() {
  const ctx = await requireUser();
  if (ctx.profile?.role !== "admin") {
    redirect("/app");
  }
  return ctx;
}
