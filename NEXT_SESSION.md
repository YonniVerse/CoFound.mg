> Fichier de reprise de contexte. Chargé automatiquement par `CLAUDE.md`.
> Mis à jour par la commande `/handoff` en fin de session.
>
> **Ne contient que l’état vivant.** L’historique va dans `CHANGELOG.md`, les décisions arrêtées
> dans `CLAUDE.md`, le détail dans `docs/`.

**Dernière mise à jour** : 2026-08-21
**Phase** : Vague 1 — finalisation de E-15
**Branche** : `E-15`, issue de `dev` après fusion de la PR #36
**État du workspace** : E-12 et E-13 finalisés et fusionnés ; E-15 initialisé avec contrats et routes API de consentements

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

Les PR #34 (E-08) et #35 (E-12) sont fusionnées dans `dev`. E-12 fournit le profil public/privé, l’édition partielle, l’identité privée, les contrôles de référentiels actifs et le seuil de visibilité. Les tests API passent avec 40 tests, dont l’intégration HTTP des routes `/me/profile` et `/me/identity`. La branche E-13 est issue de ce `dev` synchronisé. La revue et le plan sont dans `docs/revue-pr35-et-plan-e13.md`, et l’audit des tickets dans `docs/audit-tickets-rino.md`.

---

## 3. Tickets livrés — E-08/E-12 et ticket courant — E-13

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

F-12 est confirmé terminé via la PR #18 fusionnée ; le provider i18n est présent dans `apps/web/src/i18n.tsx`. E-15 est initialisé sur sa branche dédiée avec les contrats partagés, `ConsentModule`, les routes `GET /me/consents`, `POST /me/consents/:purpose` et `DELETE /me/consents/:purpose`, ainsi que les premiers tests unitaires. Les validations API passent avec 49 tests, dont l’intégration HTTP E-15. L’onglet Confidentialité de `/settings` est maintenant implémenté avec lecture, octroi, retrait confirmé et i18n français/malgache. La prochaine action est la revue et la fusion de la PR E-15.
