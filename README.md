# Sourcey

SaaS B2B/B2C de sourcing francophone depuis la Chine. Cette version contient la **landing page complète** (`/`) avec toutes les sections, animations, et le formulaire waitlist branché sur SQLite local.

## Stack

- **Next.js 14** App Router + TypeScript strict
- **Tailwind CSS 3.4** + design system custom (palette `primary`, `enterprise`)
- **shadcn/ui style** (Radix Accordion, Tabs, Slot)
- **Framer Motion** pour toutes les animations
- **Lenis** pour smooth scroll
- **Prisma 5** + **SQLite** (waitlist + enterprise_leads)

Tout le reste est mocké : pas de Supabase, pas de Stripe, pas d'OpenAI, pas de Resend pour cette version.

## Démarrer

```bash
npm install
npx prisma db push
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

> **Quirk Windows / Claude Code :** si tu lances depuis un shell Claude Code, fais `$env:ANTHROPIC_API_KEY=$null` avant `npm run dev` pour éviter que des libs réagissent à la clé vide injectée.

## Structure de la landing

1. **Navigation** sticky avec backdrop-blur, mobile hamburger
2. **Hero** : reveal mot-par-mot, mockup dashboard, 3 floating badges
3. **Comment ça marche** : timeline horizontale Usine → Agent → Toi
4. **Trust strip** : marquee logos Shopify/Woo/Prestashop/Amazon/…
5. **Pour qui ?** : 2 cards B2C (bleu) + Entreprise (violet)
6. **Stats** : 3 cards avec count-up sur entrée viewport
7. **Features tabs** : 4 onglets animés (Agents / IA / QC / Logistique)
8. **Comparaison** : tableau Sourcey vs CJ vs Spocket vs Alibaba vs freelance
9. **Galerie agents** : scroll horizontal 8 cards
10. **Témoignages** : 3 cards avec étoiles + résultat chiffré
11. **Pricing** : toggle B2C / Entreprise + Mensuel / Annuel animés
12. **FAQ** : accordion 8 questions
13. **Final CTA** : bloc bleu avec form waitlist (POST `/api/waitlist`)
14. **Footer** dark 6 colonnes

## Scripts

```bash
npm run dev          # dev server
npm run build        # build production
npm run db:push      # sync schema vers SQLite
npm run db:seed      # un email de démo
npm run db:reset     # reset + seed
```

## Prochaines étapes

- Page `/entreprise` dédiée + formulaire leads B2B
- Auth (signup, login)
- Dashboard utilisateur
- Sourcing IA par image
- Chat avec traduction
- Admin panel
