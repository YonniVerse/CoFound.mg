# Context Handoff — Reprise de session CoFound.mg

> **Fichier de reprise de contexte**. Mis à jour à la fin de chaque session de travail.
> **Périmètre Développeur** : Norman (Référent Frontend & Responsable Découverte / Feeds / Espace Projet).
> **Source de vérité du backlog & séquencement** : [`docs/plan-de-developpement.md`](docs/plan-de-developpement.md).

---

## 1. État Actuel du Projet

- **Dernière mise à jour** : 2026-08-21
- **Vague actuelle** : Vague 3 (Le projet) — **P-01 à P-05 réalisés, P-06 en cours**
- **Branche Git actuelle** : `P-06` (issue de `origin/feat/P-05-candidatures-candidat`)
- **Tests automatisés** : 62/62 tests backend validés (`pnpm test` dans `apps/api`) ; typechecks et lint validés
- **Build Web** : Validé sans aucune erreur (`pnpm --filter web build`)

---

## 2. Récapitulatif des Tickets de Norman

| Ticket | Description | Branche Git | État |
|---|---|---|---|
| **E-10** | Écran d'activation `/activation/:token` + choix du mot de passe | `feat/E-10-activation` | ✅ **TERMINÉ** |
| **E-11** | Écran de connexion + mot de passe oublié | `feat/E-11-login` | ✅ **TERMINÉ** |
| **M-01** | Recherche PostgreSQL (`tsvector`, `pg_trgm`, `unaccent`) | `feat/M-01-postgresql-search` | ✅ **TERMINÉ** |
| **M-02** | API Feed Projets : filtres statut/secteur/région, pagination par curseur | `feat/M-02-api-feed-projets` | ✅ **TERMINÉ** |
| **M-03** | Interface Feed Projets : scroll infini, filtre statut latéral fixe | `feat/M-03-interface-feed-projets` | ✅ **TERMINÉ** |
| **M-04** | API + interface Feed Talents (opt-in, cartes pseudonymisées) | `feat/M-04-feed-talents` | ✅ **TERMINÉ** |
| **P-01 à P-04** | Création projet, BMC guidé, transition statut, postes ouverts | - | ✅ **TERMINÉS PAR L'ÉQUIPE** |
| **P-05** | Candidature : API + écran candidat + modal postulation + tableau de bord candidat `/my-applications` | `feat/P-05-candidatures-candidat` | ✅ **TERMINÉ** |
| **P-06** | File de candidatures côté porteur, accepter / refuser avec motif | `P-06` | 🔄 **EN COURS — API et UI-28 ajoutées** |

---

## 3. Fichiers Majeurs Modifiés pendant la Session

- `packages/shared/src/schemas.ts` : Ajout des schémas Zod `createApplicationInputSchema`, `applicationItemSchema`, `myApplicationsResponseSchema`.
- `apps/api/src/applications/applications.service.ts` : Service NestJS créant une candidature (contrôle unicité candidature `PENDING`, poste ouvert), listant les candidatures du candidat et permettant le retrait.
- `apps/api/src/applications/applications.controller.ts` : Endpoints protégés par `project:apply` (`POST /applications`, `GET /applications/me`, `PATCH /applications/:id/withdraw`).
- `apps/api/src/applications/applications.module.ts` : Déclaration et enregistrement dans `AppModule`.
- `apps/api/test/applications.test.ts` : Suite de tests unitaires P-05, avec mocks contrôlés et imports nettoyés.
- `apps/api/test/applications.owner.test.ts` : Tests ciblés P-06 sur la file pseudonymisée, la propriété du projet, l’acceptation transactionnelle et le refus d’une candidature déjà décidée.
- `apps/web/src/hooks/useMyApplications.ts` : Hook React connecté à l'API `/applications/me` avec fallback démo et chargement initial différé pour respecter le lint React.
- `apps/web/src/components/applications/ApplyModal.tsx` : Modal de postulation à un projet avec message et sélection de poste.
- `apps/web/src/pages/MyApplicationsPage.tsx` : Page candidat `/my-applications` avec filtres de statut (`En attente`, `Acceptée`, `Refusée`, `Retirée`), motif de refus et bouton de retrait.
- `apps/web/src/App.tsx` : Enregistrement des routes lazy `/my-applications` et `/projects/:id/applications`.
- `apps/web/src/pages/ProjectApplicationsPage.tsx` : Écran UI-28 de file porteur, filtres par statut, pseudonymat et actions accepter/refuser.
- `apps/api/src/applications/applications.controller.ts` : Routes porteur de lecture, acceptation et refus motivé.
- `apps/api/src/applications/applications.service.ts` : Autorisation propriétaire et décisions transactionnelles P-06.
- `apps/api/src/rbac/permissions.ts` : Permission `project:manage` disponible pour les comptes Talent, avec propriété vérifiée au niveau service.

---

## 4. Décisions Techniques Prises

1. **Unicité des candidatures en attente** : Un candidat ne peut avoir qu'une seule candidature `PENDING` active pour un projet donné. Une tentative de double postulation renvoie un code d'erreur `APPLICATION_ALREADY_EXISTS` (`409 Conflict`).
2. **Poste ouvert obligatoire si spécifié** : Si un `positionId` est fourni, l'API vérifie qu'il appartient bien au projet et possède `isOpen: true`.
3. **Permission `project:apply`** : Tous les endpoints candidatures exigent la permission `Permission.PROJECT_APPLY` (accordée aux comptes `TALENT`).
4. **Retrait autonome** : Le candidat peut retirer une candidature à l'état `PENDING`, la faisant passer à `WITHDRAWN`.

---

## 5. Instructions de Reprise (À faire ensuite)

P-06 est en cours : le premier lot API/UI est typé et validé. Les tests ciblés de service sont ajoutés ; il reste à ajouter les tests HTTP d’intégration, finaliser les états UI-28 et préparer la PR.

Pour la prochaine session :
1. Lire ce fichier (`NEXT_SESSION.md`) et vérifier la branche Git courante.
2. Rester sur `P-06` et vérifier le diff avant toute modification.
3. Finaliser le ticket **P-06 — File de candidatures côté porteur, accepter / refuser avec motif** :
   - Endpoints backend pour le porteur de projet : lister les candidatures reçues par projet (`GET /projects/:id/applications`), accepter (`PATCH /applications/:id/accept`), refuser avec motif obligatoire (`PATCH /applications/:id/reject`).
   - Interface Web de gestion des candidatures reçues pour le porteur de projet dans l'espace projet.
