# Changelog — CoFound.mg

Journal des décisions et des livrables. Le plus récent en haut.

Format : `## AAAA-MM-JJ — Titre` puis les rubriques utiles parmi **Décidé · Ajouté · Modifié ·
Retiré · En cours · Bloqué**.

> Ce fichier retrace **l'historique**. L'état courant est dans `NEXT_SESSION.md`.
> Mis à jour par la commande `/handoff`.

---

## 2026-08-21 — Démarrage de P-09 : gestion des tâches projet

### Décidé

- Les tâches sont visibles uniquement par les membres actifs du projet, car le travail d’équipe doit rester dans l’espace projet privé.
- L’assignation est limitée aux membres actifs et les mutations passent par une transaction Prisma, afin d’éviter les responsables orphelins et les écritures partielles.

### Ajouté

- Schémas partagés P-09 pour les statuts, la création, la mise à jour et la réponse des tâches.
- `ProjectTasksService` et `ProjectTasksController` avec CRUD REST, échéance, statut et responsable pseudonymisé.
- Tests unitaires et tests HTTP ciblés P-09 : **5/5 réussis**.
- Écran lazy `/projects/:id/tasks` et appels CRUD réels dans `projectApi`.

### En cours

- La branche `P-09` doit encore être commitée, poussée et publiée en PR vers `dev`.
- La dépendance M-10 doit être confirmée avant la fusion finale de la chaîne de la Vague 3.

---

## 2026-08-21 — Finalisation technique de P-08 : intégration HTTP et UI-29 réelle

### Ajouté

- Test d’intégration HTTP du `ProjectMembersController` couvrant `GET`, `POST`, `PATCH` et `DELETE` sous `/api/v1/projects/:projectId/members`.
- Conversion des erreurs de validation des schémas membres en réponse HTTP `400`.
- Appels `projectApi` réels pour charger, ajouter, modifier et quitter une équipe.

### Modifié

- UI-29 `/projects/:id/team` ne dépend plus de données de démonstration : elle utilise `apiClient`, gère les états de chargement, erreur, vide et mutation, et respecte la règle du dernier `OWNER`.
- Le service P-08 vérifie l’existence du compte cible avant ajout.
- Le test BMC réintégré a été typé sans `any` pour maintenir le lint strict.

### Validation

- Suite API complète : **83/83 tests réussis**.
- Typecheck et lint API/frontend réussis.
- Build frontend réussi.

---

## 2026-08-21 — Publication P-07 et démarrage P-08 membres & rôles

### Décidé

- Les mutations de rôle et de retrait vérifient le dernier `OWNER` dans une transaction Prisma, afin d’éviter une perte concurrente de propriété.
- L’identité civile reste réservée à l’espace des membres actifs ; le genre n’est jamais renvoyé par l’API équipe.

### Ajouté

- PR [#49](https://github.com/YonniVerse/CoFound.mg/pull/49) pour la relance automatique P-07.
- `ProjectMembersService` et `ProjectMembersController` avec liste, ajout, changement de rôle et retrait.
- Schémas partagés des rôles et membres P-08.
- Écran UI-29 `/projects/:id/team`, route lazy et protection visuelle du dernier porteur.
- Tests ciblés `project-members.test.ts`.

### Modifié

- La branche `P-08` réintègre les dépendances projet P-01 à P-04 nécessaires au module projet.
- Le module projet enregistre désormais les contrôleurs et services BMC, postes et membres.

### En cours

- UI-29 utilise encore des données locales de démonstration ; le branchement au client API réel et les tests HTTP/intégration restent à faire.

---

## 2026-08-21 — Vague 3 : Ticket P-05 (Candidature API + Écran candidat)

### Ajouté
- **Ticket P-05 — Candidature API & Écran candidat** :
  - **API NestJS (`POST /applications`, `GET /applications/me`, `PATCH /applications/:id/withdraw`)** : Endpoints de soumission de candidature, de liste candidat et de retrait autonome protégés par `Permission.PROJECT_APPLY`.
  - **Schémas Zod partagés** : `createApplicationInputSchema`, `applicationItemSchema`, `myApplicationsResponseSchema`.
  - **Composant Web Modal `ApplyModal.tsx`** : Modal permettant aux candidats de postuler avec message de motivation et choix optionnel du poste ouvert.
  - **Page Candidat `/my-applications` (`MyApplicationsPage.tsx`)** : Tableau de bord de suivi des candidatures avec filtres par statut (`En attente`, `Acceptée`, `Refusée`, `Retirée`), motif de refus et bouton de retrait.
  - **Hook `useMyApplications.ts`** : Hook React d'interaction API avec secours démo local.
  - **Tests unitaires** : Suite de tests `apps/api/test/applications.test.ts` (54/54 tests backend passants).

---

## 2026-08-21 — Stabilisation de P-05

### Corrigé

- Suppression des imports inutilisés dans les tests de candidatures.
- Correction du chargement initial du hook `useMyApplications` pour respecter la règle React ESLint `set-state-in-effect`.
- Validation finale : 58 tests backend passants, typechecks API/frontend et lint global réussis.

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

## 2026-08-21 — Démarrage de P-06

### Ajouté

- Contrats partagés pour la file porteur et le refus motivé.
- Routes de lecture, acceptation et refus des candidatures reçues.
- Décisions protégées par la propriété du projet et exécutées dans une transaction Prisma.
- Écran UI-28 `/projects/:id/applications` avec filtres par statut, pseudonymat du candidat et actions accepter/refuser.

### Validé

- 58 tests API passants.
- Typecheck partagé, API et frontend réussi.
- Lint global réussi.
- Build frontend réussi.

### À poursuivre

- Ajouter les tests ciblés d’intégration HTTP P-06.
- Finaliser les états UI et préparer la Pull Request.

## 2026-08-21 — Couverture P-06

Les tests ciblés de la file porteur couvrent désormais la lecture pseudonymisée, le refus d’un accès par un non-propriétaire, l’acceptation transactionnelle d’une candidature en attente et le rejet d’une candidature déjà décidée. La suite API compte 62 tests passants, et les typechecks ainsi que le lint global sont réussis.

## 2026-08-21 — Publication P-06 et démarrage P-07

La branche `feat/P-06-file-candidatures-porteur` a été publiée et la Pull Request #48 a été ouverte vers `dev`. La validation complète des modules présents a réussi avec 62 tests API passants, typechecks, lint, build et contrôle bundle.

Le premier lot P-07 ajoute `ApplicationReminderService`, configurable par `APPLICATION_REMINDER_DAYS`, qui regroupe les candidatures `PENDING` dépassant le seuil et crée une notification in-app idempotente par porteur et projet. Le déclenchement planifié, les tests ciblés et l’interface de notification restent à finaliser.

## 2026-08-21 — Finalisation locale de P-07

Le service de relance du porteur dispose maintenant d’un déclenchement périodique configurable par `APPLICATION_REMINDER_ENABLED` et `APPLICATION_REMINDER_INTERVAL_MS`. Le timer est non bloquant et s’arrête proprement avec le module NestJS. Les relances restent in-app et sont idempotentes par porteur et projet.

Trois tests ciblés couvrent le seuil temporel, le regroupement de plusieurs candidatures d’un même projet et l’absence de doublon. La suite API compte 65 tests passants ; le typecheck API et le lint global sont également réussis.
