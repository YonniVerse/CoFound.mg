# Handoff CoFound.mg

**Dernière mise à jour** : 2026-08-22
**Vague** : Vague 5 — Sécurité et finition
**Ticket courant** : S-12 en cours
**Branche actuelle** : `feat/S-12-i18n`
**État du workspace** : modifications S-12 locales non commités au moment de cette mise à jour.

## État exact

S-09 est publié dans la [PR #76](https://github.com/YonniVerse/CoFound.mg/pull/76), mais la validation réelle sur recette reste conditionnée aux variables `E2E_*`, aux comptes authentifiés et au jeton d’activation.

S-10 a été fusionné dans `dev` via la [PR #77](https://github.com/YonniVerse/CoFound.mg/pull/77). S-11 a été fusionné via la [PR #78](https://github.com/YonniVerse/CoFound.mg/pull/78). Les validations locales correspondantes sont réussies.

S-12 progresse depuis `origin/dev`. Les clés FR/MG communes couvrent maintenant les actions de feed, les états d’erreur, les filtres projets et la chaîne d’import. `FeedErrorWidget`, `ProfileCard`, `ProjectCard`, `ProjectsFeedPage`, `ImportMappingPage` et `ImportPreviewPage` utilisent désormais i18n pour leurs textes visibles structurants. Les statuts de ligne de prévisualisation, l’état vide, le chargement, l’erreur de chargement, les compteurs et les boutons sont inclus.

## Fichiers S-12 modifiés

- `apps/web/src/i18n.tsx` : clés FR/MG feed, projets et import.
- `apps/web/src/components/feed/FeedErrorWidget.tsx` : messages et code d’erreur traduits.
- `apps/web/src/components/feed/ProfileCard.tsx` : actions et libellés traduits.
- `apps/web/src/components/feed/ProjectCard.tsx` : actions et libellé de recherche traduits.
- `apps/web/src/pages/ProjectsFeedPage.tsx` : en-tête, recherche, filtres et état vide traduits.
- `apps/web/src/pages/ImportMappingPage.tsx` : titre et option d’import traduits.
- `apps/web/src/pages/ImportPreviewPage.tsx` : interface, statuts, compteurs, erreurs et actions traduits.

## Validations récentes

- `git diff --check` : réussi.
- `pnpm --filter @cofound/shared build` : réussi.
- `pnpm --filter @cofound/web build` : réussi.
- `pnpm --filter @cofound/web lint` : réussi après suppression de `RESULT_LABELS` inutilisée et ajout de `t` aux dépendances du hook.
- Le chunk analytique reste lazy à 358,03 kB brut / 104,22 kB gzip.
- Aucun secret réel ajouté.

## Reste à faire pour S-12

Migrer les chaînes visibles restantes dans `TalentCard`, `SectionCTA`, `SectionHero`, `ActivationPage`, `DreamMatchPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `MyApplicationsPage` et `ProductHealthPage`. Traiter aussi les textes de `PreviewRow` déjà couverts et les chaînes de navigation nécessaires, puis ajouter un contrôle ciblé contre la réintroduction de textes visibles en dur. Relancer les validations finales, créer le commit de clôture et ouvrir la PR S-12.

## Suite de la Vague 5

Après fusion de S-12, traiter S-13 — documentation d’exploitation — puis S-14 — CGU et politique de confidentialité avec engagement de portabilité. Les PR de Vague 4 #73, #74 et #75 restent ouvertes indépendamment.
