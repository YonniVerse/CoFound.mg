> Fichier de reprise de contexte. Chargé automatiquement par `CLAUDE.md`.
> Mis à jour par la commande `/handoff` en fin de session.
>
> **Ne contient que l’état vivant.** L’historique va dans `CHANGELOG.md`, les décisions arrêtées
> dans `CLAUDE.md`, le détail dans `docs/`.

**Dernière mise à jour** : 2026-08-21
**Phase** : Vague 1 — démarrage de E-16
**Branche** : `E-16`, issue de `dev` synchronisé après fusion de la PR #38
**État du workspace** : E-15 est fusionné dans `dev` ; le socle de la console établissement est en cours

---

## 1. Où on en est

| Élément | État |
|---|---|
| Vague 0 — Fondations | ✅ `F-01` à `F-19` intégrés dans `dev` |
| E-01 à E-08 | ✅ tickets d’import et dépendances email fusionnés ou intégrés |
| E-12 — API et modèle de profil | ✅ fusionné dans `dev` |
| E-13 — Onboarding progressif | ✅ fusionné dans `dev` |
| E-14 — Rappel de complétion | ✅ fusionné dans `dev` |
| E-15 — Registre des consentements | ✅ PR #38 fusionnée dans `dev` |
| F-08 — Organisations et capacités | ✅ dépendance vérifiée dans `dev` |
| F-13 — RBAC et permissions | ✅ dépendance vérifiée dans `dev` |
| E-16 — Console établissement | 🔄 branche créée ; overview backend et UI-34 initiale en cours |

---

## 2. E-16 — socle en cours

L’endpoint `GET /institution/overview` est protégé par `ORG_READ` et ne retourne que les organisations de type `INSTITUTION` auxquelles l’utilisateur appartient. Les métriques sont agrégées au niveau organisationnel et toute valeur strictement inférieure à `MIN_AGGREGATION_THRESHOLD` (5) est remplacée par `null`. Aucun champ de genre n’est utilisé ou exposé.

La page `/institution` fournit l’état de chargement, l’erreur, le premier usage sans chiffres à zéro, l’action principale « Importer une promotion », les cartes de métriques masquées et les cinq derniers lots d’import. Les liens vers la liste et le rapport des lots réutilisent les routes E-08 existantes.

---

## 3. Points de vigilance

- Toute route de console doit vérifier le rôle contextuel de l’utilisateur dans l’organisation, et non une organisation fournie librement par le client.
- Le seuil de cinq personnes s’applique à chaque agrégat ; aucune donnée individuelle ni donnée de genre ne doit apparaître.
- Les mutations futures de E-16 (membres et rôles) devront être transactionnelles et auditées.
- Les alertes d’invitations anciennes et de rebonds seront traitées dans l’intégration détaillée E-17.

---

## 4. Prochaine action

Ajouter les tests unitaires et d’intégration de `InstitutionOverviewService` et du contrôleur, notamment l’isolement organisationnel, le rejet des non-membres, `ORG_READ` et le masquage des valeurs sous le seuil. Ensuite, finaliser la revue E-16 avant d’ouvrir la PR.
