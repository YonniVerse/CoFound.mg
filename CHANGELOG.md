# Changelog — CoFound.mg

Journal des décisions et des livrables. Le plus récent en haut.

Format : `## AAAA-MM-JJ — Titre` puis les rubriques utiles parmi **Décidé · Ajouté · Modifié ·
Retiré · En cours · Bloqué**.

> Ce fichier retrace **l'historique**. L'état courant est dans `NEXT_SESSION.md`.
> Mis à jour par la commande `/handoff`.

---

## 2026-08-27 — Refonte sociale de l’onglet Projet du feed

### Décidé

- Afficher les publications sous l’identité du projet plutôt que sous celle de l’utilisateur, afin que le feed reste centré sur les équipes et leurs avancées.
- Limiter le compositeur aux projets possédés par le compte connecté et ne rendre publiques que les publications non expirées des projets `RECRUITING` ou `ACTIVE`, afin de protéger les brouillons et les projets inactifs.

### Ajouté

- Fil social `ProjectSocialFeed` dans l’onglet Projet de `/feed`, avec sélection du projet, type de publication, validation, états de chargement/erreur/vide et lien vers le projet.
- Endpoint authentifié `GET /api/v1/projects/mine` et endpoint public `GET /api/v1/projects/posts/feed`.
- Contrats shared pour les projets possédés et les publications enrichies avec les informations du projet.
- Tests backend ciblés pour la liste des projets possédés et le feed de publications projet-branded.
- Traductions françaises et malgaches du nouveau parcours.

### Modifié

- `/feed` n’affiche plus le parcours de la page `/projects` dans l’onglet Projet avec les libellés « Projets qui recrutent » et « Nouveau projet » ; il affiche désormais le fil social dédié aux projets.
- Les fonctionnalités existantes des onglets Tous et Co-fondateurs restent inchangées.

### Validation

- Shared build, typecheck/lint/build frontend et typecheck/lint/build API réussis.
- Tests backend ciblés : **10/10 réussis**.
- Aucun test Playwright ni déploiement Vercel n’a été exécuté pour cette fonctionnalité pendant cette session.

---

## 2026-08-27 — Nettoyage des branches obsolètes

### Décidé

- Conserver uniquement `main` et `dev`, afin de réduire le dépôt aux deux branches de référence sans modifier le code applicatif.
- Ne pas fusionner mécaniquement les branches anciennes divergentes lorsqu’un livrable fonctionnel équivalent ou ultérieur est déjà présent dans `main`, afin d’éviter de réintroduire du code obsolète.

### Retiré

- Suppression de **56 branches distantes** obsolètes sur GitHub après audit de leur historique et de leurs pull requests.
- L’ancien outillage de mock de discussion de P-10 n’a pas été réintroduit dans `main`, car le canal de discussion réel est déjà présent dans `main`.

### Validation

- Avant nettoyage : **58 branches distantes** détectées par l’API GitHub ; aucune pull request ouverte.
- Résultat : l’API GitHub et les références locales après `git fetch --all --prune` ne contiennent plus que `main` et `dev`.
- Suppressions réussies : **56/56** ; échec : **0**.
- Aucun fichier de code n’a été modifié et aucun build ou test applicatif n’a été relancé.

---

## 2026-08-24 — Recette Playwright du rôle Talent et raccordement du détail projet

### Décidé

- Conserver les corrections sur `fix/talent-recipe-findings` et ne pas modifier `main`, car la recette a révélé plusieurs écarts entre les déploiements et le code source.
- Déclarer explicitement `TALENT_READ` sur `/me/status`, car le refus par défaut rendait le statut personnel inaccessible au frontend et bloquait l’onboarding.

### Ajouté

- Rapport de recette Playwright `docs/recette-talent-2026-08-24.md`.
- Régression RBAC vérifiant la permission déclarée par `AccountStatusController`.

### Modifié

- Le détail projet frontend charge désormais les données privées et les postes ouverts via l’API réelle au lieu de `MOCK_PROJECT_DETAIL`.
- La candidature du détail projet envoie désormais `POST /applications` avec le projet, le poste optionnel et le message.
- Les composants du détail projet affichent le pitch, le statut, les postes et les membres reçus par l’API.

### Validation

- Build shared, typecheck/lint/build web, `git diff --check` et tests API ciblés : **19/19 réussis**.
- La suite API globale reste partiellement bloquée par des erreurs Prisma préexistantes dans l’environnement local : 132 tests passent, 17 échouent.

### En cours

- Les scénarios TAL-003, TAL-005 et TAL-007 à TAL-013 restent à conclure après réalignement du frontend Vercel et de l’API Render.

### Bloqué

- Production : `/me/status` répond 403 et `/projects/feed` ainsi que `/talents/feed` répondent 404.
- Preview `fix/bugs-main-audit` : appels Render bloqués par CORS, car seule l’origine `https://co-found-mg.vercel.app` est autorisée.

---

## 2026-08-24 — Maintenir la session après expiration du token

### Corrigé

- Le cookie de refresh utilise désormais `SameSite=None; Secure` en production, ce qui permet les requêtes cross-site entre Vercel et Render.
- Le client HTTP renouvelle automatiquement l’access token après un `401` puis rejoue la requête initiale.
- Les appels concurrents partagent une seule rotation de refresh token.
- Une session encore valide est restaurée au chargement de l’application.

### Ajouté

- Tests du format du cookie de refresh en production, en développement et au logout.

### Validation

- Build shared/API/web, typechecks, lint et **181/181 tests API réussis**.

### En cours

- Pousser la branche `fix/auth-session-refresh`, ouvrir une PR vers `main`, puis vérifier le comportement après 15 minutes sur Vercel/Render.

---

## 2026-08-24 — Corriger le timeout du seed multi-comptes

### Corrigé

- Le hachage Argon2 est exécuté avant la transaction interactive Prisma, afin que plusieurs comptes ne fassent plus expirer le délai de 5 secondes.
- La transaction conserve uniquement les upserts utilisateurs, qui restent atomiques.

### Validation

- Le build Render et les migrations du log fourni étaient réussis ; l’échec était limité au timeout `P2028` de l’auto-seed.
- Après correction locale : typecheck, build API, lint et **178/178 tests API réussis**.

### En cours

- Terminer le rebase documentaire, pousser le correctif sur `main`, puis confirmer sur Render l’ouverture du port et le healthcheck HTTP 200.

---

## 2026-08-24 — Fusion de dev vers main avec résolution de conflits

### Fusionné

- Fusion de `origin/dev` dans `main`, incluant les corrections UX et i18n de la landing page, LoginPage, FeedPage, Projects, ProjectDetail et Dream Match.
- Conservation des changements opérationnels de `main`, notamment l’auto-seed Render de développement, les routes de livraison et la protection de statut de compte.
- Conservation des traductions FR/MG des deux branches dans `apps/web/src/i18n.tsx`.

### Conflits résolus

- `CHANGELOG.md` et `NEXT_SESSION.md` : documentation consolidée avec les contextes frontend et backend.
- `apps/web/package.json` : build partagé de dev conservé et script `assets:optimize` de main réintégré.
- `apps/web/src/App.tsx` : structure et protections de main conservées.
- `apps/web/src/components/landing/SectionCTA.tsx`, `apps/web/src/pages/FeedPage.tsx` et `apps/web/src/pages/LoginPage.tsx` : versions UX de dev conservées.
- `apps/web/src/i18n.tsx` : clés des deux branches fusionnées sans perte.

### Validation

- Typecheck, lint, `git diff --cached --check` et build de production web réussis après résolution.
- Commit de fusion local créé : `e09ca27`.
- Synchronisation de main avec les nouveaux commits distants en cours avant publication.

---

## 2026-08-24 — Automatiser le seed des comptes au démarrage Render

### Ajouté

- Auto-seed avant `app.listen` lorsque `SEED_ACCOUNTS_ON_START=true`, `SEED_ACCOUNTS_JSON` est présent et que l’environnement est autorisé.
- `SEED_ACCOUNTS_MODE=development` permet explicitement ce fonctionnement sur l’instance Render de développement malgré `NODE_ENV=production` fourni par Render.
- La routine d’upsert est partagée entre la commande manuelle et le démarrage automatique.

### Décidé

- Les mots de passe restent dans les variables secrètes Render et ne sont jamais inscrits dans le code, car l’auto-seed ne doit pas transformer des identifiants administrateurs en secrets versionnés.
- L’auto-seed reste désactivé par défaut et une configuration invalide bloque le démarrage, afin d’éviter un provisionnement silencieux ou partiel.

### Validation

- Typecheck, build API, lint et **178/178 tests API réussis**.
- Le build compilé contient bien le lanceur d’auto-seed dans `dist`.

### En cours

- Pousser le commit fonctionnel et la documentation, puis configurer une seule fois les trois variables secrètes dans Render pour les redéploiements de développement.

---

## 2026-08-24 — Fusionner le seed multi-comptes et multi-rôles

### Modifié

- La PR #94 est fusionnée dans `main` après réussite de la CI, du déploiement Vercel et de Preview Comments.
- La fonctionnalité de seed multi-comptes est désormais disponible sur la branche de livraison.

### En cours

- Exécuter le seed réel dans Render avec la matrice de comptes choisie par le propriétaire, puis supprimer la variable secrète temporaire.

---

## 2026-08-24 — Étendre le seed aux comptes et rôles de plateforme

### Décidé

- Utiliser `SEED_ACCOUNTS_JSON` pour les nouvelles configurations multi-rôles, tout en conservant `ADMIN_ACCOUNTS_JSON` afin de ne pas casser le seed Render déjà exécuté.
- Refuser les combinaisons `staffRole` avec `TALENT` ou `ORG_MEMBER`, car les rôles staff ne s’appliquent qu’à `platformRole=STAFF`.

### Ajouté

- Parser partagé `apps/api/prisma/seed-accounts-config.ts` pour normaliser les e-mails, valider les rôles, détecter les doublons et appliquer les valeurs par défaut.
- Commande `pnpm --filter @cofound/api seed:accounts`, avec maintien de `seed:admin` comme alias compatible.
- Tests unitaires couvrant les trois rôles de plateforme, les rôles staff, les valeurs par défaut et les erreurs de configuration.

### Modifié

- `seed-admin.ts` crée ou met à jour désormais des comptes `TALENT`, `ORG_MEMBER` et `STAFF`, avec `SUPER_ADMIN`, `OPS_ADMIN` ou `MODERATOR` pour ces derniers.
- La documentation Render fournit un exemple multi-comptes sans secret réel.

### Validation

- Typecheck API, lint API, suite API **177/177 tests réussis** et `git diff --check`.

### En cours

- Branche `feat/seed-multi-comptes-roles` à pousser et proposer en PR vers `main`, puis exécution réelle avec une variable Render temporaire choisie par le propriétaire.

---

## 2026-08-24 — Corriger le démarrage Render après le seed admin

### Ajouté

- PR #93 fusionnée dans `main` après correction des imports runtime de `PrismaService` dans Account Status, Product Health et Reference Data.

### Modifié

- Le crash NestJS `UnknownDependenciesException` sur `AccountStatusService` est corrigé ; les services utilisent désormais le token runtime `PrismaService`.
- La procédure Render revient au Start Command normal après l’exécution ponctuelle du seed admin.

### Validation

- Le log Render confirme que les migrations étaient à jour et que le seed a créé deux comptes : `yonnidebian@gmail.com` en `SUPER_ADMIN` et `yoniubuntu@gmail.com` en `OPS_ADMIN`.
- Validation locale : build shared, Prisma generate, typecheck API, lint API, build API, 173 tests API réussis et aucun import type de `PrismaService` restant dans `apps/api/src`.
- L’API répond HTTP 200 sur `/api/v1/health` après le déploiement observé.

### En cours

- Restaurer le Start Command normal dans Render et vérifier que le dernier déploiement de `main` est Live.
- Supprimer `ADMIN_ACCOUNTS_JSON` de Render et tester la connexion des comptes administrateurs.

---

## 2026-08-24 — Préparer le seed des comptes administrateurs

### Décidé

- Le seed admin est une commande ponctuelle séparée du démarrage Render, afin de ne pas réinitialiser les mots de passe à chaque redéploiement.
- Les mots de passe sont fournis temporairement via une variable Render et hachés avec Argon2id, car aucun secret ne doit être commité ou exposé au frontend.

### Ajouté

- `apps/api/prisma/seed-admin.ts` avec validation des e-mails, mots de passe, rôles et détection des doublons.
- Script `pnpm --filter @cofound/api seed:admin`.
- Procédure et exemple `ADMIN_ACCOUNTS_JSON` dans `deploy/README.md`.
- PR #92 fusionnée dans `main`.

### Validation

- Prisma validate et generate réussis avec une URL locale fictive, sans connexion à Neon.
- Typecheck API, lint API et `git diff --check` réussis.
- CI GitHub et contrôles Vercel de la PR #92 réussis.

### En cours

- Exécuter le seed dans Render après choix des e-mails et mots de passe par le propriétaire.

---

## 2026-08-24 — Supprimer le compte fictif et fiabiliser le feed production

### Décidé

- Les mocks restent disponibles uniquement en développement local pour faciliter le prototypage, mais ne doivent plus être affichés comme données réelles en production.
- La session n’est pas restaurée automatiquement au chargement initial, afin qu’une visite publique ne présente pas implicitement un compte déjà connecté.

### Ajouté

- Issue #90 pour raccorder les écrans encore alimentés par des mocks à l’API réelle.
- PR #91 fusionnée dans `main`.

### Modifié

- `DashboardLayout` charge désormais `/me/profile`, affiche l’identité réelle et propose la déconnexion ; le profil fictif `Mialy Randria / ISCAM` et le badge de messages `3` ont été retirés.
- Le feed rend les projets retournés par `/projects/feed`.
- Les fallback `mockFeed` des projets, talents et suggestions sont limités au développement local.
- Les routes affichant `DashboardLayout` redirigent vers `/login` lorsque l’état d’authentification local est inactif.

### Validation

- Typecheck, lint, build frontend, build shared et `git diff --check` réussis.
- CI et contrôles Vercel de la PR #91 réussis.
- Déploiement Production Vercel du merge #91 `READY`, domaine public HTTP 200.

### En cours

- Raccorder les écrans Impact, détail/candidature projet, suggestions et aperçu d’import suivis par #90.
- Tester réellement le parcours B-01/Cloudinary avec des comptes de recette.

---

## 2026-08-24 — Stabilisation des déploiements Render et Vercel

### Ajouté

- Issue #87 déclarée puis clôturée après correction de l’import runtime de `PrismaService` dans `PersonalDataExportService`.
- Issue #88 déclarée puis clôturée après ajout de la compilation de `@cofound/shared` avant le build Vite depuis `apps/web`.
- PR #89 fusionnée dans `main` avec les deux corrections de déploiement.

### Modifié

- Le frontend Vercel conserve `apps/web` comme Root Directory et compile désormais son package partagé avant le build.
- Le backend Render démarre correctement après résolution de l’injection NestJS et répond HTTP 200 sur `/api/v1/health` avec la base Neon opérationnelle.

### Validation

- CI GitHub de la PR #89 : réussie.
- Vercel Production sur main : `READY`, déploiement `dpl_CrXZhSkVcSBxvSjizYNZqK4YAreR`, domaine `co-found-mg.vercel.app`.
- Validation locale : génération Prisma, typechecks, lint, tests API, builds API/frontend et `git diff --check` réussis.

### En cours

- Réaliser un test fonctionnel authentifié B-01/Cloudinary avec des comptes de recette et un petit PDF.
- Vérifier dans le dashboard Render que le service utilise bien `main` ; son endpoint health est déjà opérationnel.

---

## 2026-08-24 — Bascule de la livraison complète sur main

### Décidé

- `main` devient la branche de livraison, car le projet Vercel est relié à cette branche et l’ancienne séparation `dev`/feature créait plusieurs chemins de déploiement.
- Les PR empilées #73, #74, #75, #76, #82 et #83 sont clôturées après intégration ou identification de leur obsolescence, car leurs changements utiles sont présents dans main via #86.

### Ajouté

- PR #86 fusionnée dans main : dev, Vague 4 B-01 à B-11, Cloudinary B-12, S-05 à S-08 et harnais E2E S-09.
- Résolution de conflits RBAC, module NestJS, client API et traductions S-06 pendant la migration.
- Issue #84 pour le Root Directory Vercel invalide (`frontend` au lieu de `apps/web`).
- Issue #85 pour la PR #82 de recherche PostgreSQL obsolète et redondante.

### Validation

- CI GitHub « Qualité du workspace » réussie sur la PR #86.
- Validation locale complète réussie : builds shared/API/frontend, typechecks, lint, tests API et inventaire des trois scénarios E2E.

### Bloqué

- Le déploiement Vercel Production de main échoue avant le build avec `NOW_SANDBOX_WORKER_ROOTDIR_NOT_EXIST` tant que le réglage Root Directory n’est pas corrigé dans le dashboard.
- Le service Render doit encore être basculé manuellement de `feat/B-09-team-contact` vers `main`.

---

## 2026-08-24 — Intégration Cloudinary des justificatifs B-01

### Décidé

- Cloudinary est utilisé comme exception opérationnelle pour les justificatifs B-01, car le compte et le service Render sont disponibles ; R2 reste la cible générale des autres fichiers.
- Les assets sont téléversés côté API avec le delivery type `authenticated`, car les justificatifs ne doivent pas être accessibles depuis une URL CDN publique.
- Les secrets Cloudinary restent uniquement dans Render, car Vercel et le frontend sont des environnements publics.

### Ajouté

- Service Cloudinary NestJS avec upload signé, validation des formats et de la taille, nettoyage des assets orphelins et génération d’URLs temporaires.
- Support multipart sur `POST /api/v1/organization-requests` avec cinq fichiers maximum et 10 Mo par fichier.
- Route staff `GET /api/v1/staff/organization-requests/:id/documents/:index`, protégée par RBAC, auditée et limitée à une URL de cinq minutes.
- Upload réel depuis le formulaire B-01 et bouton de consultation depuis `/staff/organizations`.
- Contrat partagé de réponse d’URL temporaire et variables documentées dans `apps/api/.env.example`.
- PR #83 : https://github.com/YonniVerse/CoFound.mg/pull/83

### Validation

- **159/159 tests API réussis**.
- Typechecks, lint, builds shared/API/frontend et `git diff --check` réussis.
- Tests Cloudinary simulés ; aucun secret ni upload réel n’a été exécuté depuis le sandbox.

### En cours

- La PR #83 doit être revue et fusionnée vers `dev`.
- Le service Render doit ensuite basculer de `feat/B-09-team-contact` vers `dev`, être redéployé et validé avec un vrai PDF de test.
- La présence des variables Cloudinary a été déclarée par l’utilisateur dans Render, mais n’est pas vérifiée par l’agent.

---

## 2026-08-22 — Progression Vague 4 — B-02 à B-11

### Ajouté

- B-02 : permissions SUPER_ADMIN, file staff, approbation/rejet des demandes, création transactionnelle de l’organisation et du premier `ORG_ADMIN`.
- B-02 : activation et retrait individuel des capacités avec audit ; `CERTIFY_AFFILIATION` est réservé aux `INSTITUTION`.
- B-03 : profil public uniquement pour les organisations vérifiées.
- B-04/B-05 : recherche partenaire de projets par maturité BMC, suivi privé et notes internes avec `ProjectWatch`.
- B-06/B-07/B-08 : opportunités, candidatures talent/projet et décisions motivées côté partenaire.
- B-09 : contact unique organisation/projet avec contrainte d’unicité et audit.
- B-10 : recherche de talents opt-in pseudonymisés pour les organisations ayant `RECRUIT`.
- B-11 : `PaymentProvider`, provider hors plateforme et création d’engagement `PROPOSED`, sans règlement en ligne.
- Console UI-49 `/staff/organizations` et contrats partagés correspondants.

### Modifié

- Ajout des migrations `ProjectWatch`, `OpportunityApplication.rejectionReason` et `OrganizationProjectContact`.
- Extension du guard RBAC avec trois permissions réservées à `STAFF/SUPER_ADMIN`.
- Ajout de la méthode DELETE au client API frontend.

### Validation

- Suite API : **155/155 tests réussis**.
- Typecheck API, frontend et shared réussi.
- Lint API/frontend, build frontend, contrôle de bundle et `git diff --check` réussis.
- Budget JavaScript initial : **65,52 KiB gzip**.

### En cours

- PR #75 de synthèse : https://github.com/YonniVerse/CoFound.mg/pull/75
- Les interfaces partenaires B-03 à B-11 sont maintenant ajoutées : profil, projets, suivi/contact, talents, opportunités, candidatures et proposition financière.
- Les migrations doivent être appliquées et les flux authentifiés testés dès que le serveur de recette fonctionne.
- Cloudinary reste en attente ; aucun secret n’a été placé dans le frontend.

---

## 2026-08-22 — Interfaces partenaires de la Vague 4

### Ajouté

- Pages frontend `/organizations/:organizationId/profile`, `/projects`, `/talents` et `/opportunities`.
- Recherche de projets par texte et maturité BMC, suivi privé, note interne et contact unique.
- Recherche de talents opt-in pseudonymisés.
- Création/publication d’opportunités, consultation des candidatures, décisions et proposition d’engagement financier hors plateforme.
- Routes frontend et traductions françaises/malgaches associées.

### Validation

- Typecheck API, frontend et shared réussi.
- Lint API/frontend réussi.
- Build frontend réussi.
- Suite API : **155/155 tests réussis**.
- Budget JavaScript initial : **69,57 KiB gzip**.

### Limites

- La recette authentifiée attend le serveur/API et la base de données disponibles.
- Cloudinary n’est pas encore raccordé au serveur ; aucune clé secrète n’a été exposée au frontend.

---

## 2026-08-22 — Implémentation de B-01 — Demande d’accès organisationnel

### Ajouté

- Branche `feat/B-01-organization-request` et PR #73 vers `dev`.
- Modèle Prisma `OrganizationRequest`, enum de statut et migration `20260822170000_add_organization_requests`.
- Contrats Zod partagés pour l’entrée, les métadonnées de pièces et la réponse B-01.
- Endpoint public `POST /api/v1/organization-requests` avec validation, normalisation, détection des doublons actifs et audit.
- Page publique `/organization-request` en trois étapes avec confirmation et numéro de demande.
- Liens vers la demande depuis la connexion et le CTA de l’accueil.
- Traductions françaises et malgaches du parcours B-01.
- Tests ciblés de création, validation, doublon et métadonnées d’audit.

### Décidé

- Les secteurs d’intérêt sont saisis comme libellés publics dans B-01, car le demandeur ne doit pas connaître les identifiants internes des référentiels.
- Les justificatifs sont limités à cinq fichiers de 10 Mo côté interface ; cette session persiste uniquement leurs métadonnées, car aucun adaptateur R2 n’est encore présent dans le dépôt.

### Validation

- Suite API : **139/139 tests réussis**.
- Typecheck API, frontend et shared, lint API/frontend, build frontend et `git diff --check` réussis.
- Budget JavaScript initial respecté : **60,28 KiB gzip**.
- `prisma validate` réussi avec une URL PostgreSQL locale temporaire.

### En cours

- Revue et fusion de la PR #73.
- Application de la migration sur Neon et validation authentifiée de l’endpoint.
- Raccordement ultérieur du stockage binaire R2 et de la consultation staff des pièces.
- Préparation de B-02 : file staff, décision d’approbation/refus et capacités organisationnelles.

---

## 2026-08-22 — CI staging et initialisation M-14

### Ajouté

- PR #64 : génération explicite du client Prisma avant les contrôles CI.
- Workflow `deploy-staging.yml` déclenché par `dev` ou manuellement, avec environnement GitHub `staging` et secrets `STAGING_*`.
- Branche `feat/M-14-reporting` et socle de signalement transverse pour les cibles PROFILE, MESSAGE, PROJECT et POST.
- Route `POST /api/v1/reports` avec validation Zod et création transactionnelle.

### Modifié

- Ajout du composant réutilisable `ReportButton` et du client `reportApi`.
- Boutons intégrés aux cartes de profils/talents, projets, publications et messages du canal projet.
- Ajout du test HTTP `POST /api/v1/reports`, avec vérification de l’authentification, de la réponse pseudonymisée et du transfert de la raison.

### Validation

- Prisma generate, lint et typecheck API réussis.
- Lint, typecheck et build frontend réussis.
- **114/114 tests API réussis**.
- Les secrets de l’environnement staging restent à configurer pour permettre un déploiement effectif.

### En cours

- Revoir et ouvrir la PR M-14.
- Revoir et fusionner la PR #64.

---

## 2026-08-22 — Démarrage de M-06 Scoring Dream-Match

### Ajouté

- Branche `feat/M-06-dream-match-scoring` créée depuis `origin/dev` après fusion de M-05.
- Contrats Zod des suggestions et facteurs de scoring.
- Endpoint `GET /me/dream-match/suggestions` avec pagination.
- Scoring SQL pondéré par complémentarité de compétences, secteurs et disponibilité.
- Tests unitaires du score, de la pagination et du pseudonymat.
- Test HTTP d’intégration de `GET /api/v1/me/dream-match/suggestions`, avec vérification du curseur, des facteurs et de l’absence d’identité civile.

### Validation

- 109/109 tests API réussis.
- Lint, typecheck et build du monorepo réussis.
- Chunk frontend maximal observé : `vendor-data` à 363,98 kB, sous le seuil de 500 kB.

### Modifié

- La PR #61 de M-06 est fusionnée dans `dev`.
- La PR #62 de M-07 est fusionnée dans `dev`.
- L’écran Dream-Match récupère les suggestions via le client API réel et affiche les facteurs explicatifs sans score numérique.

### Validation

- 109/109 tests API réussis.
- Typecheck, lint et build frontend réussis.

### En cours

- M-08 — retour « pas intéressé » et exclusion transactionnelle.

---

## 2026-08-22 — Démarrage de M-08 — Retour « pas intéressé »

### Ajouté

- Branche `feat/M-08-not-interested` créée depuis `dev` après les fusions de M-05, M-06 et M-07.
- Modèle Prisma `DreamMatchExclusion` avec unicité `(seekerId, candidateId)` et migration SQL dédiée.
- Route `POST /me/dream-match/suggestions/:talentId/not-interested`.
- Upsert transactionnel idempotent et filtre SQL `NOT EXISTS` pour exclure les profils écartés des suggestions futures.
- Tests unitaires et HTTP du retour « pas intéressé ».

### Validation

- Prisma validate réussi avec une URL locale non persistée.
- Lint et typecheck API réussis.
- **111/111 tests API réussis**.

### Modifié

- Le client API expose la mutation `markDreamMatchNotInterested`.
- L’écran Dream-Match affiche le bouton « Pas intéressé », retire la carte de manière optimiste et la restaure en cas d’échec.
- La migration `20260822100000_add_dream_match_exclusions` est appliquée sur Neon.

### Validation

- 111/111 tests API réussis.
- Typecheck, lint et build frontend réussis.
- Aucun harnais Playwright/Cypress présent ; les tests HTTP d’intégration M-08 sont la validation disponible.

### Modifié

- La PR #63 de M-08 est fusionnée dans `dev`.

### En cours

- Le staging n’est pas déployable depuis le dépôt : seul le workflow `production` existe et le Preview Vercel est bloqué par la vérification du compte auteur.
- Le CI GitHub doit exécuter `prisma generate` avant le typecheck.
- Ajouter un vrai parcours E2E authentifié lorsque le harnais et les identifiants de recette seront disponibles.

---

## 2026-08-22 — Reprise de M-04 Feed Talents

### Modifié

- La branche `feat/M-04-feed-talents` est rebasée sur `dev` après les fusions de M-01, M-02 et M-03.
- La PR #59 est ouverte vers `dev`.
- Le feed talents applique l’opt-in, le pseudonymat, la recherche et la pagination.

### Validation

- 102/102 tests API réussis.
- Lint API/frontend, typecheck API/frontend et build frontend réussis.

### En cours

- Revue et fusion de la PR #59, puis préparation de M-05.

---

## 2026-08-22 — Démarrage de M-03 — Interface Feed Projets

### Modifié

- M-02 est fusionné dans `dev` via la PR #57 et le commit `7f26b60`.
- M-03 est rebasé sur `origin/dev` et proposé dans la PR #58.
- Le Feed Projets utilise l’API M-02 avec filtres, recherche, pagination infinie, skeletons et cartes pseudonymisées.
- Le chargement initial du hook Feed respecte les règles React hooks.

### Validation

- Typecheck frontend : réussi.
- Lint frontend : réussi.
- Build frontend : réussi.
- Chunks : index 76,82 kB, vendor-react 217,50 kB, vendor-ui 232,92 kB, vendor-data 363,98 kB.

### En cours

- Revue et fusion de la PR #58, puis préparation de M-04.

---

## 2026-08-22 — Démarrage de la Vague 2 avec M-01 et M-02

### Modifié

- M-01 est fusionné dans `dev` via la PR #56 et le commit `29f18e4`.
- M-02 est implémenté sur la branche `M-02` et proposé dans la PR #57.
- Le code splitting frontend sépare React, UI et données ; le build ne produit plus de chunk supérieur à 500 kB.

### Validation

- M-01 : 97 tests API réussis après construction de `@cofound/shared`, lint et typecheck réussis.
- M-02 : 99 tests API réussis, lint et typecheck réussis ; build frontend réussi après optimisation.

### En cours

- Revue et fusion de la PR #57, puis démarrage de M-03.

---

## 2026-08-22 — Démarrage de M-05 Dream-Match

### Ajouté

- Branche `feat/M-05-dream-match-form` créée depuis `origin/dev`.
- Contrats Zod, API `GET/PATCH /me/dream-match` et upsert transactionnel des préférences.
- Écran `/dream-match` avec consentement explicite obligatoire.
- Tests de consentement, pseudonymat et enregistrement transactionnel.

### Validation

- 105/105 tests API réussis.
- Lint et typecheck API/frontend réussis.
- Build frontend réussi.

### En cours

- Revue finale du formulaire, tests HTTP et ouverture d’une PR M-05.

---

## 2026-08-22 — Fusion de M-04 et audit Vague 2t P-10 dans dev

### Modifié

- La PR #55 est fusionnée dans `dev` via le commit `65de65f`.
- M-09, M-10, M-11 et le canal projet P-10 sont intégrés dans `origin/dev`.

### En cours

- La démonstration authentifiée avec Neon reste à exécuter avant la clôture officielle de la Vague 3.

---

## 2026-08-22 — Finalisation locale de P-10

### Ajouté

- Canal de discussion projet `/projects/:id/channel` avec client API, rafraîchissement périodique et affichage pseudonymisé.
- Endpoint transactionnel d’ouverture/réutilisation du canal `ConversationType.PROJECT`, réservé aux membres actifs.
- Contrat partagé de réponse des messages et tests P-10 d’accès membre et de création des participants.

### Modifié

- La lecture M-11 retourne désormais `{ items }`, conforme au contrat consommé par le frontend.
- Validation complète réussie : 99 tests, lint, typecheck et build.

### En cours

- Les changements P-10 restent sur la branche M-09 et doivent être poussés puis revus dans la PR #55 avant fusion vers `dev`.

---

## 2026-08-22 — Audit des Vagues 2 et 3

### Ajouté

- `audit-vagues-2-3.md` : état comparatif du backlog officiel, des branches, des PR, des dépendances, des validations et des risques résiduels.

### Décidé

- V2 est considérée non intégrée dans `dev` tant que les branches M-01 à M-04 ne sont pas fusionnées et que M-05 à M-08, M-12 à M-16 ne disposent pas de livrables vérifiables, car la démonstration de rencontre n’est pas encore bout en bout.
- V3 reste non terminée tant que P-10 n’est pas raccordé au frontend et que M-11 n’est pas fusionné, car le canal projet est le dernier maillon de sa démonstration.

---

## 2026-08-22 — Implémentation locale de la chaîne M-09 à M-11

### Ajouté

- M-09 : demandes de contact avec quota mensuel, doublon `PENDING` idempotent et décisions transactionnelles.
- M-10 : connexion idempotente après acceptation, paire d’utilisateurs normalisée et accès limité aux membres.
- M-11 : conversations directes liées aux connexions, participants obligatoires et API de messages.
- Contrats Zod partagés pour demandes, connexions, conversations et messages.

### Décidé

- Les messages ne chargent que `TalentProfile.pseudonym`, afin de préserver la pseudonymité et de ne jamais exposer `TalentIdentity`.
- Toutes les créations et transitions sociales critiques sont encapsulées dans une transaction Prisma, afin d’éviter les états partiels.

### Modifié

- Le module racine NestJS enregistre les modules `ConnectionModule` et `MessagingModule`.
- L’acceptation `ACCEPTED` passe désormais par un workflow M-10 unique qui crée ou réutilise la connexion.
- L’ouverture concurrente d’une conversation récupère la conversation gagnante après une collision Prisma `P2002`.
- Les validations complètes passent : 97 tests API, lint, typecheck et build du monorepo.

### En cours

- Les corrections sont prêtes à être publiées sur la branche `M-09`; la PR #55 vers `dev` reste ouverte.
- P-10 reste à intégrer au frontend réel, car le point d’entrée du mock n’a pas encore été localisé.

---

## 2026-08-21 — Fusion de la chaîne P-09 à P-13

### Modifié

- P-09, P-11, P-12 et P-13 sont fusionnés dans `dev` via les PR #51, #52 et #53.
- La suite API finale passe avec **92/92 tests réussis**.
- Les validations frontend typecheck, lint et build sont réussies.

### Bloqué

- P-10 reste bloqué par M-11/M-10 : les modèles Prisma existent, mais aucun service/API de ces tickets n’est identifiable dans `origin/dev`. Une confirmation de Yonni est nécessaire avant d’implémenter le service réel.

---

## 2026-08-21 — Implémentation P-11 à P-13

### Ajouté

- P-11 : publications projet, API CRUD, auteur pseudonymisé et écran `/projects/:id/posts`.
- P-12 : export JSON transactionnel réservé au propriétaire et écran de téléchargement.
- P-13 : détail public filtré avec BMC public, postes ouverts, publications actives et équipe pseudonymisée.
- Tests HTTP P-11, P-12 et P-13 : **4/4 réussis**.

### Validation

- Typecheck API/frontend, lint frontend et build frontend réussis après ajout des écrans P-12/P-13.
- Les tests de production avec Prisma réel et Neon restent distincts des tests HTTP substitués.

### Bloqué

- P-10 reste dépendant de M-11, lui-même dépendant de M-10, dont le service API n’est pas identifiable dans `origin/dev`.

---

## 2026-08-21 — Fusion de P-08 et préparation de P-10

### Modifié

- La PR [#50](https://github.com/YonniVerse/CoFound.mg/pull/50) a été fusionnée vers `dev` au commit `0095044`.
- P-09 a été synchronisé avec le nouveau `dev` au commit de merge `c3f2b23` ; sa PR [#51](https://github.com/YonniVerse/CoFound.mg/pull/51) reste ouverte.

### En cours

- P-10 est préparé sur une branche dédiée depuis `dev`.

### Bloqué

- P-10 dépend de M-11. Le modèle Prisma `Conversation` existe, mais aucun service/API M-11 n’a été identifié dans `origin/dev`; l’équipe doit confirmer son propriétaire et son état avant implémentation.

---

## 2026-08-21 — Démarrage de P-09 : gestion des tâches projet

### Décidé

- Les tâches sont visibles uniquement par les membres actifs du projet, car le travail d’équipe doit rester dans l’espace projet privé.
- L’assignation est limitée aux membres actifs et les mutations passent par une transaction Prisma, afin d’éviter les responsables orphelins et les écritures partielles.

### Ajouté

- Schémas partagés P-09 pour les statuts, la création, la mise à jour et la réponse des tâches.
- `ProjectTasksService` et `ProjectTasksController` avec CRUD REST, échéance, statut et responsable pseudonymisé.
- Tests unitaires et tests HTTP ciblés P-09 : **5/5 réussis**.
- Écran lazy `/projects/:id/tasks` et appels CRUD réels dans `projectApi`.

### En cours

- La branche `P-09` est commitée au commit `8fa637a`, puis synchronisée avec `dev` au commit `c3f2b23`; la PR [#51](https://github.com/YonniVerse/CoFound.mg/pull/51) reste ouverte vers `dev`.
- La dépendance M-10 doit être confirmée avant la fusion finale de la chaîne de la Vague 3.

---

## 2026-08-21 — Finalisation technique de P-08 : intégration HTTP et UI-29 réelle

### Ajouté

- Test d’intégration HTTP du `ProjectMembersController` couvrant `GET`, `POST`, `PATCH` et `DELETE` sous `/api/v1/projects/:projectId/members`.
- Conversion des erreurs de validation des schémas membres en réponse HTTP `400`.
- Appels `projectApi` réels pour charger, ajouter, modifier et quitter une équipe.

### Modifié

- UI-29 `/projects/:id/team` ne dépend plus de données de démonstration : elle utilise `apiClient`, gère les états de chargement, erreur, vide et mutation, et respecte la règle du dernier `OWNER`.
- Le service P-08 vérifie l’existence du compte cible avant ajout.
- Le test BMC réintégré a été typé sans `any` pour maintenir le lint strict.

### Validation

- Suite API complète : **83/83 tests réussis**.
- Typecheck et lint API/frontend réussis.
- Build frontend réussi.

---

## 2026-08-21 — Publication P-07 et démarrage P-08 membres & rôles

### Décidé

- Les mutations de rôle et de retrait vérifient le dernier `OWNER` dans une transaction Prisma, afin d’éviter une perte concurrente de propriété.
- L’identité civile reste réservée à l’espace des membres actifs ; le genre n’est jamais renvoyé par l’API équipe.

### Ajouté

- PR [#49](https://github.com/YonniVerse/CoFound.mg/pull/49) pour la relance automatique P-07.
- `ProjectMembersService` et `ProjectMembersController` avec liste, ajout, changement de rôle et retrait.
- Schémas partagés des rôles et membres P-08.
- Écran UI-29 `/projects/:id/team`, route lazy et protection visuelle du dernier porteur.
- Tests ciblés `project-members.test.ts`.

### Modifié

- La branche `P-08` réintègre les dépendances projet P-01 à P-04 nécessaires au module projet.
- Le module projet enregistre désormais les contrôleurs et services BMC, postes et membres.

### En cours

- UI-29 utilise encore des données locales de démonstration ; le branchement au client API réel et les tests HTTP/intégration restent à faire.

---

## 2026-08-21 — Vague 3 : Ticket P-05 (Candidature API + Écran candidat)

### Ajouté
- **Ticket P-05 — Candidature API & Écran candidat** :
  - **API NestJS (`POST /applications`, `GET /applications/me`, `PATCH /applications/:id/withdraw`)** : Endpoints de soumission de candidature, de liste candidat et de retrait autonome protégés par `Permission.PROJECT_APPLY`.
  - **Schémas Zod partagés** : `createApplicationInputSchema`, `applicationItemSchema`, `myApplicationsResponseSchema`.
  - **Composant Web Modal `ApplyModal.tsx`** : Modal permettant aux candidats de postuler avec message de motivation et choix optionnel du poste ouvert.
  - **Page Candidat `/my-applications` (`MyApplicationsPage.tsx`)** : Tableau de bord de suivi des candidatures avec filtres par statut (`En attente`, `Acceptée`, `Refusée`, `Retirée`), motif de refus et bouton de retrait.
  - **Hook `useMyApplications.ts`** : Hook React d'interaction API avec secours démo local.
  - **Tests unitaires** : Suite de tests `apps/api/test/applications.test.ts` (54/54 tests backend passants).

---

## 2026-08-21 — Stabilisation de P-05

### Corrigé

- Suppression des imports inutilisés dans les tests de candidatures.
- Correction du chargement initial du hook `useMyApplications` pour respecter la règle React ESLint `set-state-in-effect`.
- Validation finale : 58 tests backend passants, typechecks API/frontend et lint global réussis.

---

## 2026-08-21 — Base PostgreSQL Neon configurée pour CoFound.mg

### Ajouté

- Projet Neon **`CoFound.mg`** créé dans l’organisation `Yonni`, avec la branche principale `main` et la base `neondb`.
- Migrations Prisma `0001_initial` et `0002_auth_tokens` appliquées avec succès.
- Extensions PostgreSQL vérifiées : `pg_trgm` et `unaccent`.
- Seed idempotent des référentiels exécuté et vérifié : 8 filières, 6 régions, 8 secteurs et 10 compétences.
- [`apps/api/.env.example`](apps/api/.env.example) et la documentation de connexion ajoutés via la PR [#27](https://github.com/YonniVerse/CoFound.mg/pull/27).

### Décidé

- La chaîne `DATABASE_URL` Neon n’est pas enregistrée dans Git. Les environnements locaux utilisent `apps/api/.env`, ignoré par Git, à partir de `apps/api/.env.example`.
- Les migrations doivent être appliquées avant le démarrage de l’API, puis le seed de référence peut être relancé sans risque grâce à son idempotence.

### Validé

- Le schéma public contient les tables Prisma attendues, notamment `User`, `TalentProfile`, `TalentIdentity`, `Project`, `ProjectMember`, `Connection`, `Notification`, `AuditLog`, `Skill`, `Field`, `Sector` et `Region`.
- La branche `dev` reste propre et alignée sur `origin/dev` après intégration.

---

## 2026-08-21 — Vague 0 intégrée : client web, traitements, infrastructure et observabilité

### Ajouté

- **F-14 — Client HTTP web** : `apps/web/src/lib/api-client.ts` fournit un client générique typé avec base URL configurable, Bearer conservé uniquement en mémoire, cookies `httpOnly` envoyés par `credentials: include` et parsing des erreurs via `@cofound/shared`.
- **F-15 — File de traitements** : ajout de `pg-boss` sur PostgreSQL, de la queue `cofound.notifications.email`, d’un publisher NestJS et d’un worker séparé (`start:worker`). Les demandes de réinitialisation publient un job sans jamais renvoyer le jeton brut par l’API.
- **F-16 — Infrastructure** : image API/worker multi-stage, Compose de production, Caddy avec TLS automatique, healthchecks, publication GHCR et déploiement SSH automatisé avec `known_hosts` strict. Le frontend reste déployé séparément sur son CDN statique.
- **F-17 — Sauvegardes** : image dédiée avec `pg_dump`, chiffrement avant transfert, checksum, objets horodatés et pointeur `latest` dans R2. Le profil `restore-test` restaure exclusivement vers `RESTORE_DATABASE_URL`, une base jetable distincte de la production.
- **F-18 — Observabilité** : Sentry initialisé avant NestJS quand `SENTRY_DSN` existe, filtre global des exceptions, logs JSON pino avec redaction des cookies, Authorization, mots de passe et jetons, et readiness check PostgreSQL sur `/api/v1/health`.
- Tests unitaires du healthcheck : réponse `200` lorsque PostgreSQL répond et réponse `503` lorsqu’il est indisponible.

### Décidé

- Le **plan versionné du dépôt** fait foi lorsque le contexte de reprise diverge du mapping des tickets. F-16, F-17 et F-18 suivent donc le périmètre infrastructure, sauvegardes et observabilité de `docs/plan-de-developpement.md`.
- Le fournisseur d’email transactionnel n’est pas choisi dans F-15. Le worker et ses contrats sont prêts ; le transport réel et les gabarits relèvent de `E-01`/`E-02`.
- `BACKUP_ENCRYPTION_KEY` est distinct de `JWT_SECRET` et `RESTORE_DATABASE_URL` doit toujours cibler une base de restauration jetable.

### Validé

- Pull requests fusionnées vers `dev` : [#20](https://github.com/YonniVerse/CoFound.mg/pull/20), [#21](https://github.com/YonniVerse/CoFound.mg/pull/21), [#22](https://github.com/YonniVerse/CoFound.mg/pull/22), [#23](https://github.com/YonniVerse/CoFound.mg/pull/23) et [#24](https://github.com/YonniVerse/CoFound.mg/pull/24).
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` et `pnpm check:bundle` passent sur `dev`.
- La suite API compte 12 tests passants.
- Le JavaScript initial pèse 271 701 octets gzip, sous le cliquet de 290 221 octets gzip.

### À faire hors sandbox

- Configurer les secrets GitHub de l’environnement `production`, le `.env` du VPS, le domaine Caddy, les identifiants R2 et le DSN Sentry.
- Exécuter un build Docker réel, une sauvegarde et une restauration testée sur une machine équipée de Docker. Le sandbox ne contient pas Docker ; la simulation `pnpm deploy --filter @cofound/api --prod --legacy` a toutefois confirmé le runtime Prisma.

---

## 2026-08-20 — Rapatriement du dépôt et nettoyage des permissions

*Précède la restructuration en monorepo décrite dans l'entrée suivante.*

### Modifié

- Le dépôt vit désormais dans `~/Lab/CoFound.mg` au lieu de `~/Lab/archives/CoFound.mg`.
  `.git` a été déplacé tel quel : historique, branches et remote intacts.
- `docs/PRD_CoFound_mg.md` et `docs/SPECS_CoFound_mg.md` déplacés dans `docs/archive/`.
  Archivés plutôt que supprimés : ils décrivent un produit de démonstration de hackathon
  qui ne fait plus autorité, mais restent une référence pour les maquettes d'écran.

### Corrigé

- 218 fichiers apparaissaient modifiés en `755` au lieu de `644`, sans un seul changement
  de contenu — séquelle d'un `chmod -R` ou d'une copie depuis un support FAT/NTFS.
  Permissions restaurées depuis les modes enregistrés dans l'index, en préservant le seul
  fichier légitimement exécutable et les 24 liens symboliques. Ce bruit n'est donc entré
  dans aucun commit.

### Décidé

- **Aucune mention de Claude comme co-auteur dans les commits.** Demande explicite de
  Yonni : le dépôt est un livrable présenté à un jury et à des partenaires, les commits
  doivent être entièrement les siens.
- **La convention de message du dépôt fait foi** (`.trae/rules/git-commit-message.md`) :
  Conventional Commits en français, un seul changement logique par commit. À lire avant
  tout commit.

---

## 2026-08-20 — Restructuration en monorepo pnpm (F-01)

### Ajouté

- Workspace pnpm : `apps/web`, `apps/api` (vide), `packages/shared`
- `tsconfig.base.json` — options TypeScript communes, avec `strict` et
  `noUncheckedIndexedAccess` activés
- `packages/shared` — énumérations du domaine et invariants produit
  (`MIN_AGGREGATION_THRESHOLD`, durées de jetons, limites anti-démarchage). Les schémas
  Zod viennent au ticket `F-11`.
- `.gitignore` et `.nvmrc` à la racine

### Modifié

- `frontend/` déplacé en `apps/web/` par `git mv` — historique préservé
- Passage de npm à pnpm : `package-lock.json` supprimé, `pnpm-lock.yaml` généré
- `@cofound/web` déclare `@cofound/shared` en `workspace:*` — le lien est vérifié
- Port du serveur de développement web : 3000 → **5173**, pour libérer 3000 pour l'API
- `vite.config.ts` : `__dirname` remplacé par `import.meta.url`, dont Vite annonce la
  dépréciation

### Corrigé

- 14 erreurs de typage révélées par l'activation de `strict` :
  - 6 symboles inutilisés — préexistantes, le build du dépôt était déjà rouge
  - 8 accès indexés non vérifiés (`SectionHero`, `SectionTestimonials`, `Avatar`),
    corrigés par des tuples `as const` et une valeur de repli plutôt que par des
    assertions de non-nullité
- `useProjectDetail` : l'état d'erreur et de chargement est désormais **dérivé au rendu**
  au lieu d'être synchronisé dans un effet, ce qui supprime les rendus en cascade
- ESLint aligné sur TypeScript : les identifiants préfixés par `_` sont ignorés — les deux
  outils se contredisaient
- `react-refresh/only-export-components` désactivée sur `src/components/ui/**`, format
  généré par shadcn qu'on ne modifie pas à la main

### Constaté, non traité

- Le bundle pèse **959 Ko (293 Ko gzip)** contre un budget de 200 Ko fixé dans
  l'architecture. Aucun découpage de code, `recharts` et `framer-motion` chargés d'emblée.
  Ticket `S-10`.
- Le projet Vercel pointe toujours sur `frontend/` : son répertoire racine doit passer à
  `apps/web`.

---

## 2026-08-20 — Cadrage complet du projet

### Décidé

- **D1 — Aucune inscription publique.** Les comptes étudiants sont provisionnés par import
  CSV/XLSX de l'établissement ; les organisations entrent par demande validée manuellement.
  *Écart majeur avec le cahier des charges initial, qui prévoyait une inscription filtrée par
  liste blanche.*
- **D2 — Les établissements ne paient pas.** 100 % du revenu vient des partenaires.
  *Retournement du modèle du cahier des charges (« plateforme vendue aux institutions »).*
  Conséquence : le côté partenaire entre dans le MVP.
- **D3 — Découplage Personne / Organisation / Affiliation** avec capacités activables, en
  remplacement des 7 rôles plats du cahier des charges.
- **D4 — Seuls les établissements certifient.** Associations et clubs : affiliation
  déclarative.
- **D5 — Aucun flux monétaire sur la plateforme**, même après partenariat opérateur. On
  modélise l'engagement ; le règlement va directement au bénéficiaire. *Encaisser pour compte
  de tiers est une activité réglementée.*
- **D6 — BMC obligatoire pour sortir du Brouillon**, jamais pour créer un projet.
  *Correction d'une contradiction du cahier des charges : exiger les 9 blocs à la création
  revenait à demander de tout structurer à quelqu'un qui ne sait pas structurer.*
- **D7 — Pseudonymat, pas anonymat.** Honnêteté assumée sur la ré-identification possible en
  petite promotion.
- **D8 — Genre collecté (facultatif), jamais public, jamais dans le matching.** Agrégat
  uniquement, seuil minimal de 5 individus.
- **D9 — Matching déterministe et explicable.** Aucun apprentissage automatique en V1 : rien à
  apprendre sur quelques centaines d'utilisateurs.
- **D10 — Une seule entité `Opportunity` typée** pour sondages, concours, événements, appels et
  offres de stage.
- **D11 — i18n dès le premier écran**, `currency` sur chaque montant, référentiels en base.
- **D12 — Web responsive maintenant, application native en V2** ⇒ le backend est une API.

### Décisions techniques

- **Validé** du cahier des charges : React + TypeScript, Tailwind, Node + TypeScript, NestJS,
  PostgreSQL, Prisma, RBAC, Cloudflare R2, Docker.
- **Rejeté** : Socket.IO → **SSE** · Nginx → **Caddy** · JWT en `localStorage` → **cookie
  `httpOnly` avec rotation et détection de réutilisation** · VPS unique → **statique sur CDN +
  API sur VPS + PostgreSQL managé**.
- **Écarté après examen** : Next.js, Laravel, Auth0/Clerk, GraphQL, tRPC, Redis, Meilisearch,
  paliers gratuits des PaaS.
- **Ajouté au cahier des charges** (absent à l'origine) : email transactionnel, file de
  traitements (pg-boss), recherche intégrée, supervision, stratégie de tests, CI/CD, monorepo
  à types partagés, sauvegardes restaurées, i18n, mesure d'audience respectueuse de la vie
  privée.
- **Décision de schéma structurante** : `TalentIdentity` séparée de `TalentProfile`. La donnée
  privée n'est pas masquée, **elle n'est pas chargée**.

### Ajouté

- `docs/specs-fonctionnelles.md` — spécifications exhaustives par acteur
- `docs/mvp-scope.md` — Must / Should / Won't avec justification produit de chaque exclusion
- `docs/stack-technique-et-justifications.md` — registre de décisions techniques
- `docs/architecture.md` — schémas, flux critiques, RBAC, budget de performance
- `docs/modele-de-donnees.md` — 32 entités du MVP
- `docs/plan-de-developpement.md` — 6 vagues, ~70 tickets, répartition, risques
- `docs/business/modele-economique.md` — modèle, méthode de tarification, coûts, indicateurs
- `docs/business/business-plan-canevas.md` — structure et formules pour le CEO
- `docs/business/pitch-et-objections.md` — récit, arguments, objections, script de démonstration
- `docs/README.md`, `README.md`, `CLAUDE.md`, `NEXT_SESSION.md`, `.claude/commands/handoff.md`

### Audit du prototype existant

Dépôt `YonniVerse/CoFound.mg`, branche `dev`, commit `2c7999e`.

- **Conservé** : design system (tokens OKLCH, échelles d'ombres et de rayons, Inter + Sora
  auto-hébergées), primitives shadcn/Radix, landing page, pattern `fetchMock` → hooks.
- **5 corrections identifiées** (`C1` à `C5`), dont le retrait du badge de genre sur les
  profils de personnes — il réintroduisait précisément le biais que la plateforme existe pour
  supprimer.

### En attente

- Business plan (CEO)
- Montants des formules partenaires
- Arbitrage de marque : `CoFound.mg` vs `CoFounder.mg`
- Choix de l'établissement pilote

## 2026-08-21 — Démarrage de P-06

### Ajouté

- Contrats partagés pour la file porteur et le refus motivé.
- Routes de lecture, acceptation et refus des candidatures reçues.
- Décisions protégées par la propriété du projet et exécutées dans une transaction Prisma.
- Écran UI-28 `/projects/:id/applications` avec filtres par statut, pseudonymat du candidat et actions accepter/refuser.

### Validé

- 58 tests API passants.
- Typecheck partagé, API et frontend réussi.
- Lint global réussi.
- Build frontend réussi.

### À poursuivre

- Ajouter les tests ciblés d’intégration HTTP P-06.
- Finaliser les états UI et préparer la Pull Request.

## 2026-08-21 — Couverture P-06

Les tests ciblés de la file porteur couvrent désormais la lecture pseudonymisée, le refus d’un accès par un non-propriétaire, l’acceptation transactionnelle d’une candidature en attente et le rejet d’une candidature déjà décidée. La suite API compte 62 tests passants, et les typechecks ainsi que le lint global sont réussis.

## 2026-08-21 — Publication P-06 et démarrage P-07

La branche `feat/P-06-file-candidatures-porteur` a été publiée et la Pull Request #48 a été ouverte vers `dev`. La validation complète des modules présents a réussi avec 62 tests API passants, typechecks, lint, build et contrôle bundle.

Le premier lot P-07 ajoute `ApplicationReminderService`, configurable par `APPLICATION_REMINDER_DAYS`, qui regroupe les candidatures `PENDING` dépassant le seuil et crée une notification in-app idempotente par porteur et projet. Le déclenchement planifié, les tests ciblés et l’interface de notification restent à finaliser.

## 2026-08-21 — Finalisation locale de P-07

Le service de relance du porteur dispose maintenant d’un déclenchement périodique configurable par `APPLICATION_REMINDER_ENABLED` et `APPLICATION_REMINDER_INTERVAL_MS`. Le timer est non bloquant et s’arrête proprement avec le module NestJS. Les relances restent in-app et sont idempotentes par porteur et projet.

Trois tests ciblés couvrent le seuil temporel, le regroupement de plusieurs candidatures d’un même projet et l’absence de doublon. La suite API compte 65 tests passants ; le typecheck API et le lint global sont également réussis.

---

## 2026-08-22 — Finalisation partielle des interfaces frontend

### Modifié

- Les routes `/projects`, `/profiles` et `/profile/me` ne renvoient plus vers `ComingSoonPage` : elles utilisent respectivement les écrans fonctionnels du feed et de l’onboarding en attendant des pages dédiées lorsque les contrats UI l’exigeront.
- Le bouton « Postuler à ce projet » de `ProjectActionCard` ouvre désormais `ApplyModal` et transmet le message de motivation à `useProjectDetail.applyToProject`.
- Les postes affichés dans le détail projet sont proposés comme options de candidature ; aucune identité civile n’est ajoutée au parcours.

### Validation

- Typecheck frontend réussi.
- Lint frontend réussi.
- Build Vite réussi.
- `git diff --check` réussi après nettoyage du composant.
- Les chunks applicatifs restent sous la limite de 500 kB ; le plus grand chunk de données observé est d’environ 364 kB.

### En cours

- Les événements métier des notifications email restent à raccorder aux services de connexion, messagerie, candidatures et résolution des signalements.
- Les états UI « déjà candidaté », projet fermé, non-éligible et retrait doivent encore être couverts dans le parcours de candidature.
- Les actions « Sauvegarder » et « Partager » restent visuelles.
- Les changements M-15/M-16 et les compléments frontend restent sur `feat/M-15-notifications` et ne sont pas encore fusionnés dans `dev`.

---

## 2026-08-22 — Feeds spécialisés, candidatures et événements de notification

### Modifié

- `/projects` utilise désormais `ProjectsFeedPage` avec recherche, filtre de statut, pagination et API `/projects/feed`.
- `/profiles` utilise désormais `TalentsFeedPage` avec recherche, pagination et API `/talents/feed`.
- Le hook `useMyApplications` ne remplace plus les réponses réelles par des candidatures fictives et remonte les erreurs métier à l’interface.
- Les candidatures refusent désormais côté backend les projets qui ne sont pas en recrutement et les comptes non éligibles.
- La modale de candidature peut afficher les messages relatifs à une candidature déjà existante, un poste fermé, un projet fermé, une non-éligibilité ou un retrait impossible.

### Ajouté

- Notification `connection.accepted` lors de l’acceptation d’une demande de connexion.
- Notification `message.received` aux autres participants lors de l’envoi d’un message.
- Notification `application.accepted` lors de l’acceptation d’une candidature.
- Route de résolution `PATCH /reports/:id/resolve`, protégée par `moderation:act`, avec notification `report.resolved` au déclarant.
- Injection de `NotificationsModule` dans les modules connexion, messagerie, candidatures et signalement.

### Validation

- Suite API : **116/116 tests réussis**.
- Typecheck et lint API réussis.
- Typecheck, lint et build frontend réussis.
- `git diff --check` réussi.
- Chunks frontend applicatifs sous 500 kB.

### En cours

- Les nouveaux événements doivent encore recevoir des tests unitaires et HTTP dédiés avec doubles de `NotificationService`.
- Le détail projet doit encore exposer les vrais identifiants `OpenPosition.id` afin de supprimer les identifiants de postes dérivés utilisés temporairement par la carte de candidature.
- La file et l’interface staff de modération restent à construire.
- Les changements restent non commités sur `feat/M-15-notifications`.

---

## 2026-08-22 — Tests des événements de notification métier

### Ajouté

- `apps/api/test/notification-business-events.test.ts` couvre les événements `connection.accepted`, `message.received`, `application.accepted` et `report.resolved`.
- Le test de messagerie vérifie que seuls les autres participants sont notifiés et que le pseudonyme, la locale et les références métier sont transmis.
- Le test de résolution HTTP dans `dream-match.integration.test.ts` couvre `PATCH /reports/:id/resolve`, le statut HTTP et l’acteur de modération transmis au service.

### Validation

- Typecheck API réussi.
- Lint API réussi.
- Suite API complète : **121/121 tests réussis**.

### En cours

- Les scénarios d’erreur de file email, de répétition/idempotence des décisions et de recette authentifiée Neon restent à ajouter.

---

## 2026-08-22 — Publication de la branche notifications

### Modifié

- Commit `6546556` créé avec le message conventionnel `feat(notifications): raccorder les événements métier`.
- Branche `feat/M-15-notifications` poussée sur `origin`.
- Pull Request [#67](https://github.com/YonniVerse/CoFound.mg/pull/67) ouverte vers `dev` avec la description des feeds spécialisés, du parcours de candidature, des notifications et des tests.

### Validation

- Validation monorepo réussie avant publication : lint, typecheck, tests API **121/121**, build et `git diff --check`.
- La branche locale est propre et suit `origin/feat/M-15-notifications`.

### En cours

- GitHub indique actuellement `UNSTABLE` pour l’état de fusion de la PR ; le détail des contrôles n’est pas accessible via le jeton CLI courant. La PR doit être revue depuis GitHub avant fusion.

---

## 2026-08-22 — Fusion des chaînes notifications, auth et établissement

Les PR #67, #43, #44, #40, #41 et #42 ont été fusionnées dans `dev`, dans l’ordre des dépendances. Cela clôture l’intégration des notifications M-15/M-16, de l’activation E-10, de la connexion E-11, des rapports d’import E-17, des affiliations E-18 et de l’annuaire E-19.

Les branches E-10, E-11, E-18 et E-19 ont été synchronisées avec `dev` avant fusion afin de résoudre les conflits du routeur frontend et des traductions sans perdre les routes récemment ajoutées. Le commit `bee8499` corrige la mise en session après activation en ajoutant `setAccessToken` au contexte d’authentification.

Après reconstruction de `@cofound/shared`, la validation intégrée passe avec 128/128 tests API, lint, typecheck et build frontend réussis. La reconstruction du package partagé est nécessaire après les fusions lorsque les tests exécutent des exports nouvellement ajoutés.

La prochaine chaîne prioritaire est désormais S-01, puis S-02 et S-03. S-04 peut être préparé en parallèle après vérification de l’audit d’accès à l’identité.


## 2026-08-22 — E-14 et chaîne des signalements

### Ajouté

- Finalisation d’E-14 avec traductions FR/MG de la bannière de complétion et test HTTP de `GET /api/v1/me/profile/completion-reminder`.
- File de modération priorisée et paginée pour les signalements ouverts ou en revue.
- Décisions transactionnelles et sanctions `WARNING`, `FREEZE`, `DISABLE` et `CONTENT_REMOVED`.
- Gel ou désactivation automatique du compte pour les sanctions correspondantes.
- Notification du déclarant lors d’une résolution ou d’un classement sans suite.
- Accès modérateur explicite à l’identité civile de la cible, avec journalisation et exclusion du genre de la réponse.
- Propagation de `staffRole` dans les claims JWT et contrôle RBAC réservé aux rôles staff habilités.
- Console frontend `/moderation` avec file pseudonymisée, décisions et révélation d’identité confirmée.
- Tests unitaires de file, sanction et audit d’identité, ainsi que tests HTTP E-14 et résolution de signalement.

### Validation

- PR #37 d’E-14 fusionnée dans `dev`.
- Commit de la chaîne S-01 à S-04 : `e73ae62`.
- PR #68 ouverte vers `dev`.
- Typecheck, lint, tests ciblés, build frontend et `git diff --check` réussis.
- Tests ciblés signalement/RBAC/intégration : **23/23 réussis**.


## 2026-08-22 — Stabilisation et fusion S-01 à S-04

### Modifié

- Ajout du formulaire frontend de sanction avec action, identifiant de cible, motif et durée.
- Conservation de la compatibilité RBAC pour les comptes STAFF sans rôle de modération.
- Correction du contexte JWT afin de ne renseigner `staffRole` que lorsque le claim existe.

### Validation

- Tests ciblés signalement, RBAC et intégration : **23/23 réussis**.
- Typecheck package partagé, API et frontend réussis.
- Lint API et frontend réussis.
- Build Vite réussi avec chunks applicatifs sous 500 kB.
- `git diff --check` réussi.

### Fusion

- PR #68 fusionnée dans `dev`.
- `dev` synchronisé avec `origin/dev` au commit `32e6af7`.
- La branche de fonctionnalité a été supprimée après fusion.

### En cours

- Recette Neon avec un vrai compte staff et validation du transport email réel.
- Préparation de S-05 : console staff d’audit, référentiels et santé produit.


## 2026-08-22 — Déploiement backend Render réussi

### Déployé

- Service API `cofound-mg` déployé sur Render depuis `feat/B-09-team-contact`.
- URL publique : https://cofound-mg.onrender.com.
- Frontend autorisé par CORS : `https://co-found-mg.vercel.app`.
- Les huit migrations Prisma ont été appliquées sur Neon.

### Vérifié

- `GET /api/v1/health` répond `HTTP 200` avec `{"status":"ok","database":"ok"}`.
- Le build utilise pnpm 11.9.0 installé explicitement, sans dépendre de Corepack.
- Le démarrage applique les migrations Prisma avant `node dist/main.js`.

### Correctifs de déploiement

- Injection NestJS corrigée pour `PrismaService` et `OffPlatformPaymentProvider`.
- Dépendances `class-validator` et `class-transformer` ajoutées à l’API.

### À faire ensuite

- Renseigner l’URL API Render dans Vercel si ce n’est pas déjà fait.
- Créer le Background Worker Render pour `node dist/worker.js`.
- Raccorder Cloudinary côté serveur uniquement lorsque le flux documentaire sera repris.
