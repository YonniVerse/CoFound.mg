# Handoff CoFound.mg

**Dernière mise à jour** : 2026-08-22
**Vague** : Vague 5 — Sécurité et finition
**Ticket courant** : S-12 en cours
**Branche actuelle** : `feat/S-12-i18n`
**État du workspace** : modifications S-12 locales non commités au moment de cette mise à jour.

## État exact

S-09 est publié dans la [PR #76](https://github.com/YonniVerse/CoFound.mg/pull/76), mais la validation réelle sur recette reste conditionnée aux variables `E2E_*`, aux comptes authentifiés et au jeton d’activation.

S-10 a été fusionné dans `dev` via la [PR #77](https://github.com/YonniVerse/CoFound.mg/pull/77). S-11 a été fusionné via la [PR #78](https://github.com/YonniVerse/CoFound.mg/pull/78). Les validations locales correspondantes sont réussies.

S-12 est en cours depuis `origin/dev`. L’audit initial a trouvé des chaînes visibles en dur dans les feeds, les cartes, l’import, les pages métier et les composants marketing. Les clés communes FR/MG ont été ajoutées pour les actions de feed, les états d’erreur, les filtres de projets et les écrans d’import.

Les composants `FeedErrorWidget`, `ProfileCard` et `ProjectCard` utilisent maintenant `useI18n`. `ProjectsFeedPage` utilise également i18n pour son en-tête, la recherche, les filtres et l’état vide. `ImportMappingPage` utilise les clés i18n pour le titre de correspondance et l’action d’ignorance de colonne.

## Fichiers S-12 modifiés

- `apps/web/src/i18n.tsx` : nouvelles clés FR/MG feed, projets, erreurs et import.
- `apps/web/src/components/feed/FeedErrorWidget.tsx` : messages et code d’erreur traduits.
- `apps/web/src/components/feed/ProfileCard.tsx` : actions, statut et libellés traduits.
- `apps/web/src/components/feed/ProjectCard.tsx` : actions et libellé de recherche traduits.
- `apps/web/src/pages/ProjectsFeedPage.tsx` : textes structurants et filtres traduits.
- `apps/web/src/pages/ImportMappingPage.tsx` : titre et option d’import traduits.

## Validation

- `git diff --check` : réussi.
- `pnpm --filter @cofound/shared build` : réussi.
- `pnpm --filter @cofound/web build` : réussi.
- `pnpm --filter @cofound/web lint` : réussi.
- Le chunk analytique reste lazy à 358,03 kB brut / 104,22 kB gzip.
- Aucun secret réel ajouté.

## Reste à faire pour S-12

Migrer les chaînes visibles restantes dans `ImportPreviewPage`, `ApplyModal`, `TalentCard`, `SectionCTA`, `SectionHero`, `ActivationPage`, `DreamMatchPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `MyApplicationsPage` et `ProductHealthPage`. Ajouter ensuite un contrôle ciblé contre la réintroduction de textes visibles en dur, lancer les validations finales, créer le commit et ouvrir la PR S-12.

## Suite de la Vague 5

Après fusion de S-12, traiter S-13 — documentation d’exploitation — puis S-14 — CGU et politique de confidentialité avec engagement de portabilité. Les PR de Vague 4 #73, #74 et #75 restent ouvertes indépendamment.
