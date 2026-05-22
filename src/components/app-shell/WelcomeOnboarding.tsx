"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Plus,
  MessagesSquare,
  PackageSearch,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * WelcomeOnboarding — page d'accueil affichée juste après le sign-up.
 *
 * Présente Sourcey à l'utilisateur :
 *   - où sont les choses dans l'app
 *   - comment soumettre un brief
 *   - comment être notifié et joindre l'équipe
 *
 * Animations en cascade (motion/react) — chaque card apparaît avec un léger
 * stagger pour donner l'impression d'un parcours guidé sans nécessiter
 * de "clic suivant".
 */

type Step = {
  n: string;
  icon: LucideIcon;
  title: string;
  description: string;
  cta?: { label: string; href: string };
  accent: "primary" | "amber" | "green" | "violet";
};

const STEPS: Step[] = [
  {
    n: "01",
    icon: LayoutDashboard,
    title: "Ton tableau de bord",
    description:
      "Vue d'ensemble de tes briefs en cours, statistiques de tes commandes, raccourcis. C'est ta page d'accueil — tu y reviens à chaque connexion.",
    accent: "primary",
  },
  {
    n: "02",
    icon: Plus,
    title: "Soumets ton premier brief",
    description:
      "Décris ce que tu veux vendre : type de produit, MOQ, budget, délais. Un formulaire en 2 minutes. C'est le point de départ de toute mission Sourcey.",
    cta: { label: "Créer mon premier brief", href: "/app/new" },
    accent: "amber",
  },
  {
    n: "03",
    icon: PackageSearch,
    title: "Suis tes commandes en temps réel",
    description:
      "Une fois ton brief soumis, suis chaque étape : sourcing, négociation, devis, production, inspection, expédition, livraison. Notifications dans l'app + sur WhatsApp.",
    accent: "violet",
  },
  {
    n: "04",
    icon: MessagesSquare,
    title: "Contacte l'équipe",
    description:
      "Ta messagerie centralise toutes les conversations Support. Pour les échanges rapides, on te contacte directement sur WhatsApp avec le numéro renseigné dans ton profil.",
    cta: { label: "Voir ma messagerie", href: "/app/inbox" },
    accent: "green",
  },
];

const ACCENT_STYLES = {
  primary: {
    bg: "bg-primary-50",
    text: "text-primary-700",
    ring: "ring-primary-100",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-700",
    ring: "ring-green-200",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-200",
  },
};

export function WelcomeOnboarding({ firstName }: { firstName: string }) {
  return (
    <div className="mx-auto max-w-[920px] px-4 py-8 md:px-6 md:py-12">
      {/* Hero */}
      <motion.header
        className="text-center"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-primary-700 ring-1 ring-inset ring-primary-100">
          <Sparkles className="h-3 w-3" />
          Bienvenue
        </div>
        <h1 className="mt-4 font-display text-[clamp(28px,4vw,40px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Salut {firstName} 👋
          <br />
          <span className="text-neutral-500">Voici comment ça marche.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-[560px] text-[14px] leading-relaxed text-neutral-500 md:text-[15px]">
          Sourcey gère ton sourcing en Chine de A à Z. On te montre vite fait
          les 4 endroits importants dans l'app, et tu peux te lancer.
        </p>
      </motion.header>

      {/* Steps */}
      <motion.ol
        variants={{
          visible: {
            transition: { staggerChildren: 0.08, delayChildren: 0.2 },
          },
          hidden: {},
        }}
        className="mt-10 grid gap-4 md:grid-cols-2"
      >
        {STEPS.map((step) => {
          const Icon = step.icon;
          const a = ACCENT_STYLES[step.accent];
          return (
            <motion.li
              key={step.n}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(15,23,42,0.12)] md:p-6"
            >
              {/* Step number */}
              <span className="absolute right-5 top-5 font-mono text-[11px] font-semibold text-neutral-300">
                {step.n}
              </span>

              {/* Icon */}
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset ${a.bg} ${a.text} ${a.ring}`}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>

              <h2 className="mt-4 text-[16px] font-bold tracking-tight text-neutral-900 md:text-[17px]">
                {step.title}
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-500 md:text-[14px]">
                {step.description}
              </p>

              {step.cta && (
                <Link
                  href={step.cta.href}
                  className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary-700 hover:text-primary-800"
                >
                  {step.cta.label}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </motion.li>
          );
        })}
      </motion.ol>

      {/* Quick checklist */}
      <motion.section
        className="mt-10 rounded-2xl border border-neutral-200 bg-gradient-to-br from-primary-50/60 via-white to-white p-5 md:p-7"
      >
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-primary-700">
          Bon à savoir
        </h2>
        <ul className="mt-3 grid gap-2.5 md:grid-cols-2 md:gap-x-8">
          <Check>
            On te contacte sur <strong>WhatsApp dans les 24h</strong> après
            ton brief.
          </Check>
          <Check>
            Sourcey reste <strong>l'intermédiaire</strong> — tu n'as pas à
            parler directement avec les usines.
          </Check>
          <Check>
            Notifications importantes dans la <strong>messagerie</strong>
            (devis, mise à jour fournisseur, etc.).
          </Check>
          <Check>
            <strong>Annulable à tout moment</strong>, sans engagement.
          </Check>
        </ul>
      </motion.section>

      {/* Big CTA */}
      <motion.div
        className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
      >
        <Link
          href="/app/new"
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-primary-500 to-primary-700 px-6 py-3.5 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5"
          style={{
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.35)",
              "inset 0 -2px 0 rgba(15,40,100,0.35)",
              "0 14px 30px -8px rgba(37,99,235,0.55)",
              "0 0 0 1px rgba(29,78,216,0.45)",
            ].join(", "),
          }}
        >
          <Plus className="h-4 w-4" />
          Créer mon premier brief
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/app"
          className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-6 py-3.5 text-[14px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Aller au tableau de bord
        </Link>
      </motion.div>

      <p className="mt-6 text-center text-[11.5px] text-neutral-400">
        Cette page reste accessible via{" "}
        <Link
          href="/app/bienvenue"
          className="underline-offset-2 hover:underline"
        >
          /app/bienvenue
        </Link>{" "}
        si tu veux la revoir plus tard.
      </p>
    </div>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-[13.5px] leading-relaxed text-neutral-700">
      <CheckCircle2
        className="mt-0.5 h-4 w-4 shrink-0 text-green-600"
        strokeWidth={2.2}
      />
      <span>{children}</span>
    </li>
  );
}
