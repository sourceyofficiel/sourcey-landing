/**
 * NextAuth v5 setup — ready to drop in when you install the deps.
 *
 * INSTALL (when ready) :
 *   npm install next-auth@beta @auth/prisma-adapter
 *
 * Then :
 *   1) Add a `proxy.ts` file at the project root containing :
 *
 *        export { auth as proxy } from "@/lib/auth";
 *        export const config = { matcher: ["/app/:path*"] };
 *
 *   2) Replace usage of `getCurrentUser()` from `auth-mock` with `auth()`
 *      from `@/lib/auth` across server components / route handlers.
 *
 *   3) Update Prisma User model to satisfy the Adapter schema requirements
 *      (Account, Session, VerificationToken tables — see docs).
 *
 *   4) Set the env vars in .env (NEXTAUTH_SECRET, RESEND_API_KEY,
 *      optional GOOGLE_CLIENT_ID/SECRET).
 *
 * The current `auth-mock.ts` keeps working in dev/demo without this.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

// Uncomment when next-auth + @auth/prisma-adapter are installed:
//
// import NextAuth from "next-auth";
// import EmailProvider from "next-auth/providers/email";
// import Google from "next-auth/providers/google";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { prisma } from "@/lib/db";
// import { magicLinkEmail } from "@/lib/email";
//
// export const { handlers, auth, signIn, signOut } = NextAuth({
//   adapter: PrismaAdapter(prisma),
//   session: { strategy: "database" },
//   pages: { signIn: "/login", verifyRequest: "/login/check-email" },
//   providers: [
//     EmailProvider({
//       from: process.env.EMAIL_FROM ?? "Sourcey <hello@sourcey.fr>",
//       maxAge: 10 * 60, // 10-minute magic link
//       sendVerificationRequest: ({ identifier, url }) =>
//         magicLinkEmail({ to: identifier, url }).then(() => undefined),
//     }),
//     ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
//       ? [
//           Google({
//             clientId: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//           }),
//         ]
//       : []),
//   ],
//   callbacks: {
//     session({ session, user }) {
//       if (session.user) {
//         (session.user as { id?: string }).id = user.id;
//         (session.user as { plan?: string }).plan = (user as { plan?: string }).plan ?? "free";
//       }
//       return session;
//     },
//   },
// });

export const AUTH_ENABLED = Boolean(process.env.NEXTAUTH_SECRET);
