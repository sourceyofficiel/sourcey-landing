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
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "AutoSAV — Le SAV e-commerce qui répond pour toi",
  description:
    "L'IA qui rédige tes réponses SAV en français, avec ton contexte produit et le suivi colis en live. Setup en 8 minutes. 14 jours gratuits.",
};

export const dynamic = "force-dynamic";

/**
 * Landing AutoSAV — page d'accueil principale.
 *
 * Ancienne landing Sourcey accessible via /sourcey si besoin (ou virée).
 * Le dashboard utilisateur est sur /autosav/w/[slug] après login.
 */
export default async function HomePage() {
  const user = await getCurrentUser();
  // Si user déjà connecté, le bouton Connexion devient "Mon dashboard"
  const ctaHref = user ? "/autosav/onboarding" : "/signup?next=/autosav/onboarding";

  return (
    <main className="relative min-h-screen bg-white text-neutral-900">
      {/* === HEADER === */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <Mail className="h-4 w-4" />
            </div>
            <span className="font-display text-[18px] font-extrabold tracking-tight">
              AutoSAV
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Beta
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <Link
                href="/autosav/onboarding"
                className="hidden text-[14px] font-medium text-neutral-600 hover:text-neutral-900 sm:inline"
              >
                Mon dashboard
              </Link>
            ) : (
              <Link
                href="/login?next=/autosav/onboarding"
                className="hidden text-[14px] font-medium text-neutral-600 hover:text-neutral-900 sm:inline"
              >
                Connexion
              </Link>
            )}
            <Link
              href={ctaHref}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-[13.5px] font-bold text-white hover:bg-indigo-700"
            >
              Essai gratuit 14 jours
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* === HERO === */}
      <section className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-16 md:px-8 md:pb-20 md:pt-24">
        <div className="mx-auto max-w-[860px] text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-indigo-700 ring-1 ring-inset ring-indigo-100">
            <Sparkles className="h-3 w-3" />
            L&apos;IA SAV pensée pour la France
          </div>
          <h1 className="mt-5 font-display text-[clamp(36px,5.8vw,68px)] font-extrabold leading-[1.04] tracking-tight">
            Le SAV e-commerce qui{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              répond pour toi
            </span>
            .
          </h1>
          <p className="mx-auto mt-5 max-w-[620px] text-[15.5px] leading-relaxed text-neutral-500 md:text-[17px]">
            L&apos;IA rédige tes réponses email en français avec ton contexte
            produit et le suivi colis Colissimo en live. Tu valides en 1 clic.
            Setup en 8 minutes. Moitié prix de Gorgias.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={ctaHref}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-indigo-600 px-6 text-[14.5px] font-bold text-white hover:bg-indigo-700"
            >
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#pricing"
              className="inline-flex h-12 items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-6 text-[14.5px] font-bold text-neutral-700 hover:bg-neutral-50"
            >
              Voir les tarifs
            </Link>
          </div>
          <p className="mt-4 text-[12.5px] text-neutral-400">
            14 jours sans CB · Sans engagement · Données hébergées en Europe
          </p>
        </div>
      </section>

      {/* === FEATURES === */}
      <section className="border-y border-neutral-200 bg-neutral-50/50 px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-center font-display text-[clamp(28px,3.6vw,44px)] font-extrabold tracking-tight">
            Tout ce qu&apos;il te faut pour gérer ton SAV.
          </h2>
          <p className="mx-auto mt-3 max-w-[560px] text-center text-[14.5px] text-neutral-500 md:text-[15.5px]">
            Conçu pour les e-commerçants français qui veulent un SAV pro sans
            embaucher une équipe.
          </p>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-neutral-200 bg-white p-6"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-[18px] font-extrabold tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-neutral-500">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section className="px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="text-center font-display text-[clamp(28px,3.6vw,44px)] font-extrabold tracking-tight">
            Setup en 8 minutes.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="inline-flex h-9 items-center justify-center rounded-full bg-indigo-600 px-3 text-[13px] font-bold text-white">
                  Étape {i + 1}
                </div>
                <h3 className="mt-4 font-display text-[17px] font-extrabold tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === PRICING === */}
      <section
        id="pricing"
        className="border-y border-neutral-200 bg-neutral-50/50 px-5 py-16 md:px-8 md:py-20"
      >
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-center font-display text-[clamp(28px,3.6vw,44px)] font-extrabold tracking-tight">
            Tarifs simples. Moitié prix de Gorgias.
          </h2>
          <p className="mx-auto mt-3 max-w-[600px] text-center text-[14.5px] text-neutral-500 md:text-[15.5px]">
            14 jours gratuits sur tous les plans, sans CB requise.
          </p>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-3xl border bg-white p-7 ${
                  p.highlighted
                    ? "border-indigo-600 shadow-[0_30px_60px_-25px_rgba(99,102,241,0.4)]"
                    : "border-neutral-200"
                }`}
              >
                {p.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    Populaire
                  </div>
                )}
                <h3 className="font-display text-[22px] font-extrabold tracking-tight">
                  {p.name}
                </h3>
                <p className="mt-1 text-[13px] text-neutral-500">{p.tagline}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-[42px] font-extrabold leading-none">
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
            <strong>0,12 €</strong>. Pas de surprises : un compteur live dans
            ton dashboard te montre où tu en es.
          </p>
        </div>
      </section>

      {/* === CTA FINAL === */}
      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[900px] overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-10 text-center text-white md:p-14">
          <h2 className="font-display text-[clamp(28px,3.6vw,44px)] font-extrabold tracking-tight">
            Prêt à ne plus jamais répondre à un client ?
          </h2>
          <p className="mx-auto mt-3 max-w-[480px] text-[14.5px] text-white/80">
            14 jours pour tester sur tes vrais emails. Sans engagement, sans
            CB, résiliable en 1 clic.
          </p>
          <Link
            href={ctaHref}
            className="mt-7 inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 text-[14.5px] font-bold text-indigo-700 hover:bg-neutral-100"
          >
            Démarrer mon essai gratuit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-200 px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 text-[12.5px] text-neutral-500 md:flex-row">
          <p>© 2026 AutoSAV — Beta</p>
          <div className="flex gap-4">
            <Link href="/#pricing" className="hover:text-neutral-900">
              Tarifs
            </Link>
            <Link href="/login" className="hover:text-neutral-900">
              Connexion
            </Link>
            <Link href="/signup" className="hover:text-neutral-900">
              Inscription
            </Link>
          </div>
        </div>
      </footer>
    </main>
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
    desc: "Pro et Agency : laisse l'IA répondre seule sur les questions simples (suivi, retour, taille). Tu gardes des nuits sereines.",
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
    desc: "Shopify (OAuth 1 clic) ou WooCommerce (clés API). On récupère commandes + clients automatiquement.",
  },
  {
    title: "Connecte ta boîte mail",
    desc: "Gmail, Outlook, IONOS ou IMAP. On commence à lire et drafter.",
  },
  {
    title: "Importe ta KB",
    desc: "Colle tes FAQ et politique de retour. L'IA s'en sert pour répondre fidèlement à ta marque.",
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
