# Déploiement API et worker

Le ticket F-16 déploie deux processus identiques depuis une image immuable : l’API NestJS et le worker pg-boss. Ils partagent la même base PostgreSQL managée. Caddy termine TLS et ne publie que les routes `/api/*` vers l’API.

Le frontend reste déployé séparément sur son CDN statique. Le VPS ne contient ni les fichiers du frontend ni la base de données.

## Bootstrap du VPS

Le serveur doit disposer de Docker Engine, du plugin Compose v2 et d’un utilisateur de déploiement non root autorisé à exécuter Docker. Le dossier de déploiement peut ensuite être préparé ainsi :

```bash
mkdir -p /srv/cofound/deploy
cp deploy/compose.production.yml deploy/Caddyfile /srv/cofound/deploy/
cp deploy/.env.example /srv/cofound/deploy/.env
chmod 600 /srv/cofound/deploy/.env
```

Le fichier `/srv/cofound/deploy/.env` doit être rempli manuellement. Il ne doit jamais être commité. La première mise en route est effectuée par :

```bash
cd /srv/cofound
docker compose --env-file deploy/.env -f deploy/compose.production.yml up -d
```

La commande de l’API applique les migrations Prisma avant de démarrer NestJS. Le worker ne démarre qu’après le healthcheck de l’API.

## Secrets GitHub Actions

Les secrets suivants sont requis dans l’environnement GitHub `production` :

| Secret | Usage |
|---|---|
| `DEPLOY_HOST` | Nom DNS ou adresse du VPS |
| `DEPLOY_USER` | Utilisateur SSH de déploiement |
| `DEPLOY_PATH` | Chemin absolu du checkout, par exemple `/srv/cofound` |
| `DEPLOY_SSH_KEY` | Clé privée SSH dédiée au déploiement |
| `DEPLOY_KNOWN_HOSTS` | Ligne(s) `known_hosts` du VPS, générées hors CI et vérifiées humainement |
| `GHCR_USERNAME` | Compte technique autorisé à lire le paquet GHCR |
| `GHCR_READ_TOKEN` | Token GHCR en lecture seule, stocké uniquement dans GitHub et transmis par stdin à `docker login` |

Le workflow `deploy-api.yml` s’exécute sur un tag `v*` ou manuellement. Il publie l’image dans GHCR, copie uniquement les fichiers Compose/Caddy, met à jour `COFOUND_API_IMAGE`, tire l’image et recrée les services.

## Vérifications après déploiement

```bash
curl --fail https://api.example.mg/health
curl --fail https://api.example.mg/api/v1/health
ssh deploy@vps 'cd /srv/cofound && docker compose --env-file deploy/.env -f deploy/compose.production.yml ps'
```

Une restauration complète relève du ticket F-17. Les sauvegardes PostgreSQL ne sont donc pas effectuées par ce Compose.
