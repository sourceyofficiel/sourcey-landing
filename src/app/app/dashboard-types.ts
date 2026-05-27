/**
 * Types partagés entre page.tsx (server) et DashboardView.tsx (client).
 * Mettre dans un fichier neutre (pas marqué "use client" ni server) évite
 * les bundling issues entre server et client components.
 */

export interface DashboardLead {
  id: string;
  display_name: string;
  handle_tiktok: string | null;
  handle_instagram: string | null;
  avatar_url: string | null;
  followers_count: number;
  size_tier: string;
  global_status: string;
  created_at: string;
  created_by: string | null;
  profiles: { full_name: string | null; email: string } | null;
}

export interface DashboardActivity {
  id: string;
  action: string;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user_id: string | null;
  profiles: { full_name: string | null; email: string } | null;
}
