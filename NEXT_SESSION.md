# Context Handoff — Reprise de session CoFound.mg

**Dernière mise à jour** : 2026-08-24
**Phase** : seed multi-comptes et multi-rôles fusionné dans main
**Branche locale** : `main`
**État Git** : `main` suit `origin/main` sur le merge de la PR #94 ; le workspace est propre après le commit de ce handoff.

## 1. État courant

`main` est la branche de livraison. La PR #94 a étendu le seed admin existant aux rôles de plateforme `TALENT`, `ORG_MEMBER` et `STAFF`, avec `SUPER_ADMIN`, `OPS_ADMIN` ou `MODERATOR` pour les comptes staff.

Le seed est idempotent, séparé du démarrage normal de l’API, et force les comptes seedés à `ACTIVE`. Les mots de passe sont hachés avec Argon2id et ne sont jamais écrits dans les logs, le dépôt ou le frontend.

## 2. Travail livré cette session

- Ajout de `platformRole` dans la configuration des comptes.
- Compatibilité conservée avec `ADMIN_ACCOUNTS_JSON` : une entrée sans `platformRole` crée un compte `STAFF/SUPER_ADMIN`.
- Ajout de `SEED_ACCOUNTS_JSON` comme variable recommandée pour les configurations multi-rôles.
- Validation stricte des rôles et refus de `staffRole` sur `TALENT` ou `ORG_MEMBER`.
- Ajout de `pnpm --filter @cofound/api seed:accounts`, avec maintien de `seed:admin`.
- Tests unitaires du parsing et documentation Render multi-comptes.
- PR #94 fusionnée dans `main` après trois contrôles verts : CI, Vercel et Preview Comments.

## 3. Validation

Réussis sur la branche fusionnée : `pnpm --filter @cofound/api typecheck`, `pnpm --filter @cofound/api test` avec **177/177 tests**, `pnpm --filter @cofound/api lint` et `git diff --check`.

Aucun nouveau seed réel n’a été exécuté depuis le sandbox. La création de nouveaux comptes nécessite que le propriétaire définisse temporairement `SEED_ACCOUNTS_JSON` comme variable secrète dans Render.

## 4. Points ouverts

Pour créer les comptes souhaités, définir dans Render une variable temporaire `SEED_ACCOUNTS_JSON` contenant la matrice d’adresses, `platformRole`, `staffRole` et mots de passe choisis, puis exécuter :

```bash
pnpm --filter @cofound/api seed:accounts
```

Après réussite, supprimer immédiatement `SEED_ACCOUNTS_JSON` et conserver la commande Start normale :

```bash
pnpm --filter @cofound/api prisma:migrate:deploy && pnpm --filter @cofound/api start
```

Ne jamais envoyer les mots de passe dans le chat. Tester ensuite les comptes sur `https://co-found-mg.vercel.app/login` avec leurs identifiants conservés côté utilisateur.

L’issue #90 reste ouverte pour les écrans frontend encore mockés. Le test réel B-01/Cloudinary reste à faire avec des comptes de recette.

## 5. Fichiers importants

- `apps/api/prisma/seed-admin.ts` : exécution du seed multi-comptes.
- `apps/api/prisma/seed-accounts-config.ts` : parsing, normalisation et validation.
- `apps/api/test/seed-accounts-config.test.ts` : tests de configuration.
- `apps/api/package.json` : commandes `seed:accounts` et `seed:admin`.
- `deploy/README.md` : procédure Render et exemple multi-rôles sans secret réel.
- `.claude/commands/handoff.md` : workflow obligatoire de reprise/clôture.

## 6. Prochaine action

Définir dans Render la variable secrète temporaire `SEED_ACCOUNTS_JSON` avec la matrice de comptes choisie, exécuter `pnpm --filter @cofound/api seed:accounts`, supprimer la variable, puis vérifier les connexions et `/api/v1/health`.
