# Plan de test complet — branche `main`

**Projet** : CoFound.mg  
**Branche auditée** : `main`  
**Commit audité** : `1a9cade` — `Merge pull request #95 from YonniVerse/dev`  
**Date de l’audit** : 2026-08-24  
**Périmètre** : API NestJS, frontend React/Vite, Prisma, authentification, RBAC, parcours métier et contrôles d’erreur.  
**Statuts initiaux** : tous les scénarios sont `À tester` tant qu’ils n’ont pas été exécutés sur un environnement avec comptes de test et données contrôlées.

> Ce document est un plan de recette et de non-régression. Les éléments de la section **Bugs suspectés / Audit code** sont des constats statiques à confirmer par des tests ciblés ; ils ne constituent pas tous des bugs avérés.

## 1. Préconditions et données de test

Cette section définit le socle nécessaire pour exécuter la recette par rôle de manière reproductible. Les tests doivent être lancés sur un environnement de recette isolé, avec une base de données dédiée, les migrations Prisma appliquées et des comptes dont les identifiants ne sont jamais réutilisés en production. Les routes API sont préfixées par `/api/v1`, conformément à `apps/api/src/main.ts:16`, et l’authentification repose sur un Bearer token traité par les guards globaux déclarés dans `apps/api/src/app.module.ts:35-39`.

### 1.1 Environnement de recette

| Élément | Précondition attendue | Vérification |
|---|---|---|
| Branche | `fix/bugs-main-audit` pour les corrections de cette équipe ; aucune fusion vers `main` pendant la recette | `git branch --show-current` |
| Frontend | URL de recette connue, build correspondant au commit testé | Ouvrir `/login`, `/feed`, `/projects`, `/dream-match` et `/settings` |
| API | Base URL connue avec préfixe `/api/v1` | `GET /api/v1/health` retourne un état documenté |
| Base de données | Base isolée, migrations Prisma appliquées, aucune donnée personnelle réelle | Vérifier le schéma et le nombre de fixtures |
| Authentification | Secret JWT de recette, tokens générés pour chaque persona, cookie/refresh configuré si activé | Login, refresh, logout et expiration contrôlés |
| Référentiels | Fields, skills, sectors, regions actifs disponibles ; au moins un item inactif pour les cas négatifs | Requête de référence ou seed contrôlé |
| Stockage | Stockage de fichiers de recette disponible pour documents d’organisation et exports | Upload valide, extension invalide et fichier trop volumineux |
| Observabilité | Logs API, erreurs HTTP et audits accessibles à l’équipe de recette, sans secrets | Corréler chaque test à un timestamp et un persona |
| Localisation | Langues `fr` et `mg` activées | Rejouer les écrans critiques dans les deux langues |

### 1.2 Comptes de test et états d’accès

Créer des comptes distincts par persona. Le champ `platformRole` provient de `PlatformRole` dans `apps/api/prisma/schema.prisma:57-61`. Les sous-rôles organisationnels proviennent de `OrganizationRole` aux lignes 35-39 et les sous-rôles staff de `StaffRole` aux lignes 63-67. Chaque compte doit avoir un email de recette unique, un mot de passe de 12 à 128 caractères et un statut documenté.

| Persona | Configuration minimale | Données liées à créer | Vérifications préalables |
|---|---|---|---|
| Visiteur | Aucun token | Aucune | Vérifier que les routes publiques ne dépendent pas d’une session précédente |
| TALENT actif | `platformRole=TALENT`, `status=ACTIVE` | Profil Talent, identité, compétences, secteurs, consentements | Le profil existe ; sa visibilité peut être activée et désactivée |
| ORG_ADMIN actif | `platformRole=ORG_MEMBER`, `status=ACTIVE`, membership `ORG_ADMIN` | Organisation A vérifiée, capacités contrôlées, au moins deux membres | Compte membre actif de l’organisation A uniquement |
| ORG_MANAGER actif | `platformRole=ORG_MEMBER`, `status=ACTIVE`, membership `ORG_MANAGER` | Organisation A, projet/opportunité de recette | Capacité présente puis retirée pour les tests d’autorisation métier |
| ORG_VIEWER actif | `platformRole=ORG_MEMBER`, `status=ACTIVE`, membership `ORG_VIEWER` | Organisation A avec membres, projets et opportunités | Peut lire le périmètre autorisé mais ne doit pas écrire |
| STAFF — MODERATOR | `platformRole=STAFF`, `staffRole=MODERATOR`, `status=ACTIVE` | Signalements ouverts, contenus de test | Persona hors périmètre de correction de cette équipe, conservé pour les tests de non-régression |
| STAFF — OPS_ADMIN | `platformRole=STAFF`, `staffRole=OPS_ADMIN`, `status=ACTIVE` | Données de santé produit | Même règle de non-régression que ci-dessus |
| STAFF — SUPER_ADMIN | `platformRole=STAFF`, `staffRole=SUPER_ADMIN`, `status=ACTIVE` | Demande organisationnelle, référentiels, logs | Même règle de non-régression que ci-dessus |
| Compte non actif | Un compte par statut `INVITED`, `FROZEN`, `LEAVING`, `ALUMNI`, `DISABLED` | Données minimales selon le statut | Les tests de cette équipe vérifient seulement qu’un compte non actif ne contourne pas les parcours TALENT/organisation |

### 1.3 Fixtures fonctionnelles minimales

Préparer au moins deux organisations distinctes : **Organisation A** pour le parcours positif et **Organisation B** pour les tests d’isolation. Organisation A doit contenir un ORG_ADMIN, un ORG_MANAGER et un ORG_VIEWER ; Organisation B doit contenir un autre administrateur et des ressources similaires mais non accessibles à A.

| Fixture | Minimum requis | Usage |
|---|---|---|
| Profils | Deux TALENT actifs visibles, un TALENT actif non visible et un profil incomplet | Feed, recherche, matching, visibilité et confidentialité |
| Projets | Un projet DRAFT possédé par le TALENT, un projet RECRUITING avec poste, un projet d’Organisation B | CRUD, candidature, IDOR et transitions |
| Équipe projet | Owner, member actif, candidature PENDING et candidature déjà décidée | Membres, applications, acceptation, rejet et retrait |
| Matching | Profil Dream Match avec secteurs/skills valides, exclusion et consentement | Lecture, upsert, validation et exclusion |
| Organisation | A et B, capacités `PUBLISH_OPPORTUNITY` et `RECRUIT` contrôlées | Isolation, capacité, opportunités et discovery partenaire |
| Membres organisation | Un membre par sous-rôle, un second admin temporaire | CRUD membre et protection du dernier admin |
| Opportunités | Brouillon, publiée, candidature TALENT et candidature PROJECT | Création, publication, décision et doublons |
| Imports | Lot PREVIEW avec ligne valide, doublon et erreur | Preview, mapping, application, annulation et compteurs |
| Relations | Demande de connexion PENDING, connexion ACCEPTED, blocage et conversation | Connexions, messages, blocage et confidentialité |
| Données limites | Email inconnu, ID inexistant, texte vide/trop long, dates invalides, fichier >10 Mo | 400, 403, 404, 409, 413 et erreurs UI |

### 1.4 Règles d’exécution et d’isolement

Avant chaque scénario d’écriture, réinitialiser les fixtures concernées ou utiliser un identifiant unique. Conserver le token, le persona, la langue, l’URL, le payload, le code HTTP, la réponse et les changements en base. Exécuter chaque test positif avec le compte autorisé puis le même test avec un compte d’une autre organisation ou d’un autre rôle. Ne jamais utiliser les emails, tokens, documents ou mots de passe de la recette sur un environnement réel.

Une précondition est considérée comme valide lorsque les comptes se connectent, les tokens sont correctement associés au persona attendu, les fixtures sont visibles dans le bon périmètre et les tests négatifs peuvent être rejoués sans dépendance à l’ordre d’exécution.

## 2. Tableau de synthèse des rôles et permissions

La matrice ci-dessous distingue les permissions globales de plateforme, les rôles d’organisation et les capacités métier. Les permissions globales sont déclarées dans `apps/api/src/rbac/permissions.ts:1-20` et attribuées aux rôles plateforme aux lignes 24-36. Le `PermissionGuard` applique ensuite des règles spéciales aux permissions staff dans `apps/api/src/rbac/permission.guard.ts:38-47`. Un rôle d’organisation ne remplace pas `platformRole` : il est vérifié par les services métier à partir de l’appartenance à l’organisation.

### 2.1 Permissions globales de plateforme

| Rôle plateforme | Permissions accordées par le guard | Interprétation de recette |
|---|---|---|
| `TALENT` | `talent:read`, `project:read`, `project:create`, `project:manage`, `project:apply`, `connection:request`, `message:send` | Peut gérer son profil, créer/gérer ses projets, candidater, établir des connexions et envoyer des messages ; ne doit pas gérer une organisation ni une surface staff |
| `ORG_MEMBER` | `talent:read`, `project:read`, `org:read` | Peut consulter les ressources autorisées et accéder aux services organisationnels ; les mutations sont limitées par le membership, le sous-rôle et les capacités |
| `STAFF` | `talent:read`, `project:read`, `org:read`, `moderation:read`, `audit:read` dans la table de base | Les permissions staff supplémentaires sont filtrées par `staffRole` dans le guard ; ce rôle est couvert ici uniquement en non-régression |

### 2.2 Sous-rôles organisationnels

| Persona complet | Base plateforme | Règles métier attendues | Capacités à contrôler | Interdictions prioritaires |
|---|---|---|---|---|
| `ORG_MEMBER` + `ORG_ADMIN` | `ORG_MEMBER` actif et membership A `ORG_ADMIN` | Lecture du périmètre A ; gestion des membres ; administration selon capacités accordées ; protection du dernier admin | `CERTIFY_AFFILIATION`, `PUBLISH_OPPORTUNITY`, `RECRUIT`, `MENTOR`, `FUND`, `SURVEY`, `ANALYTICS` | Organisation B, données hors membership, suppression/rétrogradation du dernier admin |
| `ORG_MEMBER` + `ORG_MANAGER` | `ORG_MEMBER` actif et membership A `ORG_MANAGER` | Lecture et gestion opérationnelle ; invitation/modification/suppression selon service ; opportunités uniquement avec capacité | Même liste de capacités, avec vérification du rôle manager | Dernier admin, capacité absente, élévation vers `ORG_ADMIN`, organisation B |
| `ORG_MEMBER` + `ORG_VIEWER` | `ORG_MEMBER` actif et membership A `ORG_VIEWER` | Lecture des membres et ressources de A selon le service | Aucune mutation de capacité ; les capacités de l’organisation ne donnent pas automatiquement un droit au viewer | Invitation, modification/suppression membre, import apply, publication, décision et gestion de capacités |

### 2.3 Persona TALENT actif

| Domaine | Accès attendu | Contrôle négatif obligatoire |
|---|---|---|
| Profil / identité | Lire et modifier uniquement son propre profil et son identité | ID d’un autre TALENT, champ interdit, référentiel inactif |
| Projets | Créer ses projets, lire les projets autorisés, gérer uniquement ses projets/propriétés | Publier ou modifier le projet d’un autre owner, lire un projet privé sans membership |
| Applications | Candidater comme TALENT, consulter et retirer ses candidatures | Candidater au nom d’un autre utilisateur/projet non membre, doublon |
| Dream Match | Lire et enregistrer ses préférences avec consentement, gérer ses exclusions | Sans consentement, skills/sectors invalides, profil d’un autre TALENT |
| Connexions / messages | Envoyer et décider les relations prévues, envoyer des messages autorisés | Utilisateur bloqué, conversation étrangère, message vide ou trop long |
| Confidentialité | Consulter exports et consentements propres | Télécharger l’export d’un autre utilisateur, exposer identité civile dans discovery |
| Organisation / staff | Aucun droit d’administration d’organisation ou de staff | Appeler directement les URLs organisation, import, audit, référence et santé |

### 2.4 Sous-rôles staff conservés pour non-régression

| Persona | Accès attendu | Limite à vérifier |
|---|---|---|
| `STAFF` + `MODERATOR` | File de modération, décisions et résolution selon le guard | Pas d’organization requests, référence ou santé produit réservées |
| `STAFF` + `OPS_ADMIN` | Modération et `product-health:read` | Pas d’audit, organization requests ou référence selon le guard actuel |
| `STAFF` + `SUPER_ADMIN` | Organization requests, capacités, audit, référence et santé produit | Les contrôles d’appartenance organisationnelle restent obligatoires |

### 2.5 États non actifs et visiteur

| État | Accès attendu | Vérification minimale |
|---|---|---|
| Visiteur sans token | Routes explicitement anonymes uniquement : landing, contenus publics, opportunités publiées, profils publics et demande organisationnelle | Toute route `/me`, écriture projet, matching, messagerie, import ou staff doit refuser |
| `INVITED` | Activation avant parcours métier | Aucun projet, matching ou message avant activation |
| `FROZEN` / `DISABLED` | Blocage des opérations métier et redirection/état de compte prévu | Réutiliser un token existant et vérifier l’absence de mutation |
| `LEAVING` / `ALUMNI` | Règles explicites à confirmer par produit | Tester lecture, écriture, exports et accès organisationnel séparément |

### 2.6 Règles de lecture de la matrice

Une réponse HTTP 200 de la page frontend ne prouve pas l’autorisation : l’API doit toujours être testée directement avec le token du persona. Une permission globale telle que `org:read` ne suffit pas à autoriser une mutation ; le service doit vérifier l’organisation, le statut actif, le sous-rôle et la capacité. Inversement, un sous-rôle organisationnel ne doit jamais donner à un `ORG_MEMBER` les permissions globales réservées à `TALENT` ou à `STAFF`.

## 3. Tests transverses de sécurité et de non-régression

| ID | Fonctionnalité / route ciblée | Étapes à exécuter | Résultat attendu | Statut |
|---|---|---|---|---|
| SEC-001 | Token absent — `/api/v1/me` | Appeler la route sans `Authorization` | HTTP 401 avec code `UNAUTHENTICATED` | À tester |
| SEC-002 | Token mal formé ou algorithme incorrect | Utiliser un JWT expiré, signé avec une mauvaise clé ou un autre algorithme | HTTP 401 ; aucune donnée métier retournée | À tester |
| SEC-003 | Permission absente | Appeler une route protégée avec un compte authentifié mais sans permission | HTTP 403 avec message `FORBIDDEN` approprié | À tester |
| SEC-004 | CORS et cookies | Tester origine autorisée, origine non autorisée et requête avec credentials | Origines conformes à `CORS_ORIGIN`, aucune fuite de session | À tester |
| SEC-005 | Statut de compte | Utiliser un compte FROZEN/DISABLED sur une route métier puis sur `/me/status` | Le frontend redirige vers `/account-status` et l’API refuse toute opération interdite | À tester |
| SEC-006 | Isolation IDOR | Remplacer chaque `userId`, `projectId`, `organizationId`, `applicationId` et `memberId` par celui d’un autre périmètre | HTTP 403 ou 404 selon le contrat ; aucune donnée de l’autre périmètre | À tester |
| SEC-007 | Validation globale | Envoyer des champs inconnus, types erronés et payloads excessifs | `ValidationPipe`/Zod rejette proprement ; aucune écriture partielle | À tester |
| SEC-008 | Routes anonymes | Vérifier landing, `/projects/feed`, `/talents/feed`, `/opportunities`, `/health`, annuaire et profils publics sans token | HTTP 200 ou erreur métier explicite selon l’existence de la ressource | À tester |
| SEC-009 | Frontend accès direct | Ouvrir directement chaque URL staff, institution, organisation et projet avec chaque persona | L’UI ne doit pas donner l’illusion d’un accès accordé ; l’API reste l’autorité et les erreurs sont traitées | À tester |
| SEC-010 | Déconnexion / rotation | Se connecter, se déconnecter, réutiliser l’ancien access token et l’ancien refresh token | Session invalidée selon le contrat ; refresh token révoqué ou remplacé non réutilisable | À tester |

## 4. Rôle Visiteur non authentifié

| ID | Fonctionnalité / route ciblée | Étapes à exécuter | Résultat attendu | Statut |
|---|---|---|---|---|
| VIS-001 | Landing `/` | Ouvrir la landing en desktop/mobile, changer FR/MG, suivre les CTA publics | Page lisible, textes traduits, aucun appel protégé bloquant le rendu | À tester |
| VIS-002 | Authentification `/auth/login` et `/login` | Saisir email inexistant, mauvais mot de passe, champs vides puis identifiants valides | Erreurs localisées, aucun token en cas d’échec, redirection correcte en cas de succès | À tester |
| VIS-003 | Mot de passe oublié | Soumettre email vide, invalide, inconnu puis valide | Réponse non révélatrice de l’existence du compte et message cohérent | À tester |
| VIS-004 | Contenus publics | Tester `/projects/feed`, `/talents/feed`, `/opportunities`, `/institution/directory`, `/organizations/:id/profile`, `/projects/:id/public` | Seules les données publiées/visibles sont exposées ; ressource absente en 404 | À tester |
| VIS-005 | Demande organisation | Soumettre `/organization-requests` avec payload vide, email invalide, document invalide et formulaire complet | Validation par champ, limite de fichier respectée, statut PENDING créé une seule fois | À tester |
| VIS-006 | Dépôt de signalement | Créer un report depuis un contenu public avec motif valide puis invalide | Signalement accepté selon le contrat ; payload invalide rejeté | À tester |
| VIS-007 | Accès interdit | Appeler `/me`, `/projects/new`, `/messages`, `/notifications`, `/staff/audit`, `/institution/imports` sans token | HTTP 401, sans rendu d’informations privées | À tester |
| VIS-008 | Résilience UI | Couper l’API puis ouvrir landing et pages publiques | États de chargement/erreur compréhensibles, pas de boucle ni écran blanc | À tester |

## 5. Rôle TALENT

| ID | Fonctionnalité / route ciblée | Étapes à exécuter | Résultat attendu | Statut |
|---|---|---|---|---|
| TAL-001 | Connexion, statut et profil | Se connecter, consulter `/me`, `/me/profile`, `/me/identity`, `/profile/me` | Session active, profil propre uniquement, statut et onboarding cohérents | Succès |
| TAL-002 | Onboarding | Compléter chaque étape avec champs valides, incomplets puis réessayer une étape déjà terminée | Progression idempotente, validations visibles, profil publiable seulement si complet | À tester |
| TAL-003 | Profil et identité | Modifier bio, compétences, disponibilité, identité et avatar ; envoyer texte trop long | PATCH accepté pour le propriétaire, limites validées, aucune modification d’un autre profil | Succès |
| TAL-004 | Découverte | Tester `/feed`, `/search`, `/talents/feed`, `/projects/feed` avec recherche vide, terme inconnu et pagination | Résultats cohérents, pseudonymisation respectée, états vide/erreur corrects | À tester |
| TAL-005 | Dream Match | Lire `/me/dream-match`, enregistrer préférences, obtenir suggestions, exclure/réintégrer une suggestion | Préférences persistées, résultats déterministes, exclusion idempotente et limitée au compte | Succès |
| TAL-006 | Création de projet | Créer un projet valide, puis titre/description absents, trop longs ou secteurs invalides | Projet DRAFT créé pour le compte ; validation 400 sans écriture partielle | À tester |
| TAL-007 | Gestion de projet propriétaire | Lire, publier en recruiting, modifier BMC, positions, posts, tâches et membres | Propriétaire autorisé ; transitions de statut et contrôles d’appartenance respectés | À tester |
| TAL-008 | Projet non propriétaire | Lire un projet public, tenter de le modifier, publier ou gérer ses membres | Lecture selon visibilité ; écriture refusée avec 403/404 sans fuite | À tester |
| TAL-009 | Candidature | Postuler à un poste/projet, soumettre candidature spontanée, doublon, retrait et payload invalide | Une candidature par contrainte métier, statut correct, retrait possible uniquement par l’auteur | Succès |
| TAL-010 | Décision de candidature | Avec un projet possédé, accepter/refuser une candidature ; avec un autre projet, tenter la même action | Propriétaire uniquement ; motif de rejet obligatoire si requis ; action idempotente | Succès |
| TAL-011 | Connexions et messagerie | Envoyer une demande, accepter/refuser, envoyer message vide ou trop long, bloquer/débloquer | Relations et conversations isolées ; doublons et utilisateurs bloqués correctement gérés | À tester |
| TAL-012 | Notifications et préférences | Lire notifications, marquer lu, modifier consentements et préférences | Données propres au compte, actions répétées sûres, erreurs 503 affichées via dialogue | À tester |
| TAL-013 | Export et confidentialité | Demander export, consulter statut, télécharger export expiré/inexistant | Export asynchrone lié au compte, téléchargement autorisé uniquement au propriétaire | Succès |
| TAL-014 | Accès staff/organisation | Appeler routes staff et routes de gestion organisation avec token TALENT | 403 systématique ; aucune action visible ne doit réussir par manipulation d’URL | Succès |

## 6. Rôle ORG_MEMBER — ORG_ADMIN

| ID | Fonctionnalité / route ciblée | Étapes à exécuter | Résultat attendu | Statut |
|---|---|---|---|---|
| ADM-001 | Connexion organisationnelle | Se connecter avec un membre ORG_ADMIN actif, ouvrir profil et espaces organisationnels | Session active, organisation correcte, aucune organisation étrangère visible | À tester |
| ADM-002 | Profil organisation | Lire et modifier les informations permises de `/organizations/:organizationId/profile` | Lecture/écriture limitée à l’organisation et aux capacités du rôle | À tester |
| ADM-003 | Membres CRUD | Lister, inviter un email nouveau/existant, modifier un rôle, supprimer un membre | CRUD autorisé ; email normalisé ; doublon rejeté ; audit/notification selon contrat | À tester |
| ADM-004 | Dernier administrateur | Tenter de rétrograder ou supprimer le dernier `ORG_ADMIN`, puis ajouter un second admin et réessayer | Première opération refusée en conflit ; seconde opération possible | À tester |
| ADM-005 | Import institution | Créer un import, consulter preview, mapping, appliquer un lot valide/invalide, annuler | Accès seulement à l’organisation ; lignes et compteurs cohérents ; apply idempotent | À tester |
| ADM-006 | Affiliations | Consulter, créer, modifier et suspendre une affiliation selon les capacités institutionnelles | Capacité `CERTIFY_AFFILIATION` requise ; historique et statuts cohérents | À tester |
| ADM-007 | Opportunités | Créer brouillon, publier, lister candidatures, accepter/refuser avec motif | Capacité `PUBLISH_OPPORTUNITY` et rôle manager requis ; transitions valides uniquement | À tester |
| ADM-008 | Discovery partenaire | Rechercher projets/talents, suivre/ne plus suivre, contacter un projet | Périmètre organisation correct, doublons empêchés, message enregistré une fois | À tester |
| ADM-009 | Capacités organisation | Accorder/retirer `RECRUIT`, `FUND`, `MENTOR`, etc. ; tester institution et capacité interdite | Réservé au SUPER_ADMIN selon guard ; `CERTIFY_AFFILIATION` limité à INSTITUTION | À tester |
| ADM-010 | Surfaces interdites | Tester modération, audit, référence, santé, création de projet TALENT et candidature personnelle | 403 ou UI désactivée avec erreur API propre | À tester |

## 7. Rôle ORG_MEMBER — ORG_MANAGER

| ID | Fonctionnalité / route ciblée | Étapes à exécuter | Résultat attendu | Statut |
|---|---|---|---|---|
| MGR-001 | Lecture organisationnelle | Consulter overview, profil, membres, projets, talents et opportunités de sa structure | Lecture autorisée si membre actif et données limitées à l’organisation | À tester |
| MGR-002 | Gestion opérationnelle | Inviter, modifier et supprimer un membre non administrateur ; créer/publier une opportunité avec capacité | Actions autorisées uniquement sur son organisation et si capacité présente | Succès |
| MGR-003 | Dernier admin | Tenter de supprimer/rétrograder le dernier admin | HTTP 409, aucun changement en base | À tester |
| MGR-004 | Sans capacité | Retirer `PUBLISH_OPPORTUNITY` puis créer/publier une opportunité | HTTP 403 métier `ORGANIZATION_CAPABILITY_REQUIRED` | Succès |
| MGR-005 | Import et affiliation | Tester import apply et certification d’affiliation avec/sans capacité | Refus sans capacité ; opérations autorisées correctement journalisées | Succès |
| MGR-006 | Escalade de privilèges | Modifier son propre rôle ou celui d’un autre vers ORG_ADMIN, puis agir sur une autre organisation | Impossible sans règle explicitement prévue ; aucune élévation indirecte | Succès |
| MGR-007 | Staff et TALENT | Appeler audit, santé, référence, organization requests et création projet | 403 systématique | À tester |

## 8. Rôle ORG_MEMBER — ORG_VIEWER

| ID | Fonctionnalité / route ciblée | Étapes à exécuter | Résultat attendu | Statut |
|---|---|---|---|---|
| VIEW-001 | Lecture membres | Lister les membres de sa propre organisation et d’une organisation étrangère | Sa structure visible selon contrat ; étrangère refusée | Succès |
| VIEW-002 | Lecture projet/opportunité | Consulter projets, talents, opportunités et candidatures accessibles | Lecture seulement ; données privées non exposées | Succès |
| VIEW-003 | Écriture membres | Inviter, modifier et supprimer un membre | HTTP 403 ; aucun changement persistant | Succès |
| VIEW-004 | Écriture opportunités | Créer, publier ou décider une candidature malgré `ORG_READ` | Refus par contrôle de capacité/rôle manager | Succès |
| VIEW-005 | Imports et affiliations | Créer/apply un import et modifier une affiliation | Refus ; les écrans affichent un état interdit cohérent | À tester |
| VIEW-006 | Capacité et staff | Accorder/reti rer une capacité, accéder audit/référence/santé | 403 partout | À tester |
| VIEW-007 | Changement de rôle | Faire promouvoir le viewer par un admin, reconnecter puis retester | Nouvelles permissions actives après émission de token selon contrat ; ancien token contrôlé | À tester |

## 9. Rôle STAFF — MODERATOR

| ID | Fonctionnalité / route ciblée | Étapes à exécuter | Résultat attendu | Statut |
|---|---|---|---|---|
| MOD-001 | Connexion staff | Se connecter et ouvrir `/moderation` | Accès à la file ; aucun écran organisation request/audit non autorisé | À tester |
| MOD-002 | File de signalements | Lister `/reports/moderation-queue`, filtrer et paginer | Signalements visibles avec niveau de détail attendu, sans identité prématurément révélée | À tester |
| MOD-003 | Modération | Décider, résoudre, retirer contenu ou avertir ; répéter la décision | Actions conformes au workflow, idempotence ou conflit explicite | À tester |
| MOD-004 | Révélation identité | Révéler l’identité d’un report valide puis d’un report inexistant | Action uniquement staff autorisé ; audit produit ; 404 sans fuite | À tester |
| MOD-005 | Contournement rôle | Appeler `/staff/audit`, `/staff/reference-data`, `/staff/health`, `/staff/organization-requests` | 403 pour les surfaces réservées | À tester |
| MOD-006 | Données organisationnelles | Tenter de modifier membres, opportunités, capacités ou imports | Refus malgré `ORG_READ` plateforme | À tester |
| MOD-007 | Erreurs de payload | Envoyer motif absent, statut inconnu, report inexistant et ID mal formé | 400/404/409 explicites, pas d’état partiellement modifié | À tester |

## 10. Rôle STAFF — OPS_ADMIN

| ID | Fonctionnalité / route ciblée | Étapes à exécuter | Résultat attendu | Statut |
|---|---|---|---|---|
| OPS-001 | Modération étendue | Rejouer la file, décisions et identité avec OPS_ADMIN | Même accès de modération que prévu, actions auditées | À tester |
| OPS-002 | Santé produit | Ouvrir `/staff/health` avec API saine, base indisponible et service dégradé | Données de santé adaptées, pas de secrets exposés | À tester |
| OPS-003 | Audit interdit | Lire `/staff/audit` et exporter les logs | 403 si le code réserve `AUDIT_READ` au SUPER_ADMIN | À tester |
| OPS-004 | Organization requests interdites | Lire, approuver, refuser et consulter documents | 403 ; aucune création d’organisation ou de membre | À tester |
| OPS-005 | Référence interdite | Lire/créer/modifier les données de référence | 403 | À tester |
| OPS-006 | Statut et erreurs | Tester compte OPS_ADMIN FROZEN/DISABLED, payload invalide et base indisponible | Refus sécurisé et message UI non technique | À tester |

## 11. Rôle STAFF — SUPER_ADMIN

| ID | Fonctionnalité / route ciblée | Étapes à exécuter | Résultat attendu | Statut |
|---|---|---|---|---|
| SADM-001 | File de demandes organisationnelles | Lister, détailler, ouvrir document, approuver une demande valide | Demande approuvée une seule fois ; organisation et premier admin créés ; audit enregistré | À tester |
| SADM-002 | Rejet demande | Rejeter sans motif, motif trop court puis motif valide ; rejeter une demande déjà décidée | Validation du motif, statut REJECTED et conflit lors d’une seconde décision | À tester |
| SADM-003 | Création du premier compte | Approuver avec contact inexistant puis contact existant TALENT/ORG_MEMBER | Compte et membre créés/mis à jour conformément au contrat ; vérifier qu’aucun rôle existant n’est perdu involontairement | À tester |
| SADM-004 | Documents | Accéder à un document valide, index négatif, index hors limites et requête sans signature autorisée | URL temporaire seulement, refus propre et aucune fuite de fichier | À tester |
| SADM-005 | Capacités | Accorder et retirer chaque capacité ; tester `CERTIFY_AFFILIATION` sur INSTITUTION puis COMPANY | Opérations idempotentes, unique par organisation/capacité, restriction institutionnelle appliquée | À tester |
| SADM-006 | Audit | Lister avec filtres, pagination, dates invalides et export | Logs complets, filtres sûrs, aucun secret dans la réponse | À tester |
| SADM-007 | Référence data | Lire, créer, modifier un item valide et tenter doublon/ID inconnu | CRUD réservé au SUPER_ADMIN avec validation et audit | À tester |
| SADM-008 | Santé et compte | Consulter santé produit et accéder à un compte suspendu | Santé disponible ; statut de compte respecté ; aucun bypass de sécurité | À tester |
| SADM-009 | Non-régression métier | Tester projets, organisations, imports, opportunités, modération et privacy sans IDOR | Le statut staff n’autorise pas automatiquement l’accès à des données d’organisation non attribuées | À tester |

## 12. Rôle compte non actif

| ID | Fonctionnalité / route ciblée | Étapes à exécuter | Résultat attendu | Statut |
|---|---|---|---|---|
| STA-001 | Compte INVITED | Utiliser token ou tenter activation, login et route métier | Activation requise ; aucune écriture métier avant activation | À tester |
| STA-002 | Compte FROZEN | Ouvrir une route protégée, vérifier `/me/status` et le frontend | Redirection `/account-status`, actions bloquées | À tester |
| STA-003 | LEAVING / ALUMNI | Tester feed, projets, messages et exports | Règles explicites et cohérentes ; aucune permission résiduelle inattendue | À tester |
| STA-004 | DISABLED | Réutiliser anciens tokens et demander reset/refresh | Refus sécurisé, pas de réactivation implicite | À tester |
| STA-005 | Réactivation | Modifier le statut via le parcours autorisé puis reconnecter | Nouveau token et permissions conformes, ancien état non réutilisé | À tester |

## 13. Tests CRUD et routes à couvrir par domaine

| Domaine | Routes API principales | Création | Lecture | Modification | Suppression / transition |
|---|---|---|---|---|---|
| Auth / compte | `/auth/*`, `/me`, `/me/status` | Login, activation, reset | Session et statut | Profil, identité, préférences | Logout, révocation, statut |
| Profil / privacy | `/me/profile`, `/me/identity`, `/me/privacy/exports`, `/talents/:id` | Export, profil initial | Profil public/privé | Profil propre | Export expiration, consentement |
| Projet | `/projects`, `/projects/:id`, `/projects/:id/bmc`, `/positions`, `/tasks`, `/posts`, `/members` | Projet, position, tâche, post, membre | Projet public/membre | Gestion owner/member | Retrait, archivage, suppression contenus |
| Applications | `/applications`, `/opportunities/*` | Candidature | Mes candidatures / reçues | Acceptation, rejet, retrait | Transitions et doublons |
| Relations | `/connections/*`, `/blocks/*`, `/messages/*` | Demande, blocage, message | Conversations et listes | Décision, lecture | Déblocage, archivage si prévu |
| Organisation | `/organization-requests`, `/organizations/*` | Demande, membre, opportunité, engagement | Profil, membres, projets, talents | Capacités, affiliation, opportunité | Rejet, retrait membre, watch |
| Institution | `/institution/*`, `/organizations/:id/members`, `/institution/imports/*` | Import et membre | Overview, annuaire, batch | Mapping/apply, membres, affiliations | Annulation lot, retrait membre |
| Modération | `/reports/*`, `/moderation` | Report | Queue, identité | Décision, résolution | Retrait de contenu / clôture |
| Staff | `/staff/audit`, `/staff/reference-data`, `/staff/health` | Référence | Logs, santé, référence | Référence et actions opérationnelles | Selon domaine |

## 14. Bugs suspectés / Audit code

Les points suivants ont été relevés par lecture statique et doivent être confirmés par les scénarios indiqués. Les éléments marqués comme corrigés ont été reproduits par un test automatisé puis publiés sur `fix/bugs-main-audit`.

| ID | Niveau à confirmer | Fichier / ligne | Observation | Test de confirmation |
|---|---|---|---|---|
| BUG-AUDIT-001 | Élevé — sécurité | `apps/api/src/rbac/access-token.guard.ts:32-40` et `apps/api/src/rbac/permission.guard.ts:38-47` | Les permissions et le statut sont dérivés des claims JWT. Le guard vérifie la signature et les claims, mais ne revalide pas en base à chaque requête qu’un rôle/statut n’a pas été révoqué depuis l’émission du token. | SEC-010, STA-002, STA-004 : révoquer ou geler un compte, puis réutiliser un access token encore valide sur une route d’écriture. |
| BUG-AUDIT-002 | Élevé — confidentialité | `apps/api/src/institution/institution-members.service.ts:15-16` et `apps/api/src/project/project-members.service.ts:43-51` | Les listes de membres sélectionnent les emails et le service projet force `revealIdentity: true`. Cela peut contredire la pseudonymisation attendue dans les écrans de découverte. | SEC-006, TAL-004, ADM-003 : comparer les champs renvoyés à un visiteur, un talent, un membre projet et un admin. |
| BUG-AUDIT-003 | Élevé — intégrité des rôles | `apps/api/src/organization-request/organization-request-staff.service.ts:80-94` | Lors de l’approbation d’une demande, un utilisateur existant peut être muté en `ORG_MEMBER`. Si l’email correspond à un TALENT actif, cette mutation peut lui retirer ses permissions TALENT et ses parcours associés. | SADM-003 : approuver une demande avec l’email d’un TALENT actif et vérifier le rôle, les projets, candidatures et données existantes. |
| BUG-AUDIT-004 | Moyen — RBAC | `apps/api/src/organization-request/organization-request-staff.controller.ts:29` | L’approbation est décorée avec `ORGANIZATION_REQUEST_READ` alors que le rejet utilise `ORGANIZATION_REQUEST_MANAGE`. Le guard réserve actuellement les deux au SUPER_ADMIN, mais la permission de lecture pour une mutation est incohérente et fragile lors d’une future évolution RBAC. | SADM-001 et une simulation de changement de matrice de permissions ; vérifier aussi les audits de mutation. |
| BUG-AUDIT-005 | Moyen — RBAC / métier | `apps/api/src/organization-request/opportunity.controller.ts:24-51` et `opportunity.service.ts:14-70` | Toute la classe exige `ORG_READ`, tandis que les opérations d’écriture dépendent ensuite de la capacité `PUBLISH_OPPORTUNITY` et des rôles manager. Le contrôle métier est correct en apparence, mais il faut vérifier que la lecture ne révèle pas des données à un ORG_VIEWER et que les méthodes mutantes ne sont pas contournables. | MGR-002, MGR-004, VIEW-002, VIEW-004. |
| BUG-AUDIT-006 | Moyen — validation | `apps/api/src/institution/institution-members.service.ts:21-25` | Le rôle fourni par l’entrée est casté en `OrganizationRole` côté service. La validation effective doit être confirmée dans le schéma partagé ; sans validation stricte, une valeur arbitraire pourrait atteindre Prisma ou produire une erreur 500. | ADM-003, MGR-006, VIEW-003 avec rôle inconnu, valeur vide et casse incorrecte. |
| BUG-AUDIT-007 | Moyen — opérationnel | `apps/api/src/account-seed/seed-accounts-config.ts:51-55` | Une configuration de seed sans `platformRole` prend par défaut `STAFF`, et un staff sans `staffRole` prend par défaut `SUPER_ADMIN`. Une variable Render mal configurée pourrait donc provisionner un compte plus privilégié que prévu. | SADM-009 et test de configuration avec champs manquants ; vérifier les logs et le compte réellement créé. |
| BUG-AUDIT-008 | Moyen — cohérence de statut | `apps/api/src/rbac/access-token.guard.ts:34-40` | Le statut extrait du JWT est injecté dans la requête mais le guard de permission ne semble pas refuser explicitement les statuts non actifs. La restriction est peut-être déléguée aux services, à `/me/status` ou au frontend, ce qui risque de créer des écarts entre routes. | STA-001 à STA-004 : tester chaque statut sur chaque famille de route en lecture et écriture. |
| BUG-AUDIT-009 | Faible à moyen — UX/sécurité | `apps/web/src/App.tsx:55-66` | `AccountStatusBoundary` appelle `/me/status` sur chaque changement de route et ignore silencieusement les erreurs réseau. En cas de panne, l’utilisateur peut voir des pages protégées sans indication claire de l’état de vérification. | SEC-005, SEC-009 et test avec API indisponible pendant une navigation. |
| BUG-AUDIT-010 | Moyen — exposition de données | `apps/api/src/organization-request/opportunity.service.ts:38-42` | La liste des candidatures d’opportunité renvoie `applicantId` et le message ; il faut confirmer que la réponse respecte la pseudonymisation et les droits du partenaire, surtout avant décision. | ADM-007, MGR-002 et VIEW-002 avec candidature TALENT et PROJECT. |
| BUG-AUDIT-011 | Élevé — escalade de privilèges — corrigé | `apps/api/src/institution/institution-members.service.ts:30-37` | Un `ORG_MANAGER` pouvait promouvoir un membre vers `ORG_ADMIN`, car le service vérifiait le rôle du membre mais pas la capacité de l’acteur à attribuer le rôle administrateur. Correction : toute promotion vers `ORG_ADMIN` est désormais refusée pour `ORG_MANAGER`. | MGR-006 et `apps/api/test/organization-members.test.ts`. |
| BUG-AUDIT-012 | Moyen — accès en lecture — corrigé | `apps/api/src/organization-request/opportunity.service.ts:14-17` | La lecture des opportunités d’une organisation exigeait à tort la capacité `PUBLISH_OPPORTUNITY`, ce qui bloquait les `ORG_VIEWER` pourtant autorisés en lecture. Correction : la lecture vérifie désormais uniquement l’appartenance active et le rôle lecteur ; les mutations conservent le contrôle de capacité. | VIEW-001, VIEW-002 et `apps/api/test/opportunity-access.test.ts`. |
| BUG-AUDIT-013 | Élevé — RBAC opérationnel — corrigé | `apps/api/src/import/import-batch.controller.ts:24-43` et `apps/api/src/institution/institution-affiliation.controller.ts:12-17` | Les mutations imports/affiliations exigeaient `org:manage`, permission absente de tous les `ORG_MEMBER`, ce qui empêchait un ORG_MANAGER autorisé par le service d’atteindre ces routes. Correction : les guards utilisent `org:read` et les services conservent le contrôle ORG_ADMIN/ORG_MANAGER. | MGR-005, VIEW-005 et tests `import-batch`, `import-apply`, `institution-affiliation`. |

## 15. Critères de sortie

La recette peut être déclarée acceptable lorsque chaque rôle dispose d’au moins une exécution positive et une exécution négative par famille fonctionnelle, que les tests IDOR et statut de compte sont passés, que les transitions CRUD critiques sont idempotentes, et qu’aucun rôle ne peut atteindre une surface réservée par simple manipulation d’URL ou de payload.

Les bugs suspects doivent être classés après reproduction avec : persona, token et statut utilisés, route exacte, payload minimal, réponse observée, résultat attendu, impact et éventuelle régression. Toute correction ultérieure devra ajouter ou mettre à jour un test automatisé avant sa validation de recette.

## 16. Résumé de l’audit statique

Les rôles identifiés sont **TALENT**, **ORG_MEMBER** et **STAFF** au niveau plateforme. Le rôle `ORG_MEMBER` se décline en **ORG_ADMIN**, **ORG_MANAGER** et **ORG_VIEWER** au niveau organisationnel. Le rôle `STAFF` se décline en **SUPER_ADMIN**, **OPS_ADMIN** et **MODERATOR**. Le périmètre de test ajoute le **visiteur non authentifié** et les comptes non actifs, car ils représentent des états d’accès indispensables à la non-régression.

Les premiers risques à confirmer concernent la révocation de statut/permissions avec des JWT encore valides, la possible exposition d’identités dans les listes de membres/projets, la mutation d’un compte TALENT existant lors de l’approbation d’une organisation, le défaut de cohérence entre permissions de lecture et de mutation, et les valeurs par défaut très privilégiées du seed de comptes.
