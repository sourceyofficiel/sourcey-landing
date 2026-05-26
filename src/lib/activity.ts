import { createClient } from "@/lib/supabase/server";

/**
 * Log une action utilisateur dans activity_log. Utilisé pour le leaderboard,
 * l'audit, et les stats. Non-bloquant : si ça plante, on continue silencieux
 * (pas la peine de casser une action principale pour un log).
 */
export async function logActivity(
  action: string,
  targetId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("activity_log").insert({
      user_id: user.id,
      action,
      target_id: targetId ?? null,
      metadata: metadata ?? null,
    });
  } catch (e) {
    console.warn("[activity.log] silent fail", e);
  }
}
