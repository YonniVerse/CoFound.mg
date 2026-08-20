# Changelog — CoFound.mg

Journal des décisions et des livrables. Le plus récent en haut.

Format : `## AAAA-MM-JJ — Titre` puis les rubriques utiles parmi **Décidé · Ajouté · Modifié ·
Retiré · En cours · Bloqué**.

> Ce fichier retrace **l'historique**. L'état courant est dans `NEXT_SESSION.md`.
> Mis à jour par la commande `/handoff`.

---

## 2026-08-20 — Restructuration en monorepo pnpm (F-01)

### Ajouté

- Workspace pnpm : `apps/web`, `apps/api` (vide), `packages/shared`
- `tsconfig.base.json` — options TypeScript communes, avec `strict` et
  `noUncheckedIndexedAccess` activés
- `packages/shared` — énumérations du domaine et invariants produit
  (`MIN_AGGREGATION_THRESHOLD`, durées de jetons, limites anti-démarchage). Les schémas
  Zod viennent au ticket `F-11`.
- `.gitignore` et `.nvmrc` à la racine

### Modifié

- `frontend/` déplacé en `apps/web/` par `git mv` — historique préservé
- Passage de npm à pnpm : `package-lock.json` supprimé, `pnpm-lock.yaml` généré
- `@cofound/web` déclare `@cofound/shared` en `workspace:*` — le lien est vérifié
- Port du serveur de développement web : 3000 → **5173**, pour libérer 3000 pour l'API
- `vite.config.ts` : `__dirname` remplacé par `import.meta.url`, dont Vite annonce la
  dépréciation

### Corrigé

- 14 erreurs de typage révélées par l'activation de `strict` :
  - 6 symboles inutilisés — préexistantes, le build du dépôt était déjà rouge
  - 8 accès indexés non vérifiés (`SectionHero`, `SectionTestimonials`, `Avatar`),
    corrigés par des tuples `as const` et une valeur de repli plutôt que par des
    assertions de non-nullité
- `useProjectDetail` : l'état d'erreur et de chargement est désormais **dérivé au rendu**
  au lieu d'être synchronisé dans un effet, ce qui supprime les rendus en cascade
- ESLint aligné sur TypeScript : les identifiants préfixés par `_` sont ignorés — les deux
  outils se contredisaient
- `react-refresh/only-export-components` désactivée sur `src/components/ui/**`, format
  généré par shadcn qu'on ne modifie pas à la main

### Constaté, non traité

- Le bundle pèse **959 Ko (293 Ko gzip)** contre un budget de 200 Ko fixé dans
  l'architecture. Aucun découpage de code, `recharts` et `framer-motion` chargés d'emblée.
  Ticket `S-10`.
- Le projet Vercel pointe toujours sur `frontend/` : son répertoire racine doit passer à
  `apps/web`.

---

## 2026-08-20 — Cadrage complet du projet

### Décidé

- **D1 — Aucune inscription publique.** Les comptes étudiants sont provisionnés par import
  CSV/XLSX de l'établissement ; les organisations entrent par demande validée manuellement.
  *Écart majeur avec le cahier des charges initial, qui prévoyait une inscription filtrée par
  liste blanche.*
- **D2 — Les établissements ne paient pas.** 100 % du revenu vient des partenaires.
  *Retournement du modèle du cahier des charges (« plateforme vendue aux institutions »).*
  Conséquence : le côté partenaire entre dans le MVP.
- **D3 — Découplage Personne / Organisation / Affiliation** avec capacités activables, en
  remplacement des 7 rôles plats du cahier des charges.
- **D4 — Seuls les établissements certifient.** Associations et clubs : affiliation
  déclarative.
- **D5 — Aucun flux monétaire sur la plateforme**, même après partenariat opérateur. On
  modélise l'engagement ; le règlement va directement au bénéficiaire. *Encaisser pour compte
  de tiers est une activité réglementée.*
- **D6 — BMC obligatoire pour sortir du Brouillon**, jamais pour créer un projet.
  *Correction d'une contradiction du cahier des charges : exiger les 9 blocs à la création
  revenait à demander de tout structurer à quelqu'un qui ne sait pas structurer.*
- **D7 — Pseudonymat, pas anonymat.** Honnêteté assumée sur la ré-identification possible en
  petite promotion.
- **D8 — Genre collecté (facultatif), jamais public, jamais dans le matching.** Agrégat
  uniquement, seuil minimal de 5 individus.
- **D9 — Matching déterministe et explicable.** Aucun apprentissage automatique en V1 : rien à
  apprendre sur quelques centaines d'utilisateurs.
- **D10 — Une seule entité `Opportunity` typée** pour sondages, concours, événements, appels et
  offres de stage.
- **D11 — i18n dès le premier écran**, `currency` sur chaque montant, référentiels en base.
- **D12 — Web responsive maintenant, application native en V2** ⇒ le backend est une API.

### Décisions techniques

- **Validé** du cahier des charges : React + TypeScript, Tailwind, Node + TypeScript, NestJS,
  PostgreSQL, Prisma, RBAC, Cloudflare R2, Docker.
- **Rejeté** : Socket.IO → **SSE** · Nginx → **Caddy** · JWT en `localStorage` → **cookie
  `httpOnly` avec rotation et détection de réutilisation** · VPS unique → **statique sur CDN +
  API sur VPS + PostgreSQL managé**.
- **Écarté après examen** : Next.js, Laravel, Auth0/Clerk, GraphQL, tRPC, Redis, Meilisearch,
  paliers gratuits des PaaS.
- **Ajouté au cahier des charges** (absent à l'origine) : email transactionnel, file de
  traitements (pg-boss), recherche intégrée, supervision, stratégie de tests, CI/CD, monorepo
  à types partagés, sauvegardes restaurées, i18n, mesure d'audience respectueuse de la vie
  privée.
- **Décision de schéma structurante** : `TalentIdentity` séparée de `TalentProfile`. La donnée
  privée n'est pas masquée, **elle n'est pas chargée**.

### Ajouté

- `docs/specs-fonctionnelles.md` — spécifications exhaustives par acteur
- `docs/mvp-scope.md` — Must / Should / Won't avec justification produit de chaque exclusion
- `docs/stack-technique-et-justifications.md` — registre de décisions techniques
- `docs/architecture.md` — schémas, flux critiques, RBAC, budget de performance
- `docs/modele-de-donnees.md` — 32 entités du MVP
- `docs/plan-de-developpement.md` — 6 vagues, ~70 tickets, répartition, risques
- `docs/business/modele-economique.md` — modèle, méthode de tarification, coûts, indicateurs
- `docs/business/business-plan-canevas.md` — structure et formules pour le CEO
- `docs/business/pitch-et-objections.md` — récit, arguments, objections, script de démonstration
- `docs/README.md`, `README.md`, `CLAUDE.md`, `NEXT_SESSION.md`, `.claude/commands/handoff.md`

### Audit du prototype existant

Dépôt `YonniVerse/CoFound.mg`, branche `dev`, commit `2c7999e`.

- **Conservé** : design system (tokens OKLCH, échelles d'ombres et de rayons, Inter + Sora
  auto-hébergées), primitives shadcn/Radix, landing page, pattern `fetchMock` → hooks.
- **5 corrections identifiées** (`C1` à `C5`), dont le retrait du badge de genre sur les
  profils de personnes — il réintroduisait précisément le biais que la plateforme existe pour
  supprimer.

### En attente

- Business plan (CEO)
- Montants des formules partenaires
- Arbitrage de marque : `CoFound.mg` vs `CoFounder.mg`
- Choix de l'établissement pilote
