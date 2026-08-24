# Context Handoff — Reprise de session CoFound.mg

**Dernière mise à jour** : 2026-08-24
**Phase** : `main` livré ; Render et Vercel corrigés et opérationnels
**Branche locale** : `main`
**État Git** : le code suit `origin/main` sur le merge de la PR #89 ; les documents de handoff de cette session seront commités ensuite.

## 1. État courant

`main` est désormais la branche de livraison du dépôt. La PR #86 a intégré `dev`, la Vague 4 B-01 à B-11, Cloudinary B-12 et S-09. La PR corrective #89 a ensuite corrigé les deux erreurs découvertes dans les logs de production.

Le backend Render répond actuellement à `https://cofound-mg.onrender.com/api/v1/health` avec HTTP 200 et `{"status":"ok","database":"ok"}`. Le déploiement a compilé l’API, généré Prisma et confirmé qu’il n’y avait aucune migration en attente. Le commit/branche exacts du service Render ne sont pas exposés par l’endpoint health ; vérifier dans le dashboard que le service suit bien `main`.

## 2. Travail livré

- Merge de la PR #86 dans `main` : Vague 4, Cloudinary et S-05 à S-09.
- PR #89 fusionnée dans `main` : `d51b485`, correction de l’import runtime `PrismaService` et du build frontend Vercel.
- `apps/web/package.json` compile maintenant `@cofound/shared` avant TypeScript/Vite.
- `PersonalDataExportService` importe PrismaService comme valeur runtime, afin que NestJS puisse résoudre l’injection en production.
- PR historiques #73, #74, #75, #76, #82 et #83 clôturées après intégration ou obsolescence.
- Issues #84, #87 et #88 déclarées puis clôturées avec commentaires de résolution. L’issue #85 reste ouverte pour la traçabilité de la PR #82 obsolète.

## 3. Validation

Validation locale passée sur main/fix : génération Prisma, typecheck, lint, tests API, build API, typecheck/lint/build frontend et `git diff --check`. Le contrôle CI GitHub et les trois contrôles Vercel de la PR #89 sont verts.

Le déploiement Production Vercel de main `dpl_CrXZhSkVcSBxvSjizYNZqK4YAreR` est `READY`, avec les alias `co-found-mg.vercel.app`, `co-found-mg-yonni-coders-projects.vercel.app` et l’alias Git main. Le Root Directory Vercel est `apps/web`, et `Include files outside the root directory` est activé.

Les tests E2E réels ne sont pas encore exécutés : trois scénarios sont listés, mais les variables `E2E_*` et les comptes de recette ne sont pas disponibles dans le sandbox.

## 4. Configuration de production

La variable frontend reste `VITE_API_URL=https://cofound-mg.onrender.com/api/v1` en Production Vercel. Les secrets Cloudinary restent uniquement dans Render : `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_PRESET` et `CLOUDINARY_FOLDER`.

Le service Render doit conserver les commandes natives qui fonctionnent : installation pnpm 11.9.0, build shared/Prisma/API, puis `prisma:migrate:deploy` et `start`. Le worker n’est pas encore déployé.

## 5. Points ouverts

Le test réel B-01/Cloudinary reste à faire avec un compte demandeur et un compte staff de recette : upload d’un petit PDF, vérification de l’asset `authenticated`, ouverture via URL temporaire et contrôle du refus pour un rôle non autorisé.

Les valeurs secrètes Render n’ont pas été lues ni exposées par l’agent. Aucune clé Cloudinary ne doit être ajoutée dans Vercel ou dans le dépôt.

## 6. Prochaine action

Créer ou fournir des comptes de recette demandeur/staff, puis lancer le scénario B-01 avec un petit PDF et vérifier dans Cloudinary, Render et `/staff/organizations` que l’upload privé et l’URL temporaire fonctionnent de bout en bout.
