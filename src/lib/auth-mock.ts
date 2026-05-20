/**
 * Mocked auth — for the messaging MVP we just resolve a hardcoded demo user.
 *
 * When real auth (NextAuth v5) lands, replace these helpers with
 * `auth()` reads — the rest of the codebase should keep working.
 */
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const DEMO_USER_EMAIL = "demo@sourcey.fr";
const COOKIE_NAME = "sourcey_demo_user_id";

/**
 * Returns the currently "authenticated" user id, falling back to the
 * seeded demo user. Sets a cookie so subsequent requests reuse the same id.
 */
export async function getCurrentUserId(): Promise<string> {
  const jar = cookies();
  const fromCookie = jar.get(COOKIE_NAME)?.value;
  if (fromCookie) {
    // verify it still exists (in case DB was reset)
    const user = await prisma.user.findUnique({
      where: { id: fromCookie },
      select: { id: true },
    });
    if (user) return user.id;
  }

  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true },
  });
  if (!user) {
    throw new Error(
      `Demo user not found. Run \`npm run db:seed\` to populate the database.`
    );
  }
  return user.id;
}

export async function getCurrentUser() {
  const id = await getCurrentUserId();
  return prisma.user.findUnique({ where: { id } });
}
