# Context Handoff — Reprise de session CoFound.mg

**Dernière mise à jour** : 2026-08-24
**Phase** : `main` livré ; seed admin prêt, exécution Render en attente
**Branche locale** : `main`
**État Git** : `main` suit `origin/main` sur le merge de la PR #92 ; workspace à revérifier après la mise à jour de ce fichier.

## 1. État courant

`main` est la branche de livraison. Les PR #86, #89 et #91 ont intégré la migration main, les corrections de déploiement et le correctif session/feed. La PR #92 a ajouté le seed des comptes administrateurs.

Render répond sur `https://cofound-mg.onrender.com/api/v1/health` avec HTTP 200 et `{"status":"ok","database":"ok"}`. Vercel Production suit `main`, Root Directory `apps/web`, et le dernier déploiement vérifié avant le merge #92 était `READY`. Le merge #92 déclenchera un nouveau build frontend sans modification de code frontend.

## 2. Travail livré cette session

- Audit du modèle `User` : email unique, `passwordHash` optionnel, `status`, `platformRole`, `staffRole`, `activatedAt`.
- Ajout de `apps/api/prisma/seed-admin.ts`.
- Ajout de `pnpm --filter @cofound/api seed:admin`.
- Seed idempotent : crée ou met à jour les comptes par e-mail, les active et leur attribue `platformRole=STAFF` avec `SUPER_ADMIN`, `OPS_ADMIN` ou `MODERATOR`.
- Mots de passe hachés avec Argon2id ; aucun mot de passe n’est écrit dans les logs ou le dépôt.
- Documentation de l’exécution ponctuelle dans `deploy/README.md`.
- PR #92 fusionnée dans `main` avec CI, Vercel et Preview Comments réussis.

## 3. Validation

Réussis localement avec une `DATABASE_URL` fictive uniquement pour les commandes Prisma : `prisma validate`, `prisma generate`, typecheck API, lint API et `git diff --check`. Aucun seed n’a été exécuté depuis le sandbox, car aucune `DATABASE_URL` Neon n’y est disponible.

## 4. Points ouverts

L’exécution réelle du seed Render est en attente des adresses e-mail des comptes administrateurs et des mots de passe choisis par le propriétaire. Les mots de passe ne doivent pas être envoyés dans la conversation.

Dans Render, ajouter temporairement la variable secrète `ADMIN_ACCOUNTS_JSON` au service Web API, puis exécuter `pnpm --filter @cofound/api seed:admin` depuis le Shell Render. Supprimer ensuite cette variable. Le seed n’est volontairement pas appelé au démarrage de l’API, afin de ne pas réinitialiser les mots de passe à chaque déploiement.

L’issue #90 reste ouverte pour les écrans frontend encore mockés. Le test réel B-01/Cloudinary reste également à faire avec des comptes de recette.

## 5. Fichiers importants

- `apps/api/prisma/seed-admin.ts` : validation, hash Argon2id et upsert des admins.
- `apps/api/package.json` : script `seed:admin` et lint de tous les scripts Prisma.
- `deploy/README.md` : procédure Render et exemple de `ADMIN_ACCOUNTS_JSON`.
- `apps/api/src/auth/auth.service.ts` : vérification du hash et connexion.
- `.claude/commands/handoff.md` : workflow obligatoire de reprise/clôture.

## 6. Prochaine action

Renseigner temporairement `ADMIN_ACCOUNTS_JSON` dans Render avec les e-mails et mots de passe choisis, exécuter `pnpm --filter @cofound/api seed:admin`, supprimer la variable, puis tester `https://co-found-mg.vercel.app/login` avec un compte `SUPER_ADMIN`.
