# Reprise de session — CoFound.mg

**Dernière mise à jour** : 2026-08-27
**Phase** : correction de déploiement Prisma/Neon fusionnée dans `main`
**Ticket / vague** : correctif déploiement Render — migrations Prisma via connexion Neon directe
**Branche locale** : `main`
**État Git** : `main` est synchronisée avec `origin/main` sur `333c3fa` et le dépôt est propre.

## 1. État courant

Le déploiement Render du commit `b22ad57c1ba4bb492ac910ada5a1e7003f56c378` construit correctement l’API et utilise bien `DIRECT_URL` : le log montre une connexion directe Neon sans suffixe `-pooler`. Le démarrage échoue toutefois encore sur `P1002`, car Prisma ne peut pas obtenir l’advisory lock PostgreSQL `72707369` dans le délai de 10 secondes.

Le correctif a été implémenté dans la branche temporaire `fix/render-prisma-direct-url`, commité en `665f2f2`, fusionné dans `main` par `3334831`, puis poussé sur GitHub. La branche temporaire a été supprimée localement ; elle n’avait pas été poussée à distance.

Le correctif fait utiliser `DIRECT_URL` par Prisma Migrate lorsqu’elle est définie, tout en conservant `DATABASE_URL` comme fallback local. `DATABASE_URL` reste destinée à la connexion poolée de l’application ; `DIRECT_URL` est désormais configurée dans Render avec la connexion Neon directe, sans suffixe `-pooler`.

Le diagnostic Neon a identifié le PID `15843` (`application_name=pgbouncer`, état `idle`) comme détenteur du verrou. Après confirmation explicite, `pg_terminate_backend(15843)` a été exécuté ; une nouvelle vérification a retourné une liste vide pour le verrou `72707369`. Le verrou est donc libéré.

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

`DIRECT_URL` est maintenant reconnue par Render, comme le confirme le log du commit `b22ad57`. Ne pas remplacer `DATABASE_URL`, qui reste la connexion poolée utilisée par l’application.

Le verrou Neon ayant été libéré, relancer le déploiement de `main`. La commande de démarrage doit exécuter Prisma Migrate sur la connexion directe puis lancer `node dist/main.js`.

Si le déploiement échoue encore, récupérer le log complet suivant et vérifier qu’un nouveau PID ne reprend pas le verrou `72707369`. Ne pas désactiver l’advisory lock globalement sans nouvelle analyse de concurrence.

## 4. Validation et limites

Les contrôles locaux réussis après la modification sont `prisma validate` avec une URL factice, typecheck API, lint API et `git diff --check`. Le script confirme la résolution de `DIRECT_URL` avant l’appel Prisma, mais aucun accès réel à la base de production n’a été lancé depuis le dépôt.

La base Neon a été interrogée en lecture pour l’état des migrations et des verrous. L’historique `_prisma_migrations` montre 9 migrations terminées jusqu’à `20260822200000_add_organization_project_contacts`. La seule action d’écriture a été la terminaison autorisée de la session PostgreSQL `15843`; aucun `DROP`, `DELETE`, `TRUNCATE`, `UPDATE` métier ni reset de base n’a été effectué.

Le déploiement Render n’est pas encore confirmé comme réussi : `DIRECT_URL` est bien utilisée, mais le log fourni précède la libération du verrou et se termine sur un nouvel essai incomplet. Aucun test Playwright n’a été exécuté dans cette session.

## 5. Fichiers importants et décisions

- `apps/api/package.json` : `prisma:migrate:deploy` privilégie `DIRECT_URL` puis retombe sur `DATABASE_URL`.
- `render.yaml` : déclaration de `DIRECT_URL` et commande Docker alignée sur ce comportement.
- `apps/api/.env.example` : distinction entre URL poolée d’exécution et URL directe de migration.
- `/tmp/render-neon-diagnosis.md` : note locale contenant les faits du log et les références officielles consultées.
- `NEXT_SESSION.md` et `CHANGELOG.md` : documentation du diagnostic et du correctif.

Décision technique : ne pas désactiver globalement l’advisory lock Prisma. Utiliser une connexion directe Neon pour les migrations réduit le risque lié au pooler et respecte la séparation recommandée entre accès applicatif poolé et accès CLI de migration.

Décision de sécurité : ne jamais inscrire la valeur réelle de `DIRECT_URL` dans Git, dans `render.yaml` ou dans les logs. Elle doit être ajoutée comme secret dans Render.

## 6. Prochaine action

Relancer le service `cofound-api` depuis `main` maintenant que le verrou Neon est libéré, puis confirmer dans le log que `prisma migrate deploy` termine avant le lancement de l’API et que `/api/v1/health` répond correctement.
