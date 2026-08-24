# Revue de la PR #37 et préparation de E-15

**PR examinée** : [#37 — E-14](https://github.com/YonniVerse/CoFound.mg/pull/37)  
**Branche** : `E-14` vers `dev`  
**Ticket suivant** : E-15 — Consentements  
**Date** : 21 août 2026

## 1. Décision de revue PR #37

La PR #37 ajoute le contrat partagé `profileCompletionReminderSchema`, l’endpoint privé `GET /api/v1/me/profile/completion-reminder`, le calcul des champs manquants et l’affichage d’une bannière dans l’espace personnel. La PR est encore ouverte et son statut GitHub est `UNSTABLE` ; les checks détaillés ne sont pas accessibles via l’intégration GitHub actuelle.

| Priorité | Point | Risque | Recommandation |
|---|---|---|---|
| Élevée | La bannière contient des chaînes françaises en dur | Contradiction avec la règle i18n et expérience incohérente pour les utilisateurs malgachophones | Remplacer le texte et le libellé du lien par des clés i18n |
| Élevée | Le test couvre le service mais pas l’endpoint HTTP | Le routage, la permission et le format de réponse ne sont pas vérifiés de bout en bout | Ajouter un test HTTP `GET /me/profile/completion-reminder` avec contexte authentifié |
| Moyenne | Le rappel est demandé à chaque changement de route | Requêtes répétées dans l’espace personnel et charge inutile | Mettre en cache la réponse au niveau du layout ou du contexte de session |
| Moyenne | Les clés `profile.fields.*` sont retournées sans contrat de catalogue vérifié | Une interface peut afficher des clés brutes si elles ne sont pas déclarées dans les ressources i18n | Ajouter et tester les clés françaises et malgaches |
| Moyenne | Le rappel ne distingue pas profil absent et profil existant incomplet dans la réponse | Le frontend ne peut pas adapter précisément son message | Ajouter éventuellement un état `profileMissing` si le produit le nécessite |
| Faible | Le seuil et le chemin d’action sont codés dans le service | Évolution moins souple du produit | Conserver pour le MVP ou extraire dans une constante de configuration partagée |

### Validation observée

La suite API compte **47 tests passants**. Le lint, le typecheck et le build frontend passent. Le build conserve l’avertissement connu de bundle minifié supérieur à 500 Ko. La fusion ne doit être demandée qu’après vérification locale finale des checks GitHub, car le statut distant actuel reste `UNSTABLE`.

## 2. Dépendances d’E-15

Le backlog officiel définit E-15 comme « Consentements : registre, écran, retrait », avec une dépendance directe à F-05. E-15 est attribué à **Yonni**, et non à Rino. F-05 est déjà intégré dans `dev`; le modèle Prisma `Consent` existe déjà avec `userId`, `purpose`, `policyVersion`, `grantedAt` et `revokedAt`.

| Précondition | État vérifié | Conséquence |
|---|---|---|
| F-05 — schéma Prisma initial | Disponible dans `dev` | Aucune migration de fondation à refaire |
| Modèle `Consent` | Présent dans `apps/api/prisma/schema.prisma` | E-15 peut ajouter les règles et endpoints sans recréer l’entité |
| F-13 — design system | PR #19 fusionnée | Écran `/settings` peut réutiliser les composants existants |
| F-12 — i18n | À vérifier avant l’implémentation UI complète | Les libellés de consentement doivent exister en français et malgache |
| F-15 — file pg-boss | PR #21 fusionnée | Disponible pour les traitements asynchrones futurs, notamment l’export E-15/S-06 |

## 3. Périmètre E-15 à implémenter

Le ticket doit couvrir le registre et l’écran, sans mélanger prématurément l’export complet de S-06. L’utilisateur connecté doit pouvoir consulter les consentements actifs avec leur version et leur date, accorder un consentement explicite lorsqu’un parcours le demande, et retirer un consentement avec une confirmation qui explique la conséquence.

| Domaine | Livrable attendu |
|---|---|
| API de lecture | `GET /api/v1/me/consents` avec purpose, version, date et statut |
| API de retrait | `POST` ou `DELETE /api/v1/me/consents/:purpose` avec confirmation métier côté serveur |
| Enregistrement | Création idempotente par utilisateur, finalité et version de politique |
| Historique | Conservation des retraits ; ne jamais supprimer l’historique réglementaire par erreur |
| Validation | Finalités autorisées, version non vide, utilisateur courant uniquement |
| Confidentialité | Aucun consentement d’un autre utilisateur accessible ; genre effaçable séparément |
| Frontend | Onglet Confidentialité de `/settings`, état chargement/repos/enregistrement/erreur/hors ligne |
| i18n | Clés `settings.*` en français et malgache, aucune chaîne en dur |
| Tests | Unités, intégration HTTP, idempotence, retrait et contrôle d’accès |

## 4. Ordre de passage

La PR #37 doit d’abord recevoir une revue et une validation locale finale. Elle peut ensuite être fusionnée si les checks GitHub deviennent verts et si Norman valide la cohérence visuelle de la bannière. Après fusion, E-15 doit être développé par Yonni sur sa propre branche, en réutilisant le modèle `Consent` existant. Rino ne doit pas réimplémenter E-15 dans sa branche E-14 ; son rôle est de vérifier la dépendance et de coordonner la revue croisée confidentialité.

Les tickets E-09, E-10 et E-11 ne sont pas des dépendances directes d’E-15 dans le backlog. F-12 doit néanmoins être vérifié comme précondition UI, car l’écran de paramètres exige deux locales et aucune chaîne en dur.

> Une dépendance déjà livrée, comme F-05 ou F-13, est vérifiée mais non refaite. E-15 appartient à Yonni : il faut ouvrir sa branche et sa PR dédiées, puis effectuer une revue croisée avant fusion.
