/**
 * Compatibility wrapper — kept for backward compatibility with existing code.
 *
 * Previously this resolved a hardcoded demo user. Now it just delegates
 * to the real auth system (`@/lib/auth`). All the existing callers keep
 * working without changes.
 */
import { getCurrentUser as realGetCurrentUser } from "@/lib/auth";

export const DEMO_USER_EMAIL = "demo@sourcey.fr";

/**
 * Returns the currently authenticated user id.
 * Throws if no user is logged in (route handlers should catch).
 */
export async function getCurrentUserId(): Promise<string> {
  const user = await realGetCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user.id;
}

/**
 * Returns the currently authenticated user, or null if not logged in.
 */
export async function getCurrentUser() {
  return realGetCurrentUser();
}
