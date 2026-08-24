# Context Handoff — Reprise de session CoFound.mg

**Dernière mise à jour** : 2026-08-24
**Phase** : recette Playwright du rôle Talent — anomalies détectées, corrections locales en cours
**Ticket / vague** : campagne `TAL-001` à `TAL-014`, phase de tests par rôle
**Branche locale** : `fix/talent-recipe-findings`
**État Git** : modifications non committées ; aucun commit créé conformément au workflow de handoff.

## 1. État courant

La recette a été exécutée avec le compte Talent fourni par Yonni sur `https://co-found-mg.vercel.app`. Le login réussit et le compte est affiché comme « Jeune Talent », mais l’environnement déployé n’est pas cohérent avec le code de `main` : le frontend Vercel `main` (`a550f9a`) appelle l’API Render, qui renvoie notamment 403 sur `/me/status` et 404 sur `/projects/feed` et `/talents/feed`.

Le preview de `fix/bugs-main-audit` est protégé par Vercel ; un lien temporaire a permis son ouverture, mais les appels vers Render sont bloqués par CORS car l’API autorise `https://co-found-mg.vercel.app` et non l’origine preview.

## 2. Travail réellement effectué

- Campagne Playwright de navigation complète et SPA sur les surfaces Talent : feed, recherche, Dream Match, projets, création de projet, candidatures, messages, notifications, paramètres et routes organisation/staff.
- Login Talent réussi en production. Le feed affiche le rappel d’onboarding à 0 % et `FEED_FETCH_FAILED`.
- TAL-002 reproduit : `/onboarding` reste bloqué sur « Chargement de ta progression… » ; `/me/status` répond 403.
- TAL-004 reproduit : les feeds projets et talents répondent 404 côté API déployée.
- TAL-006 validé partiellement : formulaire vide bloqué sans création ; création positive HTTP 201 en `DRAFT` avec le titre et le pitch saisis. Projet de recette créé : `cmt7axgbf0018fj36prmixhhh`. Aucun endpoint de suppression n’a été exécuté ; prévoir un nettoyage manuel si nécessaire.
- TAL-014 vérifié en négatif côté API : les routes organisation/staff ne fournissent pas de données exploitables au Talent ; l’écran `/institution` et `/staff/audit` reste toutefois rendu avec des titres, ce qui mérite une protection UI/route plus explicite.
- Rapport de recette conservé dans `docs/recette-talent-2026-08-24.md`.

## 3. Corrections locales en cours

Sur `fix/talent-recipe-findings` :

- `apps/api/src/account-status/account-status.controller.ts` déclare maintenant `@RequirePermissions(Permission.TALENT_READ)` ; `/me/status` ne tombe plus dans le refus par défaut.
- `apps/api/test/rbac.test.ts` couvre la métadonnée de permission de `/me/status`.
- Le détail projet frontend ne dépend plus de `MOCK_PROJECT_DETAIL` : `projectApi.ts` charge `GET /projects/:id` et les postes via `/projects/:id/positions`.
- La soumission de candidature appelle maintenant `POST /applications` avec `projectId`, `positionId` éventuel et message, au lieu de retourner un faux succès.
- Les composants du détail projet affichent le pitch, le statut, les postes et les membres réellement reçus ; les données de démonstration de l’écran ont été retirées.
- `packages/shared/src/schemas.ts` contient le schéma `projectPrivateDetailSchema` utilisé par le client web.

## 4. Validation et limites

Réussis sur la branche : `pnpm --filter @cofound/shared build`, `pnpm --filter @cofound/web typecheck`, `pnpm --filter @cofound/web lint`, `pnpm --filter @cofound/web build`, `git diff --check` et les tests ciblés `rbac.test.ts` + `account-status.integration.test.ts` : 19/19.

La suite API globale n’est pas verte dans cet environnement : 132 tests passent et 17 échouent sur des problèmes préexistants de génération/mock Prisma (`Prisma.sql is not a function`, `PrismaClientKnownRequestError is not a constructor` et imports de modules natifs). Le typecheck API échoue aussi sur 155 erreurs réparties dans de nombreux services Prisma existants ; aucune erreur ciblée n’a été introduite par le contrôleur modifié. Ces échecs doivent être distingués des tests ciblés réussis.

## 5. Fichiers importants et décisions

- `docs/recette-talent-2026-08-24.md` : preuves et observations Playwright détaillées.
- `apps/api/src/account-status/account-status.controller.ts` et `apps/api/test/rbac.test.ts` : correction/régression RBAC.
- `apps/web/src/data/projectApi.ts`, `apps/web/src/hooks/useProjectDetail.ts`, `apps/web/src/data/mockProject.ts` et `apps/web/src/components/project/*` : suppression des mocks du détail et branchement API.
- `packages/shared/src/schemas.ts` : contrat privé du détail projet.
- Décision technique : `/me/status` reste authentifié et utilise `TALENT_READ`, car la route doit être disponible à tous les comptes autorisés sans devenir anonyme.
- Décision de branche : aucune modification n’a été faite sur `main`; les corrections restent non committées sur `fix/talent-recipe-findings`.

## 6. Prochaine action

Aligner le backend Render sur le commit de livraison réellement testé et autoriser l’origine du preview dans CORS, puis relancer la recette TAL-002/TAL-004/TAL-005/TAL-009 avec `docs/recette-talent-2026-08-24.md` comme journal et `pnpm --filter @cofound/shared build && pnpm --filter @cofound/web typecheck` comme contrôle local.

Les mutations restantes TAL-003, TAL-005, TAL-007 à TAL-013 ne doivent être conclues qu’après cet alignement frontend/backend. Aucun changement durable de périmètre ou d’architecture n’a été répercuté dans `CLAUDE.md` ou les documents MVP.
