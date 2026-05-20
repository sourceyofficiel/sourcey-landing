"use client";

import Image from "next/image";
import { motion } from "motion/react";
import {
  Users,
  Sparkles,
  Video,
  Truck,
  Check,
  Upload,
  Play,
  Package,
  MapPin,
} from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/Container";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { fadeUp, viewportOnce } from "@/lib/motion";

const TABS = [
  { value: "agents", label: "Réseau d'agents", icon: Users },
  { value: "ai", label: "Sourcing IA", icon: Sparkles },
  { value: "qc", label: "QC vidéo", icon: Video },
  { value: "logistics", label: "Logistique", icon: Truck },
];

export function FeaturesTabs() {
  return (
    <Section id="features" className="bg-white">
      <Container>
        <SectionHeading
          eyebrow="Fonctionnalités"
          title={
            <>
              Tout ce qu'il faut pour{" "}
              <span className="text-primary-600">scaler ton e-com</span>
            </>
          }
          description="Quatre piliers conçus pour t'enlever toute la charge mentale du sourcing."
        />

        <Tabs defaultValue="agents" className="mt-12">
          <div className="flex justify-center overflow-x-auto pb-2">
            <TabsList>
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="gap-2 px-5"
                >
                  <t.icon className="h-4 w-4" />
                  <span>{t.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="agents">
            <FeaturePanel
              title="14 agents francophones, vérifiés en personne"
              description="Chacun est basé dans une ville-clé en Chine (Yiwu, Guangzhou, Shenzhen…) et spécialisé sur ses catégories. Aucun marketplace anonyme — que des humains que tu peux nommer."
              bullets={[
                "Tous parlent français + chinois (et souvent anglais)",
                "Vérifiés sur place par notre équipe à Shanghai",
                "Note publique transparente après chaque mission",
              ]}
              visual={<AgentsMap />}
            />
          </TabsContent>

          <TabsContent value="ai">
            <FeaturePanel
              title="Trouve un produit par photo en 5 secondes"
              description="Upload une image, notre IA Vision identifie le produit, estime le prix usine, et te suggère l'agent le plus pertinent. Tu valides en un clic."
              bullets={[
                "Reconnaissance produit + catégorie auto",
                "Estimation prix usine en temps réel",
                "Matching agent par spécialité + historique",
              ]}
              visual={<AiSourcingVisual />}
            />
          </TabsContent>

          <TabsContent value="qc">
            <FeaturePanel
              title="Vidéo QC HD avant chaque expédition"
              description="Ton agent filme l'ouverture des cartons, vérifie un échantillon aléatoire, teste les produits. Tu valides depuis ton dashboard ou tu demandes des corrections."
              bullets={[
                "Vidéo HD livrée sous 24h après production",
                "Validation 1-clic ou demande de rework",
                "Archivage automatique dans ton historique",
              ]}
              visual={<QcVideoVisual />}
            />
          </TabsContent>

          <TabsContent value="logistics">
            <FeaturePanel
              title="Tracking temps réel + intégrations e-com"
              description="Du port de Shanghai jusqu'à ta porte (ou celle de ton client), suis chaque étape. Push direct vers Shopify, WooCommerce, ou ton propre back-office."
              bullets={[
                "Tracking unifié multi-transporteurs",
                "Push produits + variantes vers ton store",
                "Synchronisation stock automatique",
              ]}
              visual={<LogisticsVisual />}
            />
          </TabsContent>
        </Tabs>
      </Container>
    </Section>
  );
}

function FeaturePanel({
  title,
  description,
  bullets,
  visual,
}: {
  title: string;
  description: string;
  bullets: string[];
  visual: React.ReactNode;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="grid gap-10 lg:grid-cols-2 lg:items-center"
    >
      <div>
        <h3 className="font-display text-3xl font-extrabold leading-tight text-neutral-900 md:text-4xl">
          {title}
        </h3>
        <p className="mt-4 text-lg text-neutral-600">{description}</p>
        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-100">
                <Check className="h-3.5 w-3.5 text-primary-700" strokeWidth={3} />
              </span>
              <span className="text-[15px] text-neutral-700">{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="order-first lg:order-last">{visual}</div>
    </motion.div>
  );
}

function AgentsMap() {
  const pins = [
    { city: "Yiwu", top: "32%", left: "62%" },
    { city: "Shanghai", top: "42%", left: "78%" },
    { city: "Guangzhou", top: "68%", left: "55%" },
    { city: "Shenzhen", top: "75%", left: "62%" },
  ];
  return (
    <div className="relative aspect-[5/4] overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-primary-50 to-white p-6 shadow-sm">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative h-full w-full">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">
          Chine · 4 hubs principaux
        </p>
        {pins.map((p, i) => (
          <motion.div
            key={p.city}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportOnce}
            transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
            style={{ top: p.top, left: p.left }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative">
              <span className="absolute inset-0 -m-2 animate-pulse-soft rounded-full bg-primary-400/40" />
              <span className="relative grid h-6 w-6 place-items-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30">
                <MapPin className="h-3 w-3" />
              </span>
            </div>
            <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-neutral-700 shadow-sm">
              {p.city}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AiSourcingVisual() {
  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        <Upload className="h-3.5 w-3.5" />
        Sourcing par image
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_1.2fr] items-center gap-4">
        <div className="aspect-square overflow-hidden rounded-2xl bg-neutral-100">
          <Image
            src="https://images.unsplash.com/photo-1602874801006-94d8d3c97f8a?w=400&q=80"
            alt="Bougie"
            width={300}
            height={300}
            className="h-full w-full object-cover"
          />
        </div>
        <Sparkles className="h-5 w-5 text-primary-500" />
        <div className="space-y-2">
          <div className="rounded-xl bg-primary-50 p-3">
            <p className="text-[11px] font-semibold uppercase text-primary-600">
              Catégorie
            </p>
            <p className="text-sm font-bold text-neutral-900">
              Bougies & parfums d'intérieur
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3">
            <p className="text-[11px] font-semibold uppercase text-emerald-600">
              Prix usine
            </p>
            <p className="text-sm font-bold text-neutral-900">2.40 € – 3.10 €</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-[11px] font-semibold uppercase text-amber-600">
              Agent
            </p>
            <p className="text-sm font-bold text-neutral-900">
              Chen Mei · Guangzhou
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QcVideoVisual() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-900 shadow-lg">
      <div className="relative aspect-video">
        <Image
          src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80"
          alt="QC video"
          fill
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 grid place-items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-neutral-900 shadow-2xl backdrop-blur"
          >
            <Play className="h-6 w-6 translate-x-0.5 fill-current" />
          </motion.button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
            QC vidéo · 1.4 Mo
          </p>
          <p className="mt-1 text-sm font-bold text-white">
            Bougie parfumée · Lot 500 unités · Vérifié OK
          </p>
        </div>
      </div>
    </div>
  );
}

function LogisticsVisual() {
  const STEPS = [
    { label: "Production", done: true, day: "J+0" },
    { label: "QC vidéo", done: true, day: "J+7" },
    { label: "Expédition", done: true, day: "J+8" },
    { label: "Livraison", done: false, day: "J+15" },
  ];
  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-primary-600" />
          <p className="text-sm font-semibold text-neutral-900">
            Commande #SR-1248
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
          En transit
        </span>
      </div>
      <div className="mt-6 space-y-3">
        {STEPS.map((s, i) => (
          <div
            key={s.label}
            className={`flex items-center gap-3 rounded-2xl border p-3 ${
              s.done
                ? "border-primary-200 bg-primary-50/30"
                : "border-neutral-200 bg-neutral-50/50"
            }`}
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-full ${
                s.done ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-500"
              } font-mono text-xs font-bold`}
            >
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-900">{s.label}</p>
              <p className="text-xs text-neutral-500">{s.day}</p>
            </div>
            {s.done && <Check className="h-4 w-4 text-primary-600" strokeWidth={3} />}
          </div>
        ))}
      </div>
    </div>
  );
}
