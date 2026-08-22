# Context Handoff — Reprise de session CoFound.mg
**Dernière mise à jour** : 2026-08-22
**Phase** : Vague 5 — S-08 initialisé
**Branche** : `feat/S-08-seed-demo`
**État du workspace** : premier code S-08 local non committé. S-07 est publié dans la PR #71.

## Travail réalisé
S-07 a été finalisé, committé et poussé avec le commit `87b72e3 feat(account): finaliser les statuts de compte`. La PR [#71](https://github.com/YonniVerse/CoFound.mg/pull/71) est ouverte vers `dev`. Elle comprend `GET /api/v1/me/status`, l’écran `/account-status`, les rendus ACTIVE/FROZEN/LEAVING/ALUMNI, la garde frontend redirigeant FROZEN et les tests HTTP 4/4.

S-08 a été planifié et isolé sur `feat/S-08-seed-demo`, créée depuis `dev`. Le premier code ajoute `apps/api/prisma/seed-demo.ts` et la commande `seed:demo` au package API. Le script est idempotent et préfixe tous les identifiants métier par `demo-`. Il crée une institution, un partenaire, un staff OPS_ADMIN, un talent activé avec profil et identité, une affiliation de promotion 2026, une capacité partenaire, un projet de démonstration et une opportunité publiée.

## Fichiers S-08
- `apps/api/prisma/seed-demo.ts` : seed transactionnel et idempotent.
- `apps/api/package.json` : commande `seed:demo`.

## Validation
S-07 passe les typechecks shared/API/frontend, le lint ciblé, le build frontend, `git diff --check` et 4/4 tests HTTP.

Le premier socle S-08 passe `prisma generate`, le typecheck API et le lint du seed. `seed:demo` n’a pas encore été exécuté sur une base de recette. Les données ne contiennent aucun secret réel et le mot de passe des comptes de démonstration reste volontairement absent.

## Plan détaillé S-08
Le backlog officiel définit S-08 comme **`seed:demo` : établissement, promotion, projets, partenaire, tous reconstructibles par commande**, dépendance F-06, responsabilité R. Il faut exécuter le seed sur une base de recette non productive, le rejouer pour vérifier l’absence de doublons, contrôler les relations et produire un rapport de comptage. La suite pourra ajouter une vérification automatisée du nombre d’organisations, utilisateurs, affiliations, projets et opportunités créés avec le préfixe `demo-`.

## Prochaine action
Exécuter `pnpm --filter @cofound/api seed:demo` sur une base de recette dédiée, corriger les incohérences Prisma éventuelles, rejouer la commande et ajouter les tests/contrôles d’idempotence avant le commit de S-08.


## Mise à jour S-09 — 22 août 2026

La branche `feat/S-09-e2e-playwright` a été recréée depuis `origin/dev` après fusion de S-05 à S-08. Playwright et Chromium sont installés ; `playwright test --list` détecte les trois scénarios officiels. L’exécution locale a démarré correctement après construction de `@cofound/shared`, mais les trois scénarios sont ignorés faute de variables `E2E_*` et de comptes/jeton de recette. Aucun secret n’est enregistré.

Les fichiers concernés sont `playwright.config.ts`, `tests/e2e/s09-critical-paths.spec.ts`, `package.json` et `pnpm-lock.yaml`. La branche est prête à être publiée, mais S-09 ne doit pas être déclaré validé E2E tant que les tests ne sont pas exécutés avec authentification réelle. La prochaine étape est de fournir l’URL de staging, trois comptes de test et un jeton d’activation valides.
