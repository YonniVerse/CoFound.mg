# Context Handoff — Reprise de session CoFound.mg

**Dernière mise à jour** : 2026-08-24
**Phase** : livraison sur `main` effectuée ; vérification Vercel bloquée par le Root Directory
**Branche locale** : `main`
**État Git** : main local suit `origin/main` sur le merge `36ad4cd` ; les modifications de code de migration sont committées.

## 1. État courant

La PR #86 a été fusionnée dans `main`. Elle regroupe le contenu de `dev`, la Vague 4 B-01 à B-11, Cloudinary B-12 et les tests E2E S-09, avec résolution des conflits RBAC/NestJS/client API. `main` est maintenant la branche de livraison du dépôt.

Le backend Render reste vivant sur `https://cofound-mg.onrender.com` avec Neon fonctionnel, mais le service Render doit encore être basculé manuellement de `feat/B-09-team-contact` vers `main`.

## 2. Travail livré

- Merge commit main : `36ad4cd` via [PR #86](https://github.com/YonniVerse/CoFound.mg/pull/86).
- `AccountStatus`, audit, santé produit, référentiels, exports de données et S-09 sont présents dans main.
- Vague 4 et Cloudinary sont présents dans main ; les secrets Cloudinary restent côté Render.
- Les règles RBAC B-02 et S-05 sont conservées ensemble.
- Les anciennes PR #73, #74, #75, #76, #82 et #83 ont été clôturées avec commentaires : leur contenu utile est déjà dans main via #86, et #82 était redondante/obsolète.
- Issues ouvertes : [#84](https://github.com/YonniVerse/CoFound.mg/issues/84) pour Vercel et [#85](https://github.com/YonniVerse/CoFound.mg/issues/85) pour le nettoyage de la PR #82.

## 3. Validation

La branche de migration a passé `pnpm --filter @cofound/shared build`, génération Prisma, typecheck/lint/test/build API, typecheck/lint/build frontend, `pnpm e2e:list` avec trois scénarios et `git diff --check`. Les tests E2E réels restent non exécutés faute de variables `E2E_*` et de comptes de recette.

Le contrôle CI GitHub de la PR #86 est passé. Le contrôle Vercel a échoué avant le build, indépendamment du code, avec `NOW_SANDBOX_WORKER_ROOTDIR_NOT_EXIST`.

## 4. Vercel

Projet : `co-found-mg`, domaine public `https://co-found-mg.vercel.app`, project ID `prj_Ye9PboxEgKsafHpmOVKAPCXNYRBc`. Le projet est lié à `YonniVerse/CoFound.mg` et la dernière livraison main `dpl_3iETEu4Vh5f3pAgsFvUA5zSLzJCE` est en erreur car le Root Directory est encore `frontend`, dossier inexistant. Le Root Directory correct est `apps/web`.

La variable frontend attendue reste `VITE_API_URL=https://cofound-mg.onrender.com/api/v1` en Production. Les variables Cloudinary ne doivent pas être ajoutées à Vercel.

## 5. Points ouverts et décisions

L’issue #84 est le blocage immédiat de la livraison frontend : corriger le Root Directory Vercel sur `apps/web`, puis redéployer main. Aucun outil Vercel disponible dans la session ne permet de modifier ce réglage de projet existant ; l’action doit être faite dans le dashboard.

Le Root Directory est un réglage Vercel, pas un fichier du dépôt. Le monorepo conserve `apps/web` comme application Vite et `apps/api` comme backend. Les branches historiques restent conservées à distance pour traçabilité ; elles ne sont plus des branches de livraison.

## 6. Prochaine action

Dans le dashboard Vercel du projet `co-found-mg`, régler **Root Directory** sur `apps/web`, vérifier `main` comme branche Production et `VITE_API_URL` en Production, puis relancer le déploiement main ; vérifier ensuite que le domaine public passe en état Ready.
