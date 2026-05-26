import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase admin (service_role) — bypass RLS.
 * À utiliser UNIQUEMENT côté serveur, dans des routes API protégées.
 * Sert pour créer des invitations utilisateurs, envoyer des magic links
 * de la part de quelqu'un, etc.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || serviceKey === "placeholder") {
    throw new Error(
      "Variables Supabase admin manquantes (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)"
    );
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
