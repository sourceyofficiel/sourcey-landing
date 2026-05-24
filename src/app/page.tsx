import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  Sparkles,
  Zap,
  Globe,
  ShieldCheck,
  Clock,
  ArrowRight,
  Check,
  Send,
  ChevronRight,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "AutoSAV — La plateforme SAV n°1 pour répondre vite et bien à tes clients",
  description:
    "AutoSAV t'aide à rédiger, valider et envoyer tes réponses SAV en français — chaque email a un impact, sans embaucher.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  const ctaHref = user ? "/autosav/onboarding" : "/signup?next=/autosav/onboarding";

  return (
    <main className="relative min-h-screen bg-white text-neutral-900">
      {/* === HEADER === */}
      <header className="sticky top-0 z-50 border-b border-neutral-200/70 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
              <Mail className="h-4 w-4" />
            </div>
            <span className="font-display text-[18px] font-extrabold tracking-tight">
              AutoSAV
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Beta
            </span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <Link href="#features" className="text-[13.5px] font-medium text-neutral-600 hover:text-neutral-900">
              Fonctionnalités
            </Link>
            <Link href="#pricing" className="text-[13.5px] font-medium text-neutral-600 hover:text-neutral-900">
              Tarifs
            </Link>
            <Link href="#how" className="text-[13.5px] font-medium text-neutral-600 hover:text-neutral-900">
              Comment ça marche
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/autosav/onboarding" className="hidden text-[14px] font-medium text-neutral-600 hover:text-neutral-900 sm:inline">
                Mon dashboard
              </Link>
            ) : (
              <Link href="/login?next=/autosav/onboarding" className="hidden text-[14px] font-medium text-neutral-600 hover:text-neutral-900 sm:inline">
                Connexion
              </Link>
            )}
            <Link
              href={ctaHref}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-[13.5px] font-bold text-white hover:bg-indigo-700"
            >
              Essai gratuit
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* === HERO — style Mailjet : bloc coloré, 2 colonnes === */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 text-white">
        {/* Decorative shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-5 pb-20 pt-16 md:px-8 md:pb-24 md:pt-20 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            {/* === LEFT : copy === */}
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                <Sparkles className="h-3 w-3 text-amber-300" />
                Nouveau · L&apos;IA SAV pensée pour la France
              </div>

              <h1 className="mt-6 font-display text-[clamp(36px,5.5vw,60px)] font-extrabold leading-[1.04] tracking-tight">
                La plateforme SAV n°1{" "}
                <span className="text-amber-300">pour répondre vite et bien</span>{" "}
                à tes clients.
              </h1>

              <p className="mt-5 max-w-[520px] text-[15.5px] leading-relaxed text-white/80 md:text-[17px]">
                AutoSAV t&apos;aide à rédiger, valider et envoyer tes réponses
                SAV en français — pour que chaque email ait un impact, sans
                embaucher.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={ctaHref}
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-6 text-[14.5px] font-bold text-neutral-900 transition-all hover:bg-amber-200 hover:shadow-[0_20px_40px_-10px_rgba(252,211,77,0.4)]"
                >
                  S&apos;inscrire gratuitement
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="#pricing"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/5 px-6 text-[14.5px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  Demander une démo
                </Link>
              </div>

              <p className="mt-5 text-[12.5px] text-white/60">
                14 jours d&apos;essai · Sans CB · Setup en 8 minutes
              </p>
            </div>

            {/* === RIGHT : mockup interface AutoSAV === */}
            <div className="relative">
              <DraftMockup />
            </div>
          </div>
        </div>

        {/* === MARQUEE compatibilité === */}
        <div className="relative border-t border-white/10 bg-indigo-800/40 py-8 backdrop-blur-sm">
          <div className="mx-auto max-w-[1400px] px-5 md:px-8">
            <div className="grid items-center gap-6 md:grid-cols-[auto_1fr] md:gap-10">
              <div className="text-[12.5px] text-white/70 md:max-w-[200px]">
                <strong className="block text-white">Compatible avec tes outils</strong>
                <span className="text-white/60">Shopify, Woo, Gmail, Outlook, Colissimo…</span>
              </div>
              <LogoMarquee />
            </div>
          </div>
        </div>
      </section>

      {/* === FEATURES === */}
      <section id="features" className="border-b border-neutral-200 bg-white px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-[720px] text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-indigo-700">
              Fonctionnalités
            </div>
            <h2 className="mt-5 font-display text-[clamp(30px,4vw,48px)] font-extrabold tracking-tight">
              Tout ce qu&apos;il te faut pour gérer ton SAV.
            </h2>
            <p className="mx-auto mt-4 text-[15px] leading-relaxed text-neutral-500 md:text-[16.5px]">
              Conçu pour les e-commerçants français qui veulent un SAV pro sans
              embaucher une équipe.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-neutral-200 bg-white p-7 transition-all hover:border-indigo-200 hover:shadow-[0_20px_40px_-20px_rgba(99,102,241,0.25)]"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-[18px] font-extrabold tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-500">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section id="how" className="bg-neutral-50 px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1100px]">
          <div className="mx-auto max-w-[720px] text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-amber-800">
              Setup ultra rapide
            </div>
            <h2 className="mt-5 font-display text-[clamp(30px,4vw,48px)] font-extrabold tracking-tight">
              Tu commences à drafter en 8 minutes.
            </h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 font-display text-[15px] font-extrabold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-5 font-display text-[17px] font-extrabold tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
                  {s.desc}
                </p>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="absolute right-0 top-2 hidden h-5 w-5 text-neutral-300 md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === PRICING === */}
      <section id="pricing" className="border-b border-neutral-200 bg-white px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-[720px] text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-indigo-700">
              Tarifs
            </div>
            <h2 className="mt-5 font-display text-[clamp(30px,4vw,48px)] font-extrabold tracking-tight">
              Moitié prix de Gorgias.
            </h2>
            <p className="mx-auto mt-4 text-[15px] leading-relaxed text-neutral-500 md:text-[16.5px]">
              14 jours d&apos;essai gratuits sur tous les plans, sans carte
              bancaire requise.
            </p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-3xl border bg-white p-8 ${
                  p.highlighted
                    ? "border-indigo-600 shadow-[0_30px_60px_-25px_rgba(99,102,241,0.4)]"
                    : "border-neutral-200"
                }`}
              >
                {p.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-300 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-900">
                    Populaire
                  </div>
                )}
                <h3 className="font-display text-[22px] font-extrabold tracking-tight">
                  {p.name}
                </h3>
                <p className="mt-1 text-[13px] text-neutral-500">{p.tagline}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-[44px] font-extrabold leading-none">
                    {p.price}€
                  </span>
                  <span className="text-[13.5px] text-neutral-500">/mois</span>
                </div>
                <p className="mt-1 text-[12.5px] text-neutral-500">
                  {p.ticketCount} tickets/mois inclus
                </p>
                <Link
                  href={ctaHref}
                  className={`mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13.5px] font-bold transition-colors ${
                    p.highlighted
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  Commencer l&apos;essai
                </Link>
                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[13px] text-neutral-700"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-[680px] text-center text-[12.5px] text-neutral-500">
            Au-delà du quota, chaque ticket supplémentaire est facturé{" "}
            <strong>0,12 €</strong>. Pas de surprises : compteur live dans ton
            dashboard.
          </p>
        </div>
      </section>

      {/* === CTA FINAL === */}
      <section className="bg-white px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 p-12 text-center text-white md:p-16">
            <h2 className="font-display text-[clamp(28px,3.8vw,44px)] font-extrabold tracking-tight">
              Prêt à ne plus jamais répondre à un client ?
            </h2>
            <p className="mx-auto mt-4 max-w-[520px] text-[15px] text-white/80">
              14 jours pour tester sur tes vrais emails. Sans engagement, sans
              CB, résiliable en 1 clic.
            </p>
            <Link
              href={ctaHref}
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-2xl bg-amber-300 px-7 text-[14.5px] font-bold text-neutral-900 transition-all hover:bg-amber-200"
            >
              Démarrer mon essai gratuit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="border-t border-neutral-200 bg-white px-5 py-10 md:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 text-[12.5px] text-neutral-500 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
              <Mail className="h-3 w-3" />
            </div>
            <span>© 2026 AutoSAV — Beta</span>
          </div>
          <div className="flex gap-5">
            <Link href="/#features" className="hover:text-neutral-900">Fonctionnalités</Link>
            <Link href="/#pricing" className="hover:text-neutral-900">Tarifs</Link>
            <Link href="/login" className="hover:text-neutral-900">Connexion</Link>
            <Link href="/signup" className="hover:text-neutral-900">Inscription</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ============================================================
   DRAFT MOCKUP — UI fake qui illustre l'outil dans le hero
   ============================================================ */

function DraftMockup() {
  return (
    <div className="relative">
      {/* Glow derrière */}
      <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-purple-400/30 to-indigo-300/20 blur-2xl" />

      {/* Card principale */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white text-neutral-900 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.4)]">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 border-b border-neutral-100 bg-neutral-50 px-4 py-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <div className="ml-3 text-[11px] font-medium text-neutral-500">
            autosav.io / Ticket #2847
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-[1fr_1.1fr]">
          {/* Email reçu */}
          <div className="border-b border-neutral-100 p-5 md:border-b-0 md:border-r">
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider text-neutral-400">
              <Mail className="h-3 w-3" />
              Email reçu
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-[10px] font-bold text-white">
                MD
              </div>
              <div>
                <div className="text-[12.5px] font-bold text-neutral-900">
                  Marie D.
                </div>
                <div className="text-[10.5px] text-neutral-500">il y a 2 min</div>
              </div>
            </div>
            <div className="mt-3 text-[12px] font-bold text-neutral-900">
              Où est ma commande ?
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-neutral-600">
              Bonjour, j&apos;ai commandé il y a 5 jours et je n&apos;ai
              toujours pas reçu de mail de tracking. Numéro #12847. Merci !
            </p>

            {/* Order context detected */}
            <div className="mt-4 rounded-lg bg-indigo-50 p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                <Sparkles className="h-2.5 w-2.5" />
                Contexte détecté
              </div>
              <div className="mt-1 text-[11px] text-indigo-900">
                Commande #12847 · Colissimo en transit · ETA demain
              </div>
            </div>
          </div>

          {/* Draft IA */}
          <div className="bg-gradient-to-br from-indigo-50/40 to-purple-50/30 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider text-indigo-700">
                <Sparkles className="h-3 w-3" />
                Draft généré
              </div>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-green-700">
                Prêt
              </span>
            </div>

            <div className="mt-3 whitespace-pre-line rounded-xl border border-neutral-200 bg-white p-3 font-sans text-[11.5px] leading-relaxed text-neutral-800">
              Bonjour Marie,{"\n\n"}
              Merci pour votre message ! Votre commande{" "}
              <span className="bg-yellow-100 px-0.5">#12847</span> est bien
              partie. Le suivi Colissimo indique qu&apos;elle est{" "}
              <span className="bg-yellow-100 px-0.5">en transit</span> et sera
              livrée <span className="bg-yellow-100 px-0.5">demain</span>.
              {"\n\n"}Belle journée,{"\n"}L&apos;équipe Sourcey
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                <Clock className="h-2.5 w-2.5" />
                Généré en 1,2s
              </div>
              <div className="flex gap-1.5">
                <button className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-[10.5px] font-bold text-neutral-700">
                  Modifier
                </button>
                <button className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[10.5px] font-bold text-white">
                  <Send className="h-2.5 w-2.5" />
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge bottom-right */}
      <div className="absolute -bottom-4 -right-4 hidden rotate-3 rounded-2xl bg-white px-4 py-2 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)] sm:block">
        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          Économie
        </div>
        <div className="font-display text-[18px] font-extrabold text-neutral-900">
          –40 min<span className="text-[12px] font-medium text-neutral-500">/jour</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LOGO MARQUEE — outils compatibles AutoSAV (animation CSS)
   ============================================================ */

function LogoMarquee() {
  const items = [
    "Shopify",
    "WooCommerce",
    "PrestaShop",
    "Magento",
    "Gmail",
    "Outlook",
    "IONOS",
    "Colissimo",
    "Chronopost",
    "Mondial Relay",
    "UPS",
    "DHL",
  ];
  return (
    <div className="relative overflow-hidden">
      <div className="flex animate-[marquee_30s_linear_infinite] gap-10 whitespace-nowrap">
        {[...items, ...items].map((label, i) => (
          <div
            key={i}
            className="flex shrink-0 items-center text-[15px] font-display font-extrabold tracking-tight text-white/50"
          >
            {label}
          </div>
        ))}
      </div>
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-indigo-800/40 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-indigo-800/40 to-transparent" />
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   DATA
   ============================================================ */

const FEATURES = [
  {
    icon: Sparkles,
    title: "Drafts IA en français",
    desc: "Réponses générées avec ton ton de marque et ta knowledge base. Tu valides ou tu édites en 1 clic.",
  },
  {
    icon: Zap,
    title: "Setup 8 minutes",
    desc: "Connecte ton Shopify/Woo + ta boîte mail + colle ta FAQ. C'est tout. Pas de paramétrage de 3 jours.",
  },
  {
    icon: Globe,
    title: "Colissimo intégré",
    desc: "Le suivi colis live (statut + ETA) est injecté automatiquement dans les drafts qui mentionnent une commande.",
  },
  {
    icon: Clock,
    title: "Mode auto-pilote",
    desc: "Pro et Agency : laisse l'IA répondre seule sur les questions simples (suivi, retour, taille).",
  },
  {
    icon: ShieldCheck,
    title: "Données EU & RGPD",
    desc: "Hébergement Neon Frankfurt + Vercel EU. Export/suppression en 1 clic dans tes réglages.",
  },
  {
    icon: Mail,
    title: "Multi-canal",
    desc: "Gmail, Outlook, IONOS, IMAP générique. Une seule inbox unifiée dans AutoSAV.",
  },
];

const STEPS = [
  {
    title: "Crée ton workspace",
    desc: "Nom de boutique + slug. Trial 14 jours posé direct, pas de CB demandée.",
  },
  {
    title: "Connecte ta boutique",
    desc: "Shopify (OAuth 1 clic) ou WooCommerce (clés API). On récupère commandes + clients.",
  },
  {
    title: "Connecte ta boîte mail",
    desc: "Gmail, Outlook, IONOS ou IMAP. On commence à lire et drafter.",
  },
  {
    title: "Importe ta KB",
    desc: "Colle tes FAQ et politique de retour. L'IA s'en sert pour répondre fidèlement.",
  },
];

const PLANS = [
  {
    name: "Starter",
    tagline: "Pour démarrer son SAV automatisé",
    price: 39,
    ticketCount: 200,
    highlighted: false,
    features: [
      "1 boutique connectée",
      "1 boîte mail",
      "Drafts IA illimités sur le quota",
      "Suivi Colissimo live",
      "Support email",
    ],
  },
  {
    name: "Pro",
    tagline: "Pour scaler son support sans embaucher",
    price: 99,
    ticketCount: 1000,
    highlighted: true,
    features: [
      "3 boutiques connectées",
      "Boîtes mail illimitées",
      "Mode auto-pilote",
      "5 langues (FR, EN, ES, IT, DE)",
      "Multi-utilisateurs (3)",
      "Statistiques temps réel",
    ],
  },
  {
    name: "Agency",
    tagline: "Pour les agences et grosses boutiques",
    price: 299,
    ticketCount: "Illimité",
    highlighted: false,
    features: [
      "Boutiques & boîtes illimitées",
      "10 sièges utilisateurs",
      "API + webhooks",
      "Success manager dédié",
      "SLA 99,9%",
      "Onboarding sur-mesure",
    ],
  },
];
