> Fichier de reprise de contexte. Chargé automatiquement par `CLAUDE.md`.
> L’état vivant est ici ; l’historique détaillé est dans `CHANGELOG.md`.

**Dernière mise à jour** : 2026-08-21
**Phase** : Vague 3 — P-02 publié, en attente de revue
**Branche** : `P-02`, publiée sur `origin/P-02`
**Ticket courant** : P-02 — BMC guidé
**Vague** : Vague 3 — Le projet
**État du workspace** : propre après le commit `a589da0` ; PR #45 ouverte vers `dev` ; aucun secret Neon ajouté

---
## 1. Tickets Vague 3

P-01 est validé et committé. L’ordre restant est P-02 → P-03, P-04 → P-05 → P-06 → P-07, P-08 → P-09, puis P-10, P-11, P-12 et P-13 selon leurs dépendances.

---
## 2. P-01 terminé

Le commit `62ae3c2 feat(project): créer un projet en brouillon` ajoute le contrat `projectCreateSchema`, le module projet NestJS, `POST /api/v1/projects`, `GET /api/v1/projects/:id`, la création transactionnelle en `DRAFT`, l’ajout du créateur comme `OWNER`, l’écran `/projects/new` et trois tests dédiés. La branche est publiée sur `origin/P-01`.

Validations P-01 : 52 tests API passants sur la branche dédiée, typecheck shared/API/frontend passant et lint API/frontend passant.

---
## 3. P-02 — implémenté

P-02 est implémenté : contrats Zod partagés pour neuf blocs, service NestJS transactionnel, routes GET/PATCH protégées, calcul serveur de complétion, écran UI-26 avec exemples contextualisés, indicateur d’enregistrement et autosave debouncé. Les membres actifs du projet peuvent lire et modifier le BMC ; les non-membres sont refusés. La transition `DRAFT → RECRUITING` reste réservée à P-03.

Les neuf blocs sont : segments clients, propositions de valeur, canaux, relations clients, flux de revenus, ressources clés, activités clés, partenaires clés et structure de coûts. Validations : shared build, typechecks API/web, lint et build OK ; 56 tests API passants, 0 échec.

---
## 4. Fichiers importants

- `packages/shared/src/schemas.ts` : `BMC_BLOCK_KEYS`, schémas de bloc, patch et réponse.
- `apps/api/src/project/bmc.service.ts` : contrôle membre actif, normalisation, upsert transactionnel et complétion serveur.
- `apps/api/src/project/bmc.controller.ts` : GET/PATCH `/api/v1/projects/:projectId/bmc`.
- `apps/api/src/project/project.module.ts` : enregistrement du service et contrôleur.
- `apps/api/test/bmc.test.ts` : quatre tests P-02.
- `apps/web/src/pages/ProjectBmcPage.tsx` : écran UI-26 responsive.
- `docs/plan-de-developpement.md` : backlog officiel.

---
## 5. Décisions et vigilance

- Utiliser une transaction Prisma pour créer ou mettre à jour le BMC et conserver la cohérence du projet.
- Ne pas exposer d’informations privées de membres ou de projets dans les contrats BMC.
- Refuser l’accès aux utilisateurs qui ne sont pas membres actifs du projet.
- La transition `DRAFT → RECRUITING` appartient à P-03 et ne doit pas être implémentée dans P-02.
- Les données d’exemple doivent être statiques, localisées et séparées des réponses persistées.
- Ne pas utiliser ni stocker les secrets Neon dans le dépôt.

---
## 6. Prochaine action

Revoir et fusionner la PR #45 (`P-02`) après les contrôles CI ; ensuite créer la branche P-03 depuis `dev` et implémenter la transition `DRAFT → RECRUITING` conditionnée à 100 % de complétion, avec la liste des blocs manquants. Vigilances restantes : file offline persistante, conflit avec historique et lecture publique bloc par bloc à vérifier dans les tickets concernés.
