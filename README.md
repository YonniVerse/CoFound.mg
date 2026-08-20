# CoFound.mg

**Infrastructure numérique de structuration entrepreneuriale étudiante à Madagascar.**

CoFound.mg connecte des étudiants de filières différentes pour former des équipes
complémentaires, structurer des projets crédibles et devenir visibles des incubateurs,
entreprises et institutions.

Équipe fondatrice : **You-ARY** — ESP-Antsiranana.

---

## Le problème

Des milliers d'étudiants malgaches ont des idées et des compétences ; presque aucun ne monte
un projet. Pas par manque d'envie, mais par manque de **complémentarité** — un informaticien ne
connaît que des informaticiens. Et quand une équipe se forme, personne ne la prend au sérieux :
rien ne prouve qui elle est ni ce qu'elle vaut.

## La réponse

Une plateforme **fermée et certifiée** où :

1. **L'établissement inscrit ses étudiants** — il n'y a pas d'inscription publique. C'est ce
   qui rend le badge crédible : personne ne peut se déclarer étudiant.
2. **On se rencontre sur les compétences** — nom, photo et genre restent masqués jusqu'à un
   dévoilement mutuel et consenti.
3. **On structure avant d'être visible** — un projet ne sort du brouillon qu'avec un Business
   Model Canvas rempli.
4. **Les partenaires trouvent des dossiers comparables** — pas dix messages WhatsApp.

## Le modèle économique

> **Les établissements ne paient pas. Les partenaires paient.**

On subventionne le côté qui crée la valeur (la densité de talents) et on monétise le côté qui
la capte (incubateurs, entreprises, institutions cherchant du dealflow ou du sourcing).

Détail : [`docs/business/modele-economique.md`](./docs/business/modele-economique.md)

---

## État du projet

| | Statut |
|---|---|
| Cadrage produit et technique | ✅ Terminé — voir [`docs/`](./docs/) |
| Périmètre du MVP | ✅ Arrêté |
| Architecture et modèle de données | ✅ Arrêtés |
| Plan de développement | ✅ ~70 tickets, 6 vagues |
| **Prototype d'interface** | ✅ Existant — React 19 + Vite, design system complet, données simulées |
| **Backend** | ⬜ Pas encore démarré |
| **Monorepo** | ⬜ Pas encore restructuré (ticket `F-01`) |

> **Prochaine action** : ticket `F-01` — restructuration en monorepo.
> Voir [`NEXT_SESSION.md`](./NEXT_SESSION.md) pour l'état détaillé.

---

## Structure cible

```
CoFound.mg/
├── apps/
│   ├── web/          # SPA React 19 + Vite + Tailwind 4 + shadcn  (← prototype existant)
│   └── api/          # API NestJS + Prisma + PostgreSQL
├── packages/
│   └── shared/       # Schémas Zod, types, codes d'erreur — partagés web ↔ api
└── docs/             # Documentation produit, technique et business
```

## Stack

| Brique | Choix |
|---|---|
| Frontend | React 19 · Vite · TypeScript · Tailwind 4 · shadcn/Radix · React Router 7 |
| Backend | NestJS · TypeScript · monolithe modulaire |
| Base de données | PostgreSQL managé · Prisma · recherche intégrée (`tsvector`, `pg_trgm`, `unaccent`) |
| Temps réel | **SSE** (pas WebSocket — voir la justification) |
| Auth | Maison — argon2id, jeton d'accès en mémoire, rafraîchissement en cookie `httpOnly` avec rotation |
| Traitements | pg-boss (file dans PostgreSQL, pas de Redis) |
| Fichiers | Cloudflare R2, téléversement direct présigné |
| Hébergement | Statique sur CDN · API sur VPS européen (Docker Compose + Caddy) · base managée même région |

Chaque choix, ses alternatives et son compromis assumé :
[`docs/stack-technique-et-justifications.md`](./docs/stack-technique-et-justifications.md)

---

## Lancer le projet en local

### Aujourd'hui — prototype frontend seul

Le monorepo n'est pas encore en place. Le prototype se lance depuis le dossier `frontend/` :

```bash
cd frontend
pnpm install       # ou npm install
pnpm dev           # http://localhost:5173
```

Aucun backend n'est nécessaire : les données proviennent de modules simulés
(`src/data/*Api.ts`) exposés derrière la même interface que la future API.

### Après le ticket `F-01` — monorepo complet

```bash
# Prérequis : Node 20+, pnpm 9+, Docker

pnpm install

# Base de données et services locaux
docker compose up -d

# Migrations et jeu de données de démonstration
pnpm --filter api prisma migrate dev
pnpm --filter api seed:demo

# Tout lancer
pnpm dev           # web : http://localhost:5173  ·  api : http://localhost:3000
```

**Variables d'environnement** : copier `.env.example` vers `.env` dans `apps/api`.
Les valeurs requises sont documentées dans le fichier d'exemple.

### Commandes utiles

| Commande | Effet |
|---|---|
| `pnpm dev` | Web + API en mode développement |
| `pnpm test` | Tests unitaires et d'intégration |
| `pnpm test:permissions` | **Les 7 permissions négatives** — doit toujours passer |
| `pnpm lint` | ESLint + vérification des chaînes en dur (i18n) |
| `pnpm build` | Build de production, avec vérification du budget de performance |
| `pnpm --filter api seed:demo` | Reconstruit le jeu de démonstration complet |

---

## Documentation

Index complet : [`docs/README.md`](./docs/README.md)

**Avant toute contribution**, lire au minimum :
- [`docs/mvp-scope.md`](./docs/mvp-scope.md) — ce qui est dans le périmètre et ce qui n'y est pas
- [`docs/architecture.md`](./docs/architecture.md) §5 — les permissions et la règle de visibilité de l'identité

## Règles non négociables

1. **Aucune chaîne de caractères en dur** — tout passe par les clés i18n.
2. **Aucun référentiel en dur dans le code** — compétences, filières, secteurs et régions
   vivent en base.
3. **Tout montant porte sa devise.**
4. **Les données privées ne sont jamais chargées** hors du contexte qui y donne droit — on ne
   les masque pas à l'affichage.
5. **Toute action sensible est auditée.**
6. **Les 7 permissions négatives sont testées** et bloquent la CI.
7. **Le budget de performance bloque la CI** — JS initial < 200 Ko gzip.

## Contribuer

Une branche par ticket, nommée d'après son identifiant (`F-01`, `E-07`, `M-06`…).
CI verte obligatoire. `auth`, `rbac` et `privacy` exigent une **revue croisée**.

Backlog complet : [`docs/plan-de-developpement.md`](./docs/plan-de-developpement.md)
