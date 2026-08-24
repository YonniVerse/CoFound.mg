# Context Handoff — Reprise de session CoFound.mg

**Dernière mise à jour** : 2026-08-24
**Phase** : `main` livré ; comptes admins seedés, correction Render fusionnée
**Branche locale** : `main`
**État Git** : `main` suit `origin/main` sur le merge de la PR #93 ; workspace à revérifier après la mise à jour de ce fichier.

## 1. État courant

`main` est la branche de livraison. Les PR #86, #89, #91 et #92 ont intégré la migration, les corrections de déploiement, le correctif session/feed et le seed admin. La PR #93 corrige un crash Render révélé après l’exécution du seed.

Les comptes administrateurs ont été créés dans Neon via le seed ponctuel exécuté au démarrage Render : `yonnidebian@gmail.com` avec `SUPER_ADMIN` et `yoniubuntu@gmail.com` avec `OPS_ADMIN`, d’après le log Render fourni par l’utilisateur. Les mots de passe ne sont pas documentés et ne doivent pas être exposés.

Render répondait HTTP 200 sur `/api/v1/health` après le déploiement observé. Vérifier dans le dashboard que la commande Start normale est restaurée et que le dernier déploiement de `main` est Live après la PR #93.

## 2. Travail livré cette session

- Diagnostic du log Render : migrations déjà appliquées, seed admin réussi pour deux comptes, puis crash NestJS sur `AccountStatusService` avant l’ouverture du port.
- Cause confirmée : `AccountStatusService` importait `PrismaService` avec `import type`, ce qui supprimait le token runtime NestJS.
- Correction du même motif dans `AccountStatusService`, `ProductHealthService` et `ReferenceDataService` afin d’éviter des crashes successifs au démarrage.
- PR #93 fusionnée dans `main` avec CI, Vercel et Preview Comments réussis.
- Le seed admin reste séparé du Start Command normal et ne doit pas être exécuté à chaque redéploiement.

## 3. Validation

Validation locale réussie après compilation de `@cofound/shared` : Prisma generate, typecheck API, lint API, build API, **173/173 tests API**, recherche d’aucun import `import type { PrismaService }` restant dans `apps/api/src`, et `git diff --check`.

Le premier essai de validation a été bloqué par l’absence de `cc` dans le sandbox restauré, puis par l’absence de `@cofound/shared/dist` pour les tests ; `build-essential` et le build shared ont résolu ces blocages locaux. Aucun accès à Neon n’a été utilisé depuis le sandbox.

## 4. Points ouverts

Dans Render, remettre le Start Command normal :

```bash
pnpm --filter @cofound/api prisma:migrate:deploy && pnpm --filter @cofound/api start
```

Supprimer `ADMIN_ACCOUNTS_JSON` après le seed. La variable temporaire ne doit pas rester en production, car elle contient les mots de passe en clair. Ne pas modifier ni supprimer les `passwordHash` déjà créés dans Neon.

Après le redeploy normal, vérifier `/api/v1/health`, puis tester la connexion des deux comptes sur `https://co-found-mg.vercel.app/login`. Les permissions attendues sont `SUPER_ADMIN` pour la validation des organisations et `OPS_ADMIN` pour les opérations autorisées.

L’issue #90 reste ouverte pour les écrans frontend encore mockés. Le test réel B-01/Cloudinary reste à faire avec des comptes de recette.

## 5. Fichiers importants

- `apps/api/src/account-status/account-status.service.ts` : import runtime Prisma corrigé.
- `apps/api/src/health/product-health.service.ts` : import runtime Prisma corrigé.
- `apps/api/src/reference-data/reference-data.service.ts` : import runtime Prisma corrigé.
- `apps/api/prisma/seed-admin.ts` : seed ponctuel des comptes staff.
- `apps/api/package.json` : scripts `seed:admin` et validation lint Prisma.
- `deploy/README.md` : procédure du seed et retour à la commande Start normale.
- `.claude/commands/handoff.md` : workflow obligatoire de reprise/clôture.

## 6. Prochaine action

Restaurer dans Render le Start Command normal, supprimer `ADMIN_ACCOUNTS_JSON`, redéployer `main`, puis tester la connexion `SUPER_ADMIN` sur `/login` et `/api/v1/health`.
