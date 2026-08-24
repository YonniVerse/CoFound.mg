# Context Handoff — Reprise de session CoFound.mg

**Dernière mise à jour** : 2026-08-24
**Phase** : seed multi-comptes et multi-rôles implémenté, PR à publier
**Branche locale** : `feat/seed-multi-comptes-roles`
**État Git** : modifications du seed et de la documentation à committer/pousser ; ne pas exécuter le seed depuis le sandbox.

## 1. État courant

`main` reste la branche de livraison. La correction Render de la PR #93 est fusionnée. Cette session étend le seed admin existant pour créer ou mettre à jour plusieurs comptes avec les rôles `TALENT`, `ORG_MEMBER` et `STAFF`, ce dernier pouvant recevoir `SUPER_ADMIN`, `OPS_ADMIN` ou `MODERATOR`.

Le seed reste idempotent et séparé du démarrage normal de l’API. Il force les comptes seedés à `ACTIVE`, hache les mots de passe avec Argon2id et ne journalise jamais les mots de passe.

## 2. Travail livré cette session

- Ajout de `platformRole` dans la configuration des comptes.
- Compatibilité conservée avec `ADMIN_ACCOUNTS_JSON` : une entrée sans `platformRole` reste `STAFF/SUPER_ADMIN`.
- Ajout de `SEED_ACCOUNTS_JSON` comme variable recommandée pour les comptes multi-rôles.
- Validation stricte des rôles et des combinaisons : `staffRole` est refusé pour `TALENT` et `ORG_MEMBER`.
- Ajout de la commande `pnpm --filter @cofound/api seed:accounts`, avec maintien de `seed:admin`.
- Tests unitaires du parsing pour les rôles, défauts, doublons et erreurs.
- Documentation Render mise à jour dans `deploy/README.md`.

## 3. Validation

Réussis sur la branche : `pnpm --filter @cofound/api typecheck`, `pnpm --filter @cofound/api test` avec **177/177 tests**, `pnpm --filter @cofound/api lint` et `git diff --check`.

Aucun seed réel n’a été exécuté depuis le sandbox et aucun mot de passe réel n’est présent dans le dépôt. La création effective de nouveaux comptes nécessite une variable secrète temporaire définie par le propriétaire dans Render.

## 4. Points ouverts

La branche doit être commitée et poussée, puis proposée en PR vers `main`. Après fusion, l’utilisateur pourra définir temporairement `SEED_ACCOUNTS_JSON` dans Render et exécuter `pnpm --filter @cofound/api seed:accounts`.

Exemple de matrice possible, à remplacer par les adresses et mots de passe choisis par l’utilisateur : un `SUPER_ADMIN`, un `OPS_ADMIN`, un `MODERATOR`, un `TALENT` et un `ORG_MEMBER`. Ne jamais demander ou publier les mots de passe dans le chat.

Après le seed Render, supprimer immédiatement `SEED_ACCOUNTS_JSON`, conserver le Start Command normal et tester les connexions sur `https://co-found-mg.vercel.app/login`.

L’issue #90 reste ouverte pour les écrans frontend encore mockés. Le test réel B-01/Cloudinary reste à faire avec des comptes de recette.

## 5. Fichiers importants

- `apps/api/prisma/seed-admin.ts` : exécution du seed multi-comptes.
- `apps/api/prisma/seed-accounts-config.ts` : parsing, normalisation et validation des rôles.
- `apps/api/test/seed-accounts-config.test.ts` : couverture unitaire de la configuration.
- `apps/api/package.json` : commandes `seed:accounts` et `seed:admin`.
- `deploy/README.md` : procédure Render et exemple multi-rôles sans secret réel.
- `.claude/commands/handoff.md` : workflow obligatoire de reprise/clôture.

## 6. Prochaine action

Committer puis pousser la branche `feat/seed-multi-comptes-roles`, ouvrir une PR vers `main` et attendre les contrôles CI/Vercel avant fusion.
