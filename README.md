# Creator Agency

Plateforme interne de gestion d'influenceurs et de prospection pour les marques e-commerce.
Look extérieur d'agence ; usage strictement interne (admin + prospecteurs sur invitation).

**Stack** : Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (Postgres + Auth + RLS)
· Claude Sonnet (analyse IA) · Apify (scraping TikTok/Instagram) · Vercel.

---

## Démarrage local

### 1. Setup Supabase

1. Crée un projet sur [supabase.com](https://supabase.com) (région EU recommandée).
2. **SQL Editor** → New query → colle tout le contenu de [`supabase/schema.sql`](./supabase/schema.sql)
   → Run. Toutes les tables + RLS + le trigger `handle_new_user` sont créés.
3. **Authentication → Providers → Email** :
   - Active "Enable email provider"
   - Active "Enable magic link"
   - **Désactive "Enable email signups"** (invite-only)
4. **Authentication → URL Configuration** → ajoute `http://localhost:3000/auth/callback`
   dans "Redirect URLs".
5. **Authentication → Users → Add user** → crée ton compte admin avec ton email.
6. **Table Editor → profiles** → mets `role = 'admin'` sur ta ligne.

### 2. Variables d'environnement

```bash
cp .env.local.example .env.local
```

Remplis les 5 variables :
- `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` → idem (à garder secret)
- `ANTHROPIC_API_KEY` → console.anthropic.com → API Keys
- `APIFY_API_TOKEN` → console.apify.com → Settings → Integrations
- `NEXT_PUBLIC_APP_URL` → `http://localhost:3000` en dev

### 3. Run

```bash
npm run dev
```

Ouvre `http://localhost:3000`. Tu seras redirigé vers `/login`. Entre l'email de
ton compte admin → tu reçois un magic link → clique → tu atterris sur `/app`.

---

## Architecture

### Routes

```
PUBLIC
├─ /                          redirect /app ou /login selon auth
├─ /login                     magic link Supabase
└─ /invite/[token]            accepter une invitation

APP (auth requise via middleware)
├─ /app                       dashboard
├─ /app/influencers           liste + filtres
│  ├─ /new                    ajout (URL → AI analyse)
│  └─ /[id]                   fiche + onglets
├─ /app/pipeline              Kanban
│  └─ /[id]                   détail prospection
├─ /app/campaigns             liste / new / detail
├─ /app/brands                multi-marques (admin)
├─ /app/templates             modèles de messages
├─ /app/leaderboard           classement 30j
├─ /app/team                  équipe + invitations (admin)
└─ /app/settings              profil perso

API
├─ POST  /api/influencers/[id]/analyze   IA scoring
├─ POST  /api/prospections/[id]/messages log message
├─ POST  /api/invitations                créer invitation
└─ POST  /api/ai/draft-message           rédige msg perso
```

### Modèles DB

10 tables : `profiles`, `brands`, `influencers`, `campaigns`, `prospections`,
`prospection_messages`, `message_templates`, `ai_analyses`, `invitations`,
`activity_log` + vue `leaderboard_30d`.

RLS strict : un prospecteur voit ses prospections + tous les influenceurs
en lecture/écriture. Les admins voient tout.

### Sécurité

- Auth via Supabase magic link (zéro mot de passe)
- `shouldCreateUser: false` côté client : seuls les emails déjà invités peuvent
  se connecter
- Middleware refresh la session à chaque requête et protège `/app/*`
- Rôles `admin` / `prospector` cloisonnés via RLS PostgreSQL

---

## Itérations à venir

L'app est livrée avec :
- ✅ Auth magic link + middleware
- ✅ Layout sidebar/topbar dark mode
- ✅ Schéma DB complet + RLS + trigger
- ✅ Page Dashboard avec stats live
- ⏳ CRUD influenceurs (next)
- ⏳ Analyse IA Claude + Apify scraping
- ⏳ Kanban prospections
- ⏳ Pages campagnes / templates / leaderboard / team
- ⏳ Système d'invitation par email

On itère feature par feature.

---

## Déploiement Vercel

```bash
vercel
```

Pense à reporter les 5 env vars dans Vercel → Settings → Environment Variables,
et à ajouter ton domaine de prod dans Supabase → Auth → URL Configuration
(`https://ton-domaine.com/auth/callback`).
