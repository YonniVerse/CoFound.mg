# Revue de la PR #35 et préparation de E-13

**Branche examinée** : `E-12`  
**PR** : [#35](https://github.com/YonniVerse/CoFound.mg/pull/35)  
**Commits examinés** : `79a0e91`, `301d5bb` et correctifs locaux en cours de PR  
**Date** : 2026-08-21

## Synthèse de la revue

La PR #35 apporte un premier socle cohérent pour l’API privée du profil. Elle réutilise le schéma partagé `talentProfileInputSchema`, encapsule la création et la mise à jour dans une transaction Prisma, sépare les données d’identité de la vue publique et ajoute des tests unitaires ainsi qu’un test HTTP d’intégration. Les validations locales passent avec **40 tests API**, le lint et le typecheck de l’API.

Les trois risques prioritaires identifiés ont été corrigés dans les derniers changements de la branche : la visibilité est maintenant conditionnée au seuil minimal de complétion, les référentiels actifs sont vérifiés dans la transaction et les erreurs de validation sont converties en `BadRequestException` structurée.

## Constats prioritaires

| Priorité | Zone | Constat | Impact | Action recommandée |
|---|---|---|---|---|
| Résolu | `ProfileService.updateMine` | `visibleInTalentFeed` est maintenant forcé à `false` sous `MIN_PROFILE_COMPLETION`. | Risque de visibilité prématurée supprimé. | Tests ajoutés pour un profil à 13 %. |
| Résolu | Gestion des erreurs | Le service utilise `safeParse` et lève `BadRequestException` avec `VALIDATION_FAILED`. | Les entrées invalides sont distinguées des erreurs internes. | Test ajouté sur le code et le `messageKey`. |
| Résolu | Référentiel | `Field` et `Sector` sont vérifiés comme actifs dans la transaction avant écriture. | Les références inactives sont rejetées sans création de profil. | Tests ajoutés pour filière et secteur invalides. |
| Moyenne | Contrat PATCH | Le endpoint est nommé `PATCH`, mais le schéma exige toujours `pseudonym` et remplace toute la collection `goals`/`sectorIds`. | Les mises à jour partielles peuvent être rejetées ou écraser des champs non envoyés par un client futur. | Décider explicitement entre `PUT` complet et `PATCH` partiel ; si PATCH est retenu, créer un schéma `.partial()` et fusionner côté service. |
| Moyenne | Tests d’intégration | Le test HTTP injecte directement un utilisateur fictif par middleware et ne passe pas par `AccessTokenGuard`, `PermissionGuard` ni Prisma réel. | Le routage est validé, mais pas l’authentification, l’autorisation ou la persistance réelle. | Ajouter une suite avec guards actifs et une base de test/Prisma mocké au niveau module, puis couvrir 401/403/400/200. |
| Faible | Cohérence de réponse | `getMine` renvoie `minimumCompletion`, mais aucun contrat Zod de réponse E-12 n’est partagé. | Les clients web ne disposent pas d’un contrat de parsing aussi strict que pour les imports. | Ajouter `privateTalentProfileSchema` et `profileUpdateResponseSchema` dans `packages/shared`. |

## Décision de revue proposée

Après ces corrections, E-12 est fonctionnellement prêt pour une dernière revue. Le test HTTP valide le routage et le câblage avec un service contrôlé ; il ne remplace pas encore une intégration avec PostgreSQL réel ni une exécution des guards de production.

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

La commande `pnpm --filter @cofound/api test` passe avec **40 tests**. Les commandes `pnpm --filter @cofound/api typecheck` et `pnpm --filter @cofound/api lint` passent également. Le test d’intégration HTTP E-12 vérifie le routage et l’appel des handlers `GET` et `PATCH` sous `/api/v1/me/profile` avec un service contrôlé.
