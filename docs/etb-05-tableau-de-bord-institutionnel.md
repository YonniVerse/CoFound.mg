# ETB-05 — Tableau de Bord Institutionnel

Ce document spécifie le fonctionnement, les indicateurs clés (KPIs), les formules de calcul, les règles d'accès RBAC et les garanties de confidentialité du tableau de bord institutionnel dans **CoFound**.

---

## 1. Objectifs & Philosophie

Le tableau de bord institutionnel (`/institution/dashboard`) fournit aux cadres des établissements d'enseignement supérieur (universités, grandes écoles, instituts) une vision globale et en temps réel de la dynamique de **leurs propres étudiants affiliés**.

### Principes directeurs :
1. **Pilotage de l'engagement étudiant** : Mesurer l'activation des comptes post-import et la complétion des profils.
2. **Valorisation de la dynamique entrepreneuriale** : Observer les projets créés, les secteurs investis, la pluridisciplinarité et la recherche de financements/mentors.
3. **Respect absolu de la confidentialité** : L'établissement accède uniquement à des statistiques agrégées sur ses propres affiliés, sans jamais pouvoir consulter les messageries privées, canaux de projet ou données sensibles individuelles.

---

## 2. Indicateurs Clés & Formules de Calcul

### A. Étudiants & Affiliations
| Métrique | Description | Formule / Source |
|---|---|---|
| **Total Étudiants** | Nombre total d'affiliations enregistrées pour l'établissement | `COUNT(Affiliation WHERE organizationId = orgId)` |
| **Étudiants Actifs** | Étudiants ayant activé leur compte CoFound | `COUNT(Affiliation WHERE user.status = 'ACTIVE')` |
| **Étudiants Invités / À activer** | Étudiants ayant reçu une invitation mais non encore activés | `COUNT(Affiliation WHERE user.status = 'INVITED')` |
| **Taux d'Activation (%)** | Pourcentage d'étudiants ayant finalisé l'activation de leur compte | $\text{Taux d'Activation} = \frac{\text{Étudiants Actifs}}{\text{Total Étudiants}} \times 100$ |

### B. Profils Talents
| Métrique | Description | Formule / Source |
|---|---|---|
| **Profils Commencés** | Profils ayant engagé l'onboarding | `COUNT(TalentProfile WHERE completion > 0)` |
| **Profils Complétés** | Profils remplis à un niveau satisfaisant ($\ge 60\%$) | `COUNT(TalentProfile WHERE completion >= 60)` |
| **Taux de Complétion (%)** | Proportion des étudiants actifs ayant complété leur profil | $\text{Taux de Complétion} = \frac{\text{Profils Complétés}}{\text{Étudiants Actifs}} \times 100$ |
| **Complétion Moyenne (%)** | Score moyen de remplissage des profils de l'établissement | $\text{Moyenne} = \frac{\sum \text{completion}}{\text{Total Étudiants}}$ |

### C. Projets Entrepreneuriaux
| Métrique | Description | Formule / Source |
|---|---|---|
| **Total Projets** | Projets initiés par un affilié ou comptant au moins un affilié actif | `COUNT(Project WHERE createdById IN affiliates OR members SOME affiliates)` |
| **Projets par État** | Répartition selon le cycle de vie du projet | `DRAFT`, `RECRUITING`, `ACTIVE`, `PAUSED`, `ARCHIVED` |
| **En Recherche de Mentor** | Projets publiant un appel à mentor ou en recrutement actif | `Post(type = SEEKING_MENTORSHIP) OR status = RECRUITING` |
| **En Recherche de Financement** | Projets recherchant des fonds d'amorçage ou investissements | `Post(type = SEEKING_FUNDING)` |

### D. Projets Pluridisciplinaires
- **Définition CoFound** : Un projet est considéré comme **pluridisciplinaire** lorsqu'il réunit au moins 2 membres actifs issus de filières d'études (`Field of study` / `fieldId`) distinctes au sein de leur profil talent.
- **Formule** :
  $$\text{Taux de Pluridisciplinarité} = \frac{\text{Projets Pluridisciplinaires}}{\text{Total Projets}} \times 100$$

### E. Entonnoir d'Activation (Funnel)
Visualisation du flux de conversion en 4 étapes séquentielles :
1. **Étudiants importés** (100% de la base importée par fichiers CSV/Excel).
2. **Invitations émises** (e-mails d'activation envoyés aux adresses institutionnelles).
3. **Comptes activés** (utilisateurs ayant défini leur mot de passe et validé leurs CGU).
4. **Profils complétés** (talents prêts pour le matching, les projets et les opportunités).

---

## 3. Sécurité, RBAC & Confidentialité

### A. Permissions requises
L'accès au tableau de bord nécessite :
- Rôle plateforme : `ORG_MEMBER`
- Permission RBAC : `Permission.ORG_READ`
- Rôle d'organisation : `ORG_ADMIN`, `ORG_MANAGER`, ou `ORG_VIEWER` au sein d'une organisation de type `INSTITUTION`.

### B. Isolation stricte des établissements
- Le backend résout l'organisation de rattachement via la session de l'utilisateur connecté (`request.user.userId`).
- Une tentative de consultation d'une organisation non autorisée est immédiatement rejetée avec une exception `ForbiddenException` (`institution.errors.accessDenied`).

### C. Seuils d'agrégation & Données masquées
- **Seuil d'agrégation minimal** : $\ge 5$ individus (`MIN_AGGREGATION_THRESHOLD = 5`).
- **Genre individuel** : Jamais exposé à l'établissement (masqué par conception).
- **Messagerie & Canaux de projet** : Inaccessibles à l'établissement pour préserver la liberté d'expérimentation et d'échange des étudiants.
- **Identité d'étudiants tiers** : Les membres d'autres universités au sein de projets mixtes apparaissent sous leur pseudonyme ou identité publique CoFound sans dévoiler de données privées.

---

## 4. Endpoints API

### `GET /api/v1/institution/dashboard`
- **Authentification** : Bearer JWT (`ORG_MEMBER`)
- **Paramètres optionnels** : `organizationId` (validé côté serveur)
- **Réponse** : Schéma [`institutionDashboardSchema`](file:///home/normanxcat/Lab/CoFound.mg/packages/shared/src/schemas.ts)
