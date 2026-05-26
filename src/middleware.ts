import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware Next.js : refresh la session Supabase à chaque requête + gère
 * les redirections d'auth (protection /app, blocage /login si déjà connecté).
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Tout sauf : fichiers statiques, images, API d'auth Supabase
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
