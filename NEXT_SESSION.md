# Context Handoff — Reprise de session CoFound.mg

> **Lire ce fichier en premier à chaque nouvelle session.**
> **Périmètre développeur** : Rinoh / Roédrino — Vague 3, domaine Projet.
> **Source de vérité du backlog** : [`docs/plan-de-developpement.md`](docs/plan-de-developpement.md).

---

## 1. État actuel

- **Dernière mise à jour** : 2026-08-21.
- **Vague** : Vague 3 — Projet.
- **Ticket courant** : **P-09 — Tâches**, implémenté, PR ouverte vers `dev`.
- **Branche Git** : `P-09`, créée depuis `P-08`.
- **PR P-08** : [#50](https://github.com/YonniVerse/CoFound.mg/pull/50), fusionnée vers `dev` au commit `0095044`.
- **PR P-09** : [#51](https://github.com/YonniVerse/CoFound.mg/pull/51), ouverte vers `dev`.
- **Dépendance M-10** : aucun commit/PR explicitement identifié dans l’historique `origin/dev`; à confirmer avec Yonni avant fusion globale.
- **État Git** : branche P-09 synchronisée avec `origin/P-09` au commit de merge `c3f2b23`; seuls les fichiers hérités non suivis restent exclus.

## 2. Tickets réalisés et en cours

| Ticket | État | Référence |
|---|---|---|
| P-01 à P-07 | Implémentés dans l’historique de la branche | Projet, BMC, postes, candidatures, relances |
| P-08 | Implémenté, PR ouverte | Membres, rôles, dévoilement pseudonymisé, UI-29 |
| P-09 | Implémenté, PR #51 ouverte et synchronisée | CRUD des tâches, responsable, échéance, statut |
| P-10 | Préparé, bloqué par M-11 | Canal de discussion projet |
| P-11 à P-13 | À faire | Publications, export, détail public/privé |

## 3. Travail réalisé cette session

P-09 dispose maintenant de contrats Zod partagés pour les statuts `TODO`, `DOING`, `BLOCKED` et `DONE`, la création, la mise à jour et la réponse de liste. `ProjectTasksService` implémente la liste, création, mise à jour et suppression avec accès réservé aux membres actifs. Les mutations sont transactionnelles et un responsable doit appartenir à l’équipe active du projet. Les réponses ne renvoient qu’un pseudonyme de responsable.

`ProjectTasksController` expose les routes REST sous `/api/v1/projects/:projectId/tasks`. L’écran lazy `/projects/:id/tasks` permet de créer une tâche, modifier son statut, afficher la description, le responsable et l’échéance, et supprimer une tâche via `apiClient`.

## 4. Fichiers importants

- `packages/shared/src/schemas.ts` — contrats et types P-09.
- `apps/api/src/project/project-tasks.service.ts` — logique métier et transactions.
- `apps/api/src/project/project-tasks.controller.ts` — routes CRUD P-09.
- `apps/api/src/project/project.module.ts` — enregistrement du module P-09.
- `apps/api/test/project-tasks.test.ts` — tests unitaires du service.
- `apps/api/test/project-tasks.integration.test.ts` — tests HTTP du contrôleur.
- `apps/web/src/data/projectApi.ts` — appels API des tâches.
- `apps/web/src/pages/ProjectTasksPage.tsx` — écran P-09.
- `apps/web/src/App.tsx` — route lazy P-09.

## 5. Validation et points de vigilance

- Package shared build et typecheck API : réussis.
- Tests ciblés P-09 : **5/5 réussis**.
- Suite API complète : réussie lors de la validation précédente ; elle doit être relancée après le commit final.
- Lint et build frontend : réussis lors de la validation P-09.
- Le CRUD P-09 impose actuellement `PROJECT_READ` pour la lecture et `PROJECT_MANAGE` pour les mutations.
- La validation avec Prisma réel et la démonstration recette restent à effectuer.
- P-09 est maintenant synchronisé avec `dev` après fusion de P-08 ; la PR #51 reste en attente de revue et de fusion.
- P-10 dépend de M-11. Le schéma Prisma `Conversation` existe, mais aucun service/API M-11 n’a été identifié dans `origin/dev`; ne pas dupliquer ce ticket sans confirmation de Yonni.
- Ne pas ajouter les fichiers hérités non suivis : `analyse-backlog-vagues.md`, `guide-collaboration-CoFound.md`, `plan-tickets-utilisateur.md`, `rapport-analyse-attributions.md`, `pr-e*-body.md` et `apps/api/test/email-chain.test.ts`.

## 6. Prochaine action

**Faire relire puis fusionner la PR #51** : vérifier les contrôles CI et la revue humaine, puis confirmer avec Yonni l’état de M-11 avant de démarrer l’implémentation de P-10.
