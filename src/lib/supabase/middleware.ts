import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Helper utilisé par middleware.ts à chaque requête :
 *   - Rafraîchit la session Supabase (token JWT)
 *   - Bloque l'accès à /app si non connecté
 *   - Bloque /login si déjà connecté (redirect vers /app)
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // IMPORTANT : appel getUser() pour forcer le refresh du token côté serveur.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  const isAppRoute = path.startsWith("/app");
  const isLoginRoute = path === "/login";

  // Pas connecté + tente d'accéder à /app → redirige /login
  if (!user && isAppRoute) {
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Connecté + va sur /login → redirige /app
  if (user && isLoginRoute) {
    url.pathname = "/app";
    return NextResponse.redirect(url);
  }

  return response;
}
