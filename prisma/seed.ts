import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding…");

  // --- waitlist demo --------------------------------------------------------
  await prisma.waitlist.upsert({
    where: { email: "waitlist@sourcey.fr" },
    update: {},
    create: {
      email: "waitlist@sourcey.fr",
      source: "seed",
      accountTypeInterest: "individual",
    },
  });

  // --- demo user ------------------------------------------------------------
  const user = await prisma.user.upsert({
    where: { email: "demo@sourcey.fr" },
    update: {},
    create: {
      email: "demo@sourcey.fr",
      fullName: "Démo Sourcey",
      avatarUrl: "https://i.pravatar.cc/160?img=68",
      plan: "pro",
    },
  });

  // wipe previous conversations to keep seed idempotent on the demo user
  await prisma.conversation.deleteMany({ where: { userId: user.id } });

  // --- conversation 1: Support ---------------------------------------------
  const support = await prisma.conversation.create({
    data: {
      userId: user.id,
      type: "support",
      title: "Support Sourcey",
      lastMessagePreview:
        "Bien sûr, je regarde ça et te reviens d'ici la fin de journée.",
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
      unreadByUser: 1,
    },
  });
  await seedMessages(support.id, [
    {
      senderType: "user",
      senderId: user.id,
      content: "Salut ! Petite question sur ma facture du mois dernier — j'ai été débité 2 fois ?",
      offsetMin: -180,
    },
    {
      senderType: "support",
      content: "Hello 👋 Effectivement je vois un doublon de débit de 79€ le 12/04. Je te fais le remboursement aujourd'hui.",
      offsetMin: -150,
      read: true,
    },
    {
      senderType: "user",
      senderId: user.id,
      content: "Top merci ! Tant que je te tiens, vous avez prévu une intégration WooCommerce native bientôt ?",
      offsetMin: -125,
    },
    {
      senderType: "support",
      content: "Bien sûr, je regarde ça et te reviens d'ici la fin de journée.",
      offsetMin: -120,
    },
  ]);

  // --- conversation 2: Chen Mei (agent Guangzhou) --------------------------
  const chenMei = await prisma.conversation.create({
    data: {
      userId: user.id,
      type: "agent",
      agentId: "chen-mei",
      agentName: "Chen Mei",
      agentCity: "Guangzhou",
      agentAvatarUrl: "https://i.pravatar.cc/160?img=47",
      title: "Chen Mei · Bougies parfumées 500u",
      lastMessagePreview:
        "Je te confirme le devis : 2.85€/unité, MOQ 500, prod 12 jours.",
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 15), // 15min ago
      unreadByUser: 2,
    },
  });
  await seedMessages(chenMei.id, [
    {
      senderType: "system",
      content: "Conversation démarrée pour la demande « Bougie parfumée custom · 500 unités ».",
      offsetMin: -2880, // 2 days ago
    },
    {
      senderType: "user",
      senderId: user.id,
      content: "Hello Chen Mei, j'ai vu que tu étais l'agent recommandé pour cette demande. Tu peux me trouver une usine sérieuse pour bougies parfumées en cire de soja ?",
      offsetMin: -2870,
    },
    {
      senderType: "agent",
      content: "Bonjour ! Oui, j'ai 3 usines sérieuses dans ma région à Guangzhou pour ce produit. Tu veux du contenant verre ou métal ?",
      offsetMin: -2820,
      read: true,
    },
    {
      senderType: "user",
      senderId: user.id,
      content: "Verre ambré 8cm, étiquette personnalisée, parfum vanille + bois.",
      offsetMin: -2800,
    },
    {
      senderType: "agent",
      content: "Parfait. Je consulte 2 usines et te reviens avec un devis sous 48h.",
      offsetMin: -2790,
      read: true,
    },
    {
      senderType: "system",
      content: "Devis créé par Chen Mei.",
      offsetMin: -120,
    },
    {
      senderType: "agent",
      content: "Je te confirme le devis : 2.85€/unité, MOQ 500, prod 12 jours.",
      offsetMin: -15,
    },
  ]);

  // --- conversation 3: Wang Jun (agent Shenzhen, électronique) -------------
  const wangJun = await prisma.conversation.create({
    data: {
      userId: user.id,
      type: "agent",
      agentId: "wang-jun",
      agentName: "Wang Jun",
      agentCity: "Shenzhen",
      agentAvatarUrl: "https://i.pravatar.cc/160?img=33",
      title: "Wang Jun · Chargeurs USB-C",
      lastMessagePreview:
        "Photo de l'échantillon en pièce jointe. Qu'en penses-tu ?",
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      unreadByUser: 0,
    },
  });
  await seedMessages(wangJun.id, [
    {
      senderType: "user",
      senderId: user.id,
      content: "Je cherche un chargeur USB-C 65W GaN pour ma marque DTC, certifié CE.",
      offsetMin: -2900,
    },
    {
      senderType: "agent",
      content: "J'ai exactement ce qu'il te faut. Usine partenaire à Shenzhen, certifs CE + FCC + RoHS. Je t'envoie un échantillon gratuit ?",
      offsetMin: -2880,
      read: true,
    },
    {
      senderType: "user",
      senderId: user.id,
      content: "Yes carrément. Mon adresse est sur mon profil.",
      offsetMin: -2870,
    },
    {
      senderType: "agent",
      content: "Photo de l'échantillon en pièce jointe. Qu'en penses-tu ?",
      offsetMin: -1440,
      attachments: JSON.stringify([
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80&auto=format&fit=crop",
      ]),
      read: true,
    },
  ]);

  console.log(`✓ User: ${user.email}`);
  console.log(`✓ 3 conversations seeded (support + 2 agents)`);

  // --- products catalog ----------------------------------------------------
  await prisma.product.deleteMany({});
  for (const p of PRODUCTS) {
    await prisma.product.create({ data: p });
  }
  console.log(`✓ ${PRODUCTS.length} products seeded`);
}

// ============================================================
// PRODUCT CATALOG SEED
// ============================================================

const AGENTS = {
  "chen-mei": { name: "Chen Mei", city: "Guangzhou", avatar: "https://i.pravatar.cc/160?img=47" },
  "li-wei": { name: "Li Wei", city: "Yiwu", avatar: "https://i.pravatar.cc/160?img=12" },
  "wang-jun": { name: "Wang Jun", city: "Shenzhen", avatar: "https://i.pravatar.cc/160?img=33" },
  "zhang-lin": { name: "Zhang Lin", city: "Shanghai", avatar: "https://i.pravatar.cc/160?img=23" },
  "liu-hao": { name: "Liu Hao", city: "Ningbo", avatar: "https://i.pravatar.cc/160?img=68" },
  "xu-fang": { name: "Xu Fang", city: "Yiwu", avatar: "https://i.pravatar.cc/160?img=45" },
  "zhao-qiang": { name: "Zhao Qiang", city: "Guangzhou", avatar: "https://i.pravatar.cc/160?img=15" },
  "huang-yan": { name: "Huang Yan", city: "Shenzhen", avatar: "https://i.pravatar.cc/160?img=44" },
} as const;

interface ProductSeed {
  slug: string;
  title: string;
  shortPitch: string;
  description: string;
  category: string;
  subcategory?: string | null;
  images: string[];
  agentSlug: keyof typeof AGENTS;
  priceTiers: { minQty: number; unitPrice: number }[];
  samplePrice: number | null;
  moq: number;
  leadTimeDays: number;
  material?: string | null;
  origin: string;
  certifications: string[];
  customizable: boolean;
  customOptions: string[];
  sourcedTimes: number;
  rating: number | null;
  reviewCount: number;
  featured: boolean;
  isNew: boolean;
}

const RAW_PRODUCTS: ProductSeed[] = [
  // === MODE / TEXTILE (Chen Mei, Guangzhou) ============================
  {
    slug: "hoodie-streetwear-oversize",
    title: "Hoodie streetwear oversize 350g",
    shortPitch: "Coton bio brossé, coupe oversize unisex, broderie incluse",
    description:
      "Hoodie premium 350gsm en coton bio peigné OEKO-TEX. Coupe oversize droite très portée 2025, finitions épaules tombantes. Coton brossé intérieur pour une douceur premium. Broderie poitrine ou impression DTG inclus. Fabriqué dans une usine partenaire de Chen Mei à Foshan (Guangzhou) — 8 ans d'historique avec nous, jamais une rupture qualité.",
    category: "mode",
    subcategory: "Streetwear",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611042553365-9b101441c135?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1622445275576-721325763afe?w=1000&q=80&auto=format&fit=crop",
    ],
    agentSlug: "chen-mei",
    priceTiers: [
      { minQty: 50, unitPrice: 14.5 },
      { minQty: 200, unitPrice: 11.2 },
      { minQty: 500, unitPrice: 9.4 },
      { minQty: 1000, unitPrice: 7.8 },
    ],
    samplePrice: 35,
    moq: 50,
    leadTimeDays: 22,
    material: "Coton bio peigné 350gsm",
    origin: "Guangzhou",
    certifications: ["OEKO-TEX Standard 100", "GOTS"],
    customizable: true,
    customOptions: ["Broderie", "Impression DTG", "Étiquettes intérieures", "Couleur tissu"],
    sourcedTimes: 84,
    rating: 4.9,
    reviewCount: 23,
    featured: true,
    isNew: false,
  },
  {
    slug: "tshirt-premium-coton-bio",
    title: "T-shirt premium coton bio 220g",
    shortPitch: "Coupe droite intemporelle, parfait pour ta marque DTC",
    description:
      "T-shirt 220gsm en coton bio peigné, coupe régulière sans boxy effect. Bord-côte renforcé, double couture épaules + bas. Parfait pour ta première marque DTC : la qualité ne déçoit personne, le prix tient la route en small batch. Sample en 5 jours possible.",
    category: "mode",
    subcategory: "Basique premium",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1000&q=80&auto=format&fit=crop",
    ],
    agentSlug: "chen-mei",
    priceTiers: [
      { minQty: 100, unitPrice: 5.4 },
      { minQty: 300, unitPrice: 4.2 },
      { minQty: 1000, unitPrice: 3.3 },
    ],
    samplePrice: 18,
    moq: 100,
    leadTimeDays: 15,
    material: "Coton bio peigné 220gsm",
    origin: "Guangzhou",
    certifications: ["OEKO-TEX Standard 100"],
    customizable: true,
    customOptions: ["Sérigraphie", "Étiquettes", "DTG", "Couleur"],
    sourcedTimes: 142,
    rating: 4.8,
    reviewCount: 47,
    featured: true,
    isNew: false,
  },
  {
    slug: "tote-bag-toile-lourde",
    title: "Tote bag toile lourde 12oz",
    shortPitch: "Sac réutilisable qualité gallery shop, impression custom incluse",
    description:
      "Tote bag en toile coton 12oz (340gsm), poignées longues renforcées, double couture sur les angles. Largeur 38cm x hauteur 42cm. Impression sérigraphie 1-3 couleurs incluse. Idéal pour merch, e-com éco-responsable, communication d'entreprise. Le prix au volume est imbattable.",
    category: "mode",
    subcategory: "Accessoires",
    images: [
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=1000&q=80&auto=format&fit=crop",
    ],
    agentSlug: "chen-mei",
    priceTiers: [
      { minQty: 100, unitPrice: 2.8 },
      { minQty: 500, unitPrice: 1.95 },
      { minQty: 2000, unitPrice: 1.4 },
    ],
    samplePrice: 12,
    moq: 100,
    leadTimeDays: 18,
    material: "Coton toile 12oz",
    origin: "Guangzhou",
    certifications: ["OEKO-TEX Standard 100", "FSC"],
    customizable: true,
    customOptions: ["Sérigraphie 1-3 couleurs", "Couleur toile", "Étiquette tissée"],
    sourcedTimes: 67,
    rating: 4.7,
    reviewCount: 19,
    featured: false,
    isNew: false,
  },

  // === MAISON / DÉCO (Li Wei, Yiwu) ===================================
  {
    slug: "bougie-parfumee-cire-soja",
    title: "Bougie parfumée cire de soja 200g",
    shortPitch: "Cire de soja pure, verre ambré, étiquette custom incluse",
    description:
      "Bougie 200g en cire de soja pure (zero paraffine), mèche coton sans plomb. Contenant verre ambré 8cm, look intemporel premium. 12 fragrances disponibles (vanille, bois de santal, figue, eucalyptus, ambre, monoï…). Étiquette personnalisée avec ton logo incluse. Brûle 35-40h.",
    category: "maison",
    subcategory: "Bougies & parfums",
    images: [
      "https://images.unsplash.com/photo-1602874801006-94d8d3c97f8a?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605651531144-51381895e23d?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599689019377-7f0b3a3c14e8?w=1000&q=80&auto=format&fit=crop",
    ],
    agentSlug: "li-wei",
    priceTiers: [
      { minQty: 100, unitPrice: 3.8 },
      { minQty: 500, unitPrice: 2.85 },
      { minQty: 2000, unitPrice: 2.2 },
    ],
    samplePrice: 15,
    moq: 100,
    leadTimeDays: 14,
    material: "Cire de soja pure",
    origin: "Yiwu",
    certifications: ["EU Cosmetic Compliance"],
    customizable: true,
    customOptions: ["Fragrance custom", "Étiquette logo", "Couleur cire", "Packaging custom"],
    sourcedTimes: 211,
    rating: 4.9,
    reviewCount: 68,
    featured: true,
    isNew: false,
  },
  {
    slug: "vase-ceramique-organique",
    title: "Vase céramique forme organique",
    shortPitch: "Pièce déco statement signature, fait main en céramique mate",
    description:
      "Vase en céramique grès cérame, finition mate sablée. Forme organique sculpturale (style ceramic art contemporain). Hauteur 28cm, diamètre 18cm. Chaque pièce est unique (variations volontaires). 6 coloris : crème, terre, sable, anthracite, sage, terracotta. Parfait pour boutique déco / e-com lifestyle premium.",
    category: "maison",
    subcategory: "Vases & objets déco",
    images: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1000&q=80&auto=format&fit=crop",
    ],
    agentSlug: "li-wei",
    priceTiers: [
      { minQty: 30, unitPrice: 18 },
      { minQty: 100, unitPrice: 13.5 },
      { minQty: 300, unitPrice: 10 },
    ],
    samplePrice: 45,
    moq: 30,
    leadTimeDays: 28,
    material: "Grès cérame émaillé",
    origin: "Yiwu",
    certifications: [],
    customizable: true,
    customOptions: ["Couleur émail", "Taille", "Forme custom"],
    sourcedTimes: 38,
    rating: 4.8,
    reviewCount: 12,
    featured: false,
    isNew: true,
  },
  {
    slug: "miroir-laiton-brosse",
    title: "Miroir laiton brossé biseauté",
    shortPitch: "Miroir circulaire 50cm, cadre laiton brossé, mood années 70",
    description:
      "Miroir mural circulaire 50cm de diamètre, cadre laiton brossé véritable (pas du chromé peint). Verre biseauté 4mm haute clarté. Système d'accroche mural inclus. Look années 70 chic qui marche en chambre, salle de bain, entrée. Carton de protection renforcé.",
    category: "maison",
    subcategory: "Miroirs & cadres",
    images: [
      "https://images.unsplash.com/photo-1618220179428-22790b461013?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1616593871468-2c3e2fdde0e7?w=1000&q=80&auto=format&fit=crop",
    ],
    agentSlug: "li-wei",
    priceTiers: [
      { minQty: 20, unitPrice: 38 },
      { minQty: 100, unitPrice: 28 },
    ],
    samplePrice: 75,
    moq: 20,
    leadTimeDays: 25,
    material: "Laiton brossé + verre biseauté",
    origin: "Yiwu",
    certifications: [],
    customizable: true,
    customOptions: ["Diamètre", "Finition laiton/noir/argent"],
    sourcedTimes: 22,
    rating: 4.7,
    reviewCount: 8,
    featured: false,
    isNew: true,
  },

  // === ÉLECTRONIQUE (Wang Jun, Shenzhen) ==============================
  {
    slug: "chargeur-usbc-65w-gan",
    title: "Chargeur USB-C 65W GaN compact",
    shortPitch: "Le chargeur DTC premium, GaN, certif CE + FCC + RoHS",
    description:
      "Chargeur USB-C 65W avec technologie GaN (Gallium Nitride) — 40% plus compact qu'un chargeur classique de même puissance. Charge MacBook Air, iPhone 15 Pro Max, iPad Pro. Protections intégrées (surtension, surchauffe, court-circuit). Finition matte premium. Packaging white-label inclus. Certifs européennes complètes.",
    category: "electronique",
    subcategory: "Chargeurs & câbles",
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1593207537924-c4baba8db1e1?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1623998022290-a74f8cc36563?w=1000&q=80&auto=format&fit=crop",
    ],
    agentSlug: "wang-jun",
    priceTiers: [
      { minQty: 100, unitPrice: 8.2 },
      { minQty: 500, unitPrice: 6.5 },
      { minQty: 2000, unitPrice: 5.1 },
    ],
    samplePrice: 22,
    moq: 100,
    leadTimeDays: 21,
    material: "PC/ABS + GaN chipset",
    origin: "Shenzhen",
    certifications: ["CE", "FCC", "RoHS", "UKCA"],
    customizable: true,
    customOptions: ["Couleur boîtier (5 options)", "Logo gravé", "Packaging custom"],
    sourcedTimes: 156,
    rating: 4.9,
    reviewCount: 52,
    featured: true,
    isNew: false,
  },
  {
    slug: "ecouteurs-bluetooth-anc",
    title: "Écouteurs Bluetooth ANC + Custom",
    shortPitch: "ANC pro, latence < 60ms, autonomie 30h avec boîtier",
    description:
      "Écouteurs in-ear sans fil avec réduction active de bruit (ANC) jusqu'à -32dB. Bluetooth 5.3, latence < 60ms (gaming-ready), codec aptX. Autonomie 7h écouteurs + 23h boîtier. Tactile, IP54, charge sans fil. Driver dynamique 12mm. Idéal pour marque audio DTC.",
    category: "electronique",
    subcategory: "Audio & casques",
    images: [
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1574920162043-b872873f19c8?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000&q=80&auto=format&fit=crop",
    ],
    agentSlug: "wang-jun",
    priceTiers: [
      { minQty: 100, unitPrice: 22 },
      { minQty: 500, unitPrice: 17.5 },
      { minQty: 2000, unitPrice: 13.8 },
    ],
    samplePrice: 55,
    moq: 100,
    leadTimeDays: 30,
    material: "ABS + silicone medical-grade",
    origin: "Shenzhen",
    certifications: ["CE", "FCC", "RoHS", "RED"],
    customizable: true,
    customOptions: ["Couleur boîtier", "Logo laser", "Packaging branded"],
    sourcedTimes: 89,
    rating: 4.8,
    reviewCount: 34,
    featured: true,
    isNew: true,
  },

  // === BEAUTÉ (Zhang Lin, Shanghai) ===================================
  {
    slug: "creme-visage-acide-hyaluronique",
    title: "Crème visage acide hyaluronique 50ml",
    shortPitch: "Formule clean beauty K-Beauty, finition mate, vegan & cruelty-free",
    description:
      "Crème hydratante visage 50ml avec 3 acides hyaluroniques de poids moléculaires différents (pénétration multi-couches). Texture gel-crème, finition mate non-collante. Niacinamide 5% + Centella Asiatica + extrait de thé vert. Formule clean : sans parabens, sans sulfates, vegan, cruelty-free. Conforme régulation EU.",
    category: "beaute",
    subcategory: "Soins visage",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631730486561-3c6b76f5b58c?w=1000&q=80&auto=format&fit=crop",
    ],
    agentSlug: "zhang-lin",
    priceTiers: [
      { minQty: 300, unitPrice: 4.5 },
      { minQty: 1000, unitPrice: 3.4 },
      { minQty: 5000, unitPrice: 2.6 },
    ],
    samplePrice: 25,
    moq: 300,
    leadTimeDays: 35,
    material: "Formule water-based",
    origin: "Shanghai",
    certifications: ["EU Cosmetics CPNP", "Vegan Society", "Leaping Bunny"],
    customizable: true,
    customOptions: ["Fragrance", "Packaging custom", "Étiquette", "Formule ajustée"],
    sourcedTimes: 76,
    rating: 4.9,
    reviewCount: 28,
    featured: true,
    isNew: false,
  },
  {
    slug: "savon-artisanal-saponifie-froid",
    title: "Savon saponifié à froid 100g",
    shortPitch: "Saponification à froid, beurre de karité, packaging kraft",
    description:
      "Savon 100g saponifié à froid pendant 6 semaines, riche en glycérine naturelle. 7 variantes : lavande, agrumes, charbon actif, miel, rose, eucalyptus, neutre. Beurre de karité bio 12% + huile de coco + huile d'olive. Emballage kraft + bandeau papier recyclé personnalisable.",
    category: "beaute",
    subcategory: "Savons & soins corps",
    images: [
      "https://images.unsplash.com/photo-1607006333439-505849ef4f76?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=1000&q=80&auto=format&fit=crop",
    ],
    agentSlug: "zhang-lin",
    priceTiers: [
      { minQty: 200, unitPrice: 2.1 },
      { minQty: 1000, unitPrice: 1.55 },
      { minQty: 5000, unitPrice: 1.1 },
    ],
    samplePrice: 10,
    moq: 200,
    leadTimeDays: 45,
    material: "Saponifié à froid",
    origin: "Shanghai",
    certifications: ["EU Cosmetics CPNP", "ECOCERT"],
    customizable: true,
    customOptions: ["Parfum custom", "Bandeau étiquette", "Variante neutre fragrance-free"],
    sourcedTimes: 51,
    rating: 4.8,
    reviewCount: 17,
    featured: false,
    isNew: false,
  },

  // === SPORT / OUTDOOR (Liu Hao, Ningbo) ==============================
  {
    slug: "tapis-yoga-liege-naturel",
    title: "Tapis yoga liège naturel + caoutchouc",
    shortPitch: "Antidérapant naturel, surface liège, base caoutchouc bio",
    description:
      "Tapis de yoga 183x68cm, épaisseur 5mm. Surface en liège naturel (antidérapant même mouillé), base caoutchouc bio. Zero PVC, zero plastique. Lignes d'alignement subtilement gravées. Vient avec sangle de transport en coton + sac jute. Idéal pour marque yoga éco-responsable.",
    category: "sport",
    subcategory: "Yoga & pilates",
    images: [
      "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=1000&q=80&auto=format&fit=crop",
    ],
    agentSlug: "liu-hao",
    priceTiers: [
      { minQty: 100, unitPrice: 16 },
      { minQty: 500, unitPrice: 12.4 },
      { minQty: 2000, unitPrice: 9.5 },
    ],
    samplePrice: 38,
    moq: 100,
    leadTimeDays: 28,
    material: "Liège naturel + caoutchouc bio",
    origin: "Ningbo",
    certifications: ["FSC", "OEKO-TEX"],
    customizable: true,
    customOptions: ["Logo gravé laser", "Épaisseur 3/5/8mm", "Couleur base"],
    sourcedTimes: 64,
    rating: 4.9,
    reviewCount: 21,
    featured: true,
    isNew: false,
  },
  {
    slug: "gourde-inox-double-paroi",
    title: "Gourde inox 750ml double paroi",
    shortPitch: "Garde froid 24h / chaud 12h, finition matte, gravure laser custom",
    description:
      "Gourde 750ml en inox 304 alimentaire, double paroi sous vide. Garde froid 24h, chaud 12h. Bouchon vissant étanche avec sangle de transport. Finition extérieure poudrée mate, 10 coloris disponibles. Gravure laser logo inclus dès 200 unités. Anti-condensation.",
    category: "sport",
    subcategory: "Hydratation",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610631066894-62452ccb927c?w=1000&q=80&auto=format&fit=crop",
    ],
    agentSlug: "liu-hao",
    priceTiers: [
      { minQty: 100, unitPrice: 7.5 },
      { minQty: 500, unitPrice: 5.6 },
      { minQty: 2000, unitPrice: 4.2 },
    ],
    samplePrice: 20,
    moq: 100,
    leadTimeDays: 18,
    material: "Inox 304 alimentaire",
    origin: "Ningbo",
    certifications: ["LFGB", "FDA"],
    customizable: true,
    customOptions: ["Gravure laser", "Couleur (10 options)", "Capacité 350/500/750/1L"],
    sourcedTimes: 102,
    rating: 4.8,
    reviewCount: 39,
    featured: false,
    isNew: false,
  },

  // === JOUETS / ENFANTS (Xu Fang, Yiwu) ===============================
  {
    slug: "peluche-licorne-30cm",
    title: "Peluche licorne 30cm coton bio",
    shortPitch: "Coton bio OEKO-TEX, sécurité CE, idéal moins de 3 ans",
    description:
      "Peluche licorne câline 30cm, intérieur rembourrage fibre polyester recyclée, extérieur tissu coton bio OEKO-TEX. Yeux brodés (pas de plastique) — sécurité enfants moins de 3 ans. 6 coloris pastel : licorne classique, rainbow, lavande, sauge, beige, terracotta. Lavable machine 30°.",
    category: "enfant",
    subcategory: "Peluches",
    images: [
      "https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1591382386627-349b692688ff?w=1000&q=80&auto=format&fit=crop",
    ],
    agentSlug: "xu-fang",
    priceTiers: [
      { minQty: 100, unitPrice: 6.5 },
      { minQty: 500, unitPrice: 4.9 },
      { minQty: 2000, unitPrice: 3.6 },
    ],
    samplePrice: 18,
    moq: 100,
    leadTimeDays: 22,
    material: "Coton bio + fibre recyclée",
    origin: "Yiwu",
    certifications: ["CE EN71", "OEKO-TEX", "REACH"],
    customizable: true,
    customOptions: ["Couleur", "Étiquette tissée", "Taille 20/30/50cm"],
    sourcedTimes: 119,
    rating: 4.9,
    reviewCount: 41,
    featured: true,
    isNew: false,
  },

  // === BIJOUTERIE (Huang Yan, Shenzhen) ===============================
  {
    slug: "collier-acier-inox-plaque-or",
    title: "Collier acier inox 316L plaqué or 18k",
    shortPitch: "Acier chirurgical, plaquage or 3 microns, anti-allergie",
    description:
      "Collier chaîne acier inoxydable 316L (chirurgical), plaqué or 18 carats sur 3 microns (résiste à la sueur et à la douche). Longueur ajustable 40-45cm. Fermoir mousqueton renforcé. Hypoallergénique. 4 designs disponibles : maille forçat, cuban, perle, gourmette. Idéal marque DTC bijoux abordables-premium.",
    category: "bijouterie",
    subcategory: "Colliers",
    images: [
      "https://images.unsplash.com/photo-1611652022419-a9419f74343c?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1612767528006-6bb6dca15c12?w=1000&q=80&auto=format&fit=crop",
    ],
    agentSlug: "huang-yan",
    priceTiers: [
      { minQty: 100, unitPrice: 4.2 },
      { minQty: 500, unitPrice: 3.1 },
      { minQty: 2000, unitPrice: 2.3 },
    ],
    samplePrice: 12,
    moq: 100,
    leadTimeDays: 20,
    material: "Acier 316L + plaquage or 18k 3 microns",
    origin: "Shenzhen",
    certifications: ["Nickel-free EU", "REACH"],
    customizable: true,
    customOptions: ["Design (4 mailles)", "Longueur", "Plaquage or/argent/rose gold", "Gravure"],
    sourcedTimes: 73,
    rating: 4.7,
    reviewCount: 26,
    featured: false,
    isNew: false,
  },

  // === CUISINE (Zhao Qiang, Guangzhou) ================================
  {
    slug: "set-couteaux-japonais-damas",
    title: "Set couteaux japonais Damas 3 pièces",
    shortPitch: "Lame Damas 67 couches, manche pakkawood, présentoir bois noir",
    description:
      "Set 3 couteaux japonais (Chef 20cm, Santoku 18cm, Utility 13cm). Lame acier Damas 67 couches, dureté Rockwell 60HRC, tranchant rasoir. Manche pakkawood (bois résine ergonomique). Coffret cadeau bois noir + cale magnétique inclus. Idéal cadeau premium, food gifting, e-com cuisine.",
    category: "cuisine",
    subcategory: "Couteaux & ustensiles",
    images: [
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=1000&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1593618998269-5b9c8c5b3a09?w=1000&q=80&auto=format&fit=crop",
    ],
    agentSlug: "zhao-qiang",
    priceTiers: [
      { minQty: 30, unitPrice: 45 },
      { minQty: 100, unitPrice: 36 },
      { minQty: 500, unitPrice: 28 },
    ],
    samplePrice: 95,
    moq: 30,
    leadTimeDays: 30,
    material: "Acier Damas 67 couches + Pakkawood",
    origin: "Guangzhou",
    certifications: ["LFGB", "FDA"],
    customizable: true,
    customOptions: ["Gravure manche", "Coffret custom", "Set 5 ou 7 pièces"],
    sourcedTimes: 32,
    rating: 4.9,
    reviewCount: 11,
    featured: false,
    isNew: true,
  },
];

const PRODUCTS = RAW_PRODUCTS.map((p) => {
  const agent = AGENTS[p.agentSlug];
  return {
    slug: p.slug,
    title: p.title,
    shortPitch: p.shortPitch,
    description: p.description,
    category: p.category,
    subcategory: p.subcategory ?? null,
    images: JSON.stringify(p.images),
    agentSlug: p.agentSlug,
    agentName: agent.name,
    agentCity: agent.city,
    agentAvatarUrl: agent.avatar,
    priceTiers: JSON.stringify(p.priceTiers),
    samplePrice: p.samplePrice,
    currency: "EUR",
    moq: p.moq,
    leadTimeDays: p.leadTimeDays,
    material: p.material ?? null,
    origin: p.origin,
    certifications: p.certifications.length
      ? JSON.stringify(p.certifications)
      : null,
    customizable: p.customizable,
    customOptions: p.customOptions.length
      ? JSON.stringify(p.customOptions)
      : null,
    sourcedTimes: p.sourcedTimes,
    rating: p.rating,
    reviewCount: p.reviewCount,
    featured: p.featured,
    isNew: p.isNew,
  };
});

async function seedMessages(
  conversationId: string,
  msgs: {
    senderType: "user" | "agent" | "support" | "system";
    senderId?: string;
    content: string;
    offsetMin: number; // minutes from now, negative = past
    attachments?: string;
    read?: boolean;
  }[]
) {
  for (const m of msgs) {
    const createdAt = new Date(Date.now() + m.offsetMin * 60 * 1000);
    await prisma.message.create({
      data: {
        conversationId,
        senderType: m.senderType,
        senderId: m.senderType === "user" ? m.senderId ?? null : null,
        content: m.content,
        attachments: m.attachments ?? null,
        readByUserAt: m.read && m.senderType !== "user" ? createdAt : null,
        readByCounterpartAt: m.read && m.senderType === "user" ? createdAt : null,
        createdAt,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
