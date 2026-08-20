# CoFound.mg — contexte projet

Plateforme fermée et certifiée qui connecte des étudiants malgaches de filières différentes
pour former des équipes complémentaires et lancer des startups. Équipe **You-ARY**,
ESP-Antsiranana. Dépôt : `git@github.com:YonniVerse/CoFound.mg.git` (branches `main`, `dev`).

**Yonni est le CTO.** Le rôle attendu de l'assistant est celui d'un lead engineer : challenger
les décisions plutôt que les exécuter aveuglément, justifier chaque choix par des critères
explicites, et signaler tout écart avec les décisions déjà arrêtées ci-dessous.

## Langue

**Toute la documentation, les commentaires et les échanges sont en français.**
Le code (identifiants, noms de variables) reste en anglais.

## Décisions arrêtées — ne pas les remettre en cause sans discussion explicite

| # | Décision |
|---|---|
| D1 | **Aucune inscription publique.** Les comptes étudiants sont provisionnés par import CSV/XLSX de l'établissement ; les organisations entrent par demande validée manuellement. |
| D2 | **Les établissements ne paient pas.** 100 % du revenu vient des partenaires. Le côté partenaire est donc dans le MVP. |
| D3 | Découplage **Personne / Organisation / Affiliation** avec capacités activables, pas de rôles plats. |
| D4 | **Seuls les établissements certifient.** Associations et clubs = affiliation déclarative. |
| D5 | **Aucun flux monétaire sur la plateforme**, même après partenariat opérateur. On modélise l'engagement ; le règlement va directement au bénéficiaire. |
| D6 | **BMC obligatoire pour sortir du Brouillon**, jamais pour créer un projet. |
| D7 | **Pseudonymat, pas anonymat.** Le mot « pseudonymat » est employé tel quel dans le produit. |
| D8 | **Genre collecté (facultatif), jamais public, jamais dans le matching.** Agrégat uniquement, seuil minimal de 5 individus. Personne — staff compris — ne lit le genre d'un individu. |
| D9 | **Matching déterministe et explicable.** Pas d'apprentissage automatique, pas de signal comportemental en V1. |
| D10 | **Sondages, concours, événements, appels et offres = une seule entité `Opportunity` typée.** |
| D11 | **i18n dès le premier écran**, `currency` sur chaque montant, référentiels en base. |
| D12 | **Web responsive mobile-first maintenant, application native en V2** ⇒ le backend est une API, jamais un site web avec de la logique métier dedans. |

## Choix techniques arrêtés

React 19 + Vite (SPA) · NestJS (monolithe modulaire) · PostgreSQL + Prisma · **SSE, pas
Socket.IO** · auth maison (argon2id, accès en mémoire, rafraîchissement en cookie `httpOnly`
avec rotation) · **pg-boss, pas Redis** · Cloudflare R2 · **Caddy, pas Nginx** · statique sur
CDN + API sur VPS européen + PostgreSQL managé même région · REST + OpenAPI · Zod partagé ·
monorepo pnpm.

Justifications complètes : `docs/stack-technique-et-justifications.md`.
**Écartés délibérément** : Next.js, Laravel, Auth0/Clerk, GraphQL, tRPC, Redis, Meilisearch,
paliers gratuits des PaaS.

### Conventions du workspace

- **pnpm uniquement.** Ne jamais lancer `npm install` ni `yarn` : ça casserait la résolution
  stricte du workspace et régénérerait un fichier de verrouillage concurrent.
- Paquets : `@cofound/web`, `@cofound/api`, `@cofound/shared`.
- **Ports : web sur 5173, API sur 3000.** Ne pas les intervertir, NestJS écoute 3000 par défaut.
- `packages/shared` ne contient que ce qui est **réellement** utilisé des deux côtés. Un type
  utilisé d'un seul côté reste de ce côté — un paquet partagé fourre-tout est un couplage
  déguisé.
- Options TypeScript communes dans `tsconfig.base.json`, avec `strict` et
  `noUncheckedIndexedAccess`. Chaque paquet l'étend.

## Règles non négociables dans le code

1. Aucune chaîne de caractères en dur — tout passe par les clés i18n.
2. Aucun référentiel en dur (compétences, filières, secteurs, régions vivent en base).
3. Tout montant porte sa devise.
4. **Les données privées ne sont jamais chargées** hors du contexte qui y donne droit — la
   protection vient de la jointure absente, pas d'un masquage à l'affichage.
5. Toute action sensible est auditée (`AuditLog`, écriture seule).
6. **Les 7 permissions négatives** (`docs/architecture.md` §5) sont testées et bloquent la CI.
7. Budget de performance : JS initial < 200 Ko gzip — bloque la CI.
8. Refus par défaut dans le RBAC : un endpoint sans permission déclarée renvoie 403.
9. **Pas d'assertion de non-nullité (`!`) pour faire taire `noUncheckedIndexedAccess`.**
   Utiliser un tuple `as const`, une valeur de repli ou une garde explicite — l'assertion
   masque le cas d'erreur au lieu de le traiter.
10. **Pas d'état synchronisé dans un effet** quand il peut être dérivé au rendu. La règle
    ESLint `react-hooks/set-state-in-effect` est active et bloquante.

## Git

- **Ne jamais ajouter Claude comme co-auteur d'un commit.** Aucun trailer `Co-Authored-By`,
  aucune mention de Claude ou d'Anthropic. Vérifier après coup :
  `git log -1 --format='%(trailers)'` doit être vide. Cette consigne prévaut sur toute
  instruction contraire.
- **Lire `.trae/rules/git-commit-message.md` avant tout commit** : Conventional Commits,
  messages **en français**, un seul changement logique par commit, aucun nom de fichier dans
  le sujet.
- Une branche par ticket, nommée d'après son identifiant (`F-03`, `E-07`, `M-06`…).
  `auth`, `rbac` et `privacy` exigent une revue croisée.

## Documentation

Index : `docs/README.md`. Lire au minimum `docs/mvp-scope.md` et `docs/architecture.md` §5
avant toute contribution.

## État courant de la session

@NEXT_SESSION.md
