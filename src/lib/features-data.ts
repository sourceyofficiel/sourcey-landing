/**
 * Source unique des "fonctionnalités" affichées dans :
 *   - le dropdown de la navbar (V2NavFeatures)
 *   - les pages détaillées /features/[slug]
 *   - la home (V2FeaturesGrid si on veut s'en resservir)
 *
 * Garde la même clé (slug) partout pour les liens internes.
 */

import {
  SearchCheck,
  MessageSquare,
  ShieldCheck,
  Plane,
  PackageSearch,
  Handshake,
  type LucideIcon,
} from "lucide-react";

export type FeatureBullet = {
  title: string;
  description: string;
};

export type FeatureStep = {
  n: string;
  title: string;
  description: string;
};

export type FeatureFAQ = {
  q: string;
  a: string;
};

export type Feature = {
  slug: string;
  icon: LucideIcon;
  /** Court — utilisé dans le dropdown */
  title: string;
  /** 1 ligne courte — utilisée dans le dropdown */
  tagline: string;
  /** Titre principal de la page détaillée */
  pageTitle: string;
  /** Sous-titre dans le hero de la page détaillée */
  pageSubtitle: string;
  /** Petit badge en haut du hero ("CONTRÔLE QUALITÉ", "EXPÉDITION"...) */
  eyebrow: string;
  /** Statistique mise en avant ("-35% sur le prix" / "200+ critères" / etc.) */
  stat: { value: string; label: string };
  /** 4-5 bullets très concrets, ce qu'on fait pour toi */
  bullets: FeatureBullet[];
  /** Mini-flow 3 étapes spécifique à cette feature */
  steps: FeatureStep[];
  /** 2-3 questions de réassurance */
  faq: FeatureFAQ[];
};

export const FEATURES: Feature[] = [
  {
    slug: "sourcing",
    icon: SearchCheck,
    title: "Sourcing managé",
    tagline: "On trouve le bon fournisseur en Chine pour toi.",
    eyebrow: "Sourcing fournisseur",
    pageTitle: "On trouve ton fournisseur en Chine.",
    pageSubtitle:
      "Notre équipe parle mandarin, connaît les régions industrielles, et sélectionne pour toi les usines vraiment fiables — pas les revendeurs qui pullulent sur Alibaba.",
    stat: { value: "3-5", label: "options à comparer par brief" },
    bullets: [
      {
        title: "Recherche multi-canaux",
        description:
          "On va chercher sur 1688, Alibaba, Made-in-China, et dans notre carnet d'adresses d'usines visitées sur place lors des salons Canton Fair et Yiwu.",
      },
      {
        title: "Vérification fournisseur",
        description:
          "Licence d'export, ancienneté, certifications (CE, FCC, RoHS), production réelle vs revendeur, capacité mensuelle, références clients — on contrôle tout avant de te le présenter.",
      },
      {
        title: "Échantillons commandés et photographiés",
        description:
          "On commande des samples chez 2-3 candidats, on photographie en studio, on teste, et on te envoie un comparatif détaillé avant que tu décides.",
      },
      {
        title: "Anonymat total côté usine",
        description:
          "Le fournisseur ne sait pas qui tu es ni où tu vends. Il négocie avec Sourcey — ça te protège du démarchage direct et de la copie.",
      },
      {
        title: "On évite les pièges",
        description:
          "Usines fantômes, prix d'appel suivis de hausses, MOQ menteurs, échantillons \"polis\" différents de la prod : on a vu tous les schémas, on te dit non quand il faut.",
      },
    ],
    steps: [
      {
        n: "01",
        title: "Tu décris ton produit",
        description:
          "Type de produit, MOQ visé, budget unitaire, certifications nécessaires, marché cible. 2 minutes via le formulaire de brief.",
      },
      {
        n: "02",
        title: "On lance la recherche",
        description:
          "Notre équipe terrain en Chine consulte ses contacts, lance des appels d'offres, et commence à filtrer les bons candidats.",
      },
      {
        n: "03",
        title: "Tu reçois 3-5 options comparées",
        description:
          "Prix, MOQ, délais, photos d'échantillons, fiche d'usine. Tu choisis sur WhatsApp avec notre équipe.",
      },
    ],
    faq: [
      {
        q: "Combien de temps pour avoir mes options ?",
        a: "Compte 3 à 7 jours selon la complexité. Pour un produit standard (textile, gadget, accessoire) c'est souvent 48-72h. Pour du sur-mesure ou un produit technique, on peut aller jusqu'à 2 semaines.",
      },
      {
        q: "Vous travaillez avec quels secteurs ?",
        a: "Mode et accessoires, beauté, maison/déco, gadgets électroniques grand public, sport, animalerie, papeterie. Pas d'armes, pas de pharma, pas de produits réglementés santé.",
      },
      {
        q: "Et si aucune des options ne me convient ?",
        a: "On relance une vague. C'est inclus dans tous les plans, jusqu'à ce qu'on trouve un match. Tu paies ton abo, pas la recherche.",
      },
    ],
  },
  {
    slug: "negociation",
    icon: MessageSquare,
    title: "Négociation pour toi",
    tagline: "Prix, MOQ, conditions — on négo en mandarin en coulisses.",
    eyebrow: "Négociation",
    pageTitle: "On obtient un prix que tu n'aurais pas seul.",
    pageSubtitle:
      "Notre équipe basée en Asie négocie en mandarin avec tes fournisseurs. Ils savent que tu vas peut-être passer 5 commandes par an. Toi seul, tu serais juste un client de plus.",
    stat: { value: "-20 à -40%", label: "vs le prix initial annoncé" },
    bullets: [
      {
        title: "Négociation du prix unitaire",
        description:
          "Sur le MOQ public affiché, on obtient typiquement entre 20 et 40% de remise. On joue sur le volume, la récurrence promise, et la qualité de la relation entretenue.",
      },
      {
        title: "Réduction du MOQ",
        description:
          "Quand tu débutes et que tu ne peux pas commander 1000 pièces, on négocie souvent un MOQ test à 100-300 unités — parfois moitié moins que l'annoncé.",
      },
      {
        title: "Conditions de paiement adaptées",
        description:
          "30% acompte / 70% à l'expédition pour les petits volumes. Letter of Credit ou paiement après inspection pour les grosses commandes. On évite le 100% d'avance autant que possible.",
      },
      {
        title: "Échantillons gratuits ou remboursés",
        description:
          "Pour la plupart des fournisseurs, on obtient que le coût des samples soit déduit de la première vraie commande — ou tout simplement offert.",
      },
      {
        title: "Garantie écrite sur les défauts",
        description:
          "Clause de re-production gratuite si plus de 3% de pièces défectueuses. Garantie sur les délais. Conditions claires si l'usine se trompe.",
      },
    ],
    steps: [
      {
        n: "01",
        title: "On reçoit ton brief",
        description:
          "Tu nous dis ton budget cible, ton MOQ idéal, et tes contraintes (certifications, packaging, délai). Tu fixes le cadre.",
      },
      {
        n: "02",
        title: "On engage la négo",
        description:
          "Plusieurs allers-retours avec les usines pendant 3-5 jours. On joue plusieurs candidats les uns contre les autres pour faire baisser les prix.",
      },
      {
        n: "03",
        title: "Tu valides un devis final",
        description:
          "Quand on a obtenu le meilleur compromis, on te l'envoie sur WhatsApp avec tous les détails. Tu signes, on commande.",
      },
    ],
    faq: [
      {
        q: "Vous prenez une commission sur la négo ?",
        a: "Non. On se rémunère uniquement avec ton abonnement mensuel. Plus on te fait économiser, plus tu restes — c'est notre vrai modèle.",
      },
      {
        q: "Et si l'usine refuse de négocier ?",
        a: "On passe à la suivante. C'est l'avantage d'avoir 3-5 options en parallèle : on garde le levier de la concurrence.",
      },
      {
        q: "Vous parlez vraiment mandarin ?",
        a: "Oui, l'équipe négo est basée en Chine. C'est une raison majeure pour laquelle on obtient des prix que les Européens n'obtiennent pas, même en anglais.",
      },
    ],
  },
  {
    slug: "controle-qualite",
    icon: ShieldCheck,
    title: "Contrôle qualité",
    tagline: "Inspection avant expédition. Rapport photo détaillé.",
    eyebrow: "Quality control",
    pageTitle: "On inspecte avant que ça parte.",
    pageSubtitle:
      "Avant chaque expédition, un agent terrain inspecte ta production sur place et te remet un rapport photo + vidéo détaillé. Tu valides en connaissance de cause.",
    stat: { value: "200+", label: "critères vérifiés par lot" },
    bullets: [
      {
        title: "Inspection AQL standard",
        description:
          "On contrôle 10% du lot selon la norme AQL 2.5 (industrie textile/gadget). Vérifications dimensionnelles, fonctionnelles, esthétiques, packaging.",
      },
      {
        title: "Tests fonctionnels spécifiques",
        description:
          "Pour les produits électroniques : test branchement, autonomie, fonctions. Pour le textile : lavage, frottement, couture. Pour la cosmétique : olfactif, texture, étanchéité.",
      },
      {
        title: "Rapport photo + vidéo",
        description:
          "Tu reçois 30-50 photos sous tous les angles + une vidéo du lot. Étiquetage, packaging, accessoires, défauts éventuels — rien n'est caché.",
      },
      {
        title: "Re-production sans surcoût si défauts",
        description:
          "Au-delà de 3% de défauts majeurs, on impose à l'usine de re-produire les pièces ratées à ses frais. Clause négociée en amont.",
      },
      {
        title: "Tu valides AVANT que ça parte",
        description:
          "Tant que tu n'as pas validé le rapport, l'expédition est bloquée. C'est ton dernier point de contrôle avant que les containers partent.",
      },
    ],
    steps: [
      {
        n: "01",
        title: "Production terminée",
        description:
          "L'usine nous notifie quand ton lot est prêt et conditionné. On planifie l'inspection sur place dans les 48h.",
      },
      {
        n: "02",
        title: "Notre agent inspecte",
        description:
          "Un inspecteur indépendant se rend à l'usine, échantillonne 10% du lot, applique notre checklist de 200+ points, prend les photos et la vidéo.",
      },
      {
        n: "03",
        title: "Tu reçois le rapport + tu valides",
        description:
          "Rapport complet sur WhatsApp + dans ton app Sourcey. Tu valides, on expédie. Sinon on impose un correctif.",
      },
    ],
    faq: [
      {
        q: "L'inspection est-elle incluse dans l'abo ?",
        a: "Une inspection standard est incluse par commande dans les plans Starter et Pro. Au-delà ou pour des inspections renforcées (laboratoire, tests spécifiques), c'est facturé en sus à prix coûtant.",
      },
      {
        q: "Combien de temps prend l'inspection ?",
        a: "Demi-journée pour un lot standard, 1 journée pour un lot complexe. Le rapport est dans ton app sous 24h après la visite.",
      },
      {
        q: "Et si le lot est entièrement à refaire ?",
        a: "On enclenche la clause de re-production prévue au contrat. L'usine refait les pièces défectueuses à ses frais. Si elle refuse, on change d'usine et on récupère ton acompte.",
      },
    ],
  },
  {
    slug: "expedition",
    icon: Plane,
    title: "Agent expédition",
    tagline: "Air, mer, express — on choisit, on gère la douane.",
    eyebrow: "Logistique",
    pageTitle: "On gère la logistique de bout en bout.",
    pageSubtitle:
      "Air, mer, express : on choisit le mode de transport optimal pour ton produit et ton délai. On s'occupe de la douane, des taxes, et de l'assurance.",
    stat: { value: "DDP", label: "tu reçois sans surcoûts" },
    bullets: [
      {
        title: "Choix du transporteur optimal",
        description:
          "Express (DHL, FedEx) sous 5-7 jours pour les petits volumes urgents. Aérien standard 8-12 jours pour les volumes moyens. Maritime 35-45 jours pour les gros volumes — on fait le calcul ROI pour toi.",
      },
      {
        title: "Consolidation de cargaison",
        description:
          "Si tu commandes chez plusieurs fournisseurs, on regroupe tout dans un seul container ou une seule palette aérienne — tu ne paies qu'un transport.",
      },
      {
        title: "Formalités douanières",
        description:
          "Codes HS, déclaration EUR.1, TVA à l'import, droits de douane : on prépare tous les documents. Tu signes et c'est dédouané.",
      },
      {
        title: "Assurance transport incluse",
        description:
          "Toute marchandise expédiée est assurée à valeur de remplacement (jusqu'à 50 000€ par envoi inclus, plus sur devis). Perte, casse, vol couverts.",
      },
      {
        title: "DDP — Delivery Duty Paid",
        description:
          "Tu reçois ta marchandise chez toi sans avoir à régler quoi que ce soit au transporteur. Pas de mauvaise surprise au moment de la livraison.",
      },
    ],
    steps: [
      {
        n: "01",
        title: "Devis transport",
        description:
          "Une fois le lot inspecté et validé, on te propose 2-3 options de transport (avec délai et prix) selon ton urgence.",
      },
      {
        n: "02",
        title: "On organise l'envoi",
        description:
          "Enlèvement à l'usine, transit Chine → Europe, dédouanement, paiement des taxes pour ton compte (refacturé à prix coûtant).",
      },
      {
        n: "03",
        title: "Livraison à ton entrepôt",
        description:
          "Camion à ton adresse (perso, 3PL, fulfillment Amazon, Cdiscount). Tu signes le bon de livraison, c'est terminé.",
      },
    ],
    faq: [
      {
        q: "Vous livrez chez Amazon FBA ?",
        a: "Oui, c'est même un de nos cas d'usage les plus fréquents. On prépare les étiquettes FNSKU/box content, on envoie directement aux centres FBA, et on te donne le tracking jusqu'à la réception Amazon.",
      },
      {
        q: "Quels sont les délais réalistes ?",
        a: "Express 5-7j, aérien 8-12j, maritime 35-45j (depuis le départ usine). Compte 2 semaines de plus pour la production. Total de bout en bout : 4 à 10 semaines selon le mode.",
      },
      {
        q: "Et si le colis est perdu ?",
        a: "Assurance déclenchée immédiatement. Tu es remboursé à valeur de remplacement et on relance la production en parallèle. C'est arrivé 2x en 5 ans — on sait gérer.",
      },
    ],
  },
  {
    slug: "suivi-colis",
    icon: PackageSearch,
    title: "Suivi colis temps réel",
    tagline: "Production, transport, livraison — tu vois tout en direct.",
    eyebrow: "Tracking",
    pageTitle: "Tu sais où en est ta commande à chaque instant.",
    pageSubtitle:
      "De la mise en production à la livraison à ton entrepôt, suis ta commande étape par étape dans ton app Sourcey + notifications WhatsApp à chaque jalon.",
    stat: { value: "8", label: "jalons trackés par commande" },
    bullets: [
      {
        title: "Notifications WhatsApp à chaque étape",
        description:
          "Brief reçu → fournisseur trouvé → devis envoyé → commande passée → production lancée → production terminée → inspection ok → expédié → livré. Tu reçois un ping à chaque jalon.",
      },
      {
        title: "Photos de la production en cours",
        description:
          "À mi-production et à fin de production, l'usine nous envoie des photos. Tu les vois dans ton app — tu peux ajuster avant qu'il soit trop tard.",
      },
      {
        title: "Tracking transporteur intégré",
        description:
          "DHL, FedEx, MSC, Maersk : on connecte les APIs transporteur dans ton app. Plus besoin d'aller copier-coller un n° de suivi sur 4 sites différents.",
      },
      {
        title: "Estimation date de livraison",
        description:
          "Mise à jour automatique au fur et à mesure des étapes. Si un retard se profile, on te prévient en avance avec un nouveau plan.",
      },
      {
        title: "Historique complet conservé",
        description:
          "Toutes tes commandes, devis, rapports d'inspection, factures, tracking — tout est dans ton app, archivé, exportable en PDF pour ta compta.",
      },
    ],
    steps: [
      {
        n: "01",
        title: "Commande passée",
        description:
          "Dès que tu valides le devis, une fiche commande apparaît dans ton dashboard Sourcey avec tous les jalons à venir.",
      },
      {
        n: "02",
        title: "Mises à jour en continu",
        description:
          "Chaque action (production, inspection, expédition) déclenche une notification WhatsApp + un update visible dans l'app en temps réel.",
      },
      {
        n: "03",
        title: "Livraison confirmée",
        description:
          "Photo du dépôt, signature du bon de livraison, fiche commande clôturée. Si tu veux relancer la même réf, c'est 2 clics.",
      },
    ],
    faq: [
      {
        q: "Je dois installer une app ?",
        a: "Non. Ton app Sourcey est accessible depuis n'importe quel navigateur (mobile ou desktop). Les notifs arrivent sur WhatsApp.",
      },
      {
        q: "Vous trackez les commandes pré-Sourcey ?",
        a: "Non, on suit uniquement les commandes qu'on a gérées de A à Z. Mais on peut t'aider à reprendre des relations fournisseurs existantes (selon le plan).",
      },
      {
        q: "Et si l'usine ne répond plus ?",
        a: "Notre équipe terrain en Chine se déplace physiquement à l'usine sous 48h. C'est rare, mais c'est ça la valeur ajoutée d'avoir des humains sur place.",
      },
    ],
  },
  {
    slug: "relation-fournisseur",
    icon: Handshake,
    title: "Relation long terme",
    tagline: "Un interlocuteur dédié qui gère tes réassorts.",
    eyebrow: "Relation durable",
    pageTitle: "On reste ton bras en Chine sur la durée.",
    pageSubtitle:
      "Un seul interlocuteur Sourcey qui connaît tes produits, gère tes réassorts, ajuste les détails, et veille sur ton compte chez tes fournisseurs année après année.",
    stat: { value: "1 contact", label: "qui connaît ton compte" },
    bullets: [
      {
        title: "Account manager dédié",
        description:
          "Tu n'as pas à ré-expliquer ton produit à chaque commande. Ton AM connaît tes specs, tes habitudes, tes préférences packaging, et te suit dans la durée.",
      },
      {
        title: "Réassorts en 2 clics",
        description:
          "Pour une commande identique : tu ouvres ton dashboard, tu cliques \"Réassort\", tu confirmes les quantités. On enclenche la production sous 24h sans nouveau brief.",
      },
      {
        title: "Adaptations produit faciles",
        description:
          "Changer de couleur, ajuster la taille, modifier le packaging, ajouter ton logo : tu nous le dis sur WhatsApp, on négocie l'évolution avec l'usine.",
      },
      {
        title: "Veille concurrentielle",
        description:
          "Notre équipe te signale les nouveaux produits qui sortent dans ta catégorie et les fournisseurs concurrents avec de meilleurs prix — au cas où tu veuilles diversifier.",
      },
      {
        title: "Reporting trimestriel",
        description:
          "Tous les 3 mois, on te fait un point sur tes commandes, tes économies réalisées vs le marché, et les axes d'amélioration. Pour piloter ton business comme un grand.",
      },
    ],
    steps: [
      {
        n: "01",
        title: "Premier produit lancé",
        description:
          "À partir de ta première commande livrée, ton account manager te suit et apprend tes habitudes.",
      },
      {
        n: "02",
        title: "Tu scales sans friction",
        description:
          "Réassorts, nouvelles références, ajustements : tout est plus rapide chaque mois. Le 5e produit te prend 3x moins de temps que le 1er.",
      },
      {
        n: "03",
        title: "On veille pendant que tu vends",
        description:
          "Pas besoin de checker tous les jours. Ton AM te notifie sur les choses importantes, et te laisse tranquille sur le reste.",
      },
    ],
    faq: [
      {
        q: "Je change d'AM si je n'aime pas le mien ?",
        a: "Oui. Tu peux demander un changement à tout moment, sans justification. On match selon la personnalité, pas selon le hasard.",
      },
      {
        q: "L'AM parle français ?",
        a: "Oui, tous nos AM sont francophones natifs. La négo avec l'usine est faite par notre équipe en Chine, mais avec toi c'est 100% français.",
      },
      {
        q: "Et si je veux quitter Sourcey, je garde mes fournisseurs ?",
        a: "Oui — tu n'es pas prisonnier. À la résiliation, on te transmet tous les contacts fournisseurs avec lesquels on a bossé pour toi. C'est ton business, pas le nôtre.",
      },
    ],
  },
];

export function getFeature(slug: string): Feature | undefined {
  return FEATURES.find((f) => f.slug === slug);
}
