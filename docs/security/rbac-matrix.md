# CoFound.mg — Matrice RBAC & Architecture de Sécurité

Ce document formalise la séparation des accès, les règles d'autorisation, la protection de la vie privée (pseudonymat) et l'isolation multi-tenant au sein de la plateforme **CoFound.mg**.

---

## 1. Principes Fondamentaux de Sécurité

1. **Deny by default (Refus par défaut)** : Toute ressource ou endpoint non explicitement accordé à un rôle est immédiatement rejeté (`403 Forbidden` ou `401 Unauthorized`).
2. **Pseudonymat strict** : Les étudiants/jeunes talents interagissent sous pseudonyme (`TalentProfile`). L'identité réelle (`TalentIdentity` : nom, prénom, email, téléphone) n'est jamais exposée par défaut.
3. **Consentement mutuel pour levée d'anonymat** : La levée du pseudonymat entre deux membres requiert une mise en relation acceptée et un consentement explicite (`Connection.revealedAt`).
4. **Isolation Multi-Tenant (Établissements)** : Une institution ne peut en aucun cas accéder aux données, promotions, affiliations ou membres d'une autre institution.
5. **Cloisonnement Institution / Talents** : Les étudiants n'ont aucun accès aux consoles institutionnelles, outils d'importation, ou configurations d'organisations.
6. **Auditabilité des accès sensibles** : Tout accès exceptionnel à l'identité civile par la modération (`ReportService.revealIdentity`) est obligatoirement journalisé dans `AuditLog`.

---

## 2. Rôles et Périmètres

### A. Rôles Plateforme (`PlatformRole`)

| Rôle | Description | Permissions Principales |
|---|---|---|
| `TALENT` | Étudiant, porteur de projet, cofondateur | `talent:read`, `talent:self`, `project:read`, `project:create`, `project:manage`, `project:apply`, `connection:request`, `message:send` |
| `ORG_MEMBER` | Cadre institutionnel, gestionnaire d'incubateur, recruteur partenaire | `talent:read`, `project:read`, `org:read` |
| `STAFF` | Équipe opérationnelle, modérateurs, administrateurs système | Selon `StaffRole` : `moderation:read`, `moderation:act`, `audit:read`, `product-health:read`, `org:manage`, etc. |

### B. Sous-Rôles Staff (`StaffRole`)

| Rôle Staff | Droits accordés |
|---|---|
| `MODERATOR` | File de modération (`moderation:read`, `moderation:act`), levée d'identité sous audit obligatoire |
| `OPS_ADMIN` | Modération + Surveillance de l'état du système (`product-health:read`) |
| `SUPER_ADMIN` | Administration complète : validation organisations, gestion référentiels, journal d'audit (`audit:read`, `reference-data:manage`, `organization-request:manage`) |

### C. Rôles d'Organisation (`OrganizationRole`)

| Rôle Organisation | Droits dans l'établissement |
|---|---|
| `ORG_ADMIN` | Administration complète de l'établissement, invitation/gestion des membres, imports, certifications, affiliations |
| `ORG_MANAGER` | Gestion des promotions, imports, affiliations |
| `ORG_VIEWER` | Consultation du tableau de bord institutionnel et de l'annuaire |

---

## 3. Matrice Complète d'Accès aux Routes

### A. Routes Frontend

| Route Frontend | `TALENT` | `ORG_MEMBER` | `STAFF` | Redirection si non autorisé |
|---|---|---|---|---|
| `/feed` | ✅ Autorisé | ✅ Autorisé | ✅ Autorisé | — |
| `/search` | ✅ Autorisé | ✅ Autorisé | ✅ Autorisé | — |
| `/projects` / `/projects/feed` | ✅ Autorisé | ✅ Autorisé | ✅ Autorisé | — |
| `/profiles` / `/talents/feed` | ✅ Autorisé | ✅ Autorisé | ✅ Autorisé | — |
| `/dream-match` | ✅ Autorisé | ❌ Bloqué | ❌ Bloqué | `AccessDeniedPage (403)` |
| `/my-applications` | ✅ Autorisé | ❌ Bloqué | ❌ Bloqué | `AccessDeniedPage (403)` |
| `/projects/new` | ✅ Autorisé | ❌ Bloqué | ❌ Bloqué | `AccessDeniedPage (403)` |
| `/projects/:id/build` / `/journey` / `/bmc` | ✅ Membres projet | ❌ Bloqué | ❌ Bloqué | `AccessDeniedPage (403)` |
| `/institution` / `/institution/dashboard` | ❌ Bloqué | ✅ Autorisé | ❌ Bloqué | `AccessDeniedPage (403)` |
| `/institution/imports/*` | ❌ Bloqué | ✅ Autorisé | ❌ Bloqué | `AccessDeniedPage (403)` |
| `/institution/directory` | ❌ Bloqué | ✅ Autorisé | ❌ Bloqué | `AccessDeniedPage (403)` |
| `/institution/affiliations` | ❌ Bloqué | ✅ Autorisé | ❌ Bloqué | `AccessDeniedPage (403)` |
| `/institution/members` | ❌ Bloqué | ✅ Autorisé | ❌ Bloqué | `AccessDeniedPage (403)` |
| `/organizations/:id/projects` (Partner) | ❌ Bloqué | ✅ Membre org | ❌ Bloqué | `AccessDeniedPage (403)` |
| `/organizations/:id/talents` (Partner) | ❌ Bloqué | ✅ Membre org | ❌ Bloqué | `AccessDeniedPage (403)` |
| `/organizations/:id/wallet` | ❌ Bloqué | ✅ Membre org | ❌ Bloqué | `AccessDeniedPage (403)` |
| `/moderation` | ❌ Bloqué | ❌ Bloqué | ✅ Autorisé | `AccessDeniedPage (403)` |
| `/staff/audit` | ❌ Bloqué | ❌ Bloqué | ✅ `SUPER_ADMIN` | `AccessDeniedPage (403)` |
| `/staff/organizations` | ❌ Bloqué | ❌ Bloqué | ✅ `SUPER_ADMIN` | `AccessDeniedPage (403)` |
| `/staff/reference-data` | ❌ Bloqué | ❌ Bloqué | ✅ `SUPER_ADMIN` | `AccessDeniedPage (403)` |
| `/staff/health` | ❌ Bloqué | ❌ Bloqué | ✅ `OPS_ADMIN` / `SUPER_ADMIN` | `AccessDeniedPage (403)` |

---

## 4. Protection des Données & Pseudonymat

```
          ┌────────────────────────────────────────┐
          │               Utilisateur              │
          └───────────────────┬────────────────────┘
                              │
             ┌────────────────┴────────────────┐
             ▼                                 ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│      TalentProfile       │      │      TalentIdentity      │
│ (Pseudonyme, Bio, Avatar,│      │ (Nom, Prénom, Téléphone, │
│  Filière, Compétences)   │      │  Email, Pièce d'identité)│
└────────────┬─────────────┘      └────────────┬─────────────┘
             │                                 │
             ▼                                 ▼
    Accessible publiquement           Strictement protégé :
    (Feed, Recherche, Projets)        - Soi-même (talent:self)
                                      - Consentement mutuel (revealedAt)
                                      - Modération (sous audit obligatoire)
```

### Règles de Projection :
1. **API Publique & Feeds** : Utilise exclusivement `publicTalentViewSchema` (`revealed: false`).
2. **Recherche Partenaire** (`PartnerDiscoveryService`) : Renvoie les profils avec pseudonymes, compétences et complétion. Ne renvoie ni nom de famille, ni email personnel, ni numéro de téléphone.
3. **Modération** : L'accès à `TalentIdentity` via `/reports/:id/identity` émet un événement `MODERATION_IDENTITY_REVEALED` dans le journal d'audit serveur avec le `targetUserId` et l'acteur.
4. **Tableau de bord institutionnel** :
   - Agrégation minimum fixée à `MIN_AGGREGATION_THRESHOLD = 5`.
   - Données de genre masquées individuellement.
   - Messageries privées et canaux projets inaccessibles à l'institution.

---

## 5. Isolation Multi-Tenant

Chaque requête ciblant une organisation ou une institution est soumise à une vérification d'appartenance :

```typescript
// Exemple appliqué systématiquement :
const member = await prisma.organizationMember.findUnique({
  where: { organizationId_userId: { organizationId, userId: actorId } }
});
if (!member || !ALLOWED_ROLES.includes(member.role)) {
  throw new ForbiddenException('Accès refusé à cette organisation.');
}
```

Une institution `A` ne peut en aucun cas lire ou modifier des données appartenant à une institution `B`.

---

## 6. Suite de Tests Négatifs

La suite de tests automatisés (`apps/api/test/security-matrix-negative.test.ts` et `apps/api/test/rbac.test.ts`) garantit :
- `SEC-01` : Rejet des étudiants accédant aux routes institutionnelles (`ORG_READ`, `ORG_MANAGE`).
- `SEC-02` : Rejet des étudiants accédant aux consoles staff/audit/modération.
- `SEC-03` : Rejet des membres d'organisation accédant à l'audit, modération ou santé produit.
- `SEC-04` : Isolation inter-institutionnelle stricte (Institution A vs B).
- `SEC-05` : Rejet des modifications d'affiliations croisées.
- `SEC-06` : Non-divulgation de l'identité civile sans connexion mutuelle.
- `SEC-07` : Recherche partenaire anonymisée.
- `SEC-08` : Audit obligatoire sur toute levée de pseudonymat par un modérateur.
- `SEC-09` : Rejet immédiat (`401 Unauthorized`) de toute requête non authentifiée.
