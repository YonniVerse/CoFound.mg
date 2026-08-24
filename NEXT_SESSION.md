# Context Handoff — Reprise de session CoFound.mg

**Dernière mise à jour** : 2026-08-24
**Phase** : Vague 4 — intégration Cloudinary B-12 des justificatifs B-01 prête pour revue et déploiement
**Branche** : `feat/B-12-cloudinary-documents`
**État du workspace** : modifications Cloudinary committées et branche poussée sur `origin`; PR #83 ouverte vers `dev`.

## 1. Point de reprise

Le backend Render est opérationnel sur `https://cofound-mg.onrender.com` et Neon répond correctement. Cloudinary était auparavant en attente ; cette session a ajouté le flux complet pour les justificatifs B-01, mais le code n’est pas encore fusionné dans `dev` ni déployé sur Render.

## 2. Travail livré

- `CloudinaryService` configure le SDK depuis les variables serveur, téléverse les fichiers par requête signée avec `type: authenticated`, limite les formats/taille, nettoie les assets en cas d’échec et génère des URLs de téléchargement expirantes.
- `POST /api/v1/organization-requests` accepte désormais JSON historique et multipart (`documents`, cinq fichiers maximum, 10 Mo par fichier). Les octets restent dans Cloudinary ; la base conserve les métadonnées et références Cloudinary.
- Le staff dispose de `GET /api/v1/staff/organization-requests/:id/documents/:index`, protégé par la permission staff existante, audité et limité à une URL temporaire de cinq minutes.
- Le formulaire public B-01 envoie maintenant les vrais fichiers. La console `/staff/organizations` propose leur ouverture temporaire.
- Variables documentées : `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_PRESET`, `CLOUDINARY_FOLDER`.
- La décision d’architecture est documentée dans `docs/stack-technique-et-justifications.md` : Cloudinary est une exception limitée à B-01 ; R2 reste la cible générale des autres fichiers.

## 3. Validation

Les contrôles passent : package shared build, typecheck/lint/build API, typecheck/lint/build frontend, `git diff --check` et **159/159 tests API**. La suite couvre l’upload public simulé et la génération d’URL staff simulée. Aucun upload réel n’a été exécuté depuis le sandbox, car le secret Cloudinary ne doit pas y être copié.

## 4. Git et déploiement

Commits de cette session : `4af1169` préparation dépendances/configuration, `e4f1507` upload B-01 Cloudinary, `fc7202f` consultation staff temporaire. PR : https://github.com/YonniVerse/CoFound.mg/pull/83.

L’utilisateur a indiqué avoir ajouté les variables Cloudinary dans Render. Leur présence et leurs valeurs ne sont pas vérifiées par l’agent. Render pointe encore sur `feat/B-09-team-contact`; la branche B-12 n’est donc pas encore en production.

## 5. Décisions et limites actives

Les secrets Cloudinary restent exclusivement dans Render, jamais dans Vercel, le frontend ou Git. Le preset recommandé est signé, avec dossier `cofound/organization-requests`; les assets sont `authenticated`, non publics. Le stockage général R2 et les autres flux de fichiers ne sont pas modifiés. La compatibilité avec les anciennes demandes contenant uniquement des métadonnées est conservée, mais ces anciennes pièces ne disposent pas d’une URL Cloudinary.

## 6. Prochaine action

Après revue, fusionner la PR #83 vers `dev`, basculer le service Render sur `dev`, conserver les commandes natives fonctionnelles (`pnpm install --frozen-lockfile`, build shared/API, migrations puis start), redéployer et tester une demande B-01 réelle avec un petit PDF ; vérifier ensuite l’asset `authenticated` dans Cloudinary et le bouton staff.
