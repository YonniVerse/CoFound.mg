# Reprise de session — CoFound.mg

**Dernière mise à jour** : 2026-08-28
**Phase** : P-01 intégré sur `main` ; déploiement frontend Vercel confirmé, API Render saine
**Ticket / vague** : P-01 / Vague 3 — Le projet
**Branche locale** : `main`
**État Git** : dépôt propre, `main` synchronisé avec `origin/main` à `41d4cff` ; branche locale `P-01` supprimée ; aucune branche distante `P-01` n’existait.

## 1. État courant

Le parcours de création de projet est intégré sur `main` côté contrat partagé, API NestJS, persistance Prisma et frontend. Les commits de livraison sont `1167654` (fonctionnalité), le merge avec `origin/main`, `5d1d85a` (correction du Dockerfile backup), `ceea156` (handoff initial), puis `41d4cff` (fusion des derniers changements BMC et synchronisation finale). Un utilisateur autorisé dont le compte est `ACTIVE` peut créer un projet avec un titre, un pitch, un secteur facultatif et une région facultative. Le serveur ignore toute tentative de fournir un propriétaire, un statut, un rôle, une date de publication ou une liste de membres : ces valeurs ne font pas partie du contrat d’entrée.

La création vérifie côté serveur que le compte est `ACTIVE` et que les références fournies existent et sont actives. Elle crée le projet en `DRAFT` et le premier `ProjectMember` avec le rôle `OWNER` dans la même transaction Prisma. Le schéma Prisma existant était déjà suffisant ; aucune migration n’a été ajoutée.

L’écran `/projects/new` charge les secteurs et régions actifs depuis les routes publiques de référentiels, désactive les selects pendant le chargement, affiche les compteurs et contraintes, conserve la saisie dans `localStorage` en cas d’échec ou de perte de connexion, bloque les doubles soumissions et redirige vers `/projects/:id/bmc` après confirmation serveur. La route BMC existante est désormais enregistrée dans le routeur sans retirer `/projects/:id`.

## 2. Travail réellement effectué cette session

- Ajout du contrat `projectCreateResponseSchema` et du contrat public `publicReferenceListSchema` dans `packages/shared/src/schemas.ts`.
- Ajout de `createProject()` et `getProjectReferenceData()` dans `apps/web/src/data/projectApi.ts`.
- Remplacement du formulaire de `ProjectCreatePage.tsx` par un parcours à quatre champs métier, avec selects secteur/région, validation par champ, états de chargement/erreur/envoi et protection hors ligne.
- Ajout de la route lazy `/projects/:id/bmc` dans `apps/web/src/App.tsx`.
- Ajout de `GET /api/v1/reference-data/regions`, limité aux régions actives et trié par slug ; réutilisation de la route secteurs existante.
- Renforcement de `ProjectService.create()` : statut de compte `ACTIVE` obligatoire, références actives vérifiées dans la transaction, création atomique DRAFT + OWNER conservée.
- Validation structurée du corps dans `ProjectController.create()` avec `errors.validation` et les issues Zod dans `details`.
- Ajout de quatre tests P-01 couvrant références persistées, référence inactive/inexistante, statut de compte et échec transactionnel.

## 3. Validation

Les contrôles avant intégration réussissent : `pnpm typecheck`, `pnpm lint`, `pnpm test` (210 tests API avant fusion, puis 213 tests après fusion avec origin/main), `pnpm build`, `pnpm e2e:list` (3 tests E2E existants) et `git diff --check`. Après fusion, les mêmes contrôles typecheck/lint/test/build/diff passent avec 213 tests. Le test ciblé `apps/api/test/project.test.ts` passe avec 11 tests.

Le premier typecheck a nécessité une génération Prisma locale (`pnpm --filter @cofound/api prisma:generate`) après installation des dépendances. L’installation initiale nécessitait également `build-essential` pour compiler `argon2`; cela concerne l’environnement local et n’est pas une modification du dépôt.

Aucun test Playwright d’interface dédié à P-01 n’existe dans l’infrastructure actuelle. Les tests frontend unitaires ne sont pas configurés dans `apps/web`; la couverture ajoutée cette session est donc côté service API et les validations globales de compilation/lint/build.

## 4. Fichiers importants

- `apps/web/src/pages/ProjectCreatePage.tsx` : formulaire et états du parcours utilisateur.
- `apps/web/src/data/projectApi.ts` : appels typés de création et de référentiels.
- `apps/web/src/App.tsx` : route BMC après création.
- `apps/api/src/project/project.controller.ts` : validation d’entrée et transmission du statut authentifié.
- `apps/api/src/project/project.service.ts` : autorisation serveur, références actives et transaction atomique.
- `apps/api/src/reference-data/public-reference-data.controller.ts` et `reference-data.service.ts` : catalogue public des régions.
- `packages/shared/src/schemas.ts` : contrats Zod de création, réponse et référentiels.
- `apps/api/test/project.test.ts` : couverture ciblée P-01/P-03.

Décisions techniques : pas de migration Prisma, pas d’API HTTP parallèle, pas de BMC obligatoire à la création, et autorisation de création limitée au statut `ACTIVE` côté serveur en plus de `Permission.PROJECT_CREATE`. Les libellés frontend sont dérivés de `labelKey` faute de catalogue de traduction projet dédié ; les identifiants restent fournis par la base et ne sont pas codés en dur.

## 5. Problèmes connus / blocages

Le frontend Vercel est confirmé en production sur le commit `41d4cff` par le statut GitHub `Vercel: success`. L’API Render `https://cofound-mg.onrender.com` répond au healthcheck public avec `{"status":"ok","database":"ok"}` ; l’association exacte du dernier déploiement Render au SHA n’est pas exposée par le dépôt, donc une vérification depuis le dashboard Render reste recommandée. Le workflow VPS `deploy-api.yml` n’est pas la cible de production de l’application et ne doit pas être relancé. Il reste à effectuer une recette navigateur avec un compte Talent `ACTIVE` et, idéalement, un test E2E P-01 dédié. Le formulaire utilise les traductions textuelles déjà présentes dans la page pour le contenu général ; une passe i18n complète reste à traiter dans le ticket de finition prévu par le backlog.

Aucune décision durable supplémentaire n’a nécessité de modification de `CLAUDE.md`, `docs/mvp-scope.md` ou des documents d’architecture. Les changements fonctionnels et la correction de déploiement sont committés et poussés sur `main` ; le dépôt est propre au moment du handoff.

## 6. Prochaine action

Vérifier dans les dashboards Vercel et Render que les services ciblent bien le dépôt `YonniVerse/CoFound.mg` et le commit `41d4cff`, puis faire la recette manuelle de `/projects/new` avec un compte Talent `ACTIVE`. Vérifier la création `DRAFT`, le membre `OWNER`, la lecture des référentiels via Render et la redirection vers `/projects/<id>/bmc` côté Vercel. Ne pas utiliser le workflow VPS pour cette application.
