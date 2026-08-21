# apps/api

API NestJS en monolithe modulaire. F-05 initialise le runtime, Prisma et le schéma PostgreSQL ; les modules métier et les garanties transversales arrivent dans les tickets suivants de la vague 0.

Le healthcheck local est disponible sur `GET /api/v1/health`. Les référentiels initiaux sont chargés avec `pnpm --filter @cofound/api seed:reference`; la commande est idempotente.

## Connexion à Neon

Le projet Neon `CoFound.mg` utilise une base PostgreSQL `neondb` sur la branche principale `main`. La chaîne de connexion ne doit jamais être écrite dans Git : copier `.env.example` vers `.env`, puis renseigner les valeurs depuis la console Neon ou le gestionnaire de secrets.

```bash
cp apps/api/.env.example apps/api/.env
pnpm --filter @cofound/api prisma:migrate:deploy
pnpm --filter @cofound/api seed:reference
```

Les migrations sont idempotentes et doivent être appliquées avant le démarrage de l’API. Le fichier `apps/api/.env` est ignoré par Git.

| Ticket | Contenu |
|---|---|
| `F-05` | Schéma Prisma, migrations, extensions PostgreSQL (`pg_trgm`, `unaccent`) |
| `F-07` | Module `auth` — argon2id, jetons, rotation du rafraîchissement |
| `F-08` | Module `rbac` — guard global, refus par défaut |
| `F-09` | Module `privacy` — projections pseudonymes |
| `F-10` | Module `audit` — interceptor, table en écriture seule |

Détail et dépendances : `docs/plan-de-developpement.md`.
Architecture cible : `docs/architecture.md` §2.
