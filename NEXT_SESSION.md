# Handoff CoFound.mg

**Dernière mise à jour** : 2026-08-22
**Vague** : Vague 5 — Sécurité et finition
**Ticket courant** : S-10 finalisé localement ; S-11 à démarrer
**Branche actuelle** : `feat/S-10-performance`
**État du workspace** : changements S-10 locaux, non commités au moment de cette mise à jour.

## État exact

S-09 est publié dans la [PR #76](https://github.com/YonniVerse/CoFound.mg/pull/76) depuis `feat/S-09-e2e-playwright`. Playwright détecte les trois scénarios critiques et Chromium est installé. L’exécution locale est correctement configurée, mais les scénarios restent ignorés faute de variables `E2E_*`, de comptes authentifiés et de jeton d’activation de recette. S-09 n’est donc pas encore validé sur recette réelle.

S-10 est implémenté sur `feat/S-10-performance` depuis `origin/dev`. Le bundle initial conserve le lazy loading des routes et le shell public (`LandingPage`, `ActivationPage`) est désormais chargé à la demande. Le graphique Recharts de la page Impact est isolé dans un sous-chunk lazy. Le regroupement global Recharts a été retiré de `manualChunks` afin de ne pas charger le module analytique hors de sa route.

Les images raster lourdes de la CTA et de l’authentification ont été converties en WebP, les références frontend ont été mises à jour, et les attributs `width`, `height`, `loading="lazy"` et `decoding="async"` ont été ajoutés. Les tailles observées sont passées de 206 621 à 145 142 octets pour la CTA et de 842 479 à 110 706 octets pour l’image d’authentification.

Le budget Vite S-10 est fixé à 400 kB brut par chunk, avec une cible gzip d’environ 110 kB pour le chunk analytique isolé. Le build final ne produit plus d’avertissement de chunk supérieur au budget.

## Fichiers modifiés pour S-10

- `apps/web/src/App.tsx` : lazy loading de `LandingPage` et `ActivationPage`.
- `apps/web/src/pages/ImpactPage.tsx` : chargement différé du graphique Recharts.
- `apps/web/src/components/landing/SectionCTA.tsx` : référence WebP et métadonnées image.
- `apps/web/src/pages/LoginPage.tsx` : référence WebP et métadonnées image.
- `apps/web/src/vite.config.ts` : budget de chunks à 400 kB et découpage révisé.
- `apps/web/package.json` : commande `assets:optimize`.
- `scripts/optimize-raster-assets.py` : génération reproductible des variantes WebP.
- `apps/web/src/assets/images/cta.webp` et `apps/web/public/images/auth-hero.webp` : assets optimisés.
- `apps/web/src/i18n.tsx` : ajout des cinq clés d’export manquantes en français et en malgache, correction nécessaire pour compiler `origin/dev`.

## Validation

- `pnpm --filter @cofound/shared build` : réussi.
- `pnpm --filter @cofound/web build` : réussi.
- `pnpm --filter @cofound/web lint` : réussi.
- Aucun avertissement Vite de chunk supérieur à 400 kB.
- Aucun secret, compte de recette ou mot de passe réel ajouté au dépôt.

## PR et dépendances

Les PR S-05 à S-08 restent à contrôler/fusionner selon l’état GitHub réel. S-09 est en PR #76. La Vague 4 reste ouverte avec les PR #73, #74 et #75.

S-11 dépend de F-13 et porte sur l’accessibilité ainsi que le responsive sur mobile réel. S-12 dépend de F-12 et porte sur l’absence de chaînes en dur. S-13 dépend de F-17 et porte sur le déploiement, la restauration et la gestion d’incident. S-14 porte sur les CGU et la politique de confidentialité avec engagement de portabilité.

## Prochaines étapes concrètes

1. Vérifier le diff, créer le commit conventionnel français de S-10 et pousser `feat/S-10-performance`.
2. Ouvrir la PR S-10 vers `dev` et contrôler les vérifications CI.
3. Créer `feat/S-11-accessibilite-responsive` depuis `origin/dev` à jour.
4. Auditer les écrans prioritaires au clavier, avec lecteurs d’écran et viewport mobile, puis ajouter les corrections et tests disponibles.
5. À chaque fin de session, maintenir ce fichier et `CHANGELOG.md` avec uniquement les changements réellement effectués.
