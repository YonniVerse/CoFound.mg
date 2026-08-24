# Context Handoff — Reprise de session CoFound.mg

**Dernière mise à jour** : 2026-08-22
**Phase** : Vague 5 — S-01 à S-04 fusionnés ; préparation de S-05
**Branche** : `dev`
**État du workspace** : E-14 est fusionné via PR #37. S-01 à S-04 sont fusionnés via PR #68. `dev` est synchronisé avec `origin/dev` au commit `32e6af7`.

## 1. Travail réalisé

E-14 a été synchronisé avec `dev`, complété avec les traductions française et malgache de la bannière, puis fusionné. Un test HTTP couvre `GET /api/v1/me/profile/completion-reminder`.

La chaîne des signalements comprend une file priorisée et paginée (`GET /api/v1/reports/moderation-queue`), des décisions transactionnelles (`PATCH /api/v1/reports/:id/decision`), la résolution/classement (`PATCH /api/v1/reports/:id/resolve`), les sanctions `WARNING`, `FREEZE`, `DISABLE` et `CONTENT_REMOVED`, ainsi que le gel/désactivation automatique pour les actions correspondantes.

La résolution notifie le déclarant via `NotificationService`. L’accès à l’identité civile de la cible est séparé de la file pseudonymisée (`GET /api/v1/reports/:id/identity`), protégé par `moderation:act` et journalisé par `AuditService`. Le genre n’est jamais renvoyé dans la réponse d’identité.

Le contexte JWT transporte désormais `staffRole`. Le guard autorise les actions sensibles uniquement pour un compte `STAFF` ayant `MODERATOR`, `OPS_ADMIN` ou `SUPER_ADMIN`. Un compte STAFF sans rôle étendu reste refusé.

Une console frontend `/moderation` affiche la file pseudonymisée, permet la prise en revue, la résolution, le classement sans suite, la saisie d’une sanction et une révélation d’identité explicitement confirmée.

## 2. Fichiers importants

- `apps/api/src/report/report.service.ts` : file, décisions, sanctions, notification et résolution de cible.
- `apps/api/src/report/report.controller.ts` : routes publiques de signalement et routes staff.
- `apps/api/src/rbac/access-token.guard.ts` et `permission.guard.ts` : propagation et contrôle de `staffRole`.
- `apps/api/src/auth/auth.service.ts` et `auth-request.ts` : claims JWT et contexte authentifié.
- `packages/shared/src/schemas.ts` : contrats de file, décision et identité modérateur.
- `apps/web/src/pages/ModerationQueuePage.tsx` : console staff pseudonymisée et formulaire de sanction.
- `apps/web/src/App.tsx` : route `/moderation`.
- `apps/api/test/report.test.ts` : tests de file, sanction et audit d’identité.
- `apps/api/test/dream-match.integration.test.ts` : tests HTTP E-14 et résolution de signalement.

## 3. Validation

Le package partagé, l’API et le frontend passent le typecheck. Le lint API/frontend, le build Vite et `git diff --check` passent. Les tests ciblés signalement/RBAC/intégration passent avec **23/23 réussis**. Le build frontend produit un chunk applicatif maximal inférieur à 500 kB.

## 4. Fusion

PR #68 : https://github.com/YonniVerse/CoFound.mg/pull/68 — fusionnée.

Commit fonctionnel : `e73ae62 feat(moderation): finaliser la chaine des signalements`.

Commit de stabilisation frontend : `0ee1f47 fix(moderation): stabiliser les decisions staff`.

La branche distante de fonctionnalité a été supprimée après fusion. `dev` a été mis à jour automatiquement et reste propre après la synchronisation.

## 5. Points restant à vérifier

La recette authentifiée avec un utilisateur staff réellement porteur d’un `StaffRole` dans Neon reste à exécuter. Il faut également vérifier le transport email réel et les retries pg-boss lors d’une résolution.

Les nouvelles routes doivent encore recevoir des tests dédiés de permission en environnement HTTP complet, ainsi qu’un test d’idempotence d’une décision répétée. La résolution est actuellement protégée par le guard et la mutation empêche le traitement d’un signalement déjà résolu, mais cette garantie doit être conservée par les tests de régression.

Les écrans complets S-05 (`/staff/audit`, `/staff/reference-data`, `/staff/health`) ne sont pas encore construits. Les écrans S-07 de compte gelé, sortant et alumni, le seed `seed:demo`, les E2E Playwright, la passe accessibilité/i18n et la documentation d’exploitation restent à réaliser.

## 6. Prochaine action

Effectuer la recette réelle de la chaîne S-01 à S-04 sur Neon, puis commencer S-05 — console staff d’audit, référentiels et santé produit. Ne pas modifier les backlogs officiels sans demande explicite.
