/**
 * Génération de tickets de démo réalistes pour un workspace.
 *
 * Utilisé par /api/autosav/admin/seed pour créer 15 tickets avec drafts IA
 * pré-écrits — permet de tester le dashboard sans avoir branché IMAP/Gmail.
 *
 * Les tickets sont supprimables via /api/autosav/admin/clear-tickets.
 */

import { prisma } from "@/lib/db";
import crypto from "node:crypto";

interface SeedTicket {
  customerName: string;
  customerEmail: string;
  subject: string;
  body: string;
  category: "order" | "return" | "shipping" | "complaint" | "general";
  priority: "low" | "medium" | "high";
  // Contexte commande optionnel
  orderId?: string;
  orderStatus?: string;
  orderEta?: string;
  orderTracking?: string;
  // Draft IA pré-rédigé (réaliste, contextualisé)
  aiDraft?: string;
  // Statut initial
  status?: "pending" | "drafted" | "sent" | "resolved" | "spam";
  unread?: boolean;
  starred?: boolean;
  // Décalage temporel (minutes dans le passé)
  minutesAgo: number;
}

const SEED_DATA: SeedTicket[] = [
  {
    customerName: "Marie Dupont",
    customerEmail: "marie.dupont@gmail.com",
    subject: "Où est ma commande ?? Je m'impatiente",
    body: `Bonjour,

Cela fait 5 jours que j'ai passé ma commande #12847 et je n'ai toujours aucun mail de tracking ! C'est pour un anniversaire ce week-end, je commence vraiment à m'inquiéter.

Pouvez-vous me dire où elle en est ?

Cordialement,
Marie`,
    category: "order",
    priority: "high",
    orderId: "#12847",
    orderStatus: "En transit",
    orderEta: "Demain entre 10h-13h",
    orderTracking: "8R12345678901",
    aiDraft: `Bonjour Marie,

Merci pour votre message, et désolés pour l'inquiétude concernant cet anniversaire ! 🎂

Bonne nouvelle : votre commande #12847 est bien partie. Le suivi Colissimo indique qu'elle est en transit et sera livrée demain entre 10h et 13h.

Voici votre numéro de suivi : 8R12345678901

Belle journée 🌿
L'équipe`,
    status: "drafted",
    unread: true,
    minutesAgo: 2,
  },
  {
    customerName: "Thomas Leroy",
    customerEmail: "thomas.l@outlook.fr",
    subject: "Demande de retour — taille incorrecte",
    body: `Bonjour,

Je voudrais retourner le t-shirt commandé (commande #12831), la taille M me va pas du tout, c'est beaucoup trop grand. Je voudrais soit un L échangé soit un remboursement.

Comment je fais pour le retour ?

Merci d'avance,
Thomas`,
    category: "return",
    priority: "medium",
    orderId: "#12831",
    aiDraft: `Bonjour Thomas,

Pas de souci pour le retour ! Voici comment procéder en 3 étapes :

1. Rends-toi sur autosav.io/retours et entre ton n° de commande #12831
2. Choisis "Échange de taille" et sélectionne le L
3. Tu reçois un bon de retour Mondial Relay gratuit par email

Tu as 14 jours pour déposer le colis. Une fois reçu, on t'envoie le L sous 48h.

Belle journée 🌿
L'équipe`,
    status: "drafted",
    unread: true,
    minutesAgo: 7,
  },
  {
    customerName: "Sophie Klein",
    customerEmail: "sophie@maboutique.fr",
    subject: "Livraison avant le 24 décembre ?",
    body: `Bonjour !

Je voudrais offrir l'un de vos produits pour Noël. Si je commande aujourd'hui (22/12), est-ce que je peux être livrée avant le 24 décembre ? J'habite à Lyon.

Merci beaucoup pour votre réponse rapide,
Sophie`,
    category: "shipping",
    priority: "high",
    aiDraft: `Bonjour Sophie,

Excellente question ! Pour une commande passée aujourd'hui avec livraison à Lyon, nous avons 2 options :

✓ Colissimo Express (avant 13h aujourd'hui) : livraison le 23/12 — 9,90 €
✓ Chronopost (avant 16h aujourd'hui) : livraison le 23/12 garantie — 14,90 €

Le standard ne sera pas livré à temps malheureusement.

Veux-tu que je te réserve un panier avec l'option Express ?

Joyeuses fêtes 🌿`,
    status: "drafted",
    starred: true,
    unread: true,
    minutesAgo: 12,
  },
  {
    customerName: "Lucas Renard",
    customerEmail: "l.renard@free.fr",
    subject: "Colis 'livré' mais pas reçu",
    body: `Bonjour,

Mon colis commande #12798 indique "livré" sur Colissimo depuis hier 14h32 mais je n'ai rien reçu chez moi.

J'ai vérifié dans la boîte aux lettres, chez les voisins, au point relais le plus proche : rien.

Pouvez-vous m'aider ?

Lucas`,
    category: "complaint",
    priority: "high",
    orderId: "#12798",
    orderStatus: "Livré (réclamation)",
    orderTracking: "8R98765432109",
    status: "pending",
    minutesAgo: 18,
  },
  {
    customerName: "Camille Bonnet",
    customerEmail: "camille.b@hotmail.fr",
    subject: "Quelle matière pour le sweat oversized ?",
    body: `Bonjour,

Je voulais savoir quelle est la composition exacte du sweat oversized, j'ai une peau sensible et je voudrais être sûre avant de commander.

Merci !
Camille`,
    category: "general",
    priority: "low",
    aiDraft: `Bonjour Camille,

Bonne question ! Notre sweat oversized est en :

• 92% coton bio certifié GOTS
• 8% élasthanne pour le confort

Il est certifié Oeko-Tex (sans substances nocives pour la peau). Si tu as des sensibilités, on recommande de le laver à 30° avant la première utilisation.

N'hésite pas si tu as d'autres questions !

Belle journée 🌿
L'équipe`,
    status: "drafted",
    minutesAgo: 45,
  },
  {
    customerName: "Julien Martin",
    customerEmail: "j.martin@orange.fr",
    subject: "Code promo qui ne marche pas",
    body: `Hello,

Le code BIENVENUE10 ne fonctionne pas au moment du paiement. C'est normal ?

Julien`,
    category: "general",
    priority: "medium",
    status: "pending",
    minutesAgo: 120,
  },
  {
    customerName: "Marie Dupont", // Same customer that had #12847 — for customer history
    customerEmail: "marie.dupont@gmail.com",
    subject: "Merci pour la livraison rapide !",
    body: `Bonjour,

Je voulais vous remercier pour la livraison super rapide de ma commande #12810. La qualité est top, je recommande !

Marie`,
    category: "general",
    priority: "low",
    orderId: "#12810",
    status: "resolved",
    minutesAgo: 60 * 24 * 14, // 14 days ago
  },
  {
    customerName: "Antoine Picard",
    customerEmail: "a.picard@gmail.com",
    subject: "Question sur la disponibilité",
    body: `Bonjour,

Le pull col roulé bleu nuit en taille L est-il en cours de réassort ? Cela fait 3 semaines qu'il est en rupture.

Merci !
Antoine`,
    category: "general",
    priority: "low",
    aiDraft: `Bonjour Antoine,

Merci pour ton message ! Le pull col roulé bleu nuit taille L sera de retour en stock courant de la semaine prochaine (réception le 28/01 confirmée).

Tu veux que je te mette en liste d'attente ? Tu recevras un email dès qu'il sera disponible, en avant-première avant la mise en ligne publique.

Belle journée 🌿
L'équipe`,
    status: "drafted",
    minutesAgo: 60 * 4,
  },
  {
    customerName: "Léa Martinez",
    customerEmail: "lea.m@yahoo.fr",
    subject: "Demande de facture",
    body: `Bonjour,

Pouvez-vous m'envoyer la facture de ma commande #12856 ? J'en ai besoin pour ma compta.

Merci d'avance,
Léa`,
    category: "general",
    priority: "low",
    orderId: "#12856",
    status: "sent",
    unread: false,
    minutesAgo: 60 * 8,
  },
  {
    customerName: "Pierre Lambert",
    customerEmail: "pierre.lambert@protonmail.com",
    subject: "Réclamation produit endommagé",
    body: `Bonjour,

J'ai reçu hier ma commande #12834 et malheureusement le mug est arrivé cassé. La boîte était aussi un peu abîmée.

Photos en pièce jointe.

Je voudrais un remboursement ou un échange.

Cordialement,
Pierre`,
    category: "complaint",
    priority: "high",
    orderId: "#12834",
    status: "pending",
    starred: true,
    minutesAgo: 60 * 3,
  },
  {
    customerName: "Sarah Klein",
    customerEmail: "s.klein@gmail.com",
    subject: "Modifier adresse de livraison",
    body: `Bonjour,

Je viens de passer ma commande #12891 mais je me suis trompée dans l'adresse de livraison. Pouvez-vous la modifier ?

Nouvelle adresse : 42 rue Voltaire, 75011 Paris

Merci !
Sarah`,
    category: "shipping",
    priority: "high",
    orderId: "#12891",
    status: "pending",
    minutesAgo: 30,
  },
  {
    customerName: "David Cohen",
    customerEmail: "d.cohen@free.fr",
    subject: "Spam — Offre incroyable!!!",
    body: `OFFRE EXCLUSIVE!!! Devenez riche en 5 jours avec notre méthode révolutionnaire...`,
    category: "general",
    priority: "low",
    status: "spam",
    minutesAgo: 60 * 6,
  },
  {
    customerName: "Émilie Roux",
    customerEmail: "emilie.roux@laposte.net",
    subject: "Programme fidélité",
    body: `Bonjour,

Comment est-ce que je peux accéder à votre programme fidélité ? J'ai déjà commandé 3 fois chez vous.

Émilie`,
    category: "general",
    priority: "low",
    status: "pending",
    minutesAgo: 60 * 16,
  },
  {
    customerName: "Nicolas Bertrand",
    customerEmail: "nicolas.b@outlook.fr",
    subject: "Suivi colis bloqué depuis 4 jours",
    body: `Bonjour,

Mon colis #12767 est bloqué au centre de tri Vénissieux depuis 4 jours selon Colissimo. C'est normal ?

Nicolas`,
    category: "order",
    priority: "high",
    orderId: "#12767",
    orderStatus: "Bloqué au centre de tri",
    orderTracking: "8R55512345678",
    status: "pending",
    minutesAgo: 90,
  },
  {
    customerName: "Inès Maréchal",
    customerEmail: "ines.m@gmail.com",
    subject: "Annulation de commande",
    body: `Bonjour,

Je voudrais annuler ma commande #12903 passée il y a 30 minutes, je me suis trompée d'article.

Est-ce possible ?

Inès`,
    category: "return",
    priority: "high",
    orderId: "#12903",
    status: "pending",
    minutesAgo: 5,
  },
];

const AVATAR_GRADIENTS = [
  "from-pink-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-indigo-400 to-purple-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-blue-500",
  "from-rose-400 to-pink-500",
  "from-yellow-400 to-amber-500",
];

/**
 * Génère des tickets de démo pour un workspace. Skip ceux dont
 * externalId existe déjà (idempotent).
 */
export async function seedDemoTickets(workspaceId: string) {
  let created = 0;
  let skipped = 0;

  for (const t of SEED_DATA) {
    // ExternalId déterministe à partir du sujet (idempotent)
    const externalId = `seed-${crypto
      .createHash("sha256")
      .update(`${workspaceId}:${t.subject}:${t.customerEmail}:${t.minutesAgo}`)
      .digest("hex")
      .slice(0, 16)}`;

    const existing = await prisma.autosavTicket.findUnique({
      where: { workspaceId_externalId: { workspaceId, externalId } },
    });
    if (existing) {
      skipped++;
      continue;
    }

    const receivedAt = new Date(Date.now() - t.minutesAgo * 60 * 1000);

    const ticket = await prisma.autosavTicket.create({
      data: {
        workspaceId,
        externalId,
        channel: "email",
        customerEmail: t.customerEmail,
        customerName: t.customerName,
        subject: t.subject,
        body: t.body,
        status: t.status ?? "pending",
        priority: t.priority,
        category: t.category,
        starred: t.starred ?? false,
        unread: t.unread ?? true,
        detectedOrderId: t.orderId,
        orderStatus: t.orderStatus,
        orderEta: t.orderEta,
        orderTracking: t.orderTracking,
        receivedAt,
        resolvedAt: t.status === "resolved" ? new Date(receivedAt.getTime() + 3600 * 1000) : null,
      },
    });

    // Crée la TicketReply IA si draft fourni
    if (t.aiDraft) {
      await prisma.autosavTicketReply.create({
        data: {
          ticketId: ticket.id,
          draftedBy: "ai",
          sentBody: t.aiDraft,
          aiModel: "claude-3-5-sonnet-20241022",
          inputTokens: 250 + Math.floor(Math.random() * 200),
          outputTokens: 80 + Math.floor(Math.random() * 100),
          costCents: 1,
          isMetered: false,
        },
      });
    }

    created++;
  }

  return { created, skipped, total: SEED_DATA.length };
}

/**
 * Helpers pour déterminer la couleur d'avatar à partir d'un email
 * (déterministe, même couleur pour le même client).
 */
export function getAvatarGradient(email: string): string {
  const hash = crypto.createHash("sha256").update(email).digest();
  return AVATAR_GRADIENTS[hash[0] % AVATAR_GRADIENTS.length];
}

export function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

/**
 * Reset complet : supprime tous les tickets seed du workspace (utile pour
 * recommencer avec data fraîche).
 */
export async function clearSeedTickets(workspaceId: string) {
  const result = await prisma.autosavTicket.deleteMany({
    where: {
      workspaceId,
      externalId: { startsWith: "seed-" },
    },
  });
  return { deleted: result.count };
}
