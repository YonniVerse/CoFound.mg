# Audit des tickets de Rino — état avant le prochain ticket

**Date** : 2026-08-21  
**Dépôt** : `YonniVerse/CoFound.mg`  
**Branche examinée** : `E-12`  
**Source de vérité** : `docs/plan-de-developpement.md`, historique Git, branches distantes et Pull Requests GitHub.

## Conclusion exécutive

La chaîne de fondations et d’entrée de Rino est suffisamment avancée pour poursuivre le développement. **F-06 et F-09 sont intégrés dans `dev`**, les tickets **E-03 à E-08 sont terminés** dans la chaîne cumulée, et **E-12 est en cours de revue dans la PR #35**. Le prochain ticket logique et dépendance directe de Rino est **E-13 — Onboarding progressif**.

Il ne faut pas commencer E-13 comme ticket « livré » avant de traiter les points prioritaires de la revue E-12 : seuil de visibilité lié à la complétion, conversion des erreurs de validation en HTTP 400 et validation des références `Field`/`Sector`. En revanche, l’architecture et la liste de tâches E-13 peuvent être préparées dès maintenant, car ses dépendances de backlog sont E-12 et F-13, et F-13 est déjà intégré.

## Tableau des tickets officiellement attribués à Rino

| Ticket | Sujet | Dépendances | État réel | Preuve ou remarque |
|---|---|---|---|---|
| F-06 | Seed des référentiels | F-05 | **Terminé** | Commit `fece781`, commande `seed:reference`, modèles Field/Skill/Sector/Region présents |
| E-03 | Webhook de rebond | E-02 | **Terminé** | PR #33 fusionnée dans `dev` |
| E-04 | Analyse CSV/XLSX et normalisation | F-05 | **Terminé** | PR #26 fusionnée |
| E-05 | Mapping assisté des colonnes | E-04 | **Terminé / intégré** | Commit `e2c709a` intégré dans la branche E-06 ; pas de PR séparée |
| E-06 | Prévisualisation ligne par ligne | E-04, E-05 | **Terminé** | PR #29 fusionnée |
| E-07 | Application transactionnelle idempotente | E-06, F-15 | **Terminé** | PR #30 fusionnée |
| E-08 | Annulation et relance groupée | E-07 | **Terminé** | PR #34 fusionnée ; backend et UI-36 intégrés dans `dev` |
| E-12 | Modèle de profil et API public/privé | F-09 | **En revue** | Branche `E-12`, PR #35 ouverte ; commits `79a0e91` et `301d5bb` |
| E-13 | Onboarding progressif | E-12, F-13 | **À faire — prochain ticket** | Aucune branche/PR dédiée ; préparation possible après stabilisation d’E-12 |
| E-14 | Relance de complétion | E-13 | **À faire** | Bloqué par E-13 |
| E-16 | Console établissement : membres et rôles | F-08, F-13 | **À faire** | Dépendances de fondation disponibles, mais séquence recommandée après E-13/E-14 |
| E-17 | Console établissement : lots et rapport | E-07, E-03 | **À faire / périmètre partiellement couvert** | UI-36 d’E-08 couvre la gestion des lots ; le ticket E-17 reste à compléter selon le rapport établissement attendu |
| E-18 | Affiliations et statuts groupés | E-07 | **À faire** | Aucune branche/PR dédiée |
| E-19 | Annuaire des affiliés sans genre | E-18, F-09 | **À faire** | Bloqué par E-18 |
| M-05 | Formulaire Dream-Match | E-12 | **À faire** | Dépend d’E-12 ; aucun code dédié identifié |
| M-06 | Scoring SQL Dream-Match | M-05 | **À faire** | Bloqué par M-05 |
| M-07 | Facteurs explicatifs | M-06 | **À faire** | Bloqué par M-06 |
| M-08 | Pas intéressé et exclusion | M-06 | **À faire** | Bloqué par M-06 |
| M-14 | Bouton de signalement | F-05 | **À faire** | Aucun code dédié identifié |
| B-02 | Console staff et capacités | F-08, F-10 | **À faire** | Aucun code dédié identifié |
| S-01 | File de modération | M-14 | **À faire** | Bloqué par M-14 |
| S-02 | Décisions et sanctions | S-01 | **À faire** | Bloqué par S-01 |
| S-03 | Notification au signalant | S-02, M-15 | **À faire** | Bloqué par S-02 et M-15 |
| S-04 | Accès modérateur journalisé | S-01, F-10 | **À faire** | Bloqué par S-01 |
| S-05 | Audit, référentiels et santé staff | F-10 | **À faire** | Les référentiels de F-06 existent ; la console reste à construire |
| S-08 | Seed de démonstration reconstructible | F-06 | **À faire** | Aucun commit dédié identifié |

## Dépendances déjà disponibles

| Dépendance | État | Conséquence |
|---|---|---|
| F-05 | Intégré dans `dev` | Import, validation et données de base disponibles |
| F-06 | Intégré dans `dev` | Référentiels disponibles, mais E-12 doit encore vérifier les identifiants actifs |
| F-08 | Intégré dans `dev` | RBAC organisationnel disponible pour les futurs tickets de console |
| F-09 | Intégré dans `dev` | Projections publique/privée et confidentialité disponibles |
| F-13 | Intégré dans `dev` | Design system frontend disponible pour E-13 |
| F-15 | Disponible | Publication des invitations et notifications déjà utilisée par E-07/E-08 |
| E-12 | En revue | Prérequis fonctionnel immédiat de E-13 ; fusion à effectuer après corrections prioritaires |

## Ordre recommandé avant de passer à E-13

La première action obligatoire est de traiter les remarques prioritaires de la revue de la PR #35 et de relancer les tests. Il faut ensuite fusionner E-12 dans `dev`, créer la branche E-13 depuis cette base et écrire les contrats de progression avant l’interface. Les étapes E-13 recommandées sont : définition des étapes produit, modèle de progression, schémas Zod par étape, endpoints de lecture/écriture, transitions idempotentes, interface progressive, tests de reprise/confidentialité/accessibilité, puis PR.

Les tickets E-09 à E-11 ne sont pas attribués à Rino dans le backlog. Ils peuvent être des dépendances opérationnelles de l’activation, mais ils ne doivent pas être artificiellement ajoutés au périmètre de Rino sans arbitrage de l’équipe.
