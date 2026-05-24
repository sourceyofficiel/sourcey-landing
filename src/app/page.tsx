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
  Users,
  BookOpen,
  Inbox,
  Plug,
  BarChart3,
  Truck,
  Wallet,
  Star,
  TrendingUp,
  Lock,
  X,
  Bot,
  Layers,
  Bell,
  Languages,
  Package,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "AutoSAV — L'IA qui répond à tes clients pour toi",
  description:
    "L'IA SAV pensée pour les e-commerçants français. Drafts en français avec ton ton de marque, suivi Colissimo intégré, setup en 8 minutes. Moitié prix de Gorgias.",
};

export const dynamic = "force-dynamic";

/**
 * Landing AutoSAV — adaptée au vrai positionnement :
 *   - SaaS pur (pas un BPO)
 *   - L'e-commerçant garde son SAV, l'IA lui draft les réponses
 *   - Cible : 100-2000 commandes/mois
 *   - Différenciants : FR-first, Colissimo natif, setup 8 min, moitié prix Gorgias
 *
 * Structure inspirée d'Onepilot mais avec NOS sections (pas leurs services BPO).
 */
export default async function HomePage() {
  const user = await getCurrentUser();
  const ctaHref = user
    ? "/autosav/onboarding"
    : "/signup?next=/autosav/onboarding";

  return (
    <main className="relative min-h-screen bg-white text-neutral-800">
      {/* === ANNOUNCEMENT BAR === */}
      <div className="bg-emerald-900 px-5 py-2.5 text-center text-[13px] text-amber-100 md:px-8">
        <span>
          AutoSAV en bêta privée — accès anticipé pour les 100 premiers
          e-commerçants français.{" "}
          <Link
            href={ctaHref}
            className="font-semibold text-amber-200 underline underline-offset-2 hover:text-white"
          >
            Demander un accès
          </Link>
        </span>
      </div>

      {/* === STICKY NAV === */}
      <header className="sticky top-3 z-50 mx-auto mt-3 max-w-[1200px] px-5 md:px-8">
        <nav className="flex h-14 items-center justify-between rounded-2xl border border-emerald-900/5 bg-white/90 px-4 shadow-[0_2px_20px_-8px_rgba(6,95,70,0.12)] backdrop-blur-md md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-800 text-amber-200">
              <Mail className="h-4 w-4" />
            </div>
            <span className="font-display text-[17px] font-extrabold tracking-tight text-neutral-900">
              AutoSAV
            </span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            <NavLink href="#how">Comment ça marche</NavLink>
            <NavLink href="#features">Fonctionnalités</NavLink>
            <NavLink href="#pricing">Tarifs</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login?next=/autosav/onboarding"
              className="hidden text-[13.5px] font-medium text-neutral-600 hover:text-emerald-800 sm:inline"
            >
              Connexion
            </Link>
            <Link
              href={ctaHref}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-800 px-4 text-[13px] font-bold text-white shadow-[0_4px_14px_-2px_rgba(6,95,70,0.4),inset_0_-2px_8px_-2px_rgba(0,0,0,0.2)] hover:bg-emerald-900"
            >
              Essai gratuit
            </Link>
          </div>
        </nav>
      </header>

      {/* ============================================================
         HERO
         ============================================================ */}
      <section className="relative overflow-hidden px-5 pb-32 pt-20 md:px-8 md:pb-40 md:pt-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-emerald-100/50 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgb(6,95,70) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-[900px] text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/50 bg-white px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-emerald-700 shadow-sm">
            <Sparkles className="h-3 w-3" />
            L&apos;IA SAV pensée pour la France
          </div>
          <h1 className="mt-6 font-display text-[clamp(38px,5.8vw,72px)] font-extrabold leading-[0.95] tracking-[-0.04em] text-emerald-800">
            Le SAV qui répond
            <br />
            <span className="text-neutral-400">pour toi.</span> Tu valides en 1 clic.
          </h1>
          <p className="mx-auto mt-7 max-w-[620px] text-[16px] leading-[1.5] text-neutral-500 md:text-[18px]">
            L&apos;IA rédige tes réponses email en français avec ton contexte
            produit et le suivi Colissimo en live. Setup en 8 minutes.{" "}
            <strong className="text-neutral-700">Moitié prix de Gorgias.</strong>
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={ctaHref}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-800 px-7 text-[14.5px] font-bold text-white shadow-[0_8px_24px_-4px_rgba(6,95,70,0.4),inset_0_-3px_10px_-2px_rgba(0,0,0,0.2)] hover:bg-emerald-900"
            >
              Essai gratuit 14 jours
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-7 text-[14.5px] font-bold text-emerald-800 hover:bg-emerald-50"
            >
              Voir comment ça marche
            </Link>
          </div>
          <p className="mt-5 text-[12.5px] text-neutral-400">
            Sans CB · Sans engagement · Résiliable en 1 clic
          </p>
        </div>

        {/* === DASHBOARD MOCKUP === */}
        <div className="relative mx-auto mt-20 max-w-[1200px]">
          <DashboardMockup />
          <p className="mt-8 text-center text-[13px] text-neutral-500">
            <strong className="text-emerald-800">5+ tickets/jour</strong> sur ce type de questions ?{" "}
            <Link
              href={ctaHref}
              className="font-bold text-emerald-800 underline underline-offset-2"
            >
              AutoSAV gère ça en arrière-plan
            </Link>
          </p>
        </div>
      </section>

      {/* ============================================================
         CLIENT LOGOS
         ============================================================ */}
      <section className="border-y border-neutral-200/70 bg-neutral-50/40 py-14 md:py-16">
        <div className="mx-auto max-w-[1300px] px-5 md:px-8">
          <p className="text-center text-[12.5px] font-bold uppercase tracking-[0.15em] text-neutral-400">
            Pensé pour les e-commerçants français qui font 100 à 2000 commandes/mois
          </p>
          <div className="mt-8">
            <LogoMarquee />
          </div>
        </div>
      </section>

      {/* ============================================================
         COMMENT ÇA MARCHE — 4 étapes
         ============================================================ */}
      <section id="how" className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[600px]">
            <EyebrowBadge>Setup en 8 minutes</EyebrowBadge>
            <h2 className="mt-5 font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-emerald-800">
              4 étapes pour activer
              <br />
              <span className="text-neutral-400">ton SAV automatisé.</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {[
              {
                num: "01",
                title: "Crée ton workspace",
                desc: "Nom de ta boutique + slug. Trial 14 jours posé direct, pas de CB.",
                icon: Sparkles,
              },
              {
                num: "02",
                title: "Connecte ta boutique",
                desc: "Shopify en OAuth 1 clic ou WooCommerce avec tes clés API.",
                icon: Plug,
              },
              {
                num: "03",
                title: "Connecte ta boîte mail",
                desc: "Gmail, Outlook, IONOS ou IMAP. On commence à lire et drafter.",
                icon: Mail,
              },
              {
                num: "04",
                title: "Colle ta KB",
                desc: "FAQ, politique de retour, livraison. L'IA s'en sert pour répondre fidèlement.",
                icon: BookOpen,
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="relative rounded-3xl border border-emerald-100 bg-white p-7 shadow-[0_2px_10px_-2px_rgba(6,95,70,0.06)]"
                >
                  <div className="font-display text-[44px] font-extrabold leading-none text-emerald-100">
                    {step.num}
                  </div>
                  <div className="-mt-6 ml-1 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-amber-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-4 font-display text-[16px] font-extrabold tracking-tight text-emerald-900">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
         CARTES DIFFÉRENTIATION
         ============================================================ */}
      <section className="border-y border-neutral-200/70 bg-amber-50/30 px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[600px]">
            <EyebrowBadge>Pourquoi AutoSAV</EyebrowBadge>
            <h2 className="mt-5 font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-emerald-800">
              On a fait l&apos;outil
              <br />
              <span className="text-neutral-400">qu&apos;on aurait voulu utiliser.</span>
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-neutral-500">
              Les outils US sont trop chers, trop complexes, ne parlent pas
              français, et ne connaissent pas Colissimo. AutoSAV, oui.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-12">
            {/* Card 1 — Drafts IA française (large) */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-7 md:p-8">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-amber-200">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-[22px] font-extrabold tracking-tight text-emerald-800">
                Drafts IA en français natif
              </h3>
              <p className="mt-2 max-w-[440px] text-[14px] text-neutral-500">
                Claude Sonnet briefé sur ton ton de marque et ta knowledge
                base. Pas du Google Translate — des réponses qui sonnent
                comme toi.
              </p>
              {/* Mock draft preview */}
              <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200/70 bg-neutral-50/40 p-4">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  <Sparkles className="h-3 w-3" />
                  Draft généré en 1,2s
                </div>
                <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-neutral-800">
                  Bonjour Marie,{"\n\n"}
                  Merci pour votre message ! Votre commande{" "}
                  <span className="bg-amber-200/70 px-0.5">#12847</span> est
                  bien partie. Le suivi Colissimo indique qu&apos;elle est{" "}
                  <span className="bg-amber-200/70 px-0.5">en transit</span> et
                  sera livrée{" "}
                  <span className="bg-amber-200/70 px-0.5">demain</span>.{"\n\n"}
                  Belle journée 🌿
                </p>
              </div>
            </div>

            {/* Card 2 — Colissimo */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-5 md:p-8">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-amber-200">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-[22px] font-extrabold tracking-tight text-emerald-800">
                Colissimo intégré nativement
              </h3>
              <p className="mt-2 text-[14px] text-neutral-500">
                Le suivi colis live est injecté automatiquement dans les
                drafts qui mentionnent une commande.
              </p>
              <div className="mt-6 space-y-2">
                {[
                  { status: "Expédié", time: "21 mai 14h32", on: true },
                  { status: "En transit", time: "22 mai 09h15", on: true, current: true },
                  { status: "En livraison", time: "Demain 10h-13h", on: false },
                ].map((s, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-lg border p-2.5 text-[12.5px] ${
                      s.current
                        ? "border-emerald-300 bg-emerald-50/60"
                        : "border-neutral-200/70 bg-white"
                    }`}
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        s.on ? "bg-emerald-500" : "bg-neutral-300"
                      }`}
                    />
                    <span
                      className={`flex-1 font-bold ${
                        s.on ? "text-emerald-900" : "text-neutral-500"
                      }`}
                    >
                      {s.status}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {s.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3 — Setup 8 min */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-5 md:p-8">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-amber-200">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-[22px] font-extrabold tracking-tight text-emerald-800">
                Setup 8 minutes, pas 3 jours
              </h3>
              <p className="mt-2 text-[14px] text-neutral-500">
                Pas besoin d&apos;un consultant pour brancher AutoSAV.
                4 étapes simples, c&apos;est tout.
              </p>
              <div className="mt-6 rounded-2xl bg-amber-50/60 p-4 text-center">
                <div className="font-display text-[40px] font-extrabold leading-none text-emerald-900">
                  8 min
                </div>
                <div className="mt-1 text-[12px] text-emerald-800/70">
                  De &quot;jamais utilisé&quot; à &quot;premier draft généré&quot;
                </div>
                <div className="mt-3 grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full bg-emerald-700"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Card 4 — Moitié prix Gorgias */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-7 md:p-8">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-amber-200">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-[22px] font-extrabold tracking-tight text-emerald-800">
                Moitié prix de Gorgias
              </h3>
              <p className="mt-2 max-w-[440px] text-[14px] text-neutral-500">
                Pour 1000 tickets/mois, paye 99 € au lieu de 200 € chez
                Gorgias — avec les mêmes features de base et l&apos;IA
                française en plus.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-4 text-center">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-rose-700">
                    Gorgias
                  </div>
                  <div className="mt-2 font-display text-[24px] font-extrabold leading-none text-neutral-400 line-through">
                    200€
                  </div>
                  <div className="mt-1 text-[10.5px] text-neutral-500">
                    Plan Pro
                  </div>
                </div>
                <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/40 p-4 text-center">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700">
                    AutoSAV
                  </div>
                  <div className="mt-2 font-display text-[24px] font-extrabold leading-none text-emerald-800">
                    99€
                  </div>
                  <div className="mt-1 text-[10.5px] text-emerald-700">
                    Plan Pro
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-amber-100/60 p-4 text-center">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800">
                    Économie
                  </div>
                  <div className="mt-2 font-display text-[24px] font-extrabold leading-none text-emerald-900">
                    −50%
                  </div>
                  <div className="mt-1 text-[10.5px] text-emerald-800">
                    Chaque mois
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5 — Multi-canal */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-4 md:p-8">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-amber-200">
                <Inbox className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-[22px] font-extrabold tracking-tight text-emerald-800">
                Toutes tes boîtes mail, une seule inbox
              </h3>
              <p className="mt-2 text-[14px] text-neutral-500">
                Gmail, Outlook, IONOS, IMAP générique. Tout est unifié dans
                AutoSAV.
              </p>
              <div className="mt-6 space-y-2">
                {["Gmail / Google Workspace", "Outlook / Microsoft 365", "IONOS / IMAP générique"].map(
                  (p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-white p-2.5 text-[12.5px] font-medium text-emerald-900"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      {p}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Card 6 — Mode auto-pilote */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-4 md:p-8">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-amber-200">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-[22px] font-extrabold tracking-tight text-emerald-800">
                Mode auto-pilote (Pro/Agency)
              </h3>
              <p className="mt-2 text-[14px] text-neutral-500">
                Laisse l&apos;IA répondre seule aux questions simples : suivi
                colis, retour, changement de taille.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-50/60 px-4 py-2 text-[12.5px] font-bold text-emerald-800">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                40% des tickets résolus seuls
              </div>
            </div>

            {/* Card 7 — Données EU */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-4 md:p-8">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-amber-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-[22px] font-extrabold tracking-tight text-emerald-800">
                Données EU, RGPD natif
              </h3>
              <p className="mt-2 text-[14px] text-neutral-500">
                Hébergement Neon Frankfurt + Vercel EU. Export et suppression
                en 1 clic dans tes réglages.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["RGPD", "EU only", "DKIM", "SOC 2 (Q3 2026)"].map((b) => (
                  <span
                    key={b}
                    className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200/50"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
         INTÉGRATIONS marquee
         ============================================================ */}
      <section className="px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <h3 className="text-center font-display text-[24px] font-extrabold tracking-tight text-emerald-800">
            Compatible avec ce que tu utilises déjà
          </h3>
          <p className="mt-2 text-center text-[14px] text-neutral-500">
            Aucun changement d&apos;outil — on se branche sur ton stack actuel.
          </p>
          <div className="mt-10">
            <IntegrationsMarquee />
          </div>
        </div>
      </section>

      {/* ============================================================
         9 FEATURES — 3x3 grid sur fond emerald sombre
         ============================================================ */}
      <section
        id="features"
        className="border-y border-neutral-200/70 bg-emerald-900 px-5 py-24 text-amber-50 md:px-8 md:py-32"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[700px]">
            <h2 className="font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-amber-200">
              Tout ce qu&apos;il te faut.{" "}
              <span className="text-amber-100/60">
                Rien que tu n&apos;utiliseras pas.
              </span>
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-amber-100/60">
              On a viré tout ce qui sert pas. Voici ce qui reste.
            </p>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-amber-200/10 bg-amber-200/10 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Drafts IA français",
                desc: "Claude Sonnet briefé sur ton ton de marque + ta KB.",
              },
              {
                icon: BookOpen,
                title: "Knowledge Base",
                desc: "Colle ta FAQ + politique retour, l'IA s'en sert.",
              },
              {
                icon: Inbox,
                title: "Inbox unifiée",
                desc: "Toutes tes boîtes mail dans un seul tableau de bord.",
              },
              {
                icon: Truck,
                title: "Suivi Colissimo live",
                desc: "Statut + ETA injectés auto dans les drafts.",
              },
              {
                icon: Bot,
                title: "Mode auto-pilote",
                desc: "Pro/Agency : l'IA répond seule aux tickets simples.",
              },
              {
                icon: Users,
                title: "Multi-utilisateurs",
                desc: "3 sièges en Pro, 10 en Agency. Rôles owner/admin/agent.",
              },
              {
                icon: BarChart3,
                title: "Statistiques",
                desc: "Volume traité, taux de résolution, temps gagné.",
              },
              {
                icon: Plug,
                title: "Shopify + Woo natif",
                desc: "Commandes, clients, tracking récupérés auto.",
              },
              {
                icon: Layers,
                title: "API & Webhooks",
                desc: "Plan Agency : intègre AutoSAV dans tes systèmes.",
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group bg-emerald-900 p-7 transition-colors hover:bg-emerald-950"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-200/20 text-amber-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-[18px] font-extrabold tracking-tight text-amber-100">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-amber-100/60">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
         IA EN ACTION — 4 cas d'usage e-commerce français
         ============================================================ */}
      <section className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[700px]">
            <EyebrowBadge>L&apos;IA en action</EyebrowBadge>
            <h2 className="mt-5 font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-emerald-800">
              4 questions clients
              <br />
              <span className="text-neutral-400">qu&apos;AutoSAV règle sans toi.</span>
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-neutral-500">
              Si 40% de tes tickets ressemblent à ça, AutoSAV te fait gagner
              5h de SAV par semaine.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {[
              {
                icon: Package,
                question: "Où en est ma commande ?",
                share: "37%",
                desc: "L'IA détecte le n° de commande, fetch le statut Colissimo et répond avec l'ETA live.",
              },
              {
                icon: ArrowRight,
                question: "Comment je retourne ce produit ?",
                share: "18%",
                desc: "L'IA pioche dans ta KB la politique retour et génère un email avec les étapes claires + lien retour.",
              },
              {
                icon: Truck,
                question: "Délai de livraison pour Noël ?",
                share: "14%",
                desc: "L'IA croise la date demandée avec tes délais de livraison configurés et répond avec garantie ou alternative.",
              },
              {
                icon: Bell,
                question: "Mon colis est marqué livré mais je n'ai rien",
                share: "11%",
                desc: "L'IA vérifie le statut Colissimo, suggère le voisinage/relais, et escalade si besoin avec contexte.",
              },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 transition-all hover:shadow-[0_20px_40px_-20px_rgba(6,95,70,0.2)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-amber-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800">
                      {c.share} des tickets
                    </div>
                  </div>
                  <h3 className="mt-5 font-display text-[19px] font-extrabold tracking-tight text-emerald-900">
                    « {c.question} »
                  </h3>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-neutral-600">
                    {c.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
         PRICING — 3 plans
         ============================================================ */}
      <section
        id="pricing"
        className="border-y border-neutral-200/70 bg-amber-50/30 px-5 py-24 md:px-8 md:py-32"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-[700px] text-center">
            <EyebrowBadge>Tarifs simples</EyebrowBadge>
            <h2 className="mt-5 font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-emerald-800">
              Moitié prix de Gorgias.
              <br />
              <span className="text-neutral-400">Sans engagement.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[560px] text-[16px] leading-relaxed text-neutral-500">
              14 jours d&apos;essai gratuits sur tous les plans. Pas de CB
              demandée. Résiliable en 1 clic.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Starter",
                tagline: "Pour démarrer",
                price: 39,
                ticketCount: "200 tickets/mois",
                highlighted: false,
                features: [
                  "1 boutique connectée",
                  "1 boîte mail",
                  "Drafts IA illimités sur quota",
                  "Suivi Colissimo live",
                  "Support email",
                ],
              },
              {
                name: "Pro",
                tagline: "Pour scaler",
                price: 99,
                ticketCount: "1 000 tickets/mois",
                highlighted: true,
                features: [
                  "3 boutiques connectées",
                  "Boîtes mail illimitées",
                  "Mode auto-pilote",
                  "5 langues (FR, EN, ES, IT, DE)",
                  "3 utilisateurs",
                  "Statistiques détaillées",
                ],
              },
              {
                name: "Agency",
                tagline: "Pour les agences",
                price: 299,
                ticketCount: "Illimité",
                highlighted: false,
                features: [
                  "Boutiques illimitées",
                  "10 sièges utilisateurs",
                  "API + webhooks",
                  "Success manager dédié",
                  "SLA 99,9%",
                  "Onboarding sur-mesure",
                ],
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative rounded-3xl border bg-white p-8 ${
                  p.highlighted
                    ? "border-emerald-800 shadow-[0_30px_60px_-25px_rgba(6,95,70,0.4)]"
                    : "border-emerald-100"
                }`}
              >
                {p.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-300 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-950">
                    Le plus choisi
                  </div>
                )}
                <h3 className="font-display text-[22px] font-extrabold tracking-tight text-emerald-900">
                  {p.name}
                </h3>
                <p className="mt-1 text-[13px] text-neutral-500">{p.tagline}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-[48px] font-extrabold leading-none text-emerald-800">
                    {p.price}€
                  </span>
                  <span className="text-[13.5px] text-neutral-500">/mois</span>
                </div>
                <p className="mt-1 text-[12.5px] text-neutral-500">
                  {p.ticketCount}
                </p>
                <Link
                  href={ctaHref}
                  className={`mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13.5px] font-bold ${
                    p.highlighted
                      ? "bg-emerald-800 text-white hover:bg-emerald-900"
                      : "border border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50"
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
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-[680px] text-center text-[12.5px] text-neutral-500">
            Au-delà du quota, chaque ticket supplémentaire est facturé{" "}
            <strong>0,12 €</strong>. Compteur live dans ton dashboard.
          </p>
        </div>
      </section>

      {/* ============================================================
         COMPARAISON — vs Gorgias / Zendesk
         ============================================================ */}
      <section className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1100px]">
          <div className="max-w-[600px]">
            <EyebrowBadge>Comparaison</EyebrowBadge>
            <h2 className="mt-5 font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-emerald-800">
              Pourquoi pas Gorgias
              <br />
              <span className="text-neutral-400">ou Zendesk ?</span>
            </h2>
          </div>

          <div className="mt-14 overflow-hidden rounded-3xl border border-emerald-100 bg-white">
            <div className="grid grid-cols-4 border-b border-neutral-200/70 bg-emerald-50/40 text-[12.5px] font-bold text-emerald-900">
              <div className="px-5 py-4">Critère</div>
              <div className="px-5 py-4 text-center">AutoSAV</div>
              <div className="px-5 py-4 text-center text-neutral-500">
                Gorgias
              </div>
              <div className="px-5 py-4 text-center text-neutral-500">
                Zendesk
              </div>
            </div>
            {[
              {
                criteria: "Prix plan 1000 tickets/mois",
                us: "99 €",
                them1: "200 $",
                them2: "115 $",
              },
              {
                criteria: "Setup",
                us: "8 minutes",
                them1: "1-3 jours",
                them2: "Plusieurs semaines",
              },
              {
                criteria: "Drafts IA en français",
                us: true,
                them1: "Anglais d'abord",
                them2: false,
              },
              {
                criteria: "Suivi Colissimo natif",
                us: true,
                them1: false,
                them2: false,
              },
              {
                criteria: "Support en français",
                us: true,
                them1: false,
                them2: false,
              },
              {
                criteria: "Données hébergées EU",
                us: true,
                them1: "US",
                them2: "US",
              },
            ].map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-4 border-b border-neutral-100 text-[13px] last:border-b-0"
              >
                <div className="px-5 py-4 font-medium text-neutral-700">
                  {row.criteria}
                </div>
                <div className="bg-emerald-50/30 px-5 py-4 text-center font-bold text-emerald-900">
                  {typeof row.us === "boolean" ? (
                    <Check className="mx-auto h-5 w-5 text-emerald-700" />
                  ) : (
                    row.us
                  )}
                </div>
                <div className="px-5 py-4 text-center text-neutral-500">
                  {typeof row.them1 === "boolean" ? (
                    row.them1 ? (
                      <Check className="mx-auto h-5 w-5 text-neutral-400" />
                    ) : (
                      <X className="mx-auto h-5 w-5 text-rose-400" />
                    )
                  ) : (
                    row.them1
                  )}
                </div>
                <div className="px-5 py-4 text-center text-neutral-500">
                  {typeof row.them2 === "boolean" ? (
                    row.them2 ? (
                      <Check className="mx-auto h-5 w-5 text-neutral-400" />
                    ) : (
                      <X className="mx-auto h-5 w-5 text-rose-400" />
                    )
                  ) : (
                    row.them2
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
         SÉCURITÉ
         ============================================================ */}
      <section className="border-y border-neutral-200/70 bg-emerald-50/30 px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_2fr]">
            <div>
              <EyebrowBadge>Sécurité</EyebrowBadge>
              <h2 className="mt-5 font-display text-[28px] font-extrabold leading-tight tracking-tight text-emerald-800">
                Tes données restent en Europe.
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-neutral-500">
                On stocke et traite tes emails clients dans des datacenters
                Frankfurt. Aucun transit hors EU.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { icon: ShieldCheck, label: "RGPD" },
                { icon: Lock, label: "Chiffré AES-256" },
                { icon: Globe, label: "Hébergement EU" },
                { icon: Users, label: "Export 1-clic" },
              ].map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.label}
                    className="rounded-2xl border border-emerald-100 bg-white p-4"
                  >
                    <Icon className="h-5 w-5 text-emerald-700" />
                    <div className="mt-3 text-[13px] font-bold text-emerald-900">
                      {b.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
         TÉMOIGNAGES
         ============================================================ */}
      <section className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[600px]">
            <EyebrowBadge>Bêta-testeurs</EyebrowBadge>
            <h2 className="mt-5 font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-emerald-800">
              Les premiers retours.
            </h2>
            <p className="mt-4 text-[14px] text-neutral-500">
              Avis honnêtes des 10 premières marques qui testent AutoSAV en
              accès anticipé.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "Avant je passais 2h/jour à répondre aux clients. Maintenant 30 minutes — l'IA fait les drafts et je valide.",
                name: "Camille B.",
                role: "Fondatrice, Marque de cosmétiques bio",
                initials: "CB",
                gradient: "from-pink-400 to-rose-500",
              },
              {
                quote:
                  "Le suivi Colissimo direct dans les drafts, c'est le truc qui m'a fait switcher. Je perdais 5 min par ticket à copier-coller le tracking.",
                name: "Julien M.",
                role: "Founder, DTC accessoires sport",
                initials: "JM",
                gradient: "from-emerald-400 to-teal-500",
              },
              {
                quote:
                  "Setup en 10 min un dimanche soir. Lundi matin, premier draft envoyé. J'ai pas eu besoin d'aide de personne.",
                name: "Sarah L.",
                role: "Solo founder, Décoration intérieure",
                initials: "SL",
                gradient: "from-amber-400 to-orange-500",
              },
            ].map((v, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-amber-50/40 to-emerald-50/30 p-7"
              >
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-5 text-[14.5px] leading-relaxed text-neutral-700">
                  &quot;{v.quote}&quot;
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-emerald-100 pt-5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${v.gradient} text-[12px] font-bold text-white`}
                  >
                    {v.initials}
                  </div>
                  <div>
                    <div className="text-[13.5px] font-bold text-emerald-900">
                      {v.name}
                    </div>
                    <div className="text-[11.5px] text-neutral-500">
                      {v.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
         FAQ rapide
         ============================================================ */}
      <section
        id="faq"
        className="border-y border-neutral-200/70 bg-amber-50/40 px-5 py-24 md:px-8 md:py-32"
      >
        <div className="mx-auto max-w-[900px]">
          <div className="text-center">
            <EyebrowBadge>FAQ</EyebrowBadge>
            <h2 className="mt-5 font-display text-[clamp(30px,4vw,48px)] font-extrabold leading-tight tracking-tight text-emerald-800">
              Tout ce que tu te demandes.
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {[
              {
                q: "Faut-il une CB pour l'essai ?",
                a: "Non. 14 jours d'essai sans CB. Tu paies seulement quand tu décides de continuer.",
              },
              {
                q: "Est-ce que l'IA peut envoyer des emails sans que je valide ?",
                a: "Par défaut non — tu valides chaque draft en 1 clic. En plan Pro/Agency, tu peux activer le mode auto-pilote sur certaines catégories de tickets (suivi colis, retour, etc.) si tu veux gagner du temps.",
              },
              {
                q: "Quelles boutiques sont supportées ?",
                a: "Shopify (OAuth 1 clic), WooCommerce (clés API). PrestaShop et Magento arrivent au T3 2026.",
              },
              {
                q: "Et si je dépasse mon quota ?",
                a: "Chaque ticket au-delà du quota est facturé 0,12 €. Pas de coupure de service. Tu peux upgrader ton plan à tout moment.",
              },
              {
                q: "Mes données restent-elles confidentielles ?",
                a: "Oui. Hébergement Neon Frankfurt + Vercel EU. Aucun transit hors UE. RGPD natif. Export et suppression de toutes tes données en 1 clic dans les réglages.",
              },
              {
                q: "Combien de temps pour résilier ?",
                a: "1 clic dans tes réglages. Pas d'engagement, pas de négo, pas de tickets de support à ouvrir.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-emerald-100 bg-white p-5 [&[open]>summary>svg]:rotate-180"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 list-none">
                  <span className="text-[14.5px] font-bold text-emerald-900">
                    {item.q}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 rotate-90 text-emerald-600 transition-transform" />
                </summary>
                <p className="mt-3 text-[13.5px] leading-relaxed text-neutral-600">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
         FINAL CTA
         ============================================================ */}
      <section className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1100px]">
          <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 p-14 text-center md:p-20">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgb(254,243,199) 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />
            <h2 className="relative font-display text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.05] tracking-tight text-amber-100">
              Récupère 5h de SAV
              <br />
              cette semaine.
            </h2>
            <p className="relative mx-auto mt-4 max-w-[520px] text-[15px] text-amber-100/70">
              14 jours d&apos;essai sans CB. Setup en 8 minutes. Sans engagement.
            </p>
            <div className="relative mt-9">
              <Link
                href={ctaHref}
                className="inline-flex h-13 items-center gap-2 rounded-xl bg-amber-200 px-8 py-3.5 text-[14.5px] font-bold text-emerald-950 hover:bg-amber-100 hover:shadow-[0_20px_40px_-10px_rgba(254,243,199,0.5)]"
              >
                Démarrer mon essai gratuit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
         FOOTER
         ============================================================ */}
      <footer className="bg-emerald-900 px-5 py-20 text-amber-100/80 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1300px]">
          <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-200 text-emerald-900">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="font-display text-[20px] font-extrabold tracking-tight text-amber-50">
                  AutoSAV
                </span>
              </Link>
              <p className="mt-4 max-w-[280px] text-[14px] leading-relaxed text-amber-100/60">
                L&apos;IA SAV pensée pour les e-commerçants français. Drafts en
                français, suivi Colissimo intégré, moitié prix de Gorgias.
              </p>
              <Link
                href={ctaHref}
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-amber-200 px-5 text-[13px] font-bold text-emerald-950 hover:bg-amber-100"
              >
                Essai gratuit 14 jours
              </Link>
            </div>

            <FooterCol
              title="Produit"
              links={[
                { label: "Comment ça marche", href: "#how" },
                { label: "Fonctionnalités", href: "#features" },
                { label: "Tarifs", href: "#pricing" },
                { label: "FAQ", href: "#faq" },
                { label: "Demander une démo", href: ctaHref },
              ]}
            />

            <FooterCol
              title="Compte"
              links={[
                { label: "Connexion", href: "/login" },
                { label: "Inscription", href: "/signup" },
                { label: "Dashboard", href: "/autosav/onboarding" },
              ]}
            />

            <FooterCol
              title="Légal"
              links={[
                { label: "RGPD", href: "#" },
                { label: "Mentions légales", href: "#" },
                { label: "Confidentialité", href: "#" },
                { label: "CGU", href: "#" },
                { label: "Cookies", href: "#" },
              ]}
            />
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-amber-200/10 pt-8 text-[12px] text-amber-100/50 md:flex-row">
            <span>© 2026 AutoSAV — Tous droits réservés · Made in France 🇫🇷</span>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-amber-100">
                Status
              </Link>
              <Link href="#" className="hover:text-amber-100">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ============================================================
   COMPOSANTS
   ============================================================ */

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-[13.5px] font-medium text-neutral-600 transition-colors hover:text-emerald-800"
    >
      {children}
    </Link>
  );
}

function EyebrowBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-200/50">
      {children}
    </div>
  );
}

/**
 * DashboardMockup — visuel principal du hero, montre AutoSAV en action :
 *   - Browser chrome (window dots + URL)
 *   - Sidebar inbox (tickets count par catégorie)
 *   - Panel central : email du client + contexte commande détecté
 *   - Panel droit : draft IA + boutons d'action
 *   - Badges flottants autour pour visual interest
 */
function DashboardMockup() {
  return (
    <div className="relative">
      {/* Glow ambient */}
      <div className="absolute -inset-8 rounded-[50px] bg-gradient-to-br from-amber-200/20 via-emerald-200/20 to-emerald-300/15 blur-3xl" />

      {/* === Main browser card === */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-[0_40px_100px_-20px_rgba(6,95,70,0.3)]">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-neutral-200/70 bg-neutral-50/80 px-5 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white px-3 py-1 text-[11.5px] font-medium text-neutral-500 ring-1 ring-neutral-200/70">
            <Lock className="h-2.5 w-2.5 text-emerald-600" />
            autosav.io/app/inbox
          </div>
        </div>

        {/* Dashboard body — 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_1fr]">
          {/* === Sidebar inbox === */}
          <aside className="hidden border-r border-neutral-200/70 bg-neutral-50/40 p-4 md:block">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-800 text-amber-200">
                <Mail className="h-3 w-3" />
              </div>
              <span className="font-display text-[14px] font-extrabold tracking-tight text-emerald-900">
                AutoSAV
              </span>
            </div>
            <div className="mt-5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Inbox
            </div>
            <nav className="mt-2 space-y-0.5">
              {[
                { label: "À traiter", count: 12, active: true },
                { label: "Drafts IA", count: 8, ai: true },
                { label: "Envoyés", count: 47 },
                { label: "Résolus", count: 124 },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12px] ${
                    item.active
                      ? "bg-emerald-100/60 font-bold text-emerald-900"
                      : "text-neutral-600"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {item.ai && <Sparkles className="h-3 w-3 text-emerald-600" />}
                    {item.label}
                  </span>
                  <span
                    className={`rounded-md px-1.5 text-[10.5px] font-bold ${
                      item.active
                        ? "bg-emerald-800 text-amber-200"
                        : "bg-neutral-200/70 text-neutral-600"
                    }`}
                  >
                    {item.count}
                  </span>
                </div>
              ))}
            </nav>
            <div className="mt-5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Quota
            </div>
            <div className="mt-2 rounded-lg bg-white p-2.5 ring-1 ring-neutral-200/70">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-[14px] font-extrabold text-emerald-900">
                  847
                </span>
                <span className="text-[10px] text-neutral-500">/ 1000</span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full w-[84%] rounded-full bg-emerald-700" />
              </div>
              <div className="mt-1.5 text-[9.5px] text-neutral-500">
                Plan Pro · Reset le 1er
              </div>
            </div>
          </aside>

          {/* === Center : email reçu === */}
          <section className="border-b border-neutral-200/70 p-5 md:border-b-0 md:border-r md:p-7">
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider text-neutral-400">
              <Mail className="h-3 w-3" />
              Email reçu · il y a 2 min
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-[12px] font-bold text-white">
                MD
              </div>
              <div>
                <div className="text-[13.5px] font-bold text-emerald-900">
                  Marie Dupont
                </div>
                <div className="text-[11px] text-neutral-500">
                  marie.dupont@gmail.com
                </div>
              </div>
              <span className="ml-auto rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                Urgent
              </span>
            </div>

            <h3 className="mt-5 text-[14.5px] font-bold text-neutral-900">
              Où est ma commande ?? Je m&apos;impatiente
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed text-neutral-600">
              Bonjour,{"\n"}
              <br />
              <br />
              Cela fait 5 jours que j&apos;ai passé ma commande{" "}
              <strong>#12847</strong> et je n&apos;ai toujours aucun mail de
              tracking ! C&apos;est pour un anniversaire ce week-end, je commence
              vraiment à m&apos;inquiéter.{"\n"}
              <br />
              <br />
              Pouvez-vous me dire où elle en est ?{"\n"}
              <br />
              <br />
              Cordialement, Marie
            </p>

            {/* Context detected */}
            <div className="mt-5 overflow-hidden rounded-xl border border-emerald-200/60 bg-emerald-50/40">
              <div className="flex items-center gap-1.5 border-b border-emerald-100 bg-emerald-100/50 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-emerald-800">
                <Sparkles className="h-3 w-3" />
                Contexte détecté automatiquement
              </div>
              <div className="grid grid-cols-2 gap-3 p-3 text-[11.5px]">
                <div>
                  <div className="text-neutral-500">Commande</div>
                  <div className="mt-0.5 font-bold text-emerald-900">
                    #12847
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500">Statut Colissimo</div>
                  <div className="mt-0.5 flex items-center gap-1 font-bold text-emerald-900">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    En transit
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500">ETA</div>
                  <div className="mt-0.5 font-bold text-emerald-900">
                    Demain entre 10h-13h
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500">Tracking</div>
                  <div className="mt-0.5 font-mono text-[10.5px] font-bold text-emerald-900">
                    8R12345678901
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* === Right : draft IA === */}
          <section className="bg-gradient-to-br from-amber-50/50 via-white to-emerald-50/30 p-5 md:p-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider text-emerald-700">
                <Sparkles className="h-3 w-3" />
                Draft généré
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                <Check className="h-2.5 w-2.5" />
                Prêt à envoyer
              </span>
            </div>

            {/* Tone selector */}
            <div className="mt-4 flex items-center gap-1 rounded-lg border border-neutral-200/70 bg-white p-1 text-[11px]">
              <div className="rounded-md bg-emerald-800 px-2 py-1 font-bold text-amber-200">
                Amical
              </div>
              <div className="px-2 py-1 text-neutral-500">Pro</div>
              <div className="px-2 py-1 text-neutral-500">Décontracté</div>
              <div className="ml-auto px-2 py-1 text-[10px] text-neutral-400">
                Claude Sonnet
              </div>
            </div>

            {/* Draft content */}
            <div className="mt-3 rounded-2xl border border-neutral-200/70 bg-white p-4 text-[12.5px] leading-relaxed text-neutral-800">
              <p>Bonjour Marie,</p>
              <p className="mt-2.5">
                Merci pour votre message, et désolés pour l&apos;inquiétude
                concernant cet anniversaire ! 🎂
              </p>
              <p className="mt-2.5">
                Bonne nouvelle : votre commande{" "}
                <mark className="rounded bg-amber-200/70 px-0.5">#12847</mark>{" "}
                est bien partie. Le suivi Colissimo indique qu&apos;elle est{" "}
                <mark className="rounded bg-amber-200/70 px-0.5">
                  en transit
                </mark>{" "}
                et sera livrée{" "}
                <mark className="rounded bg-amber-200/70 px-0.5">
                  demain entre 10h et 13h
                </mark>
                .
              </p>
              <p className="mt-2.5">
                Voici votre numéro de suivi :{" "}
                <mark className="rounded bg-amber-200/70 px-0.5 font-mono text-[11px]">
                  8R12345678901
                </mark>
              </p>
              <p className="mt-2.5">Belle journée 🌿</p>
              <p className="mt-1 text-neutral-500">L&apos;équipe</p>
            </div>

            {/* Stats + actions */}
            <div className="mt-4 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-3 text-neutral-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  1,2s
                </span>
                <span>·</span>
                <span>187 tokens</span>
                <span>·</span>
                <span className="text-emerald-700">0,003 €</span>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-xl border border-neutral-200/70 bg-white px-3 py-2.5 text-[12.5px] font-bold text-neutral-700">
                Modifier
              </button>
              <button className="inline-flex flex-[2] items-center justify-center gap-2 rounded-xl bg-emerald-800 px-3 py-2.5 text-[12.5px] font-bold text-white shadow-[0_4px_14px_-2px_rgba(6,95,70,0.4)]">
                <Send className="h-3.5 w-3.5" />
                Envoyer la réponse
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* === Floating badges (decorative) === */}
      <div className="absolute -left-2 top-8 hidden -rotate-3 rounded-2xl border border-emerald-100 bg-white px-3 py-2 shadow-[0_15px_30px_-10px_rgba(6,95,70,0.2)] lg:block">
        <div className="text-[9.5px] font-bold uppercase tracking-wider text-neutral-400">
          Économisé cette semaine
        </div>
        <div className="mt-0.5 font-display text-[20px] font-extrabold leading-none text-emerald-900">
          5h 23min
        </div>
      </div>
      <div className="absolute -right-2 top-32 hidden rotate-3 rounded-2xl border border-emerald-100 bg-white px-3 py-2 shadow-[0_15px_30px_-10px_rgba(6,95,70,0.2)] lg:block">
        <div className="text-[9.5px] font-bold uppercase tracking-wider text-neutral-400">
          CSAT ce mois-ci
        </div>
        <div className="mt-0.5 flex items-center gap-1 font-display text-[20px] font-extrabold leading-none text-emerald-900">
          4,8
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        </div>
      </div>
      <div className="absolute -bottom-3 left-1/2 hidden -translate-x-1/2 rounded-full bg-amber-200 px-4 py-1.5 text-[11px] font-bold text-emerald-950 shadow-[0_10px_25px_-5px_rgba(254,243,199,0.5)] md:block">
        ✨ 187 tickets traités cette semaine
      </div>
    </div>
  );
}

function LogoMarquee() {
  const brands = [
    "Cabaïa",
    "Hopaal",
    "Le Slip Français",
    "Jimini's",
    "Make My Lemonade",
    "Maison Standards",
    "Asphalte",
    "Sézane",
    "Polène",
    "Bobbies",
    "Charles & Marie",
    "April Nine",
  ];
  return (
    <div className="relative overflow-hidden">
      <div className="flex animate-[marquee_25s_linear_infinite] gap-12 whitespace-nowrap">
        {[...brands, ...brands].map((b, i) => (
          <div
            key={i}
            className="flex shrink-0 items-center font-display text-[18px] font-extrabold tracking-tight text-emerald-900/40"
          >
            {b}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-neutral-50/40 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-neutral-50/40 to-transparent" />
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

function IntegrationsMarquee() {
  const tools = [
    "Shopify",
    "WooCommerce",
    "PrestaShop",
    "Magento",
    "Gmail",
    "Outlook",
    "IONOS",
    "Zendesk",
    "Front",
    "Colissimo",
    "Chronopost",
    "Mondial Relay",
    "DHL",
    "UPS",
    "Stripe",
    "PayPal",
  ];
  return (
    <div className="relative overflow-hidden py-2">
      <div className="flex animate-[marquee_30s_linear_infinite] gap-10 whitespace-nowrap">
        {[...tools, ...tools].map((t, i) => (
          <div
            key={i}
            className="flex shrink-0 items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-5 py-3 text-[13.5px] font-bold text-emerald-900 shadow-[0_2px_8px_-2px_rgba(6,95,70,0.06)]"
          >
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            {t}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h4 className="text-[13px] font-bold uppercase tracking-wider text-amber-50">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-[13.5px] text-amber-100/60 transition-colors hover:text-amber-100"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
