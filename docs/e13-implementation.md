# E-13 — Onboarding progressif

**Branche** : `E-13`  
**Base** : `dev` après fusion de la PR #35  
**Dépendances** : `E-12`, `F-13`  
**Responsable** : Rino

## Objectif

Permettre à un talent de compléter son profil par petites étapes, d’interrompre le parcours à tout moment et de le reprendre à l’étape sauvegardée. La complétion doit rester calculée par l’API E-12 ; le frontend ne doit jamais devenir la source de vérité.

## Étapes fonctionnelles

| Étape | Contenu | Données alimentées | Obligatoire pour la complétion |
|---|---|---|---|
| 1 — Toi | Prénom, nom, photo facultative | `TalentIdentity` | Oui |
| 2 — Parcours | Filière, année, niveau | `TalentProfile` et référentiels | Oui |
| 3 — Compétences | 3 à 8 compétences et niveaux | `TalentSkill` | Oui |
| 4 — Aspirations | Objectifs et secteurs | `TalentProfile` | Oui |
| 5 — Disponibilité | Heures et préférences d’équipe | `TalentProfile` | Oui |
| 6 — Visibilité | Pseudonyme, opt-in feed, masquage, genre facultatif | Profil public et identité privée | Non |

## Décision de persistance MVP

La progression linéaire sera stockée dans `TalentProfile` avec les champs `onboardingStep`, `onboardingCompletedSteps` et `onboardingUpdatedAt`. Cette option évite une entité supplémentaire pour le MVP, conserve la reprise avec le profil et permet une évolution ultérieure vers une entité versionnée si plusieurs parcours deviennent nécessaires.

La migration doit rester rétrocompatible : les profils existants commencent à l’étape calculée à partir de leurs données, et aucune donnée d’identité privée ne doit être copiée dans la projection publique.

## Contrats API prévus

`GET /api/v1/me/onboarding` retourne l’étape courante, les étapes terminées, le pourcentage de complétion calculé par E-12 et la définition de l’étape courante. `PATCH /api/v1/me/onboarding/steps/:step` valide uniquement les champs autorisés pour l’étape, applique la mise à jour dans une transaction et marque l’étape comme terminée lorsque ses critères sont satisfaits.

La mutation doit être idempotente : rejouer exactement la même requête ne crée aucune écriture parasite et ne fait pas régresser l’étape. Une étape future ne peut pas être marquée terminée si ses dépendances précédentes sont incomplètes, sauf reprise explicite autorisée par le produit.

## Découpage d’implémentation

| Ordre | Livraison | Validation |
|---|---|---|
| 1 | Migration Prisma de la progression | Migration appliquée et typecheck Prisma |
| 2 | Schémas Zod des six étapes et des réponses onboarding | Entrées inconnues rejetées, contrats partagés exportés |
| 3 | `OnboardingService` transactionnel | Reprise, idempotence et transitions testées |
| 4 | `OnboardingController` authentifié | `401/403/400/200` couverts |
| 5 | UI `/onboarding` mobile-first | Sauvegarde progressive et reprise visibles |
| 6 | Tests et documentation | API, UI, confidentialité, accessibilité et handoff validés |

Le champ `gender` reste privé et n’apparaît dans aucune réponse publique, aucun compteur individuel et aucune carte de matching. L’étape 6 doit expliquer le pseudonymat, le caractère facultatif du genre et le fait qu’il n’est utilisé que dans des statistiques agrégées conformes aux règles produit.
