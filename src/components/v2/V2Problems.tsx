"use client";

import { motion } from "motion/react";
import { SearchX, PackageX, MessagesSquare } from "lucide-react";

/**
 * V2Problems — Section "le visiteur se reconnaît".
 *
 * 3 problèmes ultra-concrets du sourcing en Chine, racontés à hauteur
 * d'utilisateur (solo + DTC). Texte court, ton direct, visual minimaliste.
 * But : déclencher le "putain, c'est exactement ça" avant la pitch produit.
 */

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

export function V2Problems() {
  return (
    <section
      id="problems"
      className="relative mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28"
    >
      {/* Section label */}
      <motion.div
        transition={{ duration: 0.5 }}
        className="mb-4 flex justify-center"
      >
        <span className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-rose-600">
          <span className="h-3 w-px bg-rose-400" />
          Tu te reconnais&nbsp;?
          <span className="h-3 w-px bg-rose-400" />
        </span>
      </motion.div>

      {/* Title */}
      <motion.h2
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[760px] text-center font-display text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900"
      >
        Sourcer en Chine, c'est censé être simple.
        <br className="hidden md:block" />{" "}
        <span className="text-rose-600">La réalité, elle, te bouffe tes nuits.</span>
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mx-auto mt-5 max-w-[600px] text-center text-[15px] leading-relaxed text-neutral-500 md:text-[16.5px]"
      >
        Si tu as déjà passé une commande en Chine, tu sais. Sinon, lis ce qui suit
        — c'est ce qui t'attend.
      </motion.p>

      {/* 3 problem cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6"
      >
        <ProblemCard
          variants={fadeInUp}
          icon={SearchX}
          accent="rose"
          title="10 000 fournisseurs. 0 confiance."
          description="Tu passes des heures sur Alibaba à comparer des fiches qui se ressemblent toutes. Lequel va te ghoster après le paiement&nbsp;? Mystère."
          visual={<AlibabaVisual />}
        />

        <ProblemCard
          variants={fadeInUp}
          icon={PackageX}
          accent="amber"
          title="Photo&nbsp;✨. Reçu&nbsp;😭."
          description="Le sample arrive&nbsp;: pas la bonne couleur, couture qui pète au premier lavage. Et tes 500 unités sont déjà sur le bateau."
          visual={<OrderFailVisual />}
        />

        <ProblemCard
          variants={fadeInUp}
          icon={MessagesSquare}
          accent="sky"
          title="«&nbsp;Yes friend, no problem.&nbsp;»"
          description="Tu négocies en anglais cassé sur WeChat, à 3h du matin. T'as accepté un MOQ de 5000 sans le savoir. Bonne chance pour ré-écouler ça."
          visual={<LanguageVisual />}
        />
      </motion.div>

      {/* Bridge sentence — transition vers la suite */}
      <motion.p
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mx-auto mt-16 max-w-[640px] text-center text-[15px] font-medium text-neutral-600 md:text-[16.5px]"
      >
        On a vécu ça aussi. C'est pour ça que Sourcey existe.{" "}
        <span className="text-primary-600 font-semibold">
          Un agent francophone, un seul interlocuteur, zéro embrouille.
        </span>
      </motion.p>
    </section>
  );
}

/* ============================================================
   PROBLEM CARD WRAPPER
   ============================================================ */

type Accent = "rose" | "amber" | "sky";

const ACCENT_MAP: Record<
  Accent,
  { iconBg: string; iconText: string; ring: string; glow: string }
> = {
  rose: {
    iconBg: "bg-rose-50",
    iconText: "text-rose-600",
    ring: "ring-rose-100",
    glow: "0 24px 60px -30px rgba(225,29,72,0.25)",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    ring: "ring-amber-100",
    glow: "0 24px 60px -30px rgba(217,119,6,0.25)",
  },
  sky: {
    iconBg: "bg-sky-50",
    iconText: "text-sky-600",
    ring: "ring-sky-100",
    glow: "0 24px 60px -30px rgba(2,132,199,0.25)",
  },
};

type ProblemCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  visual: React.ReactNode;
  variants: typeof fadeInUp;
  accent: Accent;
};

function ProblemCard({
  icon: Icon,
  title,
  description,
  visual,
  variants,
  accent,
}: ProblemCardProps) {
  const c = ACCENT_MAP[accent];

  return (
    <motion.article
      variants={variants}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white transition-all duration-300"
      style={
        {
          "--hover-glow": c.glow,
        } as React.CSSProperties
      }
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          (c.glow as string) ?? "";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "";
      }}
    >
      {/* Visual area */}
      <div className="relative h-[200px] overflow-hidden bg-gradient-to-b from-neutral-50/80 to-white">
        {visual}
      </div>

      {/* Text */}
      <div className="flex flex-1 flex-col gap-2.5 p-6 md:p-7">
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ring-4 ${c.iconBg} ${c.iconText} ${c.ring}`}
          >
            <Icon className="h-4 w-4" />
          </span>
          <h3
            className="text-[17px] font-bold tracking-tight text-neutral-900"
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </div>
        <p
          className="text-[14px] leading-relaxed text-neutral-500"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    </motion.article>
  );
}

/* ============================================================
   VISUAL MOCKS
   ============================================================ */

/* === Visual 1 — Galère Alibaba ===
   Grid de fournisseurs identiques anonymes, une loupe qui cherche
   en vain. Tous les badges sont en "?", aucun trustworthy. */
function AlibabaVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background pattern of identical anonymous supplier tiles */}
      <div className="absolute inset-0 grid grid-cols-5 gap-2 p-5 opacity-90">
        {Array.from({ length: 15 }).map((_, i) => {
          const isCenter = i === 7;
          return (
            <div
              key={i}
              className={`relative aspect-square rounded-lg ${
                isCenter
                  ? "bg-white shadow-lg ring-2 ring-rose-400"
                  : "bg-neutral-100"
              }`}
            >
              {/* Faux supplier "logo" — same generic block */}
              <div
                className={`absolute inset-2 rounded-md ${
                  isCenter
                    ? "bg-gradient-to-br from-rose-100 to-rose-50"
                    : "bg-gradient-to-br from-neutral-200 to-neutral-100"
                }`}
              />
              {/* Anonymous "?" mark */}
              <span
                className={`absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold ${
                  isCenter
                    ? "bg-rose-500 text-white"
                    : "bg-white/80 text-neutral-400"
                }`}
              >
                ?
              </span>
            </div>
          );
        })}
      </div>

      {/* Magnifier circle on the highlighted center tile */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-rose-500 bg-white/40 shadow-[0_0_0_4px_rgba(225,29,72,0.1)] backdrop-blur-sm">
          <SearchX className="h-6 w-6 text-rose-500" strokeWidth={2.5} />
        </div>
        {/* Handle */}
        <div className="absolute right-[-12px] top-[44px] h-[3px] w-5 rotate-45 rounded-full bg-rose-500" />
      </div>

      {/* Fade overlay top + bottom for visual focus */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}

/* === Visual 2 — Commandes ratées ===
   Deux "blobs" produits côte à côte, l'attendu en couleur saturée et
   bien rond, le reçu fondu, déformé, fadé. Pas d'UI, juste de la forme. */
function OrderFailVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative flex items-center gap-6">
        {/* EXPECTED — clean glowing blob */}
        <div className="relative flex flex-col items-center gap-2.5">
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-0 -m-4 rounded-full bg-amber-300/40 blur-xl" />
            {/* Blob */}
            <div
              className="relative h-20 w-20 bg-gradient-to-br from-amber-300 via-orange-300 to-rose-300 shadow-xl"
              style={{
                borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%",
              }}
            />
            {/* Sparkle */}
            <span className="absolute -right-1 -top-1 text-base">✨</span>
          </div>
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-neutral-500">
            Attendu
          </span>
        </div>

        {/* Arrow with X */}
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 60 12" className="h-3 w-12 fill-none">
            <path
              d="M2 6 H50 M44 2 L52 6 L44 10"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="2 3"
            />
          </svg>
          <span className="mt-1 text-[10px] font-bold text-rose-500">≠</span>
        </div>

        {/* REALITY — washed out / melted */}
        <div className="relative flex flex-col items-center gap-2.5">
          <div className="relative">
            {/* Melted blob with grayscale */}
            <div
              className="relative h-20 w-20 bg-gradient-to-br from-neutral-300 via-neutral-200 to-stone-200 shadow-md grayscale"
              style={{
                borderRadius: "70% 30% 30% 70% / 60% 40% 60% 40%",
                transform: "rotate(-8deg) scaleY(0.85)",
              }}
            />
            {/* Drip detail */}
            <div
              className="absolute -bottom-2 left-3 h-3 w-2 bg-neutral-300"
              style={{ borderRadius: "50% 50% 50% 50% / 0% 0% 100% 100%" }}
            />
            {/* Sad emoji */}
            <span className="absolute -right-1 -top-1 text-base grayscale">
              😭
            </span>
          </div>
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-neutral-500">
            Reçu
          </span>
        </div>
      </div>
    </div>
  );
}

/* === Visual 3 — Barrière langue ===
   Une bulle de chat unique avec du texte "traduit" en charabia,
   surplombée d'un icon Translate barré. Très minimal. */
function LanguageVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative flex flex-col items-center gap-3">
        {/* Top: language pills with broken connection */}
        <div className="flex items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-base">
            🇫🇷
          </span>
          {/* Broken line */}
          <div className="relative flex h-px w-10 items-center">
            <div className="absolute left-0 h-px w-3.5 bg-sky-300" />
            <div className="absolute right-0 h-px w-3.5 bg-sky-300" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold text-rose-500">
              ✕
            </span>
          </div>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-base">
            🇨🇳
          </span>
        </div>

        {/* Speech bubble with garbled answer */}
        <div className="relative max-w-[200px] rounded-2xl rounded-bl-sm border border-neutral-200 bg-white px-3.5 py-2.5 shadow-md">
          <div className="text-[12px] leading-snug text-neutral-700">
            <span className="font-semibold">Yes friend</span>{" "}
            <span className="font-mono text-neutral-400">好好好</span>{" "}
            <span className="font-semibold">no problem</span>{" "}
            <span className="font-mono text-neutral-400">5000 OK</span> 👍
          </div>
          {/* Bubble tail */}
          <div className="absolute -bottom-1.5 left-3 h-3 w-3 rotate-45 border-b border-r border-neutral-200 bg-white" />
        </div>

        {/* Below: timestamp + "online 14h ago" — small print of doom */}
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
          <span className="flex h-1.5 w-1.5 rounded-full bg-neutral-300" />
          <span>en ligne il y a 14h · 03:47 AM</span>
        </div>
      </div>
    </div>
  );
}
