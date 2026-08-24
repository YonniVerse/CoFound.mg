# Context Handoff — Reprise de session CoFound.mg

**Dernière mise à jour** : 2026-08-24
**Phase** : synchronisation dev/main intégrée ; correctif timeout auto-seed à publier
**Branche locale** : `main` pendant le rebase sur `origin/main`
**État Git** : conflit documentaire résolu en cours de rebase ; vérifier l’état après `git rebase --continue`.

## 1. État courant

`main` est la branche de livraison. La synchronisation récente de `dev` vers `main` a intégré les corrections UX/i18n frontend et conservé les changements opérationnels : auto-seed Render, routes de livraison, protection de statut de compte et configuration Vercel.

L’auto-seed Render s’exécute avant `app.listen` lorsque `SEED_ACCOUNTS_ON_START=true`, `SEED_ACCOUNTS_JSON` est présent et `SEED_ACCOUNTS_MODE=development` autorise explicitement le fonctionnement malgré `NODE_ENV=production`.

Le dernier log Render fourni montre que le build et les migrations réussissent, mais que plusieurs hachages Argon2 exécutés dans la transaction Prisma dépassent le timeout interactif de 5 secondes et provoquent `P2028`. Le correctif local déplace les hachages avant la transaction ; celle-ci ne contient plus que les upserts rapides.

## 2. Travail livré cette session

- Ajout de l’auto-seed Render de développement dans `main.ts`.
- Extension précédente du seed aux rôles `TALENT`, `ORG_MEMBER` et `STAFF` avec `SUPER_ADMIN`, `OPS_ADMIN` et `MODERATOR`.
- Déplacement du parseur et de la routine d’upsert dans `src/account-seed` compilé par le build.
- Correctif du timeout : hachage Argon2 hors transaction Prisma.
- Synchronisation de `dev` vers `main` avec résolution de conflits UX/i18n déjà effectuée sur le dépôt distant.

## 3. Validation

Réussis avant et après le rebase : typecheck API, build API, lint API, `git diff --check` et **178/178 tests API**. Le build compilé contient `runAutoSeed`.

Le log Render confirme que l’échec actuel est `P2028` dans `seed-accounts.ts`, pas une erreur de migration ni une erreur de schéma. Aucun secret ni mot de passe réel n’est présent dans le dépôt.

## 4. Points ouverts

Terminer le rebase documentaire, pousser le correctif timeout sur `main`, puis attendre le redeploy Render. Vérifier que `node dist/main.js` ouvre le port et que `https://cofound-mg.onrender.com/api/v1/health` répond HTTP 200.

Sur l’instance Render de développement, conserver les variables secrètes `SEED_ACCOUNTS_ON_START=true`, `SEED_ACCOUNTS_MODE=development` et `SEED_ACCOUNTS_JSON`. Le Start Command reste :

```bash
pnpm --filter @cofound/api prisma:migrate:deploy && pnpm --filter @cofound/api start
```

L’issue #90 reste ouverte pour les écrans frontend encore mockés. Les traductions FR/MG, les pages UX fusionnées et la carte Dream Match responsive proviennent de la synchronisation dev et doivent être conservées.

## 5. Fichiers importants

- `apps/api/src/account-seed/seed-accounts.ts` : hachage hors transaction et upserts atomiques.
- `apps/api/src/account-seed/auto-seed.ts` : activation conditionnelle de l’auto-seed.
- `apps/api/src/main.ts` : exécution avant `app.listen`.
- `apps/api/src/account-seed/seed-accounts-config.ts` : parsing et validation.
- `deploy/README.md` : procédure Render.
- `render.yaml` : Blueprint aligné sur `main`.
- `CHANGELOG.md` : historique des fusions et corrections.

## 6. Prochaine action

Terminer le rebase et pousser le correctif `fix(seed): éviter le timeout de transaction` sur `main`, puis contrôler le prochain démarrage Render et le healthcheck.
