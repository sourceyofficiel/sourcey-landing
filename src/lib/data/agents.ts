export interface AgentReview {
  author: string;
  authorCompany?: string;
  rating: number;
  text: string;
  date: string; // ISO
}

export interface Agent {
  id: string;
  slug: string;
  fullName: string;
  city: string;
  avatar: string;
  /** Optional larger banner image (Unsplash) */
  banner?: string;
  specialties: string[];
  rating: number;
  missions: number;
  /** Missions completed this current month */
  missionsThisMonth?: number;
  verified: boolean;
  languages: string[];
  /** Multi-line bio for the profile page */
  bio?: string;
  /** 1-line tagline shown next to the name */
  tagline?: string;
  joinedYear?: number;
  reviews?: AgentReview[];
  /** Avg response time, free text e.g. "< 2h" */
  responseTime?: string;
}

export const agents: Agent[] = [
  {
    id: "1",
    slug: "li-wei",
    fullName: "Li Wei",
    city: "Yiwu",
    avatar: "https://i.pravatar.cc/300?img=12",
    banner:
      "https://images.unsplash.com/photo-1525338078858-d762b5e32f2c?w=1600&q=80&auto=format&fit=crop",
    specialties: ["Accessoires", "Maison", "Décoration"],
    rating: 4.9,
    missions: 142,
    missionsThisMonth: 18,
    verified: true,
    languages: ["fr", "zh", "en"],
    bio: "Basé à Yiwu (le plus grand hub mondial d'accessoires) depuis 12 ans. Je travaille avec un réseau de 40+ usines partenaires sur la maison, la déco et les petits objets. Spécialité : produits cadeau + DIY. Je parle un français correct (3 ans à Paris pour mes études).",
    tagline: "Maison & déco · 12 ans à Yiwu",
    joinedYear: 2022,
    responseTime: "< 1h",
    reviews: [
      {
        author: "Marie L.",
        authorCompany: "Maison Lila",
        rating: 5,
        text: "Li Wei a sourcé mes 5 collections de bougies. Toujours réactif, toujours juste sur le timing. Devis souvent 15-20% sous Alibaba.",
        date: "2026-03-12",
      },
      {
        author: "Théo V.",
        authorCompany: "Brûlé Studio",
        rating: 5,
        text: "Très bon contact humain. Il m'a fait économiser pas mal sur ma première prod en suggérant un fournisseur alternatif que je n'aurais jamais trouvé seul.",
        date: "2026-02-04",
      },
    ],
  },
  {
    id: "2",
    slug: "chen-mei",
    fullName: "Chen Mei",
    city: "Guangzhou",
    avatar: "https://i.pravatar.cc/300?img=47",
    banner:
      "https://images.unsplash.com/photo-1534126511673-b6899657816a?w=1600&q=80&auto=format&fit=crop",
    specialties: ["Textile", "Mode", "Cuir"],
    rating: 4.8,
    missions: 98,
    missionsThisMonth: 12,
    verified: true,
    languages: ["fr", "zh"],
    bio: "Spécialiste textile et mode depuis 8 ans à Guangzhou (capitale chinoise de la confection). Je connais personnellement les usines de Panyu et Foshan, surtout sur le coton premium et le cuir. Je gère les rushs sans drama et je trouve des solutions packaging custom à des prix corrects.",
    tagline: "Textile & mode · Guangzhou",
    joinedYear: 2022,
    responseTime: "< 2h",
    reviews: [
      {
        author: "Sophie R.",
        authorCompany: "Atelier Nord",
        rating: 5,
        text: "Chen Mei a géré une commande complexe de 5000 hoodies brodés. Zéro retour qualité. Vidéo QC nickel.",
        date: "2026-04-01",
      },
      {
        author: "Antoine M.",
        rating: 4,
        text: "Bonne agente. Le français est un peu hésitant mais très claire à l'écrit.",
        date: "2026-01-15",
      },
    ],
  },
  {
    id: "3",
    slug: "wang-jun",
    fullName: "Wang Jun",
    city: "Shenzhen",
    avatar: "https://i.pravatar.cc/300?img=33",
    banner:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop",
    specialties: ["Électronique", "Tech", "Gadgets"],
    rating: 5.0,
    missions: 211,
    missionsThisMonth: 24,
    verified: true,
    languages: ["fr", "zh", "en"],
    bio: "Ingénieur électronique de formation (BUT à Shenzhen), je travaille depuis 6 ans avec les usines de Shenzhen sur tout ce qui touche au tech : chargeurs, audio, IoT, gadgets connectés. Je sais lire un schéma électronique et négocier la BOM (bill of materials) ligne par ligne. Certifs CE/FCC/RoHS dans mes 10 doigts.",
    tagline: "Électronique & tech · Shenzhen",
    joinedYear: 2021,
    responseTime: "< 1h",
    reviews: [
      {
        author: "Romain B.",
        authorCompany: "Volt Studio",
        rating: 5,
        text: "Wang Jun est un game-changer. Je lance des produits tech et il pige TOUT direct. Les certifs sont nickel, ce qui me sauve des mois.",
        date: "2026-04-22",
      },
      {
        author: "Clara D.",
        authorCompany: "Boom Audio",
        rating: 5,
        text: "Le seul agent qui sait vraiment ce qu'est de l'ANC bien tuné. Highly recommended pour audio DTC.",
        date: "2026-03-30",
      },
    ],
  },
  {
    id: "4",
    slug: "zhang-lin",
    fullName: "Zhang Lin",
    city: "Shanghai",
    avatar: "https://i.pravatar.cc/300?img=23",
    banner:
      "https://images.unsplash.com/photo-1474401164065-555b1d671bf7?w=1600&q=80&auto=format&fit=crop",
    specialties: ["Beauté", "Cosmétique", "Bien-être"],
    rating: 4.9,
    missions: 76,
    missionsThisMonth: 9,
    verified: true,
    languages: ["fr", "zh", "en"],
    bio: "5 ans dans la cosmétique chinoise (avant ça, j'étais formulatrice). Mon spectre : skincare, soins corps, parfums. Je connais les labos certifiés CPNP pour l'export EU, et je gère les formulations custom (vegan, K-beauty, clean beauty). Mes clients sont surtout des marques DTC en lancement.",
    tagline: "Beauté & cosmétique · Shanghai",
    joinedYear: 2023,
    responseTime: "< 3h",
    reviews: [
      {
        author: "Élise M.",
        authorCompany: "Lune Beauty",
        rating: 5,
        text: "Zhang Lin m'a sourcé toute ma première gamme (crème, sérum, savon). Tous certifs CPNP en règle. Pas une seule galère.",
        date: "2026-04-18",
      },
    ],
  },
  {
    id: "5",
    slug: "liu-hao",
    fullName: "Liu Hao",
    city: "Ningbo",
    avatar: "https://i.pravatar.cc/300?img=68",
    banner:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1600&q=80&auto=format&fit=crop",
    specialties: ["Sport", "Outdoor", "Fitness"],
    rating: 4.7,
    missions: 64,
    missionsThisMonth: 7,
    verified: true,
    languages: ["fr", "zh"],
    bio: "Ningbo c'est LE hub du matos sport et outdoor en Chine. Je suis basé là depuis 7 ans et j'y connais tout : yoga, fitness, camping, vélo. Je trouve des matières premium (liège naturel, caoutchouc bio, inox alimentaire) et je négocie sec sur les volumes. Bonus : j'adore le trail.",
    tagline: "Sport & outdoor · Ningbo",
    joinedYear: 2022,
    responseTime: "< 4h",
    reviews: [
      {
        author: "Camille B.",
        authorCompany: "Yogi Origine",
        rating: 5,
        text: "Tapis yoga liège parfaits. Liu Hao a même négocié l'emballage jute qui faisait écho à ma marque éco.",
        date: "2026-03-08",
      },
    ],
  },
  {
    id: "6",
    slug: "xu-fang",
    fullName: "Xu Fang",
    city: "Yiwu",
    avatar: "https://i.pravatar.cc/300?img=45",
    banner:
      "https://images.unsplash.com/photo-1547043198-2b3ec77b3672?w=1600&q=80&auto=format&fit=crop",
    specialties: ["Jouets", "Enfants", "Bébé"],
    rating: 4.9,
    missions: 119,
    missionsThisMonth: 14,
    verified: true,
    languages: ["fr", "zh"],
    bio: "Mère de deux enfants moi-même, je suis tout particulièrement sensible à la sécurité des jouets et au respect des normes CE EN71. Je travaille uniquement avec des usines auditées REACH. Spécialités : peluches en coton bio, jouets éducatifs en bois, accessoires bébé.",
    tagline: "Jouets & bébé · Yiwu · maman & agente",
    joinedYear: 2023,
    responseTime: "< 2h",
    reviews: [
      {
        author: "Sarah K.",
        authorCompany: "Petit Nuage",
        rating: 5,
        text: "Xu Fang est ULTRA rigoureuse sur les certifs sécurité. Pour de la peluche enfant, c'est exactement ce qu'il me fallait.",
        date: "2026-04-10",
      },
    ],
  },
  {
    id: "7",
    slug: "zhao-qiang",
    fullName: "Zhao Qiang",
    city: "Guangzhou",
    avatar: "https://i.pravatar.cc/300?img=15",
    banner:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80&auto=format&fit=crop",
    specialties: ["Cuisine", "Ustensiles", "Électroménager"],
    rating: 4.8,
    missions: 87,
    missionsThisMonth: 10,
    verified: true,
    languages: ["fr", "zh", "en"],
    bio: "Ancien sommelier reconverti dans le sourcing (longue histoire), basé à Guangzhou depuis 9 ans. Mes catégories : ustensiles de cuisine premium, électroménager petit format, accessoires café/thé. Je sais quand un fournisseur survend ses spécifications acier — je vérifie tout en vidéo.",
    tagline: "Cuisine & ustensiles · Guangzhou",
    joinedYear: 2021,
    responseTime: "< 3h",
    reviews: [
      {
        author: "Nicolas T.",
        authorCompany: "Lame Atelier",
        rating: 5,
        text: "Zhao Qiang m'a trouvé une usine pour mes couteaux Damas avec un rapport qualité-prix dingue. Il a même fait le rapport vidéo de chaque sample.",
        date: "2026-02-28",
      },
    ],
  },
  {
    id: "8",
    slug: "huang-yan",
    fullName: "Huang Yan",
    city: "Shenzhen",
    avatar: "https://i.pravatar.cc/300?img=44",
    banner:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80&auto=format&fit=crop",
    specialties: ["Bijouterie", "Montres", "Luxe"],
    rating: 5.0,
    missions: 53,
    missionsThisMonth: 6,
    verified: true,
    languages: ["fr", "zh", "en"],
    bio: "Shenzhen est aussi un gros hub de bijouterie (notamment acier inox plaqué or). Je travaille avec des ateliers qui font du plaquage 18k réellement durable (3 microns min). Beaucoup de marques DTC françaises me confient leur première gamme.",
    tagline: "Bijouterie & montres · Shenzhen",
    joinedYear: 2023,
    responseTime: "< 2h",
    reviews: [
      {
        author: "Léa F.",
        authorCompany: "Loop Paris",
        rating: 5,
        text: "Huang Yan a sourcé toute ma première collection. Plaquage tient nickel (testé 6 mois avec sueur, mer, douche).",
        date: "2026-04-05",
      },
    ],
  },
];

export function agentBySlug(slug: string): Agent | undefined {
  return agents.find((a) => a.slug === slug);
}
