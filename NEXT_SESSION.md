# Context Handoff — Reprise de session CoFound.mg
**Dernière mise à jour** : 2026-08-22
**Phase** : Vague 5 — S-07 finalisé localement ; S-08 initialisé
**Branche** : `feat/S-07-account-status`
**État du workspace** : S-07 prêt à être committé. Le premier code S-08 est présent localement mais doit être isolé sur une branche dédiée après publication de S-07.

## 1. Travail réalisé
S-06 est publié dans la PR #70 avec le commit `bef8cc3`.

S-07 est finalisé sur la branche `feat/S-07-account-status`. L’API expose `GET /api/v1/me/status` sans données civiles. L’écran lazy `/account-status` rend les états ACTIVE, FROZEN, LEAVING et ALUMNI. Une garde frontend redirige un compte FROZEN vers cette route et évite la navigation applicative ordinaire. Les traductions françaises et malgaches `account.status.*` sont présentes. Les tests HTTP couvrent les quatre statuts.

Le premier socle de S-08 est également écrit localement : `apps/api/prisma/seed-demo.ts` crée de façon idempotente un établissement, une promotion via affiliation, deux projets métier et un partenaire avec opportunité publiée ; la commande `seed:demo` est ajoutée au package API. Ces modifications S-08 ne doivent pas être mélangées au commit S-07.

## 2. Validation
S-07 passe les typechecks shared/API/frontend, le lint ciblé, `git diff --check`, le build frontend et **4/4 tests HTTP**. Le chunk `AccountStatusPage` est lazy et reste largement sous le budget de 500 kB.

S-08 passe la génération Prisma, le typecheck API, le lint du seed et `git diff --check`. Le seed-demo n’a pas encore été exécuté sur Neon dans cette session.

## 3. Commit et PR
S-07 n’a pas encore de commit ni de PR. Les fichiers à committer pour S-07 sont le module `apps/api/src/account-status`, `apps/api/src/app.module.ts`, `apps/api/test/account-status.integration.test.ts`, `packages/shared/src/schemas.ts`, `apps/web/src/pages/AccountStatusPage.tsx`, `apps/web/src/App.tsx`, `apps/web/src/i18n.tsx`, ainsi que ce handoff et le changelog. Après commit, pousser `feat/S-07-account-status` et ouvrir la PR vers `dev`.

## 4. Plan détaillé S-08
Le backlog officiel définit S-08 comme **`seed:demo` : établissement, promotion, projets, partenaire, tous reconstructibles par commande**, dépendance F-06, responsabilité R. Il faut conserver le préfixe `demo-`, l’idempotence, une transaction Prisma pour chaque lot cohérent, l’absence de secrets réels et des données explicitement non productives.

Le premier code actuel couvre le socle de données. La suite est de séparer S-08 sur `feat/S-08-seed-demo`, vérifier les relations et enums, exécuter `pnpm --filter @cofound/api seed:demo` sur une base de recette dédiée, rejouer la commande pour confirmer l’absence de doublons, puis ajouter un test de reconstruction ou un rapport de comptage. Les données de démonstration devront inclure au minimum une institution, une cohorte 2026, un talent activé avec profil, deux projets et un partenaire publiant une opportunité.

## 5. Prochaine action
Commiter et ouvrir la PR S-07, puis créer `feat/S-08-seed-demo` depuis `dev`, y déplacer le script `seed-demo` et valider son exécution idempotente sur une base de recette non productive.
