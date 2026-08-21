# Context Handoff — Reprise de session CoFound.mg

> **Fichier de reprise de contexte**. Lire ce fichier en premier à chaque nouvelle session.
> **Périmètre développeur** : Rinoh / Roédrino — Vague 3, domaine Projet.
> **Source de vérité du backlog** : [`docs/plan-de-developpement.md`](docs/plan-de-developpement.md).

---

## 1. État actuel

- **Dernière mise à jour** : 2026-08-21.
- **Vague** : Vague 3 — Projet.
- **Ticket courant** : **P-08 — Membres & rôles**, finalisé techniquement, PR ouverte.
- **Branche Git** : `P-08`.
- **PR P-07** : [#49](https://github.com/YonniVerse/CoFound.mg/pull/49), ouverte vers `dev`.
- **PR P-06** : [#48](https://github.com/YonniVerse/CoFound.mg/pull/48), ouverte vers `dev`.
- **État Git** : branche P-08 synchronisée avec `origin/P-08` au commit `2fcd742`; seuls des fichiers hérités non suivis restent dans le workspace et ne doivent pas être ajoutés.

## 2. Tickets réalisés et en cours

| Ticket | État | Référence |
|---|---|---|
| P-01 | Intégré dans la base P-08 | Création projet brouillon |
| P-02 | Intégré dans la base P-08 | BMC guidé et autosave côté équipe |
| P-03 | Intégré dans la base P-08 | Publication transactionnelle |
| P-04 | Intégré dans la base P-08 | Postes ouverts et compétences |
| P-05 | Terminé sur branche dédiée | Candidature candidat |
| P-06 | Implémenté, PR ouverte | File porteur, acceptation/refus pseudonymisés |
| P-07 | Implémenté, PR #49 ouverte | Relance périodique idempotente |
| P-08 | Finalisation technique | Membres, rôles, intégration HTTP et UI-29 connecté à l’API |

## 3. Travail réalisé cette session

Le ticket P-07 a été poussé et publié dans la PR #49. La branche P-08 a ensuite été reconstruite avec les commits projet P-01 à P-04 nécessaires à sa compilation. L’API P-08 contient maintenant `ProjectMembersService` et `ProjectMembersController` avec les routes de liste, ajout, changement de rôle et retrait. Les contrôles d’accès passent par `PROJECT_READ` et `PROJECT_MANAGE`; les mutations de rôle et de retrait utilisent une transaction Prisma afin de protéger le dernier `OWNER`.

Les contrats partagés P-08 couvrent les rôles et la réponse équipe. La liste révèle l’identité uniquement dans l’espace des membres actifs et n’expose pas le genre. UI-29 existe à `/projects/:id/team`, est chargée avec `React.lazy` et utilise désormais `projectApi`/`apiClient` pour charger l’équipe, ajouter un membre, modifier un rôle et quitter le projet. Les états de chargement, erreur, vide et mutation sont gérés dans l’écran.

## 4. Fichiers importants

- `apps/api/src/project/project-members.service.ts` — logique métier et transactions P-08.
- `apps/api/src/project/project-members.controller.ts` — routes REST P-08.
- `apps/api/src/project/project.module.ts` — enregistrement des contrôleurs/services projet, BMC, postes et membres.
- `packages/shared/src/schemas.ts` — contrats P-04 à P-08 fusionnés.
- `apps/api/test/project-members.test.ts` — tests ciblés P-08.
- `apps/api/test/project-members.integration.test.ts` — tests HTTP du contrôleur P-08.
- `apps/web/src/pages/ProjectTeamPage.tsx` — écran UI-29 actuel.
- `apps/web/src/App.tsx` — route lazy `/projects/:id/team`.
- `apps/api/src/applications/application-reminder.service.ts` — relance P-07.

## 5. Validation et points de vigilance

- `pnpm --filter @cofound/shared build` : réussi.
- `pnpm --filter @cofound/api typecheck` : réussi.
- Suite API complète : **83/83 réussis**, dont les deux tests HTTP P-08.
- `pnpm --filter @cofound/web typecheck`, lint et build : réussis ; le chunk initial reste conforme au budget observé.
- Les tests HTTP P-08 couvrent les quatre routes et la validation d’un rôle invalide avec un serveur NestJS réel et un service substitué.
- Un test concurrent avec Prisma réel reste une amélioration ultérieure ; la protection applicative du dernier `OWNER` est déjà transactionnelle.
- Ne pas ajouter au commit les fichiers hérités non suivis : `analyse-backlog-vagues.md`, `guide-collaboration-CoFound.md`, `plan-tickets-utilisateur.md`, `rapport-analyse-attributions.md`, `pr-e*-body.md` et `apps/api/test/email-chain.test.ts`.

## 6. Prochaine action

**Faire relire puis fusionner la PR #50** : vérifier les commentaires CI/revue sur https://github.com/YonniVerse/CoFound.mg/pull/50, puis fusionner vers `dev` après validation humaine.
