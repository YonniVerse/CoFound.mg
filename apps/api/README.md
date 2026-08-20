# apps/api

API NestJS — **pas encore initialisée**. F-02 fournit uniquement un serveur de santé provisoire pour valider l’orchestration locale ; il sera remplacé par NestJS au ticket F-05.

| Ticket | Contenu |
|---|---|
| `F-05` | Schéma Prisma, migrations, extensions PostgreSQL (`pg_trgm`, `unaccent`) |
| `F-07` | Module `auth` — argon2id, jetons, rotation du rafraîchissement |
| `F-08` | Module `rbac` — guard global, refus par défaut |
| `F-09` | Module `privacy` — projections pseudonymes |
| `F-10` | Module `audit` — interceptor, table en écriture seule |

Détail et dépendances : `docs/plan-de-developpement.md`.
Architecture cible : `docs/architecture.md` §2.
