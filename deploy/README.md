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

Le fichier `.env` du VPS contient aussi `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` et `BACKUP_ENCRYPTION_KEY`. La clé de chiffrement doit être distincte de `JWT_SECRET`, conservée hors Git et sauvegardée dans un gestionnaire de secrets. `RESTORE_DATABASE_URL` doit toujours pointer vers une base jetable distincte de `DATABASE_URL`.

Le workflow `deploy-api.yml` s’exécute sur un tag `v*` ou manuellement. Il publie l’image dans GHCR, copie uniquement les fichiers Compose/Caddy, met à jour `COFOUND_API_IMAGE`, tire l’image et recrée les services.

## Vérifications après déploiement

```bash
curl --fail https://api.example.mg/health
curl --fail https://api.example.mg/api/v1/health
ssh deploy@vps 'cd /srv/cofound && docker compose --env-file deploy/.env -f deploy/compose.production.yml ps'
```

## Sauvegardes et restauration

Le profil `backup` n’est pas démarré par défaut. Une sauvegarde quotidienne peut être installée avec le modèle [`backup/cron.example`](./backup/cron.example) : elle produit un dump custom PostgreSQL, le chiffre avant transfert et conserve un objet horodaté ainsi qu’un pointeur `latest`. Le checksum est stocké à côté de chaque objet.

La restauration de contrôle s’exécute vers `RESTORE_DATABASE_URL`, jamais vers `DATABASE_URL` :

```bash
docker compose --env-file deploy/.env -f deploy/compose.production.yml \
  --profile restore-test run --rm restore-test
```

Cette commande vérifie le checksum, déchiffre le dump et exécute `pg_restore --single-transaction`. Elle doit être exécutée au moins une fois avant la production et ensuite périodiquement.

## Observabilité

L’API écrit des logs JSON via pino sur stdout. Les cookies, en-têtes Authorization, mots de passe et jetons sont redacted à la source. Le niveau est réglable par `LOG_LEVEL`.

Sentry est initialisé avant NestJS quand `SENTRY_DSN` est défini. Le filtre global Sentry capture les exceptions non gérées et n’envoie pas les données personnelles par défaut. `SENTRY_TRACES_SAMPLE_RATE` doit rester proportionné au trafic et au budget du projet.

La sonde `GET /api/v1/health` est anonyme et teste PostgreSQL. Elle renvoie `200` avec `{"status":"ok","database":"ok"}` lorsque la base répond, et `503` avec `{"status":"degraded","database":"unavailable"}` sinon. Le healthcheck Compose dépend de cette readiness.

## Déploiement Render

Le dépôt fournit également [`../render.yaml`](../render.yaml) pour déclarer l’API Web et le worker de notifications. Si le service Render est configuré avec le runtime Node natif, ne pas utiliser `corepack enable` dans le Build Command : certaines images Node de Render peuvent échouer sur la vérification de signature Corepack (`Cannot find matching keyid`). Installer la version du package manager explicitement :

```bash
npm install --global pnpm@11.9.0 && pnpm install --frozen-lockfile && pnpm --filter @cofound/shared build && pnpm --filter @cofound/api prisma:generate && pnpm --filter @cofound/api build
```

La commande de démarrage de l’API native est :

```bash
pnpm --filter @cofound/api prisma:migrate:deploy && pnpm --filter @cofound/api start
```

Configurer le health check sur `/api/v1/health`, fournir `DATABASE_URL` avec la chaîne Neon complète, et définir `CORS_ORIGIN` sur l’origine Vercel exacte. Le fichier `deploy/api.Dockerfile` installe également pnpm explicitement afin d’éviter la même dépendance à Corepack dans le build Docker.
