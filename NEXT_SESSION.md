# Handoff CoFound.mg

**Dernière mise à jour** : 2026-08-22
**Vague** : Vagues 1, 2 et 3 — traitement des incohérences
**État** : audit correctif documenté
**Branche actuelle** : `dev`

## Travail réalisé

Les incohérences de traçabilité identifiées dans l’audit ont été traitées sans modifier le backlog officiel. La matrice [`docs/traceabilite-vagues-1-2-3.md`](docs/traceabilite-vagues-1-2-3.md) distingue désormais les PR dédiées fusionnées, les tickets regroupés dans une autre PR, les PR fermées sans fusion et les points à confirmer en recette.

Le rapport [`audit-vagues-1-2-3-2026-08-22.md`](audit-vagues-1-2-3-2026-08-22.md) a été complété avec les preuves et mesures correctives. E-05 est documenté comme regroupé. E-09 est documenté comme présent dans le schéma et le service d’activation, mais à démontrer en recette pour les cas nominal, expiré et réutilisé. M-09 à M-11, M-12/M-13 et M-15/M-16 sont reliés à leurs PR regroupées. P-03 et P-04 restent explicitement des PR fermées sans fusion, malgré la présence de surfaces fonctionnelles reprises dans `dev`.

Le contrôle RBAC existant a été vérifié dans `apps/api/test/rbac.test.ts` : sept cas négatifs F-19 et les contrôles staff S-05 sont présents. Aucun secret, mot de passe ou donnée réelle n’a été ajouté.

## Validation

La suite globale exécutée sur `dev` a réussi : 149 tests API, typecheck récursif, lint récursif, build shared et build web. Le dépôt était propre et aligné sur `origin/dev` avant les modifications documentaires.

## Risques restant à traiter

La présence fonctionnelle ne remplace pas une démonstration verticale sur staging. Il faut encore fournir les variables `E2E_*`, les comptes pseudonymisés et le jeton d’activation pour exécuter les trois scénarios Playwright de S-09. Les tests négatifs RBAC doivent aussi être rejoués sur la recette réelle. La restauration doit viser une base jetable, jamais la base de production. Les tickets P-03/P-04 et E-09 doivent rester marqués « à confirmer en recette » tant que cette démonstration n’est pas faite.

## Prochaines étapes

1. Committer et pousser les documents correctifs.
2. Préparer la recette staging et exécuter la démonstration verticale.
3. Mettre à jour la matrice avec les résultats réels, sans modifier le backlog officiel.
