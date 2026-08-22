# Handoff CoFound.mg

**Dernière mise à jour** : 2026-08-22
**Vague** : Vague 5 — Sécurité et finition
**Ticket courant** : S-13 en cours de revue
**Branche actuelle** : `feat/S-13-docs-exploitation`
**État du workspace** : rebase S-13 en cours ; les conflits documentaires sont résolus par ce fichier.

## État exact

S-09 est publié dans la PR #76, mais sa validation réelle sur recette reste conditionnée aux variables `E2E_*`, aux comptes authentifiés et au jeton d’activation.

S-10 et S-11 sont fusionnés dans `dev` via les PR #77 et #78. S-12 est maintenant fusionné dans `dev` via la PR #79. S-13 est publié dans la PR #80 et doit être rebasé sur le `dev` mis à jour avant fusion. S-14 est publié dans la PR #81 et dépend de la revue des documents légaux.

## Travail S-13 réalisé

Le fichier `docs/runbook-exploitation.md` couvre le déploiement, les prérequis VPS, les secrets attendus sans valeurs, les vérifications post-déploiement, les sauvegardes hors machine, la restauration vers une base jetable, la classification des incidents P0 à P3, la procédure de réponse, la non-divulgation et la revue post-incident.

## Validation

Les branches S-12, S-13 et S-14 ont passé localement `git diff --check`, le build de `@cofound/shared`, le build web et le lint web. Le rebase S-13 est en cours uniquement pour résoudre les conflits de handoff créés par la fusion de S-12.

Aucun secret, token, mot de passe ou donnée réelle n’a été ajouté.

## Reste à faire

Terminer le rebase S-13, pousser avec `--force-with-lease`, vérifier puis fusionner la PR #80. Ensuite rebaser si nécessaire S-14 sur `dev` et fusionner la PR #81 après revue humaine du contenu légal. Enfin mettre à jour l’audit et confirmer la clôture de la Vague 5. La validation E2E de S-09 sur recette reste séparée et non exécutée faute de variables et comptes de recette.
