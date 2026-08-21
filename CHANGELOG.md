# Changelog — CoFound.mg

Journal des décisions et des livrables. Le plus récent en haut.

Format : `## AAAA-MM-JJ — Titre` puis les rubriques utiles parmi **Décidé · Ajouté · Modifié ·
Retiré · En cours · Bloqué**.

> Ce fichier retrace **l'historique**. L'état courant est dans `NEXT_SESSION.md`.
> Mis à jour par la commande `/handoff`.

---

## 2026-08-21 — Implémentation de la transition P-03

### Ajouté

- Action projet `POST /api/v1/projects/:id/recruiting` protégée par `PROJECT_MANAGE`.
- Vérification transactionnelle du propriétaire, du statut `DRAFT` et de la complétion des neuf blocs BMC.
- Retour explicite des clés de blocs manquants lorsque la publication est refusée.
- Trois tests P-03 couvrant le refus incomplet, la transition complète et les métadonnées de permission.

### Décidé

- Seul un propriétaire actif peut publier un projet, afin que la transition d’état reste une décision de gouvernance.
- La publication n’écrit `RECRUITING` et `publishedAt` que lorsque les neuf contenus BMC sont non vides.

### Validé

- `pnpm test` : 59 tests API passants, 0 échec.
- `pnpm typecheck`, `pnpm lint` et `pnpm build` : OK.

---

## 2026-08-21 — Implémentation du BMC guidé P-02

### Ajouté

- Contrats Zod partagés pour les neuf blocs standard du BMC, leur visibilité et la réponse de complétion.
- Service BMC NestJS avec contrôle des membres actifs, normalisation JSONB, upsert dans une transaction Prisma et calcul serveur de complétion.
- Routes protégées `GET` et `PATCH /api/v1/projects/:projectId/bmc`.
- Écran UI-26 responsive avec explications, exemples contextualisés, indicateur d’enregistrement, autosave debouncé et compteur de complétion.
- Quatre tests P-02 couvrant complétion, transaction, isolation et permissions.

### Validé

- `pnpm --filter @cofound/shared build`, les typechecks API/web, `pnpm lint` et `pnpm build` passent.
- La suite API compte 56 tests passants, 0 échec.

### Décidé

- Les neuf cases sont les blocs standard : segments clients, propositions de valeur, canaux, relations clients, flux de revenus, ressources clés, activités clés, partenaires clés et structure de coûts.
- La transition `DRAFT → RECRUITING` reste hors P-02 et relève de P-03.

---

## 2026-08-21 — Préparation P-02 après publication de P-01

### Publié

- Branche `P-01` créée depuis la base de développement et publiée sur `origin/P-01`.
- Commit `62ae3c2 feat(project): créer un projet en brouillon` créé avec uniquement les fichiers P-01.

### Préparé

- Branche locale `P-02` créée depuis P-01.
- Modèle Prisma `BusinessModelCanvas` vérifié : relation unique avec `Project`, blocs JSON, complétion et traçage de l’utilisateur ayant modifié le BMC.
- Aucun code P-02 ajouté pendant cette session ; contrats, routes, autosave et tests restent à développer.

---

## 2026-08-21 — Base PostgreSQL Neon configurée pour CoFound.mg

### Ajouté

- Projet Neon **`CoFound.mg`** créé dans l’organisation `Yonni`, avec la branche principale `main` et la base `neondb`.
- Migrations Prisma `0001_initial` et `0002_auth_tokens` appliquées avec succès.
- Extensions PostgreSQL vérifiées : `pg_trgm` et `unaccent`.
- Seed idempotent des référentiels exécuté et vérifié : 8 filières, 6 régions, 8 secteurs et 10 compétences.
- [`apps/api/.env.example`](apps/api/.env.example) et la documentation de connexion ajoutés via la PR [#27](https://github.com/YonniVerse/CoFound.mg/pull/27).

### Décidé

- La chaîne `DATABASE_URL` Neon n’est pas enregistrée dans Git. Les environnements locaux utilisent `apps/api/.env`, ignoré par Git, à partir de `apps/api/.env.example`.
- Les migrations doivent être appliquées avant le démarrage de l’API, puis le seed de référence peut être relancé sans risque grâce à son idempotence.

### Validé

- Le schéma public contient les tables Prisma attendues, notamment `User`, `TalentProfile`, `TalentIdentity`, `Project`, `ProjectMember`, `Connection`, `Notification`, `AuditLog`, `Skill`, `Field`, `Sector` et `Region`.
- La branche `dev` reste propre et alignée sur `origin/dev` après intégration.

---

## 2026-08-21 — Vague 0 intégrée : client web, traitements, infrastructure et observabilité

### Ajouté

- **F-14 — Client HTTP web** : `apps/web/src/lib/api-client.ts` fournit un client générique typé avec base URL configurable, Bearer conservé uniquement en mémoire, cookies `httpOnly` envoyés par `credentials: include` et parsing des erreurs via `@cofound/shared`.
- **F-15 — File de traitements** : ajout de `pg-boss` sur PostgreSQL, de la queue `cofound.notifications.email`, d’un publisher NestJS et d’un worker séparé (`start:worker`). Les demandes de réinitialisation publient un job sans jamais renvoyer le jeton brut par l’API.
- **F-16 — Infrastructure** : image API/worker multi-stage, Compose de production, Caddy avec TLS automatique, healthchecks, publication GHCR et déploiement SSH automatisé avec `known_hosts` strict. Le frontend reste déployé séparément sur son CDN statique.
- **F-17 — Sauvegardes** : image dédiée avec `pg_dump`, chiffrement avant transfert, checksum, objets horodatés et pointeur `latest` dans R2. Le profil `restore-test` restaure exclusivement vers `RESTORE_DATABASE_URL`, une base jetable distincte de la production.
- **F-18 — Observabilité** : Sentry initialisé avant NestJS quand `SENTRY_DSN` existe, filtre global des exceptions, logs JSON pino avec redaction des cookies, Authorization, mots de passe et jetons, et readiness check PostgreSQL sur `/api/v1/health`.
- Tests unitaires du healthcheck : réponse `200` lorsque PostgreSQL répond et réponse `503` lorsqu’il est indisponible.

### Décidé

- Le **plan versionné du dépôt** fait foi lorsque le contexte de reprise diverge du mapping des tickets. F-16, F-17 et F-18 suivent donc le périmètre infrastructure, sauvegardes et observabilité de `docs/plan-de-developpement.md`.
- Le fournisseur d’email transactionnel n’est pas choisi dans F-15. Le worker et ses contrats sont prêts ; le transport réel et les gabarits relèvent de `E-01`/`E-02`.
- `BACKUP_ENCRYPTION_KEY` est distinct de `JWT_SECRET` et `RESTORE_DATABASE_URL` doit toujours cibler une base de restauration jetable.

### Validé

- Pull requests fusionnées vers `dev` : [#20](https://github.com/YonniVerse/CoFound.mg/pull/20), [#21](https://github.com/YonniVerse/CoFound.mg/pull/21), [#22](https://github.com/YonniVerse/CoFound.mg/pull/22), [#23](https://github.com/YonniVerse/CoFound.mg/pull/23) et [#24](https://github.com/YonniVerse/CoFound.mg/pull/24).
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` et `pnpm check:bundle` passent sur `dev`.
- La suite API compte 12 tests passants.
- Le JavaScript initial pèse 271 701 octets gzip, sous le cliquet de 290 221 octets gzip.

### À faire hors sandbox

- Configurer les secrets GitHub de l’environnement `production`, le `.env` du VPS, le domaine Caddy, les identifiants R2 et le DSN Sentry.
- Exécuter un build Docker réel, une sauvegarde et une restauration testée sur une machine équipée de Docker. Le sandbox ne contient pas Docker ; la simulation `pnpm deploy --filter @cofound/api --prod --legacy` a toutefois confirmé le runtime Prisma.

---

## 2026-08-20 — Rapatriement du dépôt et nettoyage des permissions

*Précède la restructuration en monorepo décrite dans l'entrée suivante.*

### Modifié

- Le dépôt vit désormais dans `~/Lab/CoFound.mg` au lieu de `~/Lab/archives/CoFound.mg`.
  `.git` a été déplacé tel quel : historique, branches et remote intacts.
- `docs/PRD_CoFound_mg.md` et `docs/SPECS_CoFound_mg.md` déplacés dans `docs/archive/`.
  Archivés plutôt que supprimés : ils décrivent un produit de démonstration de hackathon
  qui ne fait plus autorité, mais restent une référence pour les maquettes d'écran.

### Corrigé

- 218 fichiers apparaissaient modifiés en `755` au lieu de `644`, sans un seul changement
  de contenu — séquelle d'un `chmod -R` ou d'une copie depuis un support FAT/NTFS.
  Permissions restaurées depuis les modes enregistrés dans l'index, en préservant le seul
  fichier légitimement exécutable et les 24 liens symboliques. Ce bruit n'est donc entré
  dans aucun commit.

### Décidé

- **Aucune mention de Claude comme co-auteur dans les commits.** Demande explicite de
  Yonni : le dépôt est un livrable présenté à un jury et à des partenaires, les commits
  doivent être entièrement les siens.
- **La convention de message du dépôt fait foi** (`.trae/rules/git-commit-message.md`) :
  Conventional Commits en français, un seul changement logique par commit. À lire avant
  tout commit.

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
