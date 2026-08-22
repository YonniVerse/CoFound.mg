# Revue PR #36 et audit des dépendances de Rino

**Date** : 21 août 2026  
**PR examinée** : [#36 — E-13](https://github.com/YonniVerse/CoFound.mg/pull/36)  
**Branche** : `E-13` vers `dev`  
**Source de vérité** : `docs/plan-de-developpement.md`, GitHub et contenu réel du dépôt.

## 1. Conclusion de revue

La PR #36 apporte une migration de progression, les contrats partagés, les endpoints d’onboarding, la persistance des compétences et un écran frontend en six étapes. Les bloqueurs transactionnels et de séquencement ont été corrigés ; les validations API passent avec 44 tests, dont le test HTTP E-13.

| Priorité | Point | Risque | Action demandée |
|---|---|---|---|
| Résolu | La mise à jour métier et la progression n’étaient pas dans une transaction unique | Écriture partielle possible | Toutes les écritures E-13 sont désormais exécutées dans une transaction Prisma unique |
| Résolu | L’ordre des étapes n’était pas imposé | Contournement du parcours | Une étape future est maintenant refusée si la progression courante ne l’autorise pas |
| Partiellement résolu | Il n’existait pas de test HTTP E-13 | Couverture route insuffisante | Test HTTP `GET`/`PATCH` et paramètre `:step` ajoutés ; les scénarios `401/403` avec guards globaux restent à compléter |
| Élevé | La reprise ne recharge pas les valeurs du profil dans l’écran frontend | Reprendre à l’étape courante avec des champs vides peut provoquer une perte ou un écrasement de données | Retourner un snapshot de l’étape et hydrater le formulaire |
| Élevé | L’écran demande des identifiants bruts de compétences, filières et secteurs | Expérience utilisateur inadaptée et risque d’identifiants invalides | Exposer les référentiels actifs et utiliser des sélecteurs typés |
| Moyen | L’étape 3 remplace toutes les compétences par suppression puis recréation | Risque de perte de données en cas de concurrence ou de mauvaise requête | Conserver la transaction et ajouter une stratégie de remplacement idempotente testée avec concurrence |
| Moyen | La migration ne rétro-remplit pas la progression des profils existants | Tous les profils existants commencent à l’étape 1 même si leur profil est déjà complet | Ajouter un backfill ou calculer la première étape manquante à la lecture |
| Résolu | Le contrat documentait une sauvegarde transactionnelle sans garantie globale | Écart de garantie | La persistance métier et l’avancement sont regroupés dans la même transaction |

## 2. Matrice des dépendances de Rino

| Ticket Rino | Dépendance | Propriétaire | État vérifié | Décision |
|---|---|---|---|---|
| F-06 | F-05 | Yonni | F-06 terminé, PR #12 fusionnée | Ne pas refaire |
| E-03 | E-02 | Yonni | E-02 terminé, PR #32 fusionnée ; E-03 PR #33 fusionnée | Ne pas refaire |
| E-04 | F-05 | Yonni | F-05 présent dans `dev` ; E-04 PR #26 fusionnée | Ne pas refaire |
| E-05 | E-04 | Rino | Intégré dans E-06, commit `e2c709a` | Ne pas refaire |
| E-06 | E-04, E-05 | Rino | PR #29 fusionnée | Ne pas refaire |
| E-07 | E-06, F-15 | Rino/Yonni | PR #30 et PR #21 fusionnées | Ne pas refaire |
| E-08 | E-07 | Rino | PR #34 fusionnée | Ne pas refaire |
| E-12 | F-09 | Yonni/Rino | PR #35 fusionnée | Ne pas refaire |
| E-13 | E-12, F-13 | Rino/Norman | E-12 PR #35 fusionnée ; F-13 PR #19 fusionnée | Dépendances disponibles |
| E-14 | E-13 | Rino | E-13 PR #36 en revue | Après fusion de E-13 |
| E-16 | F-08, F-13 | Yonni/Norman | PR #14 et PR #19 fusionnées | Dépendances disponibles |
| E-17 | E-07, E-03 | Rino | PR #34 couvre UI-36, mais le rapport établissement complet reste absent | Compléter après E-13 ou en parallèle maîtrisé |
| E-18 | E-07 | Rino | Aucun commit ou PR identifié | À implémenter |
| E-19 | E-18, F-09 | Rino/Yonni | Bloqué par E-18 | Après E-18 |
| M-05 | E-12 | Rino | Aucun commit ou PR identifié | À implémenter après E-13/E-12 stabilisés |
| M-06 | M-05 | Rino | Aucun commit ou PR identifié | Après M-05 |
| M-07 | M-06 | Rino | Aucun commit ou PR identifié | Après M-06 |
| M-08 | M-06 | Rino | Aucun commit ou PR identifié | Après M-06 |
| M-14 | F-05 | Rino | Aucun commit ou PR identifié | À implémenter |
| B-02 | F-08, F-10 | Rino | PR #14 et PR #16 fusionnées ; aucune implémentation B-02 identifiée | À implémenter |
| S-01 | M-14 | Rino | Aucun commit ou PR identifié | Après M-14 |
| S-02 | S-01 | Rino | Aucun commit ou PR identifié | Après S-01 |
| S-03 | S-02, M-15 | Rino/Yonni | Aucun M-15 identifié dans les PR ; dépendance manquante | Arbitrage puis implémentation coordonnée |
| S-04 | S-01, F-10 | Rino/Yonni | F-10 PR #16 fusionnée, S-01 absent | Après S-01 |
| S-05 | F-10 | Rino/Yonni | F-10 fusionné ; console staff absente | À implémenter |
| S-08 | F-06 | Rino | F-06 PR #12 fusionnée ; aucun seed demo identifié | À implémenter |

## 3. Dépendances externes déjà terminées

Les vérifications GitHub montrent que **F-06 (PR #12), F-08 (PR #14), F-09 (PR #15), F-10 (PR #16), F-13 (PR #19) et F-15 (PR #21)** sont déjà fusionnés. Il ne faut donc pas réimplémenter ces tickets sous prétexte qu’ils appartiennent à d’autres membres.

La chaîne E-01/E-02/E-03 est également terminée via les PR #31, #32 et #33. Les tickets E-09, E-10 et E-11 ne disposent pas d’une PR fusionnée identifiée dans l’état GitHub audité ; ils restent des dépendances opérationnelles de l’activation, mais ne sont pas des dépendances directes du parcours E-13 dans le backlog officiel.

## 4. Ordre recommandé

L’ordre d’exécution est le suivant : compléter si nécessaire les scénarios HTTP `401/403`, faire relire puis fusionner E-13. Ensuite, implémenter E-14, qui dépend directement d’E-13. En parallèle, les dépendances absentes peuvent être traitées par ticket et par propriétaire, mais aucune modification ne doit être développée dans le périmètre d’un autre ticket sans branche et validation distinctes.

Pour les dépendances de tickets Rino à venir, l’ordre technique recommandé est `M-14 → S-01 → S-02 → S-03/S-04`, `E-18 → E-19`, `M-05 → M-06 → M-07/M-08`, puis `S-08` et `S-05`. `B-02` peut démarrer dès que F-08 et F-10 sont confirmés, ce qui est déjà le cas.

> Une dépendance déjà fusionnée est une précondition disponible, pas un travail à refaire. Une dépendance absente doit être implémentée dans son propre ticket, avec attribution, branche, tests et PR explicites.
