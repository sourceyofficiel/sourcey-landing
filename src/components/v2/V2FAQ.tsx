"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * V2FAQ — Accordion 5 questions, traite les objections principales.
 */

const FAQS = [
  {
    q: "Est-ce que mes données et mes commandes sont sécurisées ?",
    a: "Tes données sont stockées en Europe (chiffrement AES-256, RGPD-friendly). Tes paiements transitent par un escrow régulé : on bloque les fonds jusqu'à ce que tu valides la commande après vidéo QC. Si la commande est ratée, tu es remboursé intégralement.",
  },
  {
    q: "Et si la commande arrive ratée ou en retard ?",
    a: "Notre garantie Sourcey Care couvre tout problème de conformité (mauvaise taille, couleur, défaut). Tu signales dans les 7 jours via la messagerie, ton agent escalade au fournisseur, on prend en charge le remplacement ou le remboursement. Le retard de livraison déclenche une compensation automatique.",
  },
  {
    q: "Ça marche pour quel type de produits ?",
    a: "Tous les produits que tu peux fabriquer en Chine : textile, accessoires, électronique grand public, déco maison, beauté/cosméto (avec certifs), goodies, bijouterie. On ne fait pas : pharma, armes, contrefaçons de marques. Si tu hésites, demande à ton agent en 30 secondes.",
  },
  {
    q: "Comment sont choisis les agents francophones ?",
    a: "Chaque agent passe par un processus de vérification : minimum 3 ans d'expérience en sourcing, test de français écrit + oral, vérification de leur réseau fournisseurs, recommandations existantes. On les évalue ensuite chaque mois sur la satisfaction client, les délais, le taux de retour.",
  },
  {
    q: "Puis-je annuler ou changer de plan ?",
    a: "Tu peux annuler à tout moment depuis ton dashboard, sans frais et sans question. Tu peux aussi passer de Starter à Pro et inversement à tout moment — la facturation est prorata-temporis. Plan Business : 30 jours de préavis pour résilier (contrat signé).",
  },
];

export function V2FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative mx-auto max-w-[800px] px-5 py-20 md:px-8 md:py-28"
    >
      <V2SectionLabel>FAQ</V2SectionLabel>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[760px] text-center font-display text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900"
      >
        Questions{" "}
        <span className="italic text-primary-600">fréquentes.</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mx-auto mt-5 max-w-[520px] text-center text-[14.5px] leading-relaxed text-neutral-500"
      >
        Les vraies questions, avec de vraies réponses. Et si tu n'en trouves pas
        la tienne, on est là sur la messagerie.
      </motion.p>

      {/* Accordion */}
      <div className="group relative mt-12 divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {/* Subtle blue glow background — top-left */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 transition-opacity duration-300 group-hover:opacity-80"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, #DBEAFE 0%, transparent 70%)",
            opacity: 0.45,
            mixBlendMode: "multiply",
          }}
        />
        {FAQS.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={faq.q}>
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-neutral-50/60 md:px-6 md:py-6"
                aria-expanded={isOpen}
              >
                <span className="text-[15px] font-semibold text-neutral-900 md:text-[16px]">
                  {faq.q}
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    isOpen
                      ? "rotate-45 border-primary-600 bg-primary-600 text-white"
                      : "border-neutral-200 bg-white text-neutral-700"
                  }`}
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-6 text-[14px] leading-relaxed text-neutral-600 md:px-6">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
