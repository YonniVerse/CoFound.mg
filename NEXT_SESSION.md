# Context Handoff — Reprise de session CoFound.mg

**Dernière mise à jour** : 2026-08-24
**Phase** : correctif de session après expiration, PR à ouvrir
**Branche locale** : `fix/auth-session-refresh`
**État Git** : correctif fonctionnel committé dans `817f434`; handoff/changelog à committer, puis branche à pousser.

## 1. État courant

`main` est la branche de livraison et contient la synchronisation dev/main, l’auto-seed Render et le correctif de timeout P2028. L’utilisateur signale une déconnexion après quelques minutes : l’access token expire après 15 minutes, mais le frontend ne lançait aucun refresh automatique et le cookie backend était `SameSite=Lax`, incompatible avec les requêtes cross-site Vercel → Render en production.

## 2. Travail livré cette session

- Cookie de refresh en production : `SameSite=None; Secure`, avec suppression au logout utilisant les mêmes attributs.
- Refresh transparent du client HTTP après une réponse 401, avec relance de la requête originale après succès.
- Une seule requête de refresh est partagée entre les appels concurrents pour éviter la rotation simultanée d’un même refresh token.
- Restauration d’une session valide au chargement de l’application via le cookie httpOnly existant.
- Test backend du format du cookie de refresh.
- Commit fonctionnel : `817f434 fix(auth): maintenir la session après expiration`.

## 3. Validation

Réussis : build shared, typecheck API, build API, **181/181 tests API**, lint API, typecheck web, lint web, build web et `git diff --check`.

Le diagnostic est basé sur le cycle réel : access token 15 minutes en mémoire, refresh token 30 jours en cookie httpOnly rotatif, aucune relance 401 côté client avant ce correctif. Aucun secret ni jeton réel n’est présent dans le dépôt.

## 4. Points ouverts

Pousser la branche et ouvrir une PR vers `main`. Après fusion et redéploiement, tester une session au-delà de 15 minutes ou provoquer une réponse 401 contrôlée pour confirmer le refresh et vérifier dans le navigateur que le cookie de refresh est bien accepté avec `SameSite=None; Secure`.

Si le refresh token est absent, expiré ou réutilisé, la déconnexion reste volontaire et correcte. Le navigateur doit accepter les cookies tiers nécessaires au fonctionnement cross-site ; l’API autorise déjà l’origine Vercel exacte et `credentials: include` est conservé.

## 5. Fichiers importants

- `apps/api/src/auth/auth.controller.ts` : cookie cross-site et suppression cohérente.
- `apps/api/test/auth-cookie.test.ts` : tests du cookie de refresh.
- `apps/web/src/lib/api-client.ts` : retry 401 et refresh partagé.
- `apps/web/src/hooks/useAuth.tsx` : handler de refresh et restauration au montage.
- `.claude/commands/handoff.md` : workflow obligatoire.

## 6. Prochaine action

Pousser `fix/auth-session-refresh`, ouvrir la PR vers `main`, attendre les contrôles CI/Vercel, puis tester le maintien de session sur le domaine Vercel après redéploiement.
