# Context Handoff — Reprise de session CoFound.mg

> **Fichier de reprise de contexte**. Lire ce fichier en premier à chaque nouvelle session.
> **Périmètre développeur** : Rinoh / Roédrino — Vague 3, domaine Projet.
> **Source de vérité du backlog** : [`docs/plan-de-developpement.md`](docs/plan-de-developpement.md).

---

## 1. État actuel

- **Dernière mise à jour** : 2026-08-21.
- **Vague** : Vague 3 — Projet.
- **Ticket courant** : **P-08 — Membres & rôles**, en cours.
- **Branche Git** : `P-08`.
- **PR P-07** : [#49](https://github.com/YonniVerse/CoFound.mg/pull/49), ouverte vers `dev`.
- **PR P-06** : [#48](https://github.com/YonniVerse/CoFound.mg/pull/48), ouverte vers `dev`.
- **État Git** : modifications P-08 non commitées ; plusieurs fichiers de documentation hérités restent non suivis et ne doivent pas être ajoutés automatiquement.

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
| P-08 | En cours | Membres, rôles et UI-29 |

## 3. Travail réalisé cette session

Le ticket P-07 a été poussé et publié dans la PR #49. La branche P-08 a ensuite été reconstruite avec les commits projet P-01 à P-04 nécessaires à sa compilation. L’API P-08 contient maintenant `ProjectMembersService` et `ProjectMembersController` avec les routes de liste, ajout, changement de rôle et retrait. Les contrôles d’accès passent par `PROJECT_READ` et `PROJECT_MANAGE`; les mutations de rôle et de retrait utilisent une transaction Prisma afin de protéger le dernier `OWNER`.

Les contrats partagés P-08 couvrent les rôles et la réponse équipe. La liste révèle l’identité uniquement dans l’espace des membres actifs et n’expose pas le genre. UI-29 existe à `/projects/:id/team`, est chargée avec `React.lazy`, permet une gestion visuelle des rôles et bloque localement la rétrogradation ou le retrait du dernier porteur. Cette interface utilise encore des données locales de démonstration et doit être branchée au client API réel.

## 4. Fichiers importants

- `apps/api/src/project/project-members.service.ts` — logique métier et transactions P-08.
- `apps/api/src/project/project-members.controller.ts` — routes REST P-08.
- `apps/api/src/project/project.module.ts` — enregistrement des contrôleurs/services projet, BMC, postes et membres.
- `packages/shared/src/schemas.ts` — contrats P-04 à P-08 fusionnés.
- `apps/api/test/project-members.test.ts` — tests ciblés P-08.
- `apps/web/src/pages/ProjectTeamPage.tsx` — écran UI-29 actuel.
- `apps/web/src/App.tsx` — route lazy `/projects/:id/team`.
- `apps/api/src/applications/application-reminder.service.ts` — relance P-07.

## 5. Validation et points de vigilance

- `pnpm --filter @cofound/shared build` : réussi.
- `pnpm --filter @cofound/api typecheck` : réussi.
- Tests API ciblés/projet : **81/81 réussis**.
- `pnpm --filter @cofound/web typecheck`, lint et build : réussis ; le chunk initial reste conforme au budget observé.
- Le test P-08 doit encore être complété par des tests HTTP/intégration sur les quatre routes et par un test concurrent du dernier `OWNER` avec Prisma réel.
- Le service `add` doit encore valider explicitement l’existence et l’éligibilité du `userId` avant son upsert.
- Ne pas ajouter au commit les fichiers hérités non suivis : `analyse-backlog-vagues.md`, `guide-collaboration-CoFound.md`, `plan-tickets-utilisateur.md`, `rapport-analyse-attributions.md`, `pr-e*-body.md` et `apps/api/test/email-chain.test.ts`.

## 6. Prochaine action

**Finaliser P-08 API** : connecter l’écran `apps/web/src/pages/ProjectTeamPage.tsx` à un client `projectApi` réel, ajouter les tests HTTP/intégration de `ProjectMembersController`, puis lancer `pnpm --filter @cofound/api test`, `pnpm --filter @cofound/api typecheck` et `pnpm --filter @cofound/web build` avant tout commit.
