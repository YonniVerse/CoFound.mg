# Notes de recette Playwright — rôle Talent

## 2026-08-24 — Vérification initiale

- Déploiement testé : `https://co-found-mg.vercel.app/`
- Page d’accueil : titre document `CoFound.mg — Trouve ton co-fondateur. Lance ta startup.`
- La landing se rend avec un `main`, un formulaire de langue, les liens `Explorer les profils` (`/feed`), `Impact 50/50` (`/impact`) et `Se connecter` (`/login`).
- Aucun écran blanc ni erreur de navigation n’a été observé lors de l’ouverture initiale.
- La campagne reste conditionnée par la disponibilité de comptes Talent et de mots de passe de recette ; le dépôt ne contient pas ces secrets.

## État backend et authentification

La landing effectue une vérification vers `https://cofound-mg.onrender.com/api/v1/me/status`, qui répond `401`, puis tente `/api/v1/auth/refresh`, également `401`, ce qui est cohérent avec une session anonyme. La page `/login` s’ouvre correctement sur le déploiement Vercel. Aucun identifiant E2E (`E2E_TALENT_*`) n’est injecté dans l’environnement local et aucun mot de passe de recette n’est présent dans les fichiers d’environnement inspectés.

## Page de connexion

La page expose les champs accessibles `Adresse email` et `Mot de passe`, le bouton `Se connecter`, le lien `Mot de passe oublié ?` et le message « Accès sur invitation ». Aucun compte de démonstration ni mot de passe public n’est affiché ; il n’est donc pas approprié de tenter des identifiants inventés.

## Smoke test des routes sans session

Le parcours Playwright a confirmé que `/feed`, `/projects/feed`, `/messages`, `/notifications`, `/projects/new`, `/staff/audit` et `/institution/imports` redirigent vers `/login`. Les routes publiques `/talents/feed` et `/opportunities` ne redirigent pas, mais leur `main` était vide après 700 ms ; `/profile/me` est restée sur sa route avec le texte de chargement « Chargement de ta progression… » malgré l’absence de session. La landing répond 304 et se rend correctement. Ces observations nécessitent un diagnostic réseau ciblé avant de conclure à un défaut.

## Diagnostic `/talents/feed`

La navigation vers `/talents/feed` renvoie HTTP 304, sans erreur console, mais l’accessibility snapshot est vide. Le symptôme est donc un rendu sans contenu accessible plutôt qu’une exception JavaScript visible ; il faut vérifier les requêtes et le bundle avant de corriger.

## Cause confirmée `/talents/feed`

Les requêtes réseau visibles ne montrent que `/me/status` et `/auth/refresh`, toutes deux en 401. L’avertissement console est explicite : `No routes matched location "/talents/feed"`. La route est donc absente du routeur frontend déployé, ce qui explique le snapshot vide malgré un chargement sans erreur JavaScript.

## Comparaison avec `/profiles`

Le routeur source déclare `/profiles` pour `TalentsFeedPage`, mais le déploiement redirige également `/profiles` vers `/login` sans session. Le plan de recette mentionne `/talents/feed`, chemin absent du routeur ; le chemin source `/profiles` n’est pas publiquement exploitable dans l’état déployé. Cette divergence de contrat doit être classée comme anomalie de routage ou de protection à confirmer avec le responsable produit.

## Authentification Talent

Le premier remplissage avec `getByLabel('Mot de passe')` était ambigu, car le label correspond aussi au bouton `Afficher le mot de passe`. Le sélecteur Playwright a été resserré vers `getByRole('textbox', { name: 'Mot de passe' })`, puis les deux champs ont été remplis correctement. Les identifiants restent uniquement dans le fichier temporaire `/tmp/talent-login.json`, hors dépôt.

## Connexion réussie et TAL-001/TAL-004 préliminaire

Le compte fourni s’authentifie correctement et redirige vers `/feed`. L’interface affiche l’adresse pseudonymisée partielle « Jeune Talen » ainsi que `talent@votre-domaine.mg`, et signale un profil complété à 0 % avec un lien vers `/onboarding`. Le feed affiche les filtres `Tous`, `Projets`, `Co-fondateurs` et la recherche, mais présente `FEED_FETCH_FAILED` avec le texte « Impossible de charger les profils de talents » et « Le flux des projets est temporairement indisponible. » Ce défaut doit être corrélé avec la réponse API exacte.

## Diagnostic API du feed authentifié

Les appels du feed Talent donnent les résultats suivants : `/api/v1/me/profile/completion-reminder` répond 200 et `/api/v1/me/profile` répond 200 ; en revanche `/api/v1/me/status` répond 403 avec `FORBIDDEN / rbac.errors.permissionRequired`. Les routes consommées par le frontend `/api/v1/projects/feed?status=RECRUITING&limit=10` et `/api/v1/talents/feed?limit=12` répondent 404. Les corps de réponse sont respectivement `Projet introuvable.` et `{code: NOT_FOUND, messageKey: talent.errors.notFound}`. Le feed ne peut donc pas fonctionner sur le déploiement actuel, indépendamment du compte Talent.

## Matrice de routes Talent authentifiée

Avec la session issue du login, `/onboarding` et `/profile/me` restent sur leur route mais affichent seulement « Chargement de ta progression… » après une navigation complète. `/search` se rend avec ses filtres. `/settings` reste accessible mais affiche l’alerte « Impossible de charger ou d’enregistrer tes préférences. » Les routes `/dream-match`, `/projects`, `/projects/new`, `/my-applications`, `/messages`, `/notifications`, `/institution` et `/staff/audit` redirigent vers `/login` lors de navigations complètes successives. Cette perte de session entre rechargements doit être testée séparément, car le token d’accès est conservé en mémoire et dépend du refresh cookie.

## Reconnexion

Après la matrice de navigation complète, la session a dû être réauthentifiée. Le login Talent a de nouveau réussi et a redirigé vers `/feed`. Les tests suivants utiliseront autant que possible des clics et navigations SPA pour éviter de confondre une perte de session au rechargement avec un défaut métier.

## Résultats de la navigation SPA

Avec le token en mémoire juste après login, `/search`, `/dream-match`, `/projects`, `/projects/new`, `/my-applications`, `/messages`, `/notifications` et `/settings` ont rendu leur structure. Le feed `/feed` échoue toutefois sur les deux feeds API en 404. `/dream-match` reste sur « Chargement… », `/projects` affiche ses titres sans contenu, `/my-applications` affiche `TOTAL : 0`, et `/settings` rend ses titres sans alerte dans ce mode SPA.

Les routes `/institution` et `/staff/audit` ont aussi rendu leur écran avec un compte Talent, alors que leurs données sont refusées côté API ; aucune mutation n’a été tentée. Dans les navigations complètes, plusieurs routes perdaient la session et redirigeaient vers `/login`. Le journal réseau montre des `401` puis des refresh, parfois `NS_BINDING_ABORTED`, ce qui indique un problème de restauration/coordination du token en plus des 404 de contrat API et du 403 de `/me/status`.

## Session fraîche pour tests détaillés

Une nouvelle navigation vers `/login` et le remplissage des champs Talent ont été effectués afin de tester les écrans avec une session nouvellement créée. La soumission du formulaire reste à faire avant les tests détaillés.

## Résolution de la reconnexion

Le clic de soumission n’a pas affiché immédiatement la redirection dans son retour, mais le snapshot suivant montre finalement `/feed` avec le layout authentifié. Le profil secondaire affichait temporairement « Compte CoFound / Profil personnel », signe que les données de profil n’étaient pas encore chargées au moment de la capture.

## Profil après stabilisation

Après trois secondes, le feed confirme le compte `talent@votre-domaine.mg`, le nom affiché « Jeune Talen », et un rappel d’onboarding à 0 % avec le lien `Continuer` vers `/onboarding`. Le défaut feed reste visible avec `FEED_FETCH_FAILED`.

## TAL-002 — Onboarding

Le clic sur `Continuer` ouvre bien `/onboarding`, mais après attente le contenu accessible reste limité à « Chargement de ta progression… ». Aucun champ ni bouton de progression n’est rendu. Le diagnostic doit vérifier la requête `/me/onboarding` et sa réponse.

## Diagnostic onboarding et statut

La page d’onboarding déclenche `/api/v1/me/onboarding`, mais le retour MCP ne fournit pas de corps de réponse exploitable ; simultanément `/api/v1/me/status` répond 403 pour le compte Talent. L’écran reste donc bloqué en chargement, et le défaut `/me/status` est confirmé comme un blocage transversal qui doit être corrigé côté API avant de conclure sur l’onboarding.

## TAL-006 — Projet vide

Le formulaire `/projects/new` est rendu avec les champs `Titre du projet` et `Pitch` ainsi que le bouton `Créer le projet`. La soumission vide ne provoque pas de navigation ni de création visible, ce qui indique que la contrainte HTML `required` bloque l’envoi ; une capture ciblée des messages de validation sera faite avant le cas positif.

## TAL-006 — Création positive

Les champs fictifs ont été remplis correctement. Le clic sur `Créer le projet` n’a pas changé l’URL ni affiché de redirection ; il faut lire le réseau et le snapshot pour déterminer s’il s’agit d’un refus backend, d’une validation silencieuse ou d’un bouton non soumis.

## TAL-006 — Création de projet réussie mais incohérente

Le POST `/api/v1/projects` répond 201 et redirige vers `/projects/cmt7axgbf0018fj36prmixhhh`. Le détail rendu est un projet existant intitulé « EcoDrive - Mobilité verte universitaire », avec statut/sections et postes ouverts, alors que les valeurs saisies étaient « Projet recette Talent 2026-08-24 » et un pitch fictif. Il faut comparer le corps de requête et la réponse HTTP avant de conclure à une anomalie d’affichage, de cache ou de déploiement.

## Confirmation HTTP de création

Le corps du POST contenait bien le titre et le pitch fictifs. La réponse 201 renvoie le même titre et pitch, le statut `DRAFT`, un identifiant de projet et un membre `OWNER`. L’écran de détail affiche donc une donnée incohérente avec la réponse fraîche de création, probablement parce que le détail `/projects/:id` est servi depuis une autre source, un cache ou une version backend/frontend désynchronisée. Le projet de recette créé est `cmt7axgbf0018fj36prmixhhh`.

## Comparaison preview Vercel

Le preview stable de `fix/bugs-main-audit` est protégé par l’authentification Vercel et redirige vers `vercel.com/login` en accès direct. Un lien temporaire de partage a permis d’ouvrir le preview ; cette protection de déploiement doit être prise en compte dans toute future recette externe. Le preview contient des commits de correctifs Talent récents, alors que la production testée correspond au commit `a550f9a` de `main`.

## Preview après partage

La navigation vers `/login` du preview est maintenant possible sans retour vers Vercel, ce qui confirme que le lien temporaire a établi le cookie d’accès au déploiement. La session API Talent devra être réauthentifiée sur ce domaine pour comparer le comportement de la branche `fix/bugs-main-audit`.

## Authentification sur preview

Le preview protégé s’ouvre via le lien temporaire, mais la soumission du même compte Talent reste sur `/login` et génère des erreurs console supplémentaires. Cette comparaison ne peut pas être conclue sans examiner les requêtes et l’origine exacte des erreurs ; la recette principale reste donc le domaine de production déjà authentifié.

## Blocage CORS du preview

Les requêtes du preview vers Render échouent avec `NS_ERROR_DOM_BAD_URI`. La console précise que `Access-Control-Allow-Origin` renvoie `https://co-found-mg.vercel.app`, qui ne correspond pas à l’origine du preview `https://co-found-mg-git-fix-bugs-main-audit-yonni-coders-projects.vercel.app`. Le preview ne peut donc pas être utilisé pour une recette authentifiée tant que son origine n’est pas autorisée côté API ; ce n’est pas une anomalie du compte Talent.
