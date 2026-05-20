# 🚀 Déploiement Sourcey sur Vercel

Stack de production : **Vercel** (hébergement Next.js) + **Neon** (Postgres) + **sourcey.fr** (domaine custom).

Coût total : ~10€/an (juste le renouvellement du domaine).

---

## 📋 Étape 1 — Setup Neon (Postgres serverless)

1. Aller sur https://neon.tech et créer un compte (login GitHub recommandé).
2. Cliquer **"Create a project"** :
   - **Project name** : `sourcey`
   - **Postgres version** : 16 (default)
   - **Region** : `Europe (Frankfurt)` ou `Europe (Paris)` — le plus proche de tes clients FR.
3. Une fois le projet créé, copier la **Connection string** (commence par `postgresql://`).
   - Format : `postgresql://USER:PASSWORD@HOST.neon.tech/sourcey?sslmode=require`
   - Garder cette string secrète, elle sert pour Vercel.
4. (Optionnel) Créer une **branche `dev`** pour le développement local. Settings → Branches → Create branch. Tu auras une 2e connection string pour ton `.env` local.

---

## 📋 Étape 2 — Push le code sur GitHub

```bash
cd C:\Users\FlowUP\Desktop\sourcia

# Vérifier le statut
git status

# Si pas encore initialisé :
git init
git add .
git commit -m "Initial Sourcey landing v2"

# Créer un repo sur github.com (nom suggéré : "sourcey-landing"), puis :
git branch -M main
git remote add origin https://github.com/[TON-USER]/sourcey-landing.git
git push -u origin main
```

⚠️ **AVANT le commit**, vérifier que `.gitignore` contient bien :

```
node_modules/
.next/
.env
.env.local
prisma/dev.db
```

---

## 📋 Étape 3 — Migrer le schema Postgres (1er run uniquement)

En local, sur la branche `dev` de Neon :

```bash
# Mettre la URL Neon dev dans .env :
# DATABASE_URL="postgresql://...neon.tech/sourcey?sslmode=require"

# Pousser le schema (crée toutes les tables)
npx prisma db push

# (Optionnel) Seed les données de démo
npm run db:seed
```

Si tu veux aussi peupler la prod Neon : refais `prisma db push` après avoir mis la URL prod dans `.env`.

---

## 📋 Étape 4 — Déployer sur Vercel

1. Aller sur https://vercel.com et créer un compte (login GitHub).
2. Cliquer **"Add New… → Project"**.
3. Sélectionner ton repo `sourcey-landing` → **"Import"**.
4. **Framework Preset** : Next.js (auto-détecté).
5. **Environment Variables** — copier-coller depuis ton `.env` local :

   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | Connection string Neon **prod** |
   | `NEXT_PUBLIC_SITE_URL` | `https://sourcey.fr` |
   | `NEXTAUTH_SECRET` | Générer avec `openssl rand -base64 32` |

   Les autres (OPENAI, RESEND, STRIPE, etc.) → laisser vide pour l'instant, l'app tournera en mode mocked.

6. Cliquer **"Deploy"** — premier build ~2-3 min.
7. Tu obtiens une URL : `sourcey-landing-xxx.vercel.app` → vérifier que tout marche, surtout `/v2`.

---

## 📋 Étape 5 — Domaine sourcey.fr

Tu as déjà acheté le domaine ✅. Maintenant on le connecte à Vercel.

1. Dans Vercel → ton projet → **Settings → Domains**.
2. **"Add"** → taper `sourcey.fr` → continue.
3. Vercel te donne 2 records DNS à configurer :
   - Soit `A record` pointant vers `76.76.21.21`
   - Soit `CNAME` pointant vers `cname.vercel-dns.com`
4. Aller chez ton registrar (OVH, Namecheap, Gandi…) → DNS de `sourcey.fr` → ajouter les records donnés par Vercel.
5. **Attendre 5 min à 2h** la propagation DNS.
6. Une fois propagé, Vercel génère automatiquement le **certificat SSL Let's Encrypt** → `https://sourcey.fr` actif.

### (Optionnel) Ajouter `www.sourcey.fr`

- Dans Vercel Domains, ajouter aussi `www.sourcey.fr` avec un CNAME vers `sourcey.fr`.

---

## 🔄 Workflow d'itération (après le premier déploiement)

Maintenant que c'est en ligne, voici comment redéployer après des modifications locales :

```bash
# 1. Modifier le code en local (avec Claude Code)
# 2. Tester en local :
npm run dev

# 3. Commit + push sur main :
git add .
git commit -m "feat: amélioration du hero / fix du footer / etc."
git push origin main

# 4. Vercel détecte le push et redéploie automatiquement (1-2 min)
# 5. Live sur sourcey.fr ⚡
```

### Migrations de schema Prisma

Si tu modifies `prisma/schema.prisma` (ajout de table/colonne) :

```bash
# Local — appliquer sur la DB dev
npx prisma db push

# Prod — Vercel exécute le `postinstall` (prisma generate) à chaque build,
# mais NE PUSH PAS le schema sur la DB prod automatiquement.
# Pour pousser sur la prod, lance localement :
DATABASE_URL="<URL_PROD_NEON>" npx prisma db push
```

⚠️ **Toujours tester sur la branche dev de Neon avant de push sur prod.**

---

## 🔍 Checklist avant chaque déploiement

- [ ] `npm run build` passe sans erreur en local
- [ ] Pas de `console.log` oublié dans le code
- [ ] Les images sont dans `/public` (pas en local-only)
- [ ] `.env.local` n'est PAS commité (vérifier `.gitignore`)
- [ ] Les variables Vercel sont à jour si tu en as ajouté

---

## 🆘 Troubleshooting

### "Module not found: @prisma/client" sur Vercel
- Vérifier que `postinstall: prisma generate` est dans `package.json` ✓ (déjà fait)
- Redéployer en cliquant "Redeploy" sur Vercel

### "Can't reach database server"
- Vérifier la `DATABASE_URL` dans Vercel → Settings → Environment Variables
- Vérifier que Neon n'est pas en "suspended" (free tier hibernate après inactivité, se réveille en 1-2 sec)

### Build échoue avec "Type error: …"
- TypeScript strict en prod, lance `npm run build` local pour reproduire et fixer

### SVG/Images cassées
- Vérifier `next.config.mjs` → `images.remotePatterns` contient bien les domaines utilisés

---

## 📊 Monitoring

- **Vercel Analytics** : gratuit, activable dans Settings → Analytics
- **Plausible / Umami** : tracking respect-vie-privée, env var `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- **Sentry** : tracking erreurs en prod (à ajouter plus tard si besoin)

---

## 🎯 État actuel — V2 prête pour le déploiement

✅ Prisma migré de SQLite vers Postgres  
✅ Script `postinstall: prisma generate` ajouté  
✅ `build` inclut `prisma generate`  
✅ `.env.example` cleané pour Postgres only  
✅ next.config.mjs OK (images remote + SVG allowed)  
✅ Landing V2 complète sur `/v2` (Hero + Solution + Features + WhoFor + Testimonials + Pricing + FAQ + FinalCTA + Footer)

**URL prévue après déploiement** : `https://sourcey.fr/v2`

Pour rediriger `/` vers `/v2` automatiquement (quand tu seras prêt) : décommenter le bloc `redirects` que je peux ajouter dans `next.config.mjs` sur demande.
