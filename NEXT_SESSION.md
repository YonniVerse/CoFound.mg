# Context Handoff — Reprise de session CoFound.mg

**Dernière mise à jour** : 2026-08-22
**Phase** : Vague 4 — socle backend et interfaces partenaires B-02 à B-11 implémentés ; recette serveur et intégrations opérationnelles restent à faire
**Branche** : `feat/B-09-team-contact`
**État du workspace** : propre après les commits de session ; branche poussée sur `origin` et PR de synthèse #75 ouverte vers `dev`.

## 1. Point de reprise

La session a repris le handoff de B-01, a laissé Cloudinary en attente comme demandé, puis a implémenté le socle backend et les interfaces principales des tickets B-02 à B-11 sur des branches successives. Les commits sont empilés ainsi : B-01 → B-02 → B-03/B-04/B-05 → B-06/B-07/B-08 → B-09/B-10/B-11 → interfaces partenaires.

La PR B-01 est #73, la PR B-02 est #74, et la PR de synthèse de la progression complète est #75 : https://github.com/YonniVerse/CoFound.mg/pull/75

## 2. Travail réalisé pendant cette session

### B-02 — Validation des organisations

- Permissions `organization-request:read`, `organization-request:manage` et `organization-capability:manage`, accessibles uniquement à `STAFF/SUPER_ADMIN`.
- File paginée `GET /api/v1/staff/organization-requests` et détail `GET .../:id`.
- Approbation avec création transactionnelle de l’organisation, création ou rattachement du premier utilisateur et rôle `ORG_ADMIN`.
- Rejet avec motif obligatoire et protection contre les décisions répétées.
- Octroi et retrait individuel des capacités avec audit.
- `CERTIFY_AFFILIATION` interdit techniquement pour les organisations qui ne sont pas de type `INSTITUTION`.
- Capacités V2 visibles mais non activables dans la console.
- Console UI-49 sur `/staff/organizations`.
- Pages partenaires : `/organizations/:organizationId/profile`, `/projects`, `/talents` et `/opportunities`, couvrant profil vérifié, recherche/suivi/contact, recherche de talents, opportunités, candidatures et proposition financière.

### B-03 à B-05 — Profil, découverte et suivi

- Profil public d’une organisation seulement lorsqu’elle est `VERIFIED`, sans contact interne ni données staff.
- Recherche partenaire de projets par texte, secteur, région et plage de maturité BMC.
- Modèle `ProjectWatch`, note privée, création/mise à jour et retrait protégés par la capacité `RECRUIT`.
- Les résultats de recherche ne contiennent pas d’identité civile.

### B-06 à B-08 — Opportunités et candidatures

- Création et publication d’opportunités par une organisation ayant `PUBLISH_OPPORTUNITY`.
- Liste publique des opportunités publiées.
- Candidature d’un talent pour son propre compte ou d’un projet par un membre du projet.
- Traitement partenaire des candidatures avec statut accepté/refusé et motif de rejet obligatoire.
- Protection contre les candidatures et décisions répétées.

### B-09 à B-11 — Contact, talents et finance

- `OrganizationProjectContact` avec contrainte unique organisation/projet : un seul message de contact, sans relance.
- Recherche de talents opt-in avec pseudonyme, profil, bio et complétion ; l’identité civile et le genre restent masqués.
- Port `PaymentProvider`, provider `OffPlatformPaymentProvider` par défaut et création d’un `FinancialEngagement` au statut `PROPOSED`, sans paiement en ligne.

## 3. Fichiers importants ajoutés ou modifiés

- `apps/api/src/organization-request/organization-request-staff.service.ts` et `.controller.ts` : B-02.
- `apps/api/src/organization-request/organization-profile.service.ts` et `.controller.ts` : B-03.
- `apps/api/src/organization-request/partner-discovery.service.ts` et `.controller.ts` : B-04/B-05/B-10.
- `apps/api/src/organization-request/opportunity.service.ts` et `.controller.ts` : B-06/B-07/B-08.
- `apps/api/src/organization-request/partner-contact.service.ts` et `.controller.ts` : B-09.
- `apps/api/src/financial/` : port de paiement et B-11.
- `apps/api/prisma/schema.prisma` : relations `ProjectWatch`, `OrganizationProjectContact`, suivi d’approbation et motif de rejet.
- `apps/api/prisma/migrations/20260822180000_add_project_watches/`.
- `apps/api/prisma/migrations/20260822190000_add_opportunity_application_rejection_reason/`.
- `apps/api/prisma/migrations/20260822200000_add_organization_project_contacts/`.
- `packages/shared/src/schemas.ts` : contrats B-02 à B-11.
- `apps/api/src/rbac/permissions.ts` et `permission.guard.ts` : restriction SUPER_ADMIN.
- `apps/api/test/organization-request-staff.test.ts`, `partner-discovery.test.ts`, `opportunity.test.ts`, `partner-operations.test.ts` et `rbac.test.ts`.
- `apps/web/src/pages/StaffOrganizationsPage.tsx`, `apps/web/src/App.tsx`, `apps/web/src/lib/api-client.ts` et `apps/web/src/i18n.tsx` : UI-49 et contrats frontend.

## 4. Validation

Les contrôles passent sur la branche :

- suite API : **155/155 tests réussis** ;
- typecheck API, frontend et shared réussi ;
- lint API et frontend réussi ;
- build frontend réussi ;
- budget JavaScript initial respecté : **65,52 KiB gzip** ;
- `git diff --check` réussi ;
- `prisma validate` doit être lancé avec une `DATABASE_URL` disponible, car le sandbox n’en fournit pas par défaut.

## 5. Git et branches

- `feat/B-01-organization-request` : demande publique B-01, PR #73.
- `feat/B-02-organization-validation` : console et validation B-02, PR #74 empilée sur B-01.
- `feat/B-03-organization-profile` : profil, recherche, suivi et opportunités initiales.
- `feat/B-09-team-contact` : B-09 à B-11 et branche de synthèse, PR #75 vers `dev`.

Derniers commits de la branche courante :

- `e493916 feat(partenaire): ajouter les interfaces de la vague 4` ;
- `3275989 feat(partenaire): ajouter contact et engagements financiers` ;
- `cd8d5eb feat(opportunite): publier et traiter les candidatures` ;
- `8833406 feat(partenaire): rechercher et suivre les projets` ;
- `d967f2d feat(staff): ajouter la console des organisations` ;
- `b8a5b2a feat(staff): valider les organisations et leurs capacités`.

## 6. Limites et points bloquants

Le serveur/API de recette n’est pas encore fonctionnel et aucune migration n’a été appliquée sur Neon pendant la session. Les endpoints et migrations doivent être testés sur une base réelle avant fusion définitive.

Les interfaces frontend partenaires B-03 à B-11 sont maintenant présentes. Elles nécessitent encore une recette manuelle authentifiée, car le serveur/API de recette n’est pas fonctionnel dans cette session et aucun harnais UI n’est installé dans le dépôt.

Cloudinary reste volontairement en attente. B-01 persiste encore les métadonnées des justificatifs ; le stockage binaire privé, les URLs signées et la consultation staff sont à faire lorsque le serveur et la configuration runtime seront disponibles. Aucun secret n’a été placé dans le frontend.

B-09 enregistre le contact unique comme entité métier auditée, mais ne l’envoie pas encore via la messagerie ou une notification email réelle. B-11 fournit l’abstraction et le provider hors plateforme, sans règlement réel.

## 7. Prochaines étapes concrètes

1. Vérifier et fusionner #73, puis #74 et enfin #75, ou rebaser la branche de synthèse selon la stratégie de revue retenue.
2. Démarrer l’API/serveur de recette, appliquer toutes les migrations et exécuter les parcours authentifiés des pages partenaires.
3. Ajouter un harnais UI ou des tests de routes frontend si nécessaire et vérifier les contrôles de capacité en conditions réelles.
4. Reprendre Cloudinary uniquement après disponibilité du serveur, avec secrets côté API et assets privés/authentifiés.
5. Remplacer l’enregistrement local du contact par une notification réelle et compléter la démonstration verticale de la Vague 4.
6. Mettre à jour ce fichier avant toute nouvelle clôture de session.

## 8. Déploiement Render vérifié

Le service web Render `cofound-mg` est déployé depuis la branche `feat/B-09-team-contact`. Le dernier déploiement fonctionnel inclut le correctif `e848d4d` et les corrections NestJS précédentes. L’URL publique est https://cofound-mg.onrender.com.

Vérification effectuée le 2026-08-22 :

```text
GET https://cofound-mg.onrender.com/api/v1/health
HTTP 200
{"status":"ok","database":"ok"}
```

Le CORS renvoie également `https://co-found-mg.vercel.app` comme origine autorisée. Les huit migrations Prisma ont été appliquées avec succès sur Neon et aucun déploiement de migration n’est encore en attente.

La configuration native Render qui fonctionne est :

```text
Build: npm install --global pnpm@11.9.0 && pnpm install --frozen-lockfile && pnpm --filter @cofound/shared build && pnpm --filter @cofound/api prisma:generate && pnpm --filter @cofound/api build
Start: pnpm --filter @cofound/api prisma:migrate:deploy && pnpm --filter @cofound/api start
Health: /api/v1/health
```

Le worker pg-boss n’est pas encore créé comme Background Worker Render. Cloudinary n’est pas encore raccordé ; les secrets restent absents du frontend. La prochaine opération de déploiement est de configurer le frontend Vercel avec l’URL API Render, puis de créer et tester le worker séparément lorsque le plan Render le permet.
