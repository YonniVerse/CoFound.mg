# Handoff CoFound.mg

**Dernière mise à jour** : 2026-08-22
**Vague** : Vague 5 — Sécurité et finition
**État** : Vague 5 fusionnée dans `dev` ; préparation staging en cours
**Branche actuelle** : `dev`

## État staging

Le workflow `.github/workflows/deploy-staging.yml` existe et se déclenche sur push vers `dev` ou manuellement via `workflow_dispatch`. Il publie les images API et backup dans GHCR avec un tag SHA et le tag `staging`, puis déploie via SSH les fichiers Compose/Caddy et recrée les services.

La commande `gh secret list --env staging` indique actuellement **aucun secret staging configuré**. Les valeurs n’ont pas été demandées ni affichées. Le déploiement réel ne doit donc pas être lancé avant la configuration humaine des secrets et du fichier `.env` sur le serveur staging.

## Travail réalisé

Création de `docs/staging-deployment-checklist.md` avec la liste des secrets attendus, la préparation du serveur, la séparation staging/production, les contrôles de santé, le seed `demo-`, la validation E2E S-09, les critères de sortie et le retour arrière. Aucun secret ou identifiant réel n’y figure.

## Pré-requis bloquants

Configurer dans l’environnement GitHub `staging` : `STAGING_DEPLOY_SSH_KEY`, `STAGING_KNOWN_HOSTS`, `STAGING_DEPLOY_HOST`, `STAGING_DEPLOY_USER`, `STAGING_DEPLOY_PATH`, `GHCR_USERNAME` et `GHCR_READ_TOKEN`. Préparer hors Git le fichier `${STAGING_DEPLOY_PATH}/deploy/.env` avec une base Neon de staging et un `RESTORE_DATABASE_URL` jetable distinct.

Fournir également, dans un environnement d’exécution séparé, les variables `E2E_*` et les comptes de démonstration nécessaires à S-09. Ne jamais les ajouter au dépôt.

## Validations

- `dev` est alignée sur `origin/dev`.
- Le build shared, le build web et le lint web de la Vague 5 sont verts.
- Les PR #79, #80 et #81 sont fusionnées.
- Aucune valeur de secret n’a été exposée.

## Prochaines étapes

1. Configurer les secrets GitHub de l’environnement `staging` et le `.env` du serveur hors dépôt.
2. Vérifier manuellement la cible SSH, la base staging, le SHA précédent et le jeu de données `demo-`.
3. Déclencher le workflow `Déploiement staging` avec confirmation humaine.
4. Contrôler les endpoints de santé, les services, les parcours Vague 5 et les trois scénarios E2E S-09.
5. Documenter le résultat dans l’audit global.
