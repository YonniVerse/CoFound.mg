# Context Handoff — Reprise de session CoFound.mg

> Lire ce fichier en premier à chaque nouvelle session. Sources de vérité : le dépôt et `docs/plan-de-developpement.md`.

## 1. État actuel

M-05 est fusionné dans `dev` via la PR #60, M-06 via la PR #61, M-07 via la PR #62, M-08 via la PR #63, la correction CI/staging via la PR #64 et M-14 via la PR #65. La branche active est `dev`, synchronisée avec `origin/dev` au commit `c5c2522`.

## 2. Livrables de cette session

M-09 expose la création, la liste des demandes entrantes et la décision accepter/refuser, avec quota mensuel de cinq demandes, refus silencieux de doublon pendant l’état `PENDING` et écritures transactionnelles. M-10 crée une connexion idempotente à partir d’une demande acceptée, normalise la paire d’identifiants et fournit les lectures limitées aux membres. M-11 fournit l’ouverture d’une conversation directe depuis une connexion, la liste des conversations, la lecture et l’envoi de messages.

Les fichiers principaux sont `apps/api/src/connection/connection-request.service.ts`, `apps/api/src/connection/connection-request.controller.ts`, `apps/api/src/connection/connection.service.ts`, `apps/api/src/connection/connection.controller.ts`, `apps/api/src/connection/connection.module.ts`, `apps/api/src/messaging/messaging.service.ts`, `apps/api/src/messaging/messaging.controller.ts`, `apps/api/src/messaging/messaging.module.ts`, `apps/api/src/app.module.ts` et `packages/shared/src/schemas.ts`.

## 3. Validation exécutée

Pour M-08, Prisma validate, lint API, typecheck API, build frontend et les tests API passent. La suite compte **111/111 tests réussis**. La migration `20260822100000_add_dream_match_exclusions` est appliquée sur Neon. Pour M-14, Prisma generate, lint API, typecheck API, lint/build frontend et la suite API passent avec **114/114 tests réussis**, dont le test HTTP du endpoint de signalement. La PR #64 ajoute `prisma generate`, la construction de `@cofound/shared` au CI et un workflow staging dédié. Le workflow staging existe mais son exécution dépend encore de la création de l’environnement GitHub et des secrets staging.

## 4. Décisions techniques

Les routes de messagerie exigent `message:send` et vérifient l’appartenance à la conversation avant toute lecture ou écriture. Les réponses de messages exposent uniquement `TalentProfile.pseudonym` sous le champ `authorPseudonym`; aucune relation `TalentIdentity` n’est chargée. Les créations de connexion et de conversation utilisent des transactions Prisma et des clés uniques pour l’idempotence.

## 5. Vigilance et travaux restants

M-05 à M-08 sont intégrés dans `dev`. M-14 ajoute les contrats Zod du signalement, `ReportService`, `ReportController`, `ReportModule`, la route POST `/reports` pour les cibles PROFILE, MESSAGE, PROJECT et POST, ainsi qu’une création transactionnelle sans identité civile dans la réponse. Le socle API, les boutons frontend et les tests HTTP M-14 sont fusionnés dans `dev`. Le composant réutilisable est intégré aux profils/talents, projets, publications et messages du canal projet. Les tickets M-12, M-13, M-15 et M-16 restent non implémentés.

## 6. Prochaine action

Configurer l’environnement GitHub `staging` et ses secrets, puis lancer le workflow après fusion de #64. Ajouter un vrai test E2E authentifié lorsque le harnais et les identifiants staging seront disponibles. Les tickets Vague 2 restants sont M-12, M-13, M-15 et M-16 ; ils doivent être traités par leurs propriétaires avant la clôture de la vague. La chaîne Rino suivante est `S-01 → S-02 → S-03/S-04`.
