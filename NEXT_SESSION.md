# Context Handoff — Reprise de session CoFound.mg

> Lire ce fichier en premier à chaque nouvelle session. Source de vérité : `docs/plan-de-developpement.md`.

## État actuel

La Vague 3 — Projet est avancée jusqu’à P-13. P-09 a été fusionné via la PR #51 au commit `cc479101`. P-11 a été fusionné via la PR #52 au commit `4016380`. P-12 et P-13 ont été fusionnés via la PR #53 au commit `2df0dfb`.

P-10 reste bloqué par M-11, lui-même dépendant de M-10. L’audit GitHub et du code ne trouve aucun service ou contrôleur M-10/M-11 dans `origin/dev`; les modèles Prisma existent, mais l’implémentation métier doit être fournie par Yonni, propriétaire indiqué par le backlog. Le mock P-10 reste disponible sur sa branche dédiée.

## Livrables

P-08 et P-09 couvrent les membres, rôles, tâches, responsables, échéances et statuts avec contrôle des membres actifs et mutations transactionnelles. P-11 couvre les publications projet et leur écran frontend. P-12 couvre l’export JSON réservé au propriétaire. P-13 couvre le détail public avec filtrage des blocs BMC privés, postes fermés, publications expirées et identités civiles.

## Validation finale après fusions

La suite API complète sur `origin/dev` passe avec **92/92 tests réussis**. Les tests HTTP P-11, P-12 et P-13 passent avec **4/4 réussis**. Le typecheck API/frontend, le lint frontend et le build frontend sont réussis. La validation avec Prisma réel/Neon et un parcours authentifié reste à effectuer si l’environnement de recette est disponible.

## Prochaine action

Confirmer avec Yonni l’état de M-10 et M-11. Dès que M-11 est disponible, remplacer le mock P-10 par l’API réelle de conversation et ajouter ses tests de permissions, participants, lecture incrémentale et envoi de messages. Ne pas déclarer P-10 terminé avant cette intégration.

Les fichiers hérités non suivis du workspace ne doivent pas être ajoutés aux commits.
