# Matrice de traçabilité corrective — Vagues 1, 2 et 3

**Date** : 22 août 2026
**Branche de référence** : `dev`
**But** : corriger la dette de traçabilité constatée lors de l’audit sans modifier le backlog officiel.

## Règles de lecture

Un ticket est marqué **PR dédiée fusionnée** lorsqu’une Pull Request identifiable a été fusionnée dans `dev`. Il est marqué **regroupé** lorsqu’il est livré dans une PR dont le titre porte un autre ticket ou plusieurs tickets. Il est marqué **présence à confirmer** lorsqu’une preuve de code existe mais que la relation entre la fonctionnalité et le ticket n’est pas explicitement documentée par une PR dédiée. Une PR **fermée sans fusion** ne doit jamais être comptée comme une fusion, même si son périmètre a ensuite été repris.

## Vague 1 — La chaîne d’entrée

| Ticket | Traçabilité corrective | Preuve / remarque |
|---|---|---|
| E-01 | PR dédiée fusionnée | PR #31 |
| E-02 | PR dédiée fusionnée | PR #32 |
| E-03 | PR dédiée fusionnée | PR #33 |
| E-04 | PR dédiée fusionnée | PR #26 |
| E-05 | Regroupé | Fonctionnalité intégrée dans la chaîne de mapping/prévisualisation ; aucune PR autonome identifiée |
| E-06 | PR dédiée fusionnée | PR #29 |
| E-07 | PR dédiée fusionnée | PR #30 |
| E-08 | PR dédiée fusionnée | PR #34 |
| E-09 | Présence fonctionnelle à confirmer en recette | La chaîne invitation/activation existe ; aucune PR autonome retrouvée pour le ticket exact |
| E-10 | PR dédiée fusionnée | PR #43 |
| E-11 | PR dédiée fusionnée | PR #44 |
| E-12 | PR dédiée fusionnée | PR #35 |
| E-13 | PR dédiée fusionnée | PR #36 |
| E-14 | PR dédiée fusionnée | PR #37 |
| E-15 | PR dédiée fusionnée | PR #38 |
| E-16 | PR dédiée fusionnée | PR #39 |
| E-17 | PR dédiée fusionnée | PR #40 |
| E-18 | PR dédiée fusionnée | PR #41 |
| E-19 | PR dédiée fusionnée | PR #42 |

**Correction appliquée.** E-05 n’est plus présenté comme une PR indépendante. E-09 est maintenu comme point de vérification recette et non comme ticket disposant d’une PR autonome.

## Vague 2 — La rencontre

| Ticket | Traçabilité corrective | Preuve / remarque |
|---|---|---|
| M-01 | PR dédiée fusionnée | PR #56 |
| M-02 | PR dédiée fusionnée | PR #57 |
| M-03 | PR dédiée fusionnée | PR #58 |
| M-04 | PR dédiée fusionnée | PR #59 |
| M-05 | PR dédiée fusionnée | PR #60 |
| M-06 | PR dédiée fusionnée | PR #61 |
| M-07 | PR dédiée fusionnée | PR #62 |
| M-08 | PR dédiée fusionnée | PR #63 |
| M-09 | Regroupé | PR #55, chaîne de mise en relation |
| M-10 | Regroupé | PR #55, dévoilement et Connection |
| M-11 | Regroupé | PR #55, API de conversations |
| M-12 | Regroupé | PR #66, interface de messagerie |
| M-13 | Regroupé | PR #66, blocage utilisateur |
| M-14 | PR dédiée fusionnée | PR #65 |
| M-15 | PR dédiée fusionnée | PR #67 |
| M-16 | Regroupé | PR #67, événements email liés aux notifications |

**Correction appliquée.** Les regroupements M-09 à M-11, M-12/M-13 et M-15/M-16 sont explicitement documentés ; ils ne sont plus interprétés comme des PR manquantes.

## Vague 3 — Le projet

| Ticket | Traçabilité corrective | Preuve / remarque |
|---|---|---|
| P-01 | Regroupé | Fonctionnalité de création présente dans la chaîne projet/BMC ; aucune PR autonome fusionnée retrouvée |
| P-02 | PR dédiée fusionnée | PR #45 |
| P-03 | PR fermée sans fusion, reprise à vérifier | PR #46 fermée ; vérifier la transition BMC en recette |
| P-04 | PR fermée sans fusion, reprise à vérifier | PR #47 fermée ; les postes existent dans le code, mais le lien historique doit rester explicite |
| P-05 | Regroupé | Chaîne candidature livrée avec P-06/P-07 |
| P-06 | PR dédiée fusionnée | PR #48 |
| P-07 | PR dédiée fusionnée | PR #49 |
| P-08 | PR dédiée fusionnée | PR #50 |
| P-09 | PR dédiée fusionnée | PR #51 |
| P-10 | Regroupé | Chaîne de canal projet livrée avec la messagerie M-10/M-11 dans PR #55 |
| P-11 | PR dédiée fusionnée | PR #52 |
| P-12 | PR dédiée fusionnée | PR #53 |
| P-13 | Regroupé | Détail public livré dans PR #53 |

**Correction appliquée.** P-03 et P-04 restent explicitement signalés comme PR fermées sans fusion. Leur fonctionnalité ne sera considérée comme démontrée qu’après vérification du parcours correspondant sur staging.

## Contrôles de risque associés

| Risque | Contrôle associé | État |
|---|---|---|
| Traçabilité trompeuse | Cette matrice distingue dédié, regroupé et fermé sans fusion | Traité par documentation |
| Permissions négatives insuffisantes | `apps/api/test/rbac.test.ts` contient les 7 cas F-19 et les contrôles staff S-05 | Couvert localement |
| Régression fonctionnelle | Typecheck, lint et suite API lancés sur `dev` | Vert : 149 tests API réussis |
| Démonstration non prouvée | Recette staging avec seed `demo-` et parcours E2E | À exécuter avec variables de recette |
| Données réelles exposées | Seed reconstructible et pseudonymat obligatoire | Aucun secret ou donnée réelle dans le dépôt |
| Pertes de données | Runbook S-13 et restauration vers une base jetable | Procédure documentée, test réel à planifier |

## Décisions

Cette matrice est un document de suivi et ne modifie pas `docs/plan-developpement.md`. Les tickets regroupés ne doivent pas être recréés artificiellement sous forme de nouvelles PR historiques. Les tickets dont la preuve dépend de staging doivent rester marqués comme tels jusqu’à la démonstration réelle.

## Références

- [Backlog officiel](https://github.com/YonniVerse/CoFound.mg/blob/dev/docs/plan-de-developpement.md)
- [PR #26 — E-04](https://github.com/YonniVerse/CoFound.mg/pull/26)
- [PR #29 — E-06](https://github.com/YonniVerse/CoFound.mg/pull/29)
- [PR #31 — E-01](https://github.com/YonniVerse/CoFound.mg/pull/31)
- [PR #32 — E-02](https://github.com/YonniVerse/CoFound.mg/pull/32)
- [PR #33 — E-03](https://github.com/YonniVerse/CoFound.mg/pull/33)
- [PR #34 — E-08](https://github.com/YonniVerse/CoFound.mg/pull/34)
- [PR #42 — E-19](https://github.com/YonniVerse/CoFound.mg/pull/42)
- [PR #44 — E-11](https://github.com/YonniVerse/CoFound.mg/pull/44)
- [PR #45 — P-02](https://github.com/YonniVerse/CoFound.mg/pull/45)
- [PR #46 — P-03, fermée](https://github.com/YonniVerse/CoFound.mg/pull/46)
- [PR #47 — P-04, fermée](https://github.com/YonniVerse/CoFound.mg/pull/47)
- [PR #48 — P-06](https://github.com/YonniVerse/CoFound.mg/pull/48)
- [PR #49 — P-07](https://github.com/YonniVerse/CoFound.mg/pull/49)
- [PR #50 — P-08](https://github.com/YonniVerse/CoFound.mg/pull/50)
- [PR #51 — P-09](https://github.com/YonniVerse/CoFound.mg/pull/51)
- [PR #52 — P-11](https://github.com/YonniVerse/CoFound.mg/pull/52)
- [PR #53 — P-12/P-13](https://github.com/YonniVerse/CoFound.mg/pull/53)
- [PR #55 — M-09/M-10/M-11/P-10](https://github.com/YonniVerse/CoFound.mg/pull/55)
- [PR #65 — M-14](https://github.com/YonniVerse/CoFound.mg/pull/65)
- [PR #66 — M-12/M-13](https://github.com/YonniVerse/CoFound.mg/pull/66)
- [PR #67 — M-15/M-16](https://github.com/YonniVerse/CoFound.mg/pull/67)
