# Audit de la Vague 4 — Le côté payant

**Date** : 22 août 2026
**Branche de référence** : `dev`
**Backlog officiel** : [`docs/plan-developpement.md`](https://github.com/YonniVerse/CoFound.mg/blob/dev/docs/plan-developpement.md)

## Conclusion exécutive

La Vague 4 n’est **pas encore fusionnée dans `dev`**. Trois PR ouvertes portent l’avancement : [PR #73](https://github.com/YonniVerse/CoFound.mg/pull/73) pour B-01, [PR #74](https://github.com/YonniVerse/CoFound.mg/pull/74) pour B-02, et [PR #75](https://github.com/YonniVerse/CoFound.mg/pull/75) pour la synthèse B-02 à B-11 et les interfaces partenaires.

Les validations locales réussissent lorsqu’elles sont exécutées dans l’ordre correct du monorepo — reconstruction de `@cofound/shared`, génération Prisma, puis tests API. Sur les branches contrôlées, B-01 passe **139/139 tests**, B-02 passe **145/145**, et la branche de synthèse B-09 passe **157/157**. Les builds et lint frontend passent également sur les trois branches.

Cependant, la clôture est bloquée par des éléments fonctionnels et de livraison clairement documentés dans la PR #75 : fusion des PR dans l’ordre, application et recette des migrations Neon, validation réelle des écrans partenaires, branchement du stockage binaire des justificatifs et notification effective des contacts et décisions.

## Périmètre officiel

| Ticket | Description | Dépendances | Responsable |
|---|---|---|---|
| B-01 | Demande d’accès partenaire, formulaire public | F-05 | N |
| B-02 | Validation staff et activation capacité par capacité | F-08, F-10 | R |
| B-03 | Profil vérifié de l’organisation | B-02 | N |
| B-04 | Recherche de projets partenaire, filtres et maturité BMC | M-01, P-02 | N |
| B-05 | Liste de suivi et notes internes privées | B-04 | N |
| B-06 | Entité `Opportunity` et appel à candidatures | B-02 | N |
| B-07 | Candidature à une opportunité | B-06 | N |
| B-08 | Traitement partenaire et motifs de rejet | B-07 | N |
| B-09 | Contact d’une équipe, message unique | B-04, M-11 | N |
| B-10 | Recherche de talents `RECRUIT`, profils pseudonymisés | M-04, F-09 | N |
| B-11 | Port `PaymentProvider` et `FinancialEngagement` sans interface | F-05 | Y |

## État détaillé des tickets

| Ticket | État actuel | Preuve | Risque ou reste à faire |
|---|---|---|---|
| B-01 | En cours, PR ouverte | PR #73, 139/139 tests annoncés et confirmés localement | Justificatifs : seules les métadonnées sont persistées ; stockage binaire R2 absent |
| B-02 | En cours, PR ouverte empilée sur B-01 | PR #74, 145/145 tests confirmés localement | Doit être fusionnée après B-01 ; recette RBAC et migrations à effectuer |
| B-03 | Implémentation annoncée dans PR #75 | Profil organisationnel présent dans la branche de synthèse | Vérifier l’écran et le statut « vérifié » sur staging |
| B-04 | Implémentation annoncée dans PR #75 | Recherche partenaire et maturité BMC présentes dans les services de la branche | Vérifier filtres, pagination, opt-in et permissions sur staging |
| B-05 | Implémentation annoncée dans PR #75 | Suivis et notes privées présents dans le périmètre de la branche | Tester qu’une note interne n’est jamais visible publiquement |
| B-06 | Implémentation annoncée dans PR #75 | Services et contrôleur d’opportunité présents | Vérifier publication et visibilité par capacité |
| B-07 | Implémentation annoncée dans PR #75 | Schémas et services de candidature d’opportunité présents | Tester candidatures talent/projet et doublons |
| B-08 | Implémentation annoncée dans PR #75 | Motif de rejet et traitement partenaire présents | Vérifier notification réelle et droits d’accès |
| B-09 | Implémentation annoncée dans PR #75 | `partner-contact.service.ts` et migration de contacts présents | Garantir l’unicité : un seul message, aucune relance |
| B-10 | Implémentation annoncée dans PR #75 | `PartnerTalentsPage` et service de recherche présents | Vérifier pseudonymat, opt-in et rôle `RECRUIT` |
| B-11 | Implémentation annoncée dans PR #75 | `PaymentProvider`, provider hors plateforme et `FinancialEngagement` présents | Pas d’interface attendue ; tester statut `PROPOSED` et absence de paiement réel |

## PR et dépendances de fusion

| PR | Branche | Base | Contenu | État |
|---|---|---|---|---|
| #73 | `feat/B-01-organization-request` | `dev` | B-01, migration `OrganizationRequest`, wizard public | Ouverte |
| #74 | `feat/B-02-organization-validation` | `feat/B-01-organization-request` | B-02, console staff et capacités | Ouverte, empilée sur #73 |
| #75 | `feat/B-09-team-contact` | `dev` | Synthèse B-02 à B-11, migrations et interfaces partenaires | Ouverte |

L’ordre recommandé est **#73 → #74 → #75**, avec une revue attentive de la duplication B-02 entre #74 et #75. La PR #75 est basée sur `dev` et contient plusieurs changements issus de la chaîne précédente ; elle ne doit pas être fusionnée aveuglément après #74 sans vérifier les conflits et le doublon fonctionnel.

## Validation technique

Les validations ont été rejouées sur les trois branches après `pnpm --filter @cofound/shared build` et `pnpm --filter @cofound/api prisma:generate` :

| Branche | Tests API | Typecheck API | Build web | Lint web |
|---|---:|---:|---:|---:|
| B-01 | **139/139** | Réussi | Réussi | Réussi |
| B-02 | **145/145** | Réussi | Réussi | Réussi |
| Synthèse B-02 à B-11 | **157/157** | Réussi | Réussi | Réussi |

Les premiers tests lancés sans reconstruire shared ni générer Prisma échouaient avec des exports shared absents et un client Prisma obsolète. Ce n’est pas un échec fonctionnel confirmé des branches, mais cela révèle un **risque de reproductibilité CI/local** : le pipeline doit garantir `shared build` et `prisma generate` avant les tests.

Le workflow CI officiel garantit bien l’ordre reproductible `pnpm --filter @cofound/api prisma:generate` puis `pnpm --filter @cofound/shared build`, avant lint, typecheck, tests, build et contrôle de budget. Les erreurs initiales observées localement provenaient donc d’un ordre d’exécution incomplet, non d’un défaut confirmé du code des branches.

Les contrôles GitHub détaillés ne sont pas lisibles depuis la session actuelle : l’API renvoie `Resource not accessible by integration` pour le champ de statut. Cela ne permet pas de conclure que les contrôles distants sont verts ; seules les validations locales sont confirmées.

## Risques résiduels

| Risque | Gravité | État | Traitement recommandé |
|---|---|---|---|
| Justificatifs sans stockage binaire | Élevée | Bloquant pour un parcours documentaire complet | Ajouter l’adaptateur R2/S3 et les permissions de consultation staff avant clôture |
| Migrations Neon non appliquées | Élevée | Non vérifié sur recette | Appliquer les migrations sur une base staging, contrôler l’idempotence et les index |
| PR #74 empilée sur #73 | Moyenne | Risque de conflit/duplication | Fusionner #73 puis rebaser #74 sur `dev` |
| PR #75 reprend B-02 | Moyenne | Risque de doublon après #74 | Comparer le diff après fusion et rebaser/éditer la branche avant fusion |
| Écrans partenaires | Moyenne | Présents dans la branche, non démontrés | Déployer staging et rejouer les parcours B-03 à B-10 |
| Contact unique et notifications | Élevée | Connexion réelle à vérifier | Tester unicité, absence de relance et notification des décisions |
| PaymentProvider | Moyenne | Port hors plateforme présent | Vérifier qu’aucun paiement réel n’est déclenché et que l’engagement reste `PROPOSED` |
| Pseudonymat RECRUIT | Élevée | À vérifier sur recette | Tester réponse API, UI et permissions avec un rôle non autorisé |

## Plan de clôture recommandé

1. Revoir et fusionner #73 après confirmation de la migration B-01 et décision explicite sur le stockage des justificatifs.
2. Rebaser #74 sur le nouveau `dev`, relancer shared build, Prisma generate, tests, typecheck, build et lint, puis fusionner.
3. Rebaser #75 sur `dev`, supprimer les doublons B-02 si nécessaire et relancer la suite complète.
4. Appliquer les migrations sur Neon staging avec sauvegarde et possibilité de retour arrière.
5. Exécuter le seed `demo-` et vérifier les parcours B-01 à B-11 avec des comptes pseudonymisés.
6. Tester les interdictions RBAC, la confidentialité des notes, le pseudonymat, l’unicité du contact et l’absence de paiement réel.
7. Ne déclarer la Vague 4 clôturée qu’après validation des justificatifs, des notifications et des interfaces partenaires sur staging.

## Conclusion

La Vague 4 est **bien avancée mais non terminée**. Les corrections réalisables sans accès externe ont été menées jusqu’à la validation locale des trois branches ; aucune fusion n’a été effectuée car le stockage documentaire et la recette staging restent des conditions de clôture. B-01 et B-02 sont dans des PR ouvertes ; B-03 à B-11 sont annoncés et largement codés dans une PR de synthèse ouverte, mais ils ne sont ni fusionnés ni démontrés sur staging. Le principal risque n’est pas le nombre de tickets manquants : c’est la mise en production prématurée d’un parcours partenaire dont le stockage documentaire, les migrations, les notifications et les contrôles de confidentialité ne sont pas encore validés en conditions réelles.

## Références

- [Backlog officiel](https://github.com/YonniVerse/CoFound.mg/blob/dev/docs/plan-de-developpement.md)
- [PR #73 — B-01](https://github.com/YonniVerse/CoFound.mg/pull/73)
- [PR #74 — B-02](https://github.com/YonniVerse/CoFound.mg/pull/74)
- [PR #75 — synthèse B-02 à B-11](https://github.com/YonniVerse/CoFound.mg/pull/75)
- [Workflow de déploiement staging](https://github.com/YonniVerse/CoFound.mg/blob/dev/.github/workflows/deploy-staging.yml)
