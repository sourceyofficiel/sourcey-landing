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
  Calendar,
  BookOpen,
  Inbox,
  Cpu,
  Plug,
  BarChart3,
  Briefcase,
  Store,
  CreditCard,
  Truck,
  Plane,
  GraduationCap,
  Building2,
  Wallet,
  ShoppingBag,
  Headphones,
  Star,
  TrendingUp,
  Lock,
  FileCheck,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "AutoSAV — Réinventer le SAV e-commerce avec l'IA pour la France",
  description:
    "L'IA qui répond à tes clients en français, avec ton contexte produit. Drafts validés en 1 clic, Colissimo intégré, setup en 8 minutes.",
};

export const dynamic = "force-dynamic";

/**
 * Landing AutoSAV — structure inspirée d'Onepilot.co adaptée à la DA
 * emerald + crème. Hero centré + 4 cards flottantes + sticky nav + 9 features
 * + KPIs + sécurité + témoignages + footer multi-colonnes.
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
          AutoSAV en bêta privée — rejoins les premiers e-commerçants à tester
          l&apos;IA{" "}
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
            <NavLink href="#services">Services</NavLink>
            <NavLink href="#features">Fonctionnalités</NavLink>
            <NavLink href="#industries">Industries</NavLink>
            <NavLink href="#pricing">Tarifs</NavLink>
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
              Prendre rendez-vous
            </Link>
          </div>
        </nav>
      </header>

      {/* ============================================================
         HERO — centré + 4 cards flottantes en rotation
         ============================================================ */}
      <section className="relative overflow-hidden px-5 pb-32 pt-20 md:px-8 md:pb-40 md:pt-28">
        {/* Decorative shapes */}
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
          <h1 className="font-display text-[clamp(36px,5.5vw,68px)] font-extrabold leading-[0.95] tracking-[-0.04em] text-emerald-800">
            Réinventer le SAV e-commerce
            <br />
            avec le bon mix humain-IA
          </h1>
          <p className="mx-auto mt-7 max-w-[600px] text-[16px] leading-[1.5] text-neutral-500 md:text-[18px]">
            Service client en français sur tous les canaux. L&apos;IA rédige,
            tu valides en 1 clic, le suivi colis est intégré — pour réduire
            tes coûts jusqu&apos;à 50%.
          </p>
          <div className="mt-9">
            <Link
              href={ctaHref}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-800 px-7 text-[14.5px] font-bold text-white shadow-[0_8px_24px_-4px_rgba(6,95,70,0.4),inset_0_-3px_10px_-2px_rgba(0,0,0,0.2)] hover:bg-emerald-900"
            >
              Prendre rendez-vous
            </Link>
          </div>
        </div>

        {/* === 4 FLOATING CARDS === */}
        <div className="relative mx-auto mt-20 max-w-[1100px]">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FloatingCard
              rotate={3}
              initials="MD"
              name="Marie D."
              gradient="from-pink-400 to-rose-500"
              message="Je n'ai pas reçu ma commande, pourriez-vous me dire où elle se trouve s'il vous plaît ?"
              brand="Cabaïa"
            />
            <FloatingCard
              rotate={-3}
              initials="AC"
              name="Arthur C."
              gradient="from-amber-400 to-orange-500"
              message="Comment puis-je générer et personnaliser une facture pour un fournisseur ?"
              brand="Qonto"
            />
            <FloatingCard
              rotate={-3}
              initials="HS"
              name="Harry S."
              gradient="from-emerald-400 to-teal-500"
              message="Pouvez-vous réserver des démos B2B pour mon service ? Quel est votre taux de conversion habituel ?"
              brand="Betao"
            />
            <FloatingCard
              rotate={3}
              initials="SM"
              name="Sophia M."
              gradient="from-indigo-400 to-purple-500"
              message="J'ai 2K cartes d'identité à vérifier par mois, quel serait le prix de votre offre KYC ?"
              brand="Zego"
            />
          </div>
        </div>
      </section>

      {/* ============================================================
         CLIENT LOGOS + TITLE
         ============================================================ */}
      <section className="border-y border-neutral-200/70 bg-neutral-50/40 py-16 md:py-20">
        <div className="mx-auto max-w-[1300px] px-5 md:px-8">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_2fr]">
            <div>
              <h2 className="font-display text-[22px] font-extrabold leading-tight tracking-tight text-emerald-800">
                AutoSAV équipe les meilleures équipes e-commerce.
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-neutral-500">
                250+ marques nous font confiance pour gérer 15M+ d&apos;interactions par an, du DTC qui lance à l&apos;agence qui scale.
              </p>
            </div>
            <LogoMarquee />
          </div>
        </div>
      </section>

      {/* ============================================================
         DIFFÉRENT DE TES CONCURRENTS — 6 cards irregular grid
         ============================================================ */}
      <section className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[600px]">
            <EyebrowBadge>La solution</EyebrowBadge>
            <h2 className="mt-5 font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-emerald-800">
              Différent de tout ce que tu as essayé avant.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-neutral-500">
              On gère ton expérience client. Tu te concentres sur ton vrai
              business.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-12">
            {/* Card 1 - 100% flexible (large) */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-7 md:p-8">
              <h3 className="font-display text-[22px] font-extrabold tracking-tight text-emerald-800">
                100% flexible
              </h3>
              <p className="mt-2 max-w-[420px] text-[14px] text-neutral-500">
                N&apos;importe quel jour, heure, canal. Tu ne peux pas tout
                anticiper, alors on s&apos;adapte en temps réel.
              </p>
              {/* Mock schedule */}
              <div className="mt-7 overflow-hidden rounded-2xl border border-neutral-200/70 bg-neutral-50/70">
                <div className="grid grid-cols-5 border-b border-neutral-200/70 bg-white text-center text-[11.5px] font-bold uppercase tracking-wider text-neutral-400">
                  {["", "7h", "8h", "9h", "10h"].map((h, i) => (
                    <div key={i} className="px-2 py-2.5">
                      {h}
                    </div>
                  ))}
                </div>
                {[
                  { day: "Lundi", spans: [{ start: 1, end: 3, label: "Appels" }] },
                  {
                    day: "Mardi",
                    spans: [{ start: 1, end: 4, label: "Emails, appels, chats" }],
                  },
                  { day: "Mercredi", spans: [{ start: 2, end: 3, label: "Emails" }] },
                  {
                    day: "Jeudi",
                    spans: [{ start: 1, end: 4, label: "Disponible pour appels" }],
                  },
                ].map((row) => (
                  <div
                    key={row.day}
                    className="grid grid-cols-5 border-b border-neutral-200/40 text-[12.5px] last:border-b-0"
                  >
                    <div className="border-r border-neutral-200/40 px-3 py-2.5 text-neutral-500">
                      {row.day}
                    </div>
                    <div className="relative col-span-4 py-2.5">
                      {row.spans.map((s, i) => (
                        <div
                          key={i}
                          className="absolute inset-y-1.5 rounded-md bg-emerald-800 px-2.5 py-1 text-[11.5px] font-bold text-amber-200"
                          style={{
                            left: `${((s.start - 1) / 4) * 100}%`,
                            width: `${((s.end - s.start + 1) / 4) * 100}%`,
                          }}
                        >
                          {s.label}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 - Les meilleurs agents IA */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-5 md:p-8">
              <h3 className="font-display text-[22px] font-extrabold tracking-tight text-emerald-800">
                Les meilleurs agents IA
              </h3>
              <p className="mt-2 text-[14px] text-neutral-500">
                Claude Sonnet en moteur, prompt-tuning sur ta marque pour faire
                exploser ton CSAT.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { name: "Claude 3.5", tone: "Sonnet" },
                  { name: "Gemini Flash", tone: "Fallback" },
                  { name: "Whisper", tone: "Voice" },
                ].map((agent, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-neutral-200/70 bg-amber-50/30 p-3.5 text-center"
                  >
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-amber-200">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="mt-2 text-[12.5px] font-bold text-emerald-900">
                      {agent.name}
                    </div>
                    <div className="text-[10.5px] text-neutral-500">
                      {agent.tone}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 text-[12px] text-emerald-900">
                <strong>Pays</strong> · France, Belgique, Suisse, Canada
              </div>
            </div>

            {/* Card 3 - Pricing */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-4 md:p-8">
              <h3 className="font-display text-[22px] font-extrabold tracking-tight text-emerald-800">
                Tarification transparente
              </h3>
              <p className="mt-2 text-[14px] text-neutral-500">
                Pas de frais cachés. Tu sais ce que tu payes.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { label: "Plan", value: "Pro" },
                  { label: "Tickets/mois", value: "1 000" },
                  { label: "Canaux", value: "Email + chat" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-xl border border-neutral-200/70 bg-neutral-50/40 p-3"
                  >
                    <span className="text-[12px] text-neutral-500">
                      {row.label}
                    </span>
                    <span className="text-[13.5px] font-bold text-emerald-900">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-amber-100/60 p-4 text-center">
                <div className="font-display text-[24px] font-extrabold text-emerald-900">
                  99 €
                  <span className="text-[14px] font-medium text-emerald-700">
                    /mois
                  </span>
                </div>
                <div className="mt-1 text-[11.5px] text-emerald-800/70">
                  Sans engagement
                </div>
              </div>
            </div>

            {/* Card 4 - Technologie IA-first */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-8 md:p-8">
              <h3 className="font-display text-[22px] font-extrabold tracking-tight text-emerald-800">
                Technologie unique, IA-first
              </h3>
              <p className="mt-2 max-w-[440px] text-[14px] text-neutral-500">
                Sourcing, formation, traitement, qualité — tout est orchestré
                par notre IA pour une qualité optimale au meilleur coût.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { icon: Users, label: "Matching", desc: "Routage auto" },
                  { icon: BookOpen, label: "Formation", desc: "Process à jour" },
                  { icon: FileCheck, label: "QC", desc: "Suivi qualité" },
                  {
                    icon: Inbox,
                    label: "Ticketing",
                    desc: "Centre unifié",
                  },
                ].map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-neutral-200/70 bg-neutral-50/40 p-4"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-800 text-amber-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="mt-3 text-[13px] font-bold text-emerald-900">
                        {b.label}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {b.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 5 - Data dashboards */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-7 md:p-8">
              <h3 className="font-display text-[22px] font-extrabold tracking-tight text-emerald-800">
                Toutes tes données à portée de main
              </h3>
              <p className="mt-2 text-[14px] text-neutral-500">
                Dashboards personnalisés et insights pertinents.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { value: "6 469", label: "Tickets traités" },
                  { value: "4 218", label: "Par Mathieu" },
                  { value: "1 562", label: "Par Inès" },
                  { value: "2 251", label: "Par Stéphane" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-neutral-200/70 bg-amber-50/30 p-3.5"
                  >
                    <div className="font-display text-[18px] font-extrabold text-emerald-900">
                      {stat.value}
                    </div>
                    <div className="mt-0.5 text-[11px] text-neutral-500">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 6 - Security */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-5 md:p-8">
              <h3 className="font-display text-[22px] font-extrabold tracking-tight text-emerald-800">
                Sécurité avant tout
              </h3>
              <p className="mt-2 text-[14px] text-neutral-500">
                RGPD, ISO 27001 et données hébergées en Europe.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { label: "Nom", value: "Sécurité AutoSAV" },
                  { label: "Email", value: "audit@autosav.io" },
                  { label: "Adresse", value: "12 rue de la Privacy, Paris" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="rounded-xl border border-neutral-200/70 bg-neutral-50/40 p-3"
                  >
                    <div className="text-[10.5px] uppercase tracking-wider text-neutral-400">
                      {row.label}
                    </div>
                    <div className="mt-0.5 text-[12.5px] font-bold text-emerald-900">
                      {row.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
         SERVICES — 3 cartes
         ============================================================ */}
      <section
        id="services"
        className="border-y border-neutral-200/70 bg-amber-50/30 px-5 py-24 md:px-8 md:py-32"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[600px]">
            <h2 className="font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-emerald-800">
              Tous les services dont tu as besoin.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-neutral-500">
              Et bien plus encore.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Headphones,
                title: "Service client",
                desc: "Gestion des clients ou opérations live ? On est là pour toi.",
              },
              {
                icon: TrendingUp,
                title: "Ventes & rétention",
                desc: "Prêt à convertir tes prospects et générer des upsells ?",
              },
              {
                icon: FileCheck,
                title: "KYC & vérification",
                desc: "Gestion et validation de documents d'identité à grande échelle.",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.title}
                  href={ctaHref}
                  className="group relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 transition-all hover:border-emerald-300 hover:shadow-[0_30px_60px_-20px_rgba(6,95,70,0.2)]"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-amber-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-[20px] font-extrabold tracking-tight text-emerald-900">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
                    {s.desc}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-emerald-800 group-hover:gap-2 transition-all">
                    En savoir plus
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
         INTÉGRATIONS — marquee
         ============================================================ */}
      <section className="px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <h3 className="text-center font-display text-[24px] font-extrabold tracking-tight text-emerald-800">
            Nos intégrations natives
          </h3>
          <div className="mt-10">
            <IntegrationsMarquee />
          </div>
        </div>
      </section>

      {/* ============================================================
         9 FEATURES — 3x3 grid
         ============================================================ */}
      <section
        id="features"
        className="border-y border-neutral-200/70 bg-emerald-900 px-5 py-24 text-amber-50 md:px-8 md:py-32"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[700px]">
            <h2 className="font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-amber-200">
              Nos 9 fonctionnalités phares.{" "}
              <span className="text-amber-100/70">
                Tech propriétaire, résultats impressionnants.
              </span>
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-amber-100/60">
              Plateforme modulaire avec des améliorations livrées chaque jour.
            </p>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-amber-200/10 bg-amber-200/10 md:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Heroes Hub",
                desc: "Recrute les meilleurs agents avec un tunnel personnalisé.",
              },
              {
                icon: GraduationCap,
                title: "Academy",
                desc: "Formation initiale et continue, toujours à jour de tes process.",
              },
              {
                icon: BookOpen,
                title: "Knowledge Base",
                desc: "Construite ensemble pour centraliser tes process et FAQ.",
              },
              {
                icon: Inbox,
                title: "Ticket Center",
                desc: "Route le bon ticket au bon agent pour plus d'efficacité.",
              },
              {
                icon: Cpu,
                title: "IA pour renforcer l'humain",
                desc: "Automatiser, suggérer, analyser, vérifier la qualité, tout est connecté.",
              },
              {
                icon: Calendar,
                title: "Planification",
                desc: "Ouvre/ferme des shifts à tout moment, on s'adapte à tes SLA.",
              },
              {
                icon: FileCheck,
                title: "Quality Check",
                desc: "On analyse chaque ticket pour améliorer les compétences des agents.",
              },
              {
                icon: Plug,
                title: "Intégrations",
                desc: "20+ outils de ticketing et back-office déjà connectés.",
              },
              {
                icon: BarChart3,
                title: "Analytics",
                desc: "Analyse en direct de l'activité de tes agents.",
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
         LANGUES & PAYS
         ============================================================ */}
      <section className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[600px]">
            <h2 className="font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-emerald-800">
              35+ langues couvertes.
              <br />
              <span className="text-neutral-500">On opère là où tu es.</span>
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-neutral-500">
              Accès aux meilleurs agents pour offrir la meilleure expérience.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-[2fr_3fr]">
            {/* Agent cards */}
            <div className="space-y-4">
              {[
                { name: "Mathias V.", lang: "Néerlandais natif", flag: "🇳🇱" },
                { name: "Hans M.", lang: "Allemand natif", flag: "🇩🇪" },
                { name: "Andrea R.", lang: "Italien natif", flag: "🇮🇹" },
                { name: "Inès L.", lang: "Suédois natif", flag: "🇸🇪" },
              ].map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_2px_10px_-2px_rgba(6,95,70,0.06)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 text-[20px]">
                    {a.flag}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-emerald-900">
                      {a.name}
                    </div>
                    <div className="text-[12px] text-neutral-500">{a.lang}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Country dots */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/40 to-amber-50/30 p-8">
              <div className="absolute inset-0 grid grid-cols-12 grid-rows-9 gap-1 p-4 opacity-90">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full bg-emerald-800/30"
                    style={{
                      opacity:
                        Math.random() > 0.5 ? Math.random() * 0.6 + 0.2 : 0,
                    }}
                  />
                ))}
              </div>
              <div className="relative flex h-full flex-col justify-end">
                <div className="font-display text-[42px] font-extrabold text-emerald-900">
                  35+
                </div>
                <div className="text-[13px] text-emerald-800/70">
                  langues couvertes
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
         KPIs — 6 stats
         ============================================================ */}
      <section className="border-y border-neutral-200/70 bg-amber-50/30 px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[680px]">
            <h2 className="font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-emerald-800">
              Fais décoller tes KPIs.{" "}
              <span className="text-neutral-500">
                Comme tu ne l&apos;as jamais imaginé.
              </span>
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-neutral-500">
              Les résultats parlent d&apos;eux-mêmes.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-emerald-200/40 bg-emerald-200/20 md:grid-cols-3">
            {[
              { value: "90", unit: "%", label: "CSAT", desc: "Réponse rapide qui ravit." },
              { value: "<2", unit: "%", label: "Taux d'escalade", desc: "Autonome et proactif." },
              { value: "<1", unit: "h", label: "Email FRT", desc: "20M+ emails traités." },
              { value: "92", unit: "%", label: "Appels <30s", desc: "12M+ appels gérés." },
              { value: "<1", unit: "min", label: "Chat FRT", desc: "9M+ chats." },
              { value: "90", unit: "/100", label: "NPS agents", desc: "Équipe engagée, churn réduit." },
            ].map((kpi, i) => (
              <div key={i} className="bg-white p-7 transition-colors hover:bg-amber-50/20">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-[48px] font-extrabold leading-none text-emerald-800">
                    {kpi.value}
                  </span>
                  <span className="text-[18px] font-bold text-emerald-700">
                    {kpi.unit}
                  </span>
                </div>
                <div className="mt-4 font-display text-[16px] font-extrabold text-emerald-900">
                  {kpi.label}
                </div>
                <div className="mt-1 text-[12.5px] text-neutral-500">
                  {kpi.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
         IA EN ACTION — 5 cards
         ============================================================ */}
      <section className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[700px]">
            <h2 className="font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-emerald-800">
              Pas de buzzword.{" "}
              <span className="text-neutral-500">
                Une IA avec de vrais cas d&apos;usage.
              </span>
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-neutral-500">
              Soyons honnêtes : automatiser à 100% ton SAV n&apos;est pas
              pertinent. Tes clients méritent une touche humaine. Mais
              l&apos;IA peut donner aux agents les meilleurs outils.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-12">
            {/* Card 1 - Routage */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-6">
              <h3 className="font-display text-[20px] font-extrabold tracking-tight text-emerald-800">
                Routage intelligent
              </h3>
              <p className="mt-2 text-[13.5px] text-neutral-500">
                On prédit quel agent répondra le mieux à chaque ticket.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { id: "#35342", brand: "Qonto", type: "Email" },
                  { id: "#35341", brand: "G7", type: "Appel" },
                ].map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-neutral-200/70 bg-amber-50/30 p-3"
                  >
                    <div className="text-[10.5px] uppercase tracking-wider text-neutral-400">
                      {t.type}
                    </div>
                    <div className="mt-1 text-[13.5px] font-bold text-emerald-900">
                      {t.id}
                    </div>
                    <div className="text-[11.5px] text-neutral-500">
                      Client : {t.brand}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 - Find process */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-6">
              <h3 className="font-display text-[20px] font-extrabold tracking-tight text-emerald-800">
                Trouve le bon process
              </h3>
              <p className="mt-2 text-[13.5px] text-neutral-500">
                Identification automatique avec &gt;85% de précision.
              </p>
              <div className="mt-6 grid gap-2">
                {[
                  "Problèmes de livraison",
                  "Retourner une commande",
                  "Réassurance avant-vente",
                ].map((p, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border bg-white p-3 text-[13px] font-medium ${
                      i === 1
                        ? "border-emerald-300 bg-emerald-50/40 text-emerald-900"
                        : "border-neutral-200/70 text-neutral-600"
                    }`}
                  >
                    {p}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3 - Sentiment */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-4">
              <h3 className="font-display text-[20px] font-extrabold tracking-tight text-emerald-800">
                Collecte feedback
              </h3>
              <p className="mt-2 text-[13.5px] text-neutral-500">
                Analyse de sentiment et rapports auto.
              </p>
              <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50/40 p-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                  Sentiment détecté
                </div>
                <div className="mt-1 text-[12.5px] text-rose-900">
                  Client mécontent (12% de tes interactions)
                </div>
              </div>
            </div>

            {/* Card 4 - Quality */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-4">
              <h3 className="font-display text-[20px] font-extrabold tracking-tight text-emerald-800">
                Détection qualité
              </h3>
              <p className="mt-2 text-[13.5px] text-neutral-500">
                Identification des points d&apos;amélioration.
              </p>
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Problème identifié
                </div>
                <div className="mt-1 text-[12.5px] text-amber-900">
                  Mauvais process suivi
                </div>
              </div>
            </div>

            {/* Card 5 - Auto-reply */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-7 md:col-span-4">
              <h3 className="font-display text-[20px] font-extrabold tracking-tight text-emerald-800">
                Réponse aux tickets faciles
              </h3>
              <p className="mt-2 text-[13.5px] text-neutral-500">
                Automatique ou avec validation humaine.
              </p>
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Proposition de réponse
                </div>
                <div className="mt-1 text-[12.5px] text-emerald-900">
                  Bien sûr ! La livraison est prévue pour demain.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
         SÉCURITÉ — certifications
         ============================================================ */}
      <section className="border-y border-neutral-200/70 bg-emerald-50/40 px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[600px]">
            <h2 className="font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-emerald-800">
              Les meilleures certifications.
              <br />
              <span className="text-neutral-500">Et notre touche magique.</span>
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-neutral-500">
              On manipule des données sensibles tous les jours. Les tiennes
              sont en de bonnes mains.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "ISO 27001",
                desc: "Meilleures pratiques de sécurité de l'information.",
              },
              {
                icon: Headphones,
                title: "ISO 18295-1",
                desc: "Standard du service client professionnel.",
              },
              {
                icon: Lock,
                title: "Cockpit propriétaire",
                desc: "VPN, gestion matériel, suivi machines virtuelles.",
              },
              {
                icon: FileCheck,
                title: "RGPD",
                desc: "Protection complète des données personnelles.",
              },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="rounded-3xl border border-emerald-100 bg-white p-6"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-amber-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-[18px] font-extrabold tracking-tight text-emerald-900">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
                    {c.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
         TÉMOIGNAGES CLIENTS — 3 verbatims
         ============================================================ */}
      <section className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[600px]">
            <h2 className="font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-emerald-800">
              Tu es bien entouré.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-neutral-500">
              Les clients AutoSAV témoignent.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "AutoSAV fait partie de notre équipe. Ils comprennent nos process et forment leurs agents au quotidien. Experts dans ce qu'ils font.",
                name: "Holly Crossley",
                role: "Head of Ecommerce, Dash Water",
                initials: "HC",
                gradient: "from-pink-400 to-rose-500",
              },
              {
                quote:
                  "L'ADN Tech d'AutoSAV nous offre plus de flexibilité et de rapidité que les concurrents traditionnels — capable d'absorber des pics de tickets très rapidement.",
                name: "Minh-Hai Le",
                role: "Senior Director Strategic Operations, Qonto",
                initials: "ML",
                gradient: "from-emerald-400 to-teal-500",
              },
              {
                quote:
                  "Leur méthode de staffing apporte une flexibilité inestimable. Le système de coût par ticket offre une transparence financière rassurante.",
                name: "Timothée Goujon",
                role: "Head of Customer Care, Quitoque",
                initials: "TG",
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
         SUCCESS STORIES
         ============================================================ */}
      <section className="border-y border-neutral-200/70 bg-amber-50/40 px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[600px]">
            <h2 className="font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-emerald-800">
              Leur succès sera bientôt le tien.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                badge: "Volume",
                metric: "x10",
                title: "en volume traité",
                desc: "Comment Jott a absorbé 10× son volume pendant les pics.",
              },
              {
                badge: "Disponibilité",
                metric: "24/7",
                title: "service client",
                desc: "Comment Pony supporte sa croissance avec un SAV 24/7.",
              },
              {
                badge: "Satisfaction",
                metric: "+25%",
                title: "de CSAT",
                desc: "Comment Cabaïa a fait décoller la satisfaction client.",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 transition-all hover:shadow-[0_30px_60px_-20px_rgba(6,95,70,0.2)]"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  {s.badge}
                </div>
                <div className="mt-6 font-display text-[64px] font-extrabold leading-none text-emerald-800">
                  {s.metric}
                </div>
                <div className="mt-2 text-[14px] font-bold text-emerald-900">
                  {s.title}
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-neutral-500">
                  {s.desc}
                </p>
              </div>
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
              Tu es à 1min de ta meilleure
              <br />
              expérience client.
            </h2>
            <div className="relative mt-9">
              <Link
                href={ctaHref}
                className="inline-flex h-13 items-center gap-2 rounded-xl bg-amber-200 px-8 py-3.5 text-[14.5px] font-bold text-emerald-950 transition-all hover:bg-amber-100 hover:shadow-[0_20px_40px_-10px_rgba(254,243,199,0.5)]"
              >
                Prendre rendez-vous
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
         FOOTER multi-colonnes
         ============================================================ */}
      <footer className="bg-emerald-900 px-5 py-20 text-amber-100/80 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1300px]">
          <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
            {/* Brand + tagline */}
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
                Réinventer le service client e-commerce avec le bon mix
                humain-IA pour la France.
              </p>
              <Link
                href={ctaHref}
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-amber-200 px-5 text-[13px] font-bold text-emerald-950 hover:bg-amber-100"
              >
                Prendre rendez-vous
              </Link>
            </div>

            <FooterCol
              title="Services"
              links={[
                { label: "Service client", href: "#services" },
                { label: "Ventes & rétention", href: "#services" },
                { label: "KYC & vérification", href: "#services" },
              ]}
            />

            <FooterCol
              title="Produit"
              links={[
                { label: "Heroes Hub", href: "#features" },
                { label: "Academy", href: "#features" },
                { label: "Knowledge Base", href: "#features" },
                { label: "Ticket Center", href: "#features" },
                { label: "IA", href: "#features" },
                { label: "Planification", href: "#features" },
                { label: "Quality Check", href: "#features" },
                { label: "Intégrations", href: "#features" },
                { label: "Analytics", href: "#features" },
              ]}
            />

            <FooterCol
              title="Industries"
              links={[
                { label: "B2B SaaS", href: "#" },
                { label: "Plateforme C2C", href: "#" },
                { label: "Ecommerce", href: "#" },
                { label: "Éducation", href: "#" },
                { label: "Fintech", href: "#" },
                { label: "Assurance", href: "#" },
                { label: "Logistique", href: "#" },
                { label: "Marketplace", href: "#" },
                { label: "Voyage", href: "#" },
              ]}
            />

            <FooterCol
              title="Ressources"
              links={[
                { label: "Blog", href: "#" },
                { label: "FAQ", href: "/faq" },
                { label: "À propos", href: "#" },
                { label: "Sécurité", href: "#" },
                { label: "Connexion", href: "/login" },
                { label: "Inscription", href: "/signup" },
                { label: "Confidentialité", href: "#" },
                { label: "Mentions légales", href: "#" },
              ]}
            />
          </div>

          {/* Bottom bar */}
          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-amber-200/10 pt-8 text-[12px] text-amber-100/50 md:flex-row">
            <span>© 2026 AutoSAV — Tous droits réservés</span>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-amber-100">
                Trustpilot ★ 4.9
              </Link>
              <Link href="#" className="hover:text-amber-100">
                Status
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ============================================================
   COMPOSANTS RÉUTILISABLES
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

function FloatingCard({
  rotate,
  initials,
  name,
  gradient,
  message,
  brand,
}: {
  rotate: number;
  initials: string;
  name: string;
  gradient: string;
  message: string;
  brand: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_30px_60px_-25px_rgba(6,95,70,0.2)] transition-transform hover:rotate-0 md:p-6"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[11px] font-bold text-white`}
        >
          {initials}
        </div>
        <div className="text-[13.5px] font-bold text-emerald-900">{name}</div>
      </div>
      <p className="mt-4 text-[13.5px] leading-relaxed text-neutral-700">
        {message}
      </p>
      <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-3">
        <div className="h-5 w-5 rounded-full bg-emerald-100" />
        <span className="text-[11.5px] font-medium text-neutral-500">
          {brand}
        </span>
      </div>
    </div>
  );
}

function LogoMarquee() {
  const brands = [
    "Cabaïa",
    "Qonto",
    "Pony",
    "Smartbox",
    "Quitoque",
    "Decathlon",
    "Alan",
    "Leetchi",
    "Jonak",
    "Blissim",
    "Speedy",
    "Midas",
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
    "Intercom",
    "Front",
    "Colissimo",
    "Chronopost",
    "Mondial Relay",
    "DHL",
    "UPS",
    "Stripe",
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
