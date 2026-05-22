"use client";

import Image from "next/image";
import { ShieldCheck, Eye, Lock } from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * SourcingTrust — section de réassurance qui utilise l'image handshake
 * pour ancrer la confiance Sourcey ↔ fournisseur ↔ client.
 *
 * Layout split : image à gauche (handshake/échange sample), 3 piliers de
 * confiance à droite. Section sombre (bg-[#0E1535]) pour casser le rythme
 * blanc de la page et mettre l'image en valeur.
 */

const PILLARS = [
  {
    icon: Eye,
    title: "Anonymat total côté usine",
    body: "Le fournisseur négocie avec Sourcey. Il ne sait ni qui tu es ni où tu vends. Pas de copie de ton concept, pas de démarchage direct dans ton dos.",
  },
  {
    icon: ShieldCheck,
    title: "Vérifications physiques",
    body: "Notre équipe terrain visite chaque usine que nous te présentons. Licence d'export, capacité réelle, conditions de production : on contrôle tout sur place.",
  },
  {
    icon: Lock,
    title: "Paiement sécurisé",
    body: "Acompte versé uniquement après validation des échantillons. Solde à l'expédition après inspection. Pas de paiement 100% d'avance sans contrôle.",
  },
];

export function SourcingTrust() {
  return (
    <section className="relative overflow-hidden bg-[#0E1535] text-white">
      {/* Background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute right-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-primary-500/20 blur-[120px]" />
        <div className="absolute left-[5%] bottom-[10%] h-[300px] w-[300px] rounded-full bg-primary-400/15 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* === LEFT : image handshake === */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-4 -z-10 rounded-[40px] bg-gradient-to-br from-primary-500/30 via-primary-600/15 to-transparent blur-3xl"
            />
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 shadow-[0_40px_70px_-20px_rgba(0,0,0,0.5)]">
              <Image
                src="/images/sourcing/trust-handshake.png"
                alt="Échange d'un échantillon entre un fournisseur chinois et un agent Sourcey"
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
              {/* Subtle dark overlay pour faire ressortir le label */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
              />

              {/* Floating label */}
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/95 px-3 py-1.5 text-[11px] font-bold text-neutral-900 shadow-md backdrop-blur-md md:bottom-6 md:left-6">
                <ShieldCheck className="h-3 w-3 text-primary-600" />
                Confiance sur le long terme
              </div>
            </div>
          </div>

          {/* === RIGHT : 3 piliers === */}
          <div>
            <V2SectionLabel>Confiance</V2SectionLabel>
            <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,40px)] font-extrabold leading-[1.08] tracking-tight">
              On bosse pour toi —{" "}
              <span className="text-primary-300">pas pour l&apos;usine.</span>
            </h2>
            <p className="mt-4 max-w-[480px] text-[14.5px] leading-relaxed text-white/70 md:text-[15.5px]">
              Notre seul revenu sur ton compte vient de ton abonnement. Aucune
              commission cachée du fournisseur, aucun intérêt à te pousser vers
              l&apos;option la plus chère.
            </p>

            <ul className="mt-8 space-y-5">
              {PILLARS.map((p) => {
                const Icon = p.icon;
                return (
                  <li key={p.title} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-primary-300 backdrop-blur-md">
                      <Icon className="h-4 w-4" strokeWidth={2.2} />
                    </span>
                    <div>
                      <h3 className="text-[14.5px] font-bold tracking-tight md:text-[15.5px]">
                        {p.title}
                      </h3>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-white/60 md:text-[13.5px]">
                        {p.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
