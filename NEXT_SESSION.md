# Context Handoff — Reprise de session CoFound.mg

**Dernière mise à jour** : 2026-08-24
**Phase** : `main` livré ; correction session/feed déployée
**Branche locale** : `main`
**État Git** : `main` suit `origin/main` sur le merge de la PR #91 ; workspace à revérifier après la mise à jour de ce fichier.

## 1. État courant

`main` est la branche de livraison. La PR #86 a intégré dev, la Vague 4, Cloudinary B-12 et S-05 à S-09. La PR #89 a corrigé les déploiements Render/Vercel. La PR #91 a corrigé le faux compte affiché dans le layout et le feed qui ignorait les résultats API.

Render répond sur `https://cofound-mg.onrender.com/api/v1/health` avec HTTP 200 et `{"status":"ok","database":"ok"}`. Vercel Production suit `main`, Root Directory `apps/web`, et le dernier déploiement du merge #91 est `READY` (`dpl_5fzeyFYFqhqP8KkQejG1juV9FHAw`).

## 2. Travail livré cette session

- Audit des sources frontend : landing statique via `landing.json`, Impact via `mockImpact`, détail/candidature projet via `fetchMock`, suggestions via `mockFeed`, aperçu d’import avec `SAMPLE_PREVIEW` dans certains cas.
- Création de l’issue #90 pour raccorder les écrans encore mockés à l’API réelle.
- PR #91 fusionnée dans `main`.
- `DashboardLayout` ne montre plus `Mialy Randria / ISCAM` en dur ; il charge `/me/profile`, affiche l’identité réelle si elle existe et propose la déconnexion.
- Les pages utilisant `DashboardLayout` redirigent vers `/login` lorsqu’aucune session authentifiée n’existe.
- Le compteur fictif de messages `3` a été retiré.
- Le feed affiche les projets renvoyés par `/projects/feed` ; les fallbacks mockés du feed projets, talents et suggestions sont limités au développement local.

## 3. Validation

Validation locale réussie après la PR #91 : build `@cofound/shared`, typecheck frontend, lint frontend, build frontend et `git diff --check`.

Les contrôles GitHub de la PR #91 sont verts : CI workspace, Vercel et Vercel Preview Comments. Le domaine `https://co-found-mg.vercel.app/` répond HTTP 200. Le backend Render reste opérationnel.

## 4. Points ouverts

L’issue #90 reste ouverte. Les écrans suivants affichent encore des données statiques ou des fallback de démonstration : Impact, détail et candidature projet, suggestions, et aperçu d’import sans identifiant. La landing statique est du contenu éditorial et ne doit pas nécessairement être remplacée par Neon.

Le test fonctionnel réel B-01/Cloudinary reste à faire avec un compte demandeur, un compte staff et un petit PDF. Les secrets Cloudinary restent uniquement dans Render.

La persistance volontaire de session n’est pas activée au chargement : le frontend ne restaure plus automatiquement un refresh cookie, afin qu’une visite publique ne présente pas un compte déjà connecté. Une authentification doit être initiée explicitement depuis `/login`.

## 5. Fichiers importants

- `apps/web/src/components/layout/DashboardLayout.tsx` : identité réelle, guard local et déconnexion.
- `apps/web/src/hooks/useFeedData.ts` : projets API et fallback développement.
- `apps/web/src/hooks/useTalentFeedData.ts` : talents API et fallback développement.
- `apps/web/src/pages/FeedPage.tsx` : rendu des cartes projets API.
- `apps/web/src/hooks/useAuth.tsx` : état de session en mémoire.
- `apps/web/src/data/impactApi.ts`, `apps/web/src/data/projectApi.ts`, `apps/web/src/pages/ImportPreviewPage.tsx` : zones encore mockées suivies par #90.

## 6. Prochaine action

Traiter l’issue #90 en commençant par remplacer `getProjectById` et `submitProjectApplication` dans `apps/web/src/data/projectApi.ts` par les endpoints API réels, puis ajouter les tests et états empty/error correspondants avant de poursuivre Impact.
