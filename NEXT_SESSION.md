# Context Handoff — Reprise de session CoFound.mg

> Lire ce fichier en premier à chaque nouvelle session. Source de vérité : `docs/plan-de-developpement.md`.

## État actuel

- Vague 3 — Projet.
- P-09 est fusionné dans `dev` via la PR #51, commit `cc479101`.
- P-11 est implémenté et publié dans la PR #52.
- P-12 et P-13 sont implémentés sur la branche `P-12` et publiés dans la PR #53.
- M-10 et M-11 restent absents de l’implémentation API identifiable dans `origin/dev`; ils sont attribués à Yonni et M-11 dépend de M-10.

## Livrables P-11 à P-13

P-11 fournit les contrats partagés, le CRUD transactionnel des publications projet, l’auteur pseudonymisé et l’écran `/projects/:id/posts` connecté à l’API réelle.

P-12 fournit l’export JSON transactionnel réservé au propriétaire, avec projet, BMC, membres pseudonymisés, postes, tâches et publications. L’écran `/projects/:id/export` déclenche le téléchargement local de l’archive.

P-13 fournit le détail public `/projects/:id/public`. Les blocs BMC privés, les postes fermés et les publications expirées sont filtrés ; les membres sont présentés uniquement par pseudonyme.

## Fichiers importants

- `apps/api/src/project/project-posts.*.ts` — API P-11.
- `apps/api/src/project/project-export.*.ts` — API P-12.
- `apps/api/src/project/project-public.*.ts` — API P-13.
- `apps/api/test/project-posts.integration.test.ts` — tests HTTP P-11.
- `apps/api/test/project-export.integration.test.ts` — test HTTP P-12.
- `apps/api/test/project-public.integration.test.ts` — test HTTP P-13.
- `apps/web/src/pages/ProjectPostsPage.tsx` — UI P-11.
- `apps/web/src/pages/ProjectExportPage.tsx` — UI P-12.
- `apps/web/src/pages/ProjectPublicPage.tsx` — UI P-13.

## Validation

- Tests HTTP P-11 : 2/2 réussis.
- Tests HTTP P-12/P-13 : 2/2 réussis.
- Suite API complète exécutée après P-09 : 84/84 réussis.
- Typecheck API/frontend, lint frontend et build frontend réussis après ajout des vues P-12/P-13.
- Les tests avec Prisma réel/Neon restent à effectuer séparément ; les tests HTTP utilisent des services substitués.

## Prochaine action

Relancer la suite API complète après P-11/P-12/P-13, stabiliser les contrôles CI des PR #52 et #53, puis faire relire et fusionner dans l’ordre des dépendances. Confirmer avec Yonni l’état de M-10/M-11 avant toute implémentation réelle de P-10.

Ne pas ajouter les fichiers hérités non suivis du workspace.
