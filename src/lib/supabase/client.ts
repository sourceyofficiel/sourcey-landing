import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client côté browser (utilisé dans les Client Components).
 * Lit les vars publiques NEXT_PUBLIC_*.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
