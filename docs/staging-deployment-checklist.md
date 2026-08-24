# Checklist de déploiement staging — Vague 5

**Objectif** : préparer le déploiement de la Vague 5 sur l’environnement `staging` avec des données de démonstration reconstructibles et sans exposer de données réelles.

> Cette checklist prépare le déploiement. Elle ne lance pas le workflow et ne contient aucune valeur de secret.

## 1. Version à déployer

La branche de référence est `dev`. Le workflow `.github/workflows/deploy-staging.yml` se déclenche automatiquement sur chaque push vers `dev` ou manuellement avec `workflow_dispatch`. Avant le lancement, vérifier que `dev` contient les fusions S-10 à S-14 et que le build local est vert.

Le workflow publie deux images GHCR avec les tags `staging-<SHA>` et `staging` : l’image API et l’image de sauvegarde. Il copie ensuite `deploy/compose.production.yml` et `deploy/Caddyfile` sur le serveur de staging, met à jour les références d’images et recrée les services.

## 2. Secrets GitHub Environment `staging`

Créer ou vérifier uniquement les secrets suivants dans **Settings → Environments → staging**. Leurs valeurs doivent être saisies directement dans GitHub ou dans le gestionnaire de secrets, jamais dans Git :

| Secret | Usage |
|---|---|
| `STAGING_DEPLOY_SSH_KEY` | Clé privée SSH dédiée au déploiement staging |
| `STAGING_KNOWN_HOSTS` | Empreinte vérifiée du serveur staging |
| `STAGING_DEPLOY_HOST` | Nom DNS ou adresse du serveur staging |
| `STAGING_DEPLOY_USER` | Utilisateur SSH non root de déploiement |
| `STAGING_DEPLOY_PATH` | Chemin absolu du checkout staging |
| `GHCR_USERNAME` | Compte autorisé à lire les images GHCR |
| `GHCR_READ_TOKEN` | Token GHCR en lecture seule |

Le workflow utilise également le `GITHUB_TOKEN` fourni automatiquement pour publier les images. Aucun secret de production ne doit être réutilisé pour staging.

## 3. Fichier `.env` du serveur staging

Préparer hors Git le fichier `${STAGING_DEPLOY_PATH}/deploy/.env` à partir de `deploy/.env.example`, avec `chmod 600`. Il doit pointer vers la base Neon de staging, jamais vers une base de production. Renseigner uniquement les valeurs de staging pour les variables nécessaires : `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, les paramètres mail, les paramètres R2 de staging et les variables d’observabilité.

Pour les tests de restauration, `RESTORE_DATABASE_URL` doit pointer vers une base jetable distincte de `DATABASE_URL`. Ne jamais utiliser la base de staging elle-même comme cible d’une restauration destructive.

## 4. Lancement contrôlé

Après validation des secrets et de la configuration serveur, lancer le workflow depuis GitHub Actions avec `workflow_dispatch`, ou pousser un commit approuvé vers `dev`. Vérifier que les deux jobs `Publier les images staging` et `Déployer staging` utilisent le même SHA.

Le lancement réel exige une confirmation humaine de l’équipe, car il se connecte en SSH au serveur et recrée les services Docker. Cette préparation n’effectue pas cette opération.

## 5. Contrôles post-déploiement

Exécuter les contrôles suivants avec l’URL réelle de staging, fournie hors dépôt :

```bash
curl --fail https://<staging-api>/health
curl --fail https://<staging-api>/api/v1/health
ssh <staging-user>@<staging-host> \
  'cd <staging-path> && docker compose --env-file deploy/.env -f deploy/compose.production.yml ps'
```

Vérifier ensuite une activation de démonstration, la complétion d’un profil, une candidature, l’import d’un lot de démonstration, la consommation du traitement asynchrone, l’affichage des pages légales `/legal/terms` et `/legal/privacy`, ainsi que l’accès staff selon les rôles prévus.

Les données doivent être générées par `pnpm --filter @cofound/api seed:demo` ou la commande documentée équivalente, avec les identifiants `demo-`. Ne jamais importer un fichier contenant des données personnelles réelles.

## 6. Validation E2E S-09

Pour exécuter les scénarios Playwright sur staging, fournir les variables `E2E_BASE_URL`, les identifiants de comptes de démonstration requis, et le jeton d’activation de démonstration. Les valeurs doivent être injectées dans l’environnement d’exécution local ou dans un secret GitHub dédié ; elles ne doivent pas être écrites dans le dépôt.

Lancer ensuite :

```bash
pnpm --filter @cofound/web e2e
```

Conserver dans le rapport uniquement les résultats, les identifiants pseudonymisés et les URLs non sensibles. Ne pas joindre de captures contenant des tokens, mots de passe ou données privées.

## 7. Critères de sortie staging

| Contrôle | Résultat attendu |
|---|---|
| API readiness | `/api/v1/health` renvoie `200` et la base est disponible |
| Worker | Le worker démarre après le healthcheck API et consomme les tâches de démonstration |
| Authentification | Login et activation de démonstration fonctionnent |
| Vague 5 | S-10 à S-14 sont accessibles sur la version déployée |
| Confidentialité | Aucun nom civil ou donnée réelle n’est exposé dans les feeds de démonstration |
| Sauvegarde | Le job staging est séparé de la production ; toute restauration vise une base jetable |
| E2E | Les trois parcours S-09 passent avec les comptes et le jeton de recette |
| Retour arrière | Le SHA précédent et l’image précédente sont identifiés avant lancement |

## 8. Retour arrière et incident

En cas de régression, conserver le SHA fautif, suspendre les nouveaux déploiements et revenir à l’image staging précédente approuvée. Ne pas supprimer la base ni exécuter de restauration sans validation explicite. Consulter [`runbook-exploitation.md`](runbook-exploitation.md) pour la classification et la réponse aux incidents.

## 9. Validation humaine requise

Avant le lancement réel, un responsable doit confirmer : l’empreinte SSH, la cible de base, la séparation staging/production, la présence des secrets, la sauvegarde du SHA précédent, la présence du jeu de données `demo-` et l’accord de l’équipe pour exécuter les tests E2E.
