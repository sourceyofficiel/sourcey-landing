# 🗺️ Sourcey — Roadmap MVP 1-3 mois

> Plan de route pour passer de **landing actuelle** → **MVP qui génère du revenu réel**.
> Échelle : 12 semaines, 3 phases, focus revenu dès la S1.

## Principe directeur

**Le plus court chemin vers le revenu, c'est le B2B manuel.** Avant de construire un produit B2C complet (dashboard, Stripe, chat traduction, IA), on encaisse des deals Entreprise (gérés à la main en DMs/calls). Ça finance la suite et valide la demande.

---

## État actuel (S0) ✅

- [x] Landing `/` complète (13 sections, animations Magic UI)
- [x] Page `/entreprise` B2B avec formulaire de lead (8 champs)
- [x] API POST `/api/waitlist` + `/api/enterprise-leads` → SQLite local
- [x] Design system (palette `primary` bleu + `enterprise` violet)
- [x] Build clean, TypeScript strict
- [x] Tout en local, pas encore déployé

**Manque pour vendre :** déploiement public, vrais emails, accusé de réception sur les leads, page agents/about.

---

## Phase 1 — "Mettre en ligne et capter de vrais leads" (S1-S4)

**Objectif** : site en prod + premiers leads B2B encaissés. Pas encore de produit, mais une vraie machine à leads.

### S1 — Production-ready

- [ ] **Migration SQLite → Postgres** (Supabase ou Neon free tier)
  - Adapter `prisma/schema.prisma` au provider `postgresql`
  - Migrations propres
- [ ] **Resend + react-email**
  - Template "Lead reçu" (auto-reply au prospect)
  - Template "Nouveau lead" (vers ta boîte)
  - Template "Bienvenue waitlist"
- [ ] **Domaine + DNS**
  - Acheter `sourcey.fr` (10€/an)
  - DNS vers Vercel
- [ ] **Vercel deploy**
  - Connexion repo GitHub
  - Env vars (DATABASE_URL, RESEND_API_KEY)
  - Preview deployments sur PR
- [ ] **OG image 1200×630**
  - Mockup avec logo + tagline pour partages sociaux
- [ ] **Plausible Analytics** (free open-source, RGPD-friendly)

**KPI fin S1** : site live sur sourcey.fr, formulaire fonctionne avec email auto-reply, première campagne d'ads lançable.

### S2 — Pages publiques manquantes

- [ ] **`/agents`** — Annuaire public des 14 agents (cards détaillées, filtres par ville/spécialité)
- [ ] **`/agents/[slug]`** — Profil agent individuel (bio, missions, langues, note moyenne, CTA "Travailler avec lui")
- [ ] **`/pricing`** — Page tarifs détaillée (extraction de la section Pricing de la landing en page dédiée + comparatif détaillé + FAQ tarifs)
- [ ] **`/about`** — Mission, équipe (avec ton bio), positionnement
- [ ] **`/legal/terms`** + **`/legal/privacy`** + **`/legal/mentions`** — Pages légales (templates iubenda ou rédaction custom)
- [ ] **Cookie banner** RGPD (consent essentiel + analytics)

**KPI fin S2** : 8 pages publiques live, SEO de base (sitemap.xml, robots.txt, schema.org Organization).

### S3 — Capture & nurturing

- [ ] **Form B2C enrichi** sur landing (vs juste email)
  - Email + plateforme (Shopify/Woo/…) + volume cible
  - Sauvé dans `Waitlist` table
- [ ] **Sequence emails waitlist** (3 emails sur 7 jours)
  - J0 : Welcome + guide PDF "Comment auditer un fournisseur chinois en 10 min"
  - J3 : Cas client (storytelling)
  - J7 : "Tu veux essayer ? Réserve un call gratuit"
- [ ] **Calendly / Cal.com** intégré pour les calls B2B
  - Embed sur `/entreprise` après soumission du formulaire
  - Lien direct dans l'email auto-reply

### S4 — Premières ventes B2B (manuelles)

- [ ] **Tableau Notion / Airtable** pour gérer les leads à la main
  - Webhook Resend → Notion à chaque lead Entreprise
- [ ] **Process de qualif** : appel découverte 30min → devis Excel manuel → contrat → facturation Stripe Invoice (paiement à l'unité, pas encore d'abonnement)
- [ ] **3 premiers contrats Entreprise** signés (cible : 5-15k€/contrat)
- [ ] **Page `/blog`** (skeleton avec 2 articles SEO sur "Sourcer en Chine en 2026")

**KPI fin Phase 1** : 1 000 visites/mois, 30 leads B2B, **2-3 contrats Entreprise signés**, 5-15k€ encaissés.

---

## Phase 2 — "Produit MVP B2C" (S5-S8)

**Objectif** : permettre à un utilisateur de signup, payer un abonnement, et créer une demande de sourcing depuis son dashboard. Les agents répondent en interne (toi + 1-2 freelance).

### S5 — Auth + Dashboard squelette

- [ ] **NextAuth v5** (email + magic link + Google OAuth)
  - Provider email via Resend
  - Stockage user dans Postgres
- [ ] **Schéma DB complet** (depuis le brief section 8)
  - `profiles`, `agents`, `sourcing_requests`, `quotes`, `orders`, `messages`, `reviews`
  - Row Level Security si Supabase
- [ ] **Route protected `/app`**
  - Sidebar (navigation : Dashboard, Sourcing, Commandes, Inbox, Billing, Settings)
  - Header (search, notifs, avatar dropdown)
- [ ] **`/app` Dashboard overview**
  - 4 stat cards (demandes en cours, commandes, économies estimées, agents disponibles)
  - Activité récente
  - Quick actions

### S6 — Création de demande de sourcing

- [ ] **`/app/sourcing/new`**
  - Formulaire : titre, description, catégorie, quantité cible, prix vente cible, délai
  - Upload images (max 5)
  - **Optionnel pour cette phase** : matching agent par règles simples (par catégorie), pas d'IA encore
- [ ] **`/app/sourcing`**
  - Liste de tes demandes avec statut
- [ ] **`/app/sourcing/[id]`**
  - Détail de la demande
  - Section "Devis reçus" (vide au début)
  - Chat basique avec l'agent (juste texte + photos, pas de traduction temps réel encore)

### S7 — Stripe abonnements

- [ ] **Stripe Subscriptions** en mode live
  - 4 prix : `starter_monthly` (29€), `starter_yearly` (276€), `pro_monthly` (79€), `pro_yearly` (756€)
  - Stripe Customer Portal pour gestion auto (annulation, changement de carte)
- [ ] **Webhooks Stripe** (`/api/webhooks/stripe`)
  - `customer.subscription.created` → update `profiles.current_plan`
  - `customer.subscription.updated` / `.deleted`
  - `invoice.payment_failed` → email de relance
- [ ] **`/app/billing`**
  - Plan actuel + bouton "Changer de plan" → Stripe Portal
  - Historique factures
- [ ] **Paywall** sur la création de demande (Gratuit = 0 demandes, Starter = 3/mo, Pro = 15/mo)

### S8 — Onboarding utilisateur

- [ ] **Signup flow guidé**
  1. Email + magic link
  2. Quelques questions (entreprise, plateforme e-com, type de produits)
  3. Choix du plan (avec offre Starter 7 jours gratuit)
  4. Tutorial interactif : "Crée ta première demande de sourcing"
- [ ] **Emails Resend déclenchés**
  - Welcome avec accès direct + guide
  - Demande créée → notif user + notif admin
  - Devis disponible → notif user
  - Renouvellement réussi / échec

**KPI fin Phase 2** : 50 signups, 10 abonnés payants, **1-2k€ MRR**.

---

## Phase 3 — "Monétisation, opérations, scale" (S9-S12)

**Objectif** : automatiser la partie ops, ajouter les features qui retiennent les users (chat traduction, IA, QC vidéo), construire l'admin.

### S9 — Workflow commande end-to-end

- [ ] **Quote → Order → Payment**
  - Agent (toi ou freelance) crée un devis depuis `/admin`
  - User reçoit notif → voit le devis dans `/app/sourcing/[id]`
  - Bouton "Accepter le devis" → Stripe Checkout (paiement unique pour la commande)
  - Création automatique de `orders` avec `payment_status: escrow_held`
- [ ] **Tracking commande `/app/orders/[id]`**
  - Timeline (production / QC / shipped / delivered)
  - Photos + vidéo QC upload manual par l'agent
  - Bouton "Valider la réception" → libère le paiement de l'escrow

### S10 — Admin panel

- [ ] **`/admin`** (protected, role admin)
  - Dashboard MRR/ARR/churn (graphs simples avec Recharts ou Tremor)
  - Utilisateurs : liste + détail
  - Agents : CRUD complet
  - Demandes : toutes, avec filtres statut/agent
  - Commandes : toutes, avec actions (créer devis, valider QC, marquer expédié)
  - **`/admin/enterprise-leads`** : pipeline Kanban (New → Contacted → Demo → Won/Lost)
  - Export CSV de tout

### S11 — Features différenciantes

- [ ] **IA sourcing par image** (GPT-4 Vision)
  - Endpoint `/api/ai/analyze-image`
  - Sur `/app/sourcing/new` : upload image → suggestion catégorie + prix usine estimé + agent recommandé
  - Compteur d'usage par plan (Starter 5/mo, Pro illimité)
- [ ] **Traduction temps réel dans le chat** (GPT-4o-mini)
  - Toggle FR ↔ ZH dans `/app/sourcing/[id]`
  - Stockage `translated_content` jsonb dans `messages`
- [ ] **Génération de fiches produits IA** (Pro+)
  - Bouton "Générer fiche Shopify" depuis une commande livrée
  - Titre SEO + description + tags + variantes

### S12 — Polish & growth

- [ ] **Intégration Shopify** (OAuth)
  - Push produit sourcé → ton store en 1 clic
- [ ] **Communauté Discord** (gratuit pour tous, perks pour payants)
- [ ] **Programme d'affiliation** simple (lien de parrainage → 20% de commission sur le 1er paiement)
- [ ] **A/B test landing** (toggle visuels, copy CTAs) via Vercel A/B ou middleware custom
- [ ] **Mobile audit** complet + corrections
- [ ] **Lighthouse 95+** sur toutes les pages publiques

**KPI fin Phase 3** : 200 users actifs, **50 abonnés payants**, **5-8k€ MRR**, 5-8 contrats Entreprise actifs (10-20k€ additionnels).

---

## Anti-objectifs (à NE PAS faire en 3 mois)

❌ App mobile native
❌ Marketplace ouverte (laisser des agents tiers s'inscrire en self-serve)
❌ IA de matching ultra-avancée (les règles simples suffisent au début)
❌ Multi-langues (FR only, l'anglais c'est V2)
❌ Refonte du design system (il marche, on ne touche pas)
❌ Migration vers un autre framework

---

## Variantes selon ton budget temps

### 🚀 Mode "1 mois" — Lean validation
Phase 1 uniquement. Tu finis la S1-S4. Tu mesures : est-ce que les ads B2B convertissent ? Sans ces 3-5 leads/semaine, c'est pas la peine de construire le produit.

### 🏗️ Mode "2 mois" — Produit minimum vendable
Phase 1 + Phase 2. À la fin, tu as un produit que des e-commerçants français paient en abonnement. Le revenu Entreprise + Pro suffit à se payer à mi-temps.

### 🎯 Mode "3 mois" — MVP complet du brief
Phase 1 + 2 + 3. Tu as la totale : produit B2C automatisé, opérations centralisées dans l'admin, features IA, prêt pour une seed dans 6 mois.

---

## Stack final cible (post-3-mois)

| Domaine | Outil |
|---|---|
| Front | Next.js 14 + TS + Tailwind + shadcn + motion |
| Auth | NextAuth v5 (email + Google) |
| DB | Postgres (Supabase ou Neon) |
| Paiement | Stripe (Subscriptions + Checkout one-shot) |
| Email transactionnel | Resend + react-email |
| AI | OpenAI (GPT-4o + Vision) |
| Hosting | Vercel |
| Analytics | Plausible |
| Erreurs | Sentry free tier |
| Status page | Better Stack / Instatus |

---

## Métriques nord à viser

| Horizon | Visiteurs/mois | Leads B2B | Abonnés payants | MRR | Revenu Entreprise additionnel |
|---|---|---|---|---|---|
| Fin S4 | 1 000 | 30 | 0 | 0€ | 5-15k€ one-shot |
| Fin S8 | 5 000 | 80 | 15 | 1-2k€ | 10-30k€ |
| Fin S12 | 15 000 | 150 | 50 | 5-8k€ | 30-60k€ |
| Mois 6 | 30 000 | 300 | 150 | 12k€ | 60-100k€ |
| Mois 9 | 50 000 | 500 | 250 | **20k€** | 100-200k€ |

Objectif du brief = 10k€ MRR à 9 mois. Mon plan vise plus haut pour avoir de la marge.

---

## Prochaine action concrète

**Cette semaine** :
1. Acheter `sourcey.fr`
2. Créer un compte Supabase + Resend + Vercel
3. Me dire : "OK on attaque la S1, migre vers Postgres + Resend + Vercel"

Et j'enchaîne.
