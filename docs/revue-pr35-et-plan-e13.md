# Revue de la PR #35 et préparation de E-13

**Branche examinée** : `E-12`  
**PR** : [#35](https://github.com/YonniVerse/CoFound.mg/pull/35)  
**Commit examiné** : `79a0e91`  
**Date** : 2026-08-21

## Synthèse de la revue

La PR #35 apporte un premier socle cohérent pour l’API privée du profil. Elle réutilise le schéma partagé `talentProfileInputSchema`, encapsule la création et la mise à jour dans une transaction Prisma, sépare les données d’identité de la vue publique et ajoute des tests unitaires ainsi qu’un test HTTP de routage. Les validations locales passent avec **37 tests API**, le lint et le typecheck de l’API.

La PR ne doit toutefois pas être considérée comme définitivement prête à fusion avant traitement des points suivants. Deux risques fonctionnels concernent directement les invariants produit : la visibilité dans le feed peut être activée sous le seuil minimal de complétion, et les références `fieldId` ne sont pas validées explicitement avant écriture. Un troisième point concerne le contrat HTTP : les erreurs Zod levées depuis le service risquent d’être transformées en réponse 500 au lieu d’une réponse 400 structurée.

## Constats prioritaires

| Priorité | Zone | Constat | Impact | Action recommandée |
|---|---|---|---|---|
| Haute | `ProfileService.updateMine` | `visibleInTalentFeed` est accepté indépendamment de `completion`. | Un profil incomplet peut devenir visible dans le matching/feed malgré `MIN_PROFILE_COMPLETION = 60`. | Refuser l’activation sous 60 % ou forcer la valeur à `false`, puis tester les deux branches. |
| Haute | Gestion des erreurs | `talentProfileInputSchema.parse()` est appelé dans le service et aucune conversion explicite en `BadRequestException` n’est visible dans le contrôleur. | Une entrée invalide peut produire une réponse HTTP 500 au lieu de 400 avec contrat `ApiError`. | Ajouter un parseur contrôlé ou un pipe DTO/Zod qui convertit les erreurs en `ApiErrorCode.VALIDATION_ERROR`. |
| Moyenne | Référentiel | `fieldId` est envoyé à Prisma sans vérification d’existence et `sectorIds` est stocké dans un JSON sans validation des secteurs actifs. | Erreurs de clé étrangère ou références inactives/inexistantes stockées dans le profil. | Vérifier les `Field` et `Sector` actifs dans la même transaction, avec tests d’échec atomique. |
| Moyenne | Contrat PATCH | Le endpoint est nommé `PATCH`, mais le schéma exige toujours `pseudonym` et remplace toute la collection `goals`/`sectorIds`. | Les mises à jour partielles peuvent être rejetées ou écraser des champs non envoyés par un client futur. | Décider explicitement entre `PUT` complet et `PATCH` partiel ; si PATCH est retenu, créer un schéma `.partial()` et fusionner côté service. |
| Moyenne | Tests d’intégration | Le test HTTP injecte directement un utilisateur fictif par middleware et ne passe pas par `AccessTokenGuard`, `PermissionGuard` ni Prisma réel. | Le routage est validé, mais pas l’authentification, l’autorisation ou la persistance réelle. | Ajouter une suite avec guards actifs et une base de test/Prisma mocké au niveau module, puis couvrir 401/403/400/200. |
| Faible | Cohérence de réponse | `getMine` renvoie `minimumCompletion`, mais aucun contrat Zod de réponse E-12 n’est partagé. | Les clients web ne disposent pas d’un contrat de parsing aussi strict que pour les imports. | Ajouter `privateTalentProfileSchema` et `profileUpdateResponseSchema` dans `packages/shared`. |

## Décision de revue proposée

La PR peut être conservée ouverte comme **premier incrément E-12**, mais la fusion devrait attendre au minimum la correction du seuil `MIN_PROFILE_COMPLETION`, la conversion des erreurs de validation en 400 et la validation des références de référentiel. Le test HTTP actuel est utile comme test de câblage ; il ne doit pas être présenté comme une intégration complète de l’authentification et de la base.

## Préparation de E-13 — onboarding progressif

E-13 dépend de E-12 et de F-13. Son objectif est de proposer des étapes courtes, de conserver la progression et d’afficher un indicateur de complétion sans exposer d’identité sensible.

### Découpage technique proposé

| Ordre | Tâche | Dépendances | Critère de terminaison |
|---|---|---|---|
| 1 | Définir les étapes produit et les champs associés : identité privée, présentation, domaine, disponibilité, objectifs et visibilité. | E-12, F-13 | Un contrat versionné décrit les étapes, leur ordre, leurs champs obligatoires et leur poids dans la complétion. |
| 2 | Ajouter la persistance de progression. | Tâche 1 | La progression est reprise après déconnexion et ne dépend pas d’un état uniquement côté navigateur. |
| 3 | Ajouter les schémas partagés par étape et les erreurs métier. | Tâche 1 | Chaque étape accepte seulement ses champs autorisés et renvoie un contrat stable en français/malgache. |
| 4 | Implémenter `GET /me/onboarding` et `PATCH /me/onboarding/steps/:step`. | Tâches 2–3 | Les lectures et écritures sont authentifiées, idempotentes et transactionnelles avec mise à jour du profil E-12. |
| 5 | Implémenter la reprise et les transitions. | Tâche 4 | Une étape terminée peut être relue, la prochaine étape est calculée, et une progression incohérente est refusée. |
| 6 | Construire l’interface progressive. | Tâches 4–5, F-13 | L’utilisateur voit une seule étape courte à la fois, peut reprendre, revenir en arrière et visualiser son pourcentage. |
| 7 | Ajouter les tests d’accessibilité, confidentialité et régression. | Tâches 4–6 | Les tests couvrent 401/403, reprise, idempotence, validation, seuil de visibilité et absence de genre dans les vues établissement. |
| 8 | Préparer migration, documentation et PR. | Toutes | Migration Prisma, contrat API, handoff et validations globales sont synchronisés avant revue. |

### Décisions à prendre avant le code E-13

Il faut confirmer si la progression est une propriété du `TalentProfile` ou une entité séparée. Une entité séparée est préférable si le produit doit conserver l’historique, versionner les parcours ou proposer plusieurs parcours par rôle ; des champs dédiés dans `TalentProfile` sont suffisants pour un MVP strictement linéaire. Il faut également confirmer si l’étape d’identité privée est obligatoire pour atteindre le seuil de visibilité et si les champs `gender` doivent rester exclusivement privés, conformément aux règles de pseudonymité.

## Validation exécutée

La commande `pnpm --filter @cofound/api test` passe avec **37 tests**. Les commandes `pnpm --filter @cofound/api typecheck` et `pnpm --filter @cofound/api lint` passent également. Le test d’intégration HTTP E-12 vérifie le routage et l’appel des handlers `GET` et `PATCH` sous `/api/v1/me/profile` avec un service contrôlé.
