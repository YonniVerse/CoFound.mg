> Fichier de reprise de contexte. Chargé automatiquement par `CLAUDE.md`.
> Mis à jour par la commande `/handoff` en fin de session.
>
> **Ne contient que l’état vivant.** L’historique va dans `CHANGELOG.md`, les décisions arrêtées
> dans `CLAUDE.md`, le détail dans `docs/`.

**Dernière mise à jour** : 2026-08-21
**Phase** : Vague 1 — implémentation de E-12
**Branche** : `E-12`, issue de `dev` après fusion de la PR #34
**État du workspace** : API E-12 et test HTTP d’intégration ajoutés ; revue PR #35 et plan E-13 documentés

---

## 1. Où on en est

| Élément | État |
|---|---|
| Vague 0 — Fondations | ✅ `F-01` à `F-19` intégrés dans `dev` |
| E-01 — Domaine et configuration email | ✅ PR #31 fusionnée ; DNS et fournisseur à renseigner en exploitation |
| E-02 — Gabarits transactionnels | ✅ PR #32 fusionnée ; transport réel à configurer |
| E-03 — Webhook de rebond | ✅ PR #33 fusionnée |
| E-04 — Analyse CSV/XLSX | ✅ PR #26 fusionnée |
| E-05 — Mapping assisté | ✅ intégré dans `dev` via la branche E-06 |
| E-06 — Prévisualisation sans écriture | ✅ PR #29 fusionnée |
| E-07 — Application transactionnelle idempotente | ✅ PR #30 fusionnée |
| E-08 — Annulation et relance groupée | ✅ backend et UI-36 implémentés et validés |

---

## 2. Validation avant E-12

La PR #34 (E-08 backend + UI-36) est fusionnée dans `dev`. La branche E-12 est issue de ce `dev` synchronisé. Les tests API passent avec 37 tests, dont un test HTTP d’intégration des routes `GET` et `PATCH /api/v1/me/profile`. La revue et le plan E-13 sont dans `docs/revue-pr35-et-plan-e13.md`.

---

## 3. Ticket livré — E-08 et ticket courant — E-12

**Objectif** : permettre à un établissement de suivre ses lots, d’annuler un lot admissible et de relancer uniquement les invitations non activées.

| Fonction | Accès | Endpoint prévu |
|---|---|---|
| Liste des lots | `ORG_VIEWER` | `GET /institution/imports` |
| Détail du lot et des rebonds | `ORG_VIEWER` | `GET /institution/imports/:id` |
| Annuler un lot | `ORG_MANAGER` | `POST /institution/imports/:id/cancel` |
| Relancer les invitations | `ORG_MANAGER` | `POST /institution/imports/:id/resend-invitations` |

Le détail doit présenter les compteurs créés, mis à jour, ignorés, erreurs et rebonds, les lignes filtrables par résultat et les adresses `BOUNCED` exportables. L’annulation doit être protégée par RBAC, auditée et idempotente. Un lot déjà appliqué ou déjà annulé ne doit pas être annulé de nouveau. La relance doit cibler les comptes encore `INVITED`, exclure les comptes activés et republier les notifications via F-15 sans créer de nouveau compte.

**Dépendance directe** : `E-07`. Les dépendances techniques disponibles sont Prisma, RBAC, audit et F-15.

---

## 4. Points de vigilance

- Le transport email F-15 reste un transport de journalisation tant qu’un fournisseur réel n’est pas configuré.
- Le domaine `.mg`, SPF, DKIM, DMARC et `EMAIL_WEBHOOK_SECRET` doivent être renseignés dans l’environnement de déploiement.
- Toute mutation E-08 doit vérifier l’organisation du lot, le rôle contextuel et l’état courant avant d’écrire.
- Aucun ticket E-08 ne doit exposer le genre individuel dans la console établissement.

---

## 5. Prochaine action

Corriger les points prioritaires de la revue PR #35 — seuil de complétion, erreurs 400 et validation des référentiels — puis fusionner E-12. E-13 pourra ensuite commencer avec la définition des étapes, la persistance de progression et les endpoints d’onboarding.
