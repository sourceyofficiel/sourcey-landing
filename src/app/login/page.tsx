import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { Sparkles } from "lucide-react";

export const metadata = { title: "Connexion · Creator Agency" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
            <Sparkles className="h-5 w-5 text-neutral-900" />
          </div>
          <h1 className="mt-4 text-[22px] font-extrabold tracking-tight text-neutral-900">
            Creator Agency
          </h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            Plateforme interne de gestion d&apos;influenceurs
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-2xl backdrop-blur">
          <h2 className="text-[15px] font-bold text-neutral-900">Connexion</h2>
          <p className="mt-1 text-[12.5px] text-neutral-500">
            Entre ton email — tu recevras un lien de connexion sécurisé.
          </p>
          <Suspense
            fallback={
              <div className="mt-6 h-11 rounded-xl bg-neutral-100" />
            }
          >
            <LoginForm />
          </Suspense>
          <p className="mt-6 text-center text-[11px] text-neutral-500">
            L&apos;accès est réservé aux membres invités. Pas d&apos;invitation ? Contacte
            l&apos;admin.
          </p>
        </div>
      </div>
    </main>
  );
}
