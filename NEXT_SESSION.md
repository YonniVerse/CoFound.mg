# Reprise de session — CoFound.mg

**Dernière mise à jour** : 2026-08-27
**Phase** : correction de déploiement Prisma/Neon fusionnée dans `main`
**Ticket / vague** : correctif déploiement Render — migrations Prisma via connexion Neon directe
**Branche locale** : `main`
**État Git** : `main` est synchronisée avec `origin/main` sur `3334831` et le dépôt est propre.

## 1. État courant

Le déploiement Render du commit `fb041342f8b51790e5b44f44abc8410eae6cb4a1` construisait correctement l’API, mais échouait au démarrage sur `prisma migrate deploy` avec `P1002`. Prisma ne pouvait pas obtenir l’advisory lock PostgreSQL `72707369` dans le délai de 10 secondes.

Le correctif a été implémenté dans la branche temporaire `fix/render-prisma-direct-url`, commité en `665f2f2`, fusionné dans `main` par `3334831`, puis poussé sur GitHub. La branche temporaire a été supprimée localement ; elle n’avait pas été poussée à distance.

Le correctif fait utiliser `DIRECT_URL` par Prisma Migrate lorsqu’elle est définie, tout en conservant `DATABASE_URL` comme fallback local. `DATABASE_URL` reste destinée à la connexion poolée de l’application ; `DIRECT_URL` doit être la connexion Neon directe, sans suffixe `-pooler`.

## 2. Travail réellement effectué

- Analyse du log Render : installation, build shared, génération Prisma et build API réussissaient ; seul le démarrage bloquait pendant la migration.
- Identification du projet Neon `CoFound.mg` (`autumn-scene-61665488`) et de sa branche principale (`br-snowy-credit-aragwop4`).
- Vérification en lecture seule de l’état Neon et de `_prisma_migrations` : les 9 migrations existantes sont terminées et aucune migration partiellement appliquée n’a été identifiée.
- Ajout du support `DIRECT_URL` dans `apps/api/package.json` pour la commande `prisma:migrate:deploy`.
- Ajout de `DIRECT_URL` comme variable secrète déclarative dans `render.yaml` et alignement de la commande Docker Render.
- Documentation de `DIRECT_URL` dans `apps/api/.env.example`.
- Commit `665f2f2`, fusion dans `main` par `3334831`, push GitHub et suppression de la branche corrective.
- Mise à jour du handoff et du changelog après la correction.

## 3. Action restante côté Render

Le dépôt ne peut pas fournir le secret Neon. Dans le groupe d’environnement Render `cofound-api-runtime`, ajouter `DIRECT_URL` avec la chaîne de connexion **Direct connection** fournie par Neon, sans `-pooler`, avec `sslmode=require`. Ne pas remplacer `DATABASE_URL`, qui reste la connexion poolée utilisée par l’application.

Une fois `DIRECT_URL` enregistrée, relancer le déploiement de `main` (`3334831`). La commande de démarrage exécutera alors Prisma Migrate sur la connexion directe avant de lancer `node dist/main.js`.

Si le déploiement échoue encore après configuration de `DIRECT_URL`, récupérer le nouveau log complet. Le log fourni s’arrêtait au début d’une nouvelle tentative à `2026-08-27T08:39:36Z`, sans résultat de cette tentative.

## 4. Validation et limites

Les contrôles locaux réussis après la modification sont `prisma validate` avec une URL factice, typecheck API, lint API et `git diff --check`. Le script confirme la résolution de `DIRECT_URL` avant l’appel Prisma, mais aucun accès réel à la base de production n’a été lancé depuis le dépôt.

La base Neon a été interrogée uniquement en lecture. L’historique `_prisma_migrations` montre 9 migrations terminées jusqu’à `20260822200000_add_organization_project_contacts`. Aucun `DROP`, `DELETE`, `TRUNCATE`, `UPDATE` métier ni reset de base n’a été effectué.

Le déploiement Render n’est pas confirmé comme réussi après ce correctif, car la variable secrète `DIRECT_URL` doit être ajoutée dans Render et le service doit être relancé. Aucun test Playwright n’a été exécuté dans cette session.

## 5. Fichiers importants et décisions

- `apps/api/package.json` : `prisma:migrate:deploy` privilégie `DIRECT_URL` puis retombe sur `DATABASE_URL`.
- `render.yaml` : déclaration de `DIRECT_URL` et commande Docker alignée sur ce comportement.
- `apps/api/.env.example` : distinction entre URL poolée d’exécution et URL directe de migration.
- `/tmp/render-neon-diagnosis.md` : note locale contenant les faits du log et les références officielles consultées.
- `NEXT_SESSION.md` et `CHANGELOG.md` : documentation du diagnostic et du correctif.

Décision technique : ne pas désactiver globalement l’advisory lock Prisma. Utiliser une connexion directe Neon pour les migrations réduit le risque lié au pooler et respecte la séparation recommandée entre accès applicatif poolé et accès CLI de migration.

Décision de sécurité : ne jamais inscrire la valeur réelle de `DIRECT_URL` dans Git, dans `render.yaml` ou dans les logs. Elle doit être ajoutée comme secret dans Render.

## 6. Prochaine action

Configurer `DIRECT_URL` dans Render avec l’URL Neon directe, relancer le service `cofound-api` depuis `main`, puis confirmer dans le log que `prisma migrate deploy` termine avant le lancement de l’API et que `/api/v1/health` répond correctement.
