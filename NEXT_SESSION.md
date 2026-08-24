# Context Handoff — Reprise de session CoFound.mg

**Dernière mise à jour** : 2026-08-24
**Phase** : auto-seed Render de développement implémenté, documentation à publier
**Branche locale** : `main`
**État Git** : commit fonctionnel local `8c6602b` à pousser ; documentation Render et Blueprint Render restent à committer.

## 1. État courant

`main` est la branche de livraison. Le seed multi-comptes et multi-rôles est déjà fusionné via la PR #94. Cette session ajoute l’exécution automatique du seed au démarrage de l’API lorsque Render est explicitement configuré pour l’instance de développement.

L’auto-seed s’exécute avant l’ouverture du port HTTP. Il met à jour ou crée les comptes présents dans `SEED_ACCOUNTS_JSON` à chaque redéploiement, sans supprimer les autres comptes. Les mots de passe restent dans les variables secrètes Render et sont hachés avec Argon2id.

## 2. Travail livré cette session

- Ajout de `runAutoSeed` au démarrage NestJS, après création de l’application et avant `app.listen`.
- Activation conditionnée par `SEED_ACCOUNTS_ON_START=true`, la présence de `SEED_ACCOUNTS_JSON` et un environnement non production ou explicitement marqué `SEED_ACCOUNTS_MODE=development`.
- Extraction de la routine d’upsert dans `src/account-seed/seed-accounts.ts`, réutilisée par le seed manuel et l’auto-seed.
- Déplacement du parseur dans `src/account-seed/seed-accounts-config.ts` afin qu’il soit inclus dans le build de production.
- Ajout des variables commentées dans `apps/api/.env.example`.
- Commit fonctionnel local : `8c6602b feat(seed): automatiser le provisionnement Render`.

## 3. Validation

Réussis : `pnpm --filter @cofound/api typecheck`, `pnpm --filter @cofound/api build`, `pnpm --filter @cofound/api test` avec **178/178 tests**, `pnpm --filter @cofound/api lint`, `git diff --check`, et vérification que `dist/main.js` référence `runAutoSeed`.

Le seed réel n’a pas été exécuté depuis le sandbox. Aucun mot de passe réel n’est présent dans Git. La configuration Render doit être renseignée par le propriétaire dans les variables secrètes du service.

## 4. Points ouverts

La documentation `deploy/README.md` et `render.yaml` doivent être committés et poussés après vérification. Le service Render doit conserver la commande Start normale ; l’auto-seed est déclenché par le code de `main.ts` uniquement lorsque les variables dédiées sont définies.

Pour l’instance Render de développement, conserver `SEED_ACCOUNTS_ON_START=true`, `SEED_ACCOUNTS_MODE=development` et `SEED_ACCOUNTS_JSON` dans les variables secrètes du service. Ne jamais ajouter ces variables à Vercel, au frontend ou à Git.

Après le déploiement, vérifier `/api/v1/health` et les connexions sur `https://co-found-mg.vercel.app/login`. L’issue #90 reste ouverte pour les écrans frontend encore mockés.

## 5. Fichiers importants

- `apps/api/src/main.ts` : appelle l’auto-seed avant l’écoute HTTP.
- `apps/api/src/account-seed/auto-seed.ts` : garde-fous et orchestration.
- `apps/api/src/account-seed/seed-accounts.ts` : upsert idempotent et hash Argon2id.
- `apps/api/src/account-seed/seed-accounts-config.ts` : parsing et validation.
- `apps/api/prisma/seed-admin.ts` : commande manuelle compatible.
- `apps/api/.env.example` : variables d’exemple désactivées.
- `deploy/README.md` et `render.yaml` : documentation et configuration à publier.

## 6. Prochaine action

Committer et pousser `deploy/README.md`, `render.yaml` et le handoff, puis vérifier dans Render que les trois variables secrètes d’auto-seed sont configurées avant le prochain redéploiement.
