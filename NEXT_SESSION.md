# Context Handoff — Reprise de session CoFound.mg

> Lire ce fichier en premier à chaque nouvelle session. Sources de vérité : le dépôt et `docs/plan-de-developpement.md`.

## 1. État actuel

La PR #56 de M-01 est fusionnée dans `dev` via le commit `29f18e4`. La branche active est `M-02` et la PR #57 est ouverte vers `dev`. M-02 est implémenté localement avec l’optimisation des chunks frontend.

## 2. Livrables de cette session

M-09 expose la création, la liste des demandes entrantes et la décision accepter/refuser, avec quota mensuel de cinq demandes, refus silencieux de doublon pendant l’état `PENDING` et écritures transactionnelles. M-10 crée une connexion idempotente à partir d’une demande acceptée, normalise la paire d’identifiants et fournit les lectures limitées aux membres. M-11 fournit l’ouverture d’une conversation directe depuis une connexion, la liste des conversations, la lecture et l’envoi de messages.

Les fichiers principaux sont `apps/api/src/connection/connection-request.service.ts`, `apps/api/src/connection/connection-request.controller.ts`, `apps/api/src/connection/connection.service.ts`, `apps/api/src/connection/connection.controller.ts`, `apps/api/src/connection/connection.module.ts`, `apps/api/src/messaging/messaging.service.ts`, `apps/api/src/messaging/messaging.controller.ts`, `apps/api/src/messaging/messaging.module.ts`, `apps/api/src/app.module.ts` et `packages/shared/src/schemas.ts`.

## 3. Validation exécutée

Les tests API passent avec **92/92 réussis**. Le lint, le typecheck complet et le build complet du monorepo passent également. Le build frontend produit notamment un chunk principal de 431,68 kB, inférieur au seuil d’avertissement de 500 kB.

## 4. Décisions techniques

Les routes de messagerie exigent `message:send` et vérifient l’appartenance à la conversation avant toute lecture ou écriture. Les réponses de messages exposent uniquement `TalentProfile.pseudonym` sous le champ `authorPseudonym`; aucune relation `TalentIdentity` n’est chargée. Les créations de connexion et de conversation utilisent des transactions Prisma et des clés uniques pour l’idempotence.

## 5. Vigilance et travaux restants

Les tests ciblés M-09/M-10/M-11/P-10 sont ajoutés et la suite compte 99 tests réussis. P-10 dispose maintenant de l’écran `/projects/:id/channel`, du client API et d’un canal `PROJECT` réservé aux membres actifs. M-01 est fusionné et M-02 est en revue dans la PR #57. Le build frontend ne signale plus de chunk supérieur à 500 kB : `vendor-react` 217,50 kB, `vendor-ui` 232,78 kB et `vendor-data` 363,98 kB. Les fichiers non suivis hérités du workspace ne doivent pas être ajoutés aux commits par erreur.

## 6. Prochaine action

Revoir et fusionner la PR #57 après contrôles GitHub, puis commencer M-03 sur `origin/dev` avec les composants du Feed Projets.
