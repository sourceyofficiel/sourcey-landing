/**
 * Real authentication helpers — bcrypt for password hashing,
 * jose for signed JWT session cookies.
 *
 * Usage côté server route :
 *   - register(email, password, fullName) → crée un user
 *   - login(email, password) → vérifie + retourne user
 *   - createSession(res, userId) → set cookie JWT signé
 *   - destroySession(res) → clear cookie
 *
 * Usage côté server component / route :
 *   - getCurrentUser() → lit le cookie, vérifie le JWT, retourne user (ou null)
 */

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "sourcey_session";
const SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days in seconds

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "NEXTAUTH_SECRET is not set. Generate one with `openssl rand -base64 32`."
    );
  }
  return new TextEncoder().encode(secret);
}

/* ============================================================
   PASSWORD HASHING
   ============================================================ */

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/* ============================================================
   USER REGISTRATION & LOGIN
   ============================================================ */

export type AuthError =
  | "EMAIL_INVALID"
  | "PASSWORD_TOO_SHORT"
  | "EMAIL_TAKEN"
  | "EMAIL_NOT_FOUND"
  | "PASSWORD_INVALID"
  | "OAUTH_ONLY";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(input: {
  email: string;
  password: string;
  fullName?: string;
}): Promise<
  | { ok: true; user: { id: string; email: string; fullName: string | null } }
  | { ok: false; error: AuthError }
> {
  const email = input.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "EMAIL_INVALID" };
  if (input.password.length < 8)
    return { ok: false, error: "PASSWORD_TOO_SHORT" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "EMAIL_TAKEN" };

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName: input.fullName?.trim() || null,
    },
    select: { id: true, email: true, fullName: true },
  });

  // Create a welcome Support conversation so the inbox isn't empty
  await createWelcomeConversation(user.id, user.fullName);

  return { ok: true, user };
}

/**
 * Create a default "Welcome to Sourcey" Support conversation for new users.
 * Includes a couple of pre-filled messages so the inbox feels alive.
 */
async function createWelcomeConversation(
  userId: string,
  fullName: string | null
) {
  try {
    const firstName = fullName?.split(" ")[0] ?? "";
    const greeting = firstName ? `Bienvenue ${firstName} 👋` : "Bienvenue 👋";

    const conv = await prisma.conversation.create({
      data: {
        userId,
        type: "support",
        agentName: "Support Sourcey",
        agentCity: "Paris",
        agentAvatarUrl: "/logo/sourcey-mark.png",
        title: "Bienvenue sur Sourcey",
        lastMessagePreview:
          "Bienvenue ! Je suis là pour t'aider à démarrer ton premier sourcing.",
        lastMessageAt: new Date(),
        unreadByUser: 1,
      },
    });

    // 2 messages : a welcome + a "what's next"
    await prisma.message.createMany({
      data: [
        {
          conversationId: conv.id,
          senderType: "support",
          senderId: null,
          content: `${greeting}\n\nJe suis Sourcey Support, content de te compter parmi nous. Voici comment ça marche :\n\n1️⃣ Décris-moi le produit que tu cherches (textile, électronique, déco...)\n2️⃣ Je te mets en relation avec l'agent francophone qui connaît ta niche\n3️⃣ Tu reçois un devis sous 24h\n\nQuel produit aimerais-tu sourcer en premier ?`,
        },
        {
          conversationId: conv.id,
          senderType: "system",
          senderId: null,
          content: "💡 Astuce : tu peux aussi parcourir notre catalogue de produits déjà négociés depuis le menu de gauche.",
        },
      ],
    });
  } catch (e) {
    // Non-blocking — if welcome conv fails, the user can still log in
    console.error("[createWelcomeConversation]", e);
  }
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<
  | { ok: true; user: { id: string; email: string; fullName: string | null } }
  | { ok: false; error: AuthError }
> {
  const email = input.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "EMAIL_INVALID" };

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      fullName: true,
      passwordHash: true,
    },
  });

  if (!user) return { ok: false, error: "EMAIL_NOT_FOUND" };
  if (!user.passwordHash) return { ok: false, error: "OAUTH_ONLY" };

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) return { ok: false, error: "PASSWORD_INVALID" };

  return {
    ok: true,
    user: { id: user.id, email: user.email, fullName: user.fullName },
  };
}

/* ============================================================
   SESSION (signed JWT in HTTP-only cookie)
   ============================================================ */

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret());

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export function destroySession() {
  cookies().delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = payload.sub;
    if (typeof userId !== "string") return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        plan: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}

export const AUTH_ENABLED = Boolean(process.env.NEXTAUTH_SECRET);
