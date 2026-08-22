# Audit global du projet CoFound.mg

**Date de contrôle** : 22 août 2026
**Branche de référence** : `dev`
**Dépôt** : [YonniVerse/CoFound.mg](https://github.com/YonniVerse/CoFound.mg)
**Sources de vérité** : [`docs/plan-de-developpement.md`](https://github.com/YonniVerse/CoFound.mg/blob/dev/docs/plan-de-developpement.md), `NEXT_SESSION.md`, audits des Vagues 1–4, historique GitHub et état réel des PR.

## 1. Résumé exécutif

Le projet contient **six vagues et 92 tickets**. Le socle technique, la chaîne d’entrée, la mise en relation, l’espace projet et la majorité de la finition sont présents dans `dev`. Les validations globales exécutées sur `dev` le 22 août ont réussi : construction de `packages/shared`, génération du client Prisma, typechecks, lint, tests, builds et contrôle du budget JavaScript. L’audit antérieur documente **149/149 tests API réussis** ; le nouveau passage global s’est également terminé sans erreur de commande.

La Vague 4 est le principal chantier restant. Ses fonctionnalités sont largement codées dans les PR #73, #74 et #75, mais elles ne sont pas fusionnées et ne sont pas démontrées sur staging. La Vague 5 est techniquement presque terminée : S-01 à S-08 et S-10 à S-14 sont fusionnés, tandis que S-09 reste ouvert et en conflit avec `dev`.

> **Règle importante du backlog :** une fonctionnalité présente dans une branche ou dans `dev` ne suffit pas à clôturer une vague. Il faut une PR revue et fusionnée, une CI verte, les permissions testées, l’interface vérifiée sur mobile et une démonstration de bout en bout sur l’environnement de recette avec `seed:demo`.

## 2. État des vagues

| Vague | Périmètre | État technique | État de clôture |
|---|---|---|---|
| V0 | Fondations | 19/19 tickets fusionnés historiquement | À confirmer par démonstration verticale et restauration réelle |
| V1 | Chaîne d’entrée | 19/19 fonctionnellement intégrés ; E-05 et E-09 regroupés ou sans PR autonome | Recette complète encore à rejouer |
| V2 | Rencontre | 16/16 fusionnés, plusieurs tickets regroupés | Recette complète et contrôles négatifs à rejouer |
| V3 | Projet | Fonctionnalités intégrées, avec tickets regroupés et PR historiques fermées sans fusion pour P-03/P-04 | Démonstration complète encore à prouver |
| V4 | Côté payant | 0/11 fusionnés ; B-01 à B-02 dans #73/#74, B-03 à B-11 annoncés dans #75 | **Non clôturée** |
| V5 | Sécurité et finition | 13/14 fusionnés ; S-09 ouvert dans #76 | **Non clôturée tant que S-09 et la recette restent non validés** |

## 3. Inventaire des tickets existants

### Vague 0 — Fondations

Les tickets F-01 à F-19 sont considérés comme fusionnés dans `dev` selon l’historique des PR et les audits précédents. Ils couvrent le monorepo, Docker local, CI, budget de performance, Prisma, référentiels, authentification, RBAC, confidentialité, audit, contrats partagés, i18n, design system, client API, pg-boss, infrastructure, sauvegardes, observabilité et tests de permissions négatives.

| Statut | Tickets |
|---|---|
| Fusionnés | F-01 à F-19 |
| Dette de validation | Démonstration verticale V0, test réel de restauration, mesure de disponibilité et revue croisée auth/RBAC/privacy |

### Vague 1 — Chaîne d’entrée

| Statut | Tickets | Observation |
|---|---|---|
| Fusionnés avec PR identifiable | E-01 à E-04, E-06 à E-08, E-10 à E-19 | La chaîne email, import, activation, profil, onboarding, consentements et console établissement est présente |
| Intégrés sans PR autonome claire | E-05 | Le mapping assisté est intégré dans la chaîne de prévisualisation ; ne pas créer artificiellement une nouvelle PR |
| Présent mais traçabilité à confirmer | E-09 | Les jetons hachés, expirants et non réutilisables sont documentés ; tester nominal, expiration et réutilisation en recette |
| Reste fonctionnel | E-17 | Le rapport établissement, notamment les rebonds et l’export des adresses à corriger, doit être confirmé de bout en bout |

### Vague 2 — Rencontre

Les tickets M-01 à M-16 sont intégrés dans `dev`. M-09 à M-11 sont regroupés dans la PR #55, M-12 et M-13 dans #66, et M-15/M-16 dans #67. M-14 est livré dans #65.

| Statut | Tickets |
|---|---|
| Fusionnés ou regroupés | M-01 à M-16 |
| Reste de validation | Parcours recherche → dévoilement → conversation, blocage, signalement, notifications et permissions négatives sur staging |

### Vague 3 — Projet

La chaîne projet est intégrée dans `dev`, de la création au BMC, aux candidatures, aux membres, aux tâches, à la discussion, aux publications, à l’export et au détail public/privé.

| Statut | Tickets | Observation |
|---|---|---|
| Fusionnés ou regroupés | P-01, P-02, P-05 à P-13 | Certaines fonctionnalités sont livrées dans des PR couvrant plusieurs tickets |
| Fonctionnellement repris mais PR historique non fusionnée | P-03, P-04 | Les PR #46 et #47 sont fermées sans fusion ; vérifier la couverture réelle en recette et conserver cette distinction historique |
| Reste de validation | Tous les parcours verticaux P-01 à P-13, confidentialité public/privé et export reconstructible |

### Vague 4 — Côté payant

| Ticket | État actuel | Reste à faire |
|---|---|---|
| B-01 | PR #73 ouverte et en conflit avec `dev` | Rebaser, confirmer la migration et décider/implémenter le stockage binaire R2/S3 des justificatifs |
| B-02 | PR #74 ouverte, empilée sur #73, mergeable selon GitHub | Rebaser après #73, vérifier RBAC et activation capacité par capacité, puis fusionner |
| B-03 | Codé ou annoncé dans #75 | Vérifier profil organisationnel et statut vérifié après rebase/fusion |
| B-04 | Codé ou annoncé dans #75 | Vérifier recherche partenaire, filtres, pagination, opt-in et maturité BMC |
| B-05 | Codé ou annoncé dans #75 | Prouver que les notes internes restent invisibles publiquement et pour les rôles non autorisés |
| B-06 | Codé ou annoncé dans #75 | Vérifier publication, visibilité des opportunités et permissions par capacité |
| B-07 | Codé ou annoncé dans #75 | Tester candidatures talent/projet, doublons et transitions |
| B-08 | Codé ou annoncé dans #75 | Vérifier motifs de rejet, droits et notifications effectives |
| B-09 | Codé ou annoncé dans #75 | Garantir un seul message par équipe, aucune relance et unicité transactionnelle du contact |
| B-10 | Codé ou annoncé dans #75 | Vérifier le rôle `RECRUIT`, l’opt-in et le pseudonymat dans API et interface |
| B-11 | Codé ou annoncé dans #75 | Vérifier `PaymentProvider`, `FinancialEngagement=PROPOSED` et l’absence totale de paiement réel |

### Vague 5 — Sécurité et finition

| Statut | Tickets | Preuve actuelle |
|---|---|---|
| Fusionnés | S-01 à S-08 | PR #68 à #72 : modération, export, statuts de compte et `seed:demo` |
| Ouvert et bloqué techniquement | S-09 | PR #76 ouverte, branche en conflit avec `dev` ; tests Playwright staging non exécutés avec variables `E2E_*` |
| Fusionnés | S-10 à S-14 | PR #77 à #81 : performance, accessibilité, i18n, runbook d’exploitation et documents légaux |
| Validation humaine requise | S-14 | Les textes légaux doivent être relus et validés par un responsable humain avant usage officiel |

## 4. PR ouvertes et état GitHub

| PR | Sujet | Base | État | Action |
|---|---|---|---|---|
| #73 | B-01 demande d’accès partenaire | `dev` | Ouverte, conflit | Rebaser et décider le stockage des justificatifs |
| #74 | B-02 validation organisation/capacités | #73 | Ouverte, empilée | Rebaser sur `dev` après #73 puis revalider |
| #75 | Synthèse B-02 à B-11 | `dev` | Ouverte, conflit | Dédoublonner B-02 avec #74, rebaser et retester |
| #76 | S-09 tests E2E Playwright | `dev` | Ouverte, conflit | Restaurer/rebaser la branche, fournir `E2E_*`, exécuter les trois parcours |

Les contrôles détaillés GitHub ne sont pas exploitables via l’intégration actuelle, qui renvoie une erreur d’accès sur le champ `statusCheckRollup`. Les résultats locaux ne doivent donc pas être présentés comme une confirmation des checks distants.

## 5. Tâches restantes prioritaires

| Priorité | Tâche | Dépendances | Bloque |
|---:|---|---|---|
| P0 | Décider le traitement des justificatifs B-01 : stockage binaire R2/S3 ou périmètre explicitement limité aux métadonnées | Décision produit/infrastructure | Clôture B-01 et fusion de la chaîne partenaire |
| P0 | Rebaser et fusionner #73, puis #74 dans cet ordre | Décision B-01, CI verte | #75 et démonstration V4 |
| P0 | Rebaser #75, supprimer les doublons B-02 et valider B-03 à B-11 | #73 et #74 fusionnées | Parcours partenaire complet |
| P0 | Fournir les secrets et variables de staging sans les committer | Accès mainteneur GitHub/VPS/Neon | Migrations, seed et recette |
| P0 | Sauvegarder la base staging, appliquer les migrations et vérifier leur idempotence | Secrets Neon staging | Exécution réelle V4/V5 |
| P0 | Exécuter `seed:demo` avec données pseudonymisées | Base staging disponible | Démonstration verticale |
| P0 | Rebaser/fusionner #76 puis exécuter S-09 avec comptes de recette et `E2E_*` | Staging, comptes de test, jeton d’activation | Clôture V5 |
| P1 | Recetter B-01 à B-11 : RBAC, notes privées, contact unique, pseudonymat `RECRUIT`, notifications et absence de paiement | V4 déployée sur staging | Clôture V4 |
| P1 | Rejouer les démonstrations verticales V0 à V3 sur staging | Seed et comptes de recette | Validation réelle des vagues précédentes |
| P1 | Rejouer les sept permissions négatives et les contrôles de confidentialité sur base de recette | Staging et comptes par rôle | Go/no-go sécurité |
| P1 | Faire valider humainement S-14 | Responsable produit/juridique | Usage officiel des CGU et politique de confidentialité |
| P2 | Régler la dette de traçabilité E-05, E-09, M-16, P-01/P-03/P-04/P-05/P-10/P-13 par notes de clôture | Aucun code nécessaire | Qualité documentaire, pas le fonctionnement immédiat |
| P2 | Tester la restauration hors machine prévue par F-17 | Accès sauvegarde et environnement isolé | Preuve complète de reprise après incident |
| P2 | Mesurer la latence depuis Antananarivo/Antsiranana et les performances sur vrai Android 3G | Appareil et environnement de test | Validation non fonctionnelle finale |

## 6. Risques à ne pas confondre avec des tickets manquants

Le principal risque n’est plus l’absence générale de code. Il s’agit de la différence entre **code intégré**, **PR fusionnée**, **fonctionnalité démontrée** et **fonctionnalité validée en conditions de recette**. Les migrations Neon, les secrets de staging, les comptes E2E, le stockage binaire, les notifications réelles et la validation juridique sont des prérequis opérationnels distincts.

Aucune donnée personnelle réelle ne doit être introduite pour lever ces points. Les jeux de données de démonstration doivent rester pseudonymisés, et les secrets doivent être fournis uniquement par les mécanismes GitHub/VPS/Neon prévus, jamais dans Git.

## 7. Ordre de reprise recommandé

La reprise doit commencer par la décision B-01, car elle conditionne la validité du parcours documentaire. Il faut ensuite fusionner #73 puis rebaser et fusionner #74. La PR #75 doit être rebasée sur ce nouvel état et débarrassée de tout doublon B-02 avant sa fusion. En parallèle seulement, l’équipe peut préparer les variables staging ; la recette effective ne doit démarrer qu’après migration et seed réussis. Enfin, il faut rebaser #76, exécuter les trois scénarios Playwright, corriger les échecs et réaliser la démonstration verticale de chaque vague.

## Références

[1]: https://github.com/YonniVerse/CoFound.mg/blob/dev/docs/plan-de-developpement.md "Backlog officiel"
[2]: https://github.com/YonniVerse/CoFound.mg/pulls "Pull Requests CoFound.mg"
[3]: https://github.com/YonniVerse/CoFound.mg/pull/73 "PR #73 — B-01"
[4]: https://github.com/YonniVerse/CoFound.mg/pull/74 "PR #74 — B-02"
[5]: https://github.com/YonniVerse/CoFound.mg/pull/75 "PR #75 — synthèse V4"
[6]: https://github.com/YonniVerse/CoFound.mg/pull/76 "PR #76 — S-09"
[7]: https://github.com/YonniVerse/CoFound.mg/pull/77 "PR #77 — S-10"
[8]: https://github.com/YonniVerse/CoFound.mg/pull/81 "PR #81 — S-14"
