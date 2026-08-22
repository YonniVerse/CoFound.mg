# Handoff CoFound.mg

**Dernière mise à jour** : 2026-08-22
**Vague** : Vague 5 — Sécurité et finition
**Ticket courant** : S-12 en cours
**Branche actuelle** : `feat/S-12-i18n`
**État du workspace** : modifications S-12 locales non commités au moment de cette mise à jour.

## État exact

S-09 est publié dans la [PR #76](https://github.com/YonniVerse/CoFound.mg/pull/76), mais la validation réelle sur recette reste conditionnée aux variables `E2E_*`, aux comptes authentifiés et au jeton d’activation.

S-10 a été fusionné dans `dev` via la [PR #77](https://github.com/YonniVerse/CoFound.mg/pull/77). S-11 a été fusionné via la [PR #78](https://github.com/YonniVerse/CoFound.mg/pull/78). Les validations locales correspondantes sont réussies.

S-12 progresse depuis `origin/dev`. Les clés FR/MG couvrent les actions de feed, les états d’erreur, les filtres projets et la chaîne d’import. `FeedErrorWidget`, `ProfileCard`, `ProjectCard`, `ProjectsFeedPage`, `ImportMappingPage` et `ImportPreviewPage` utilisent i18n pour leurs textes visibles structurants. `SectionHero` utilise maintenant i18n pour ses deux appels à l’action.

Les statuts de ligne de prévisualisation, les compteurs, les erreurs de chargement, les boutons de navigation et l’état vide sont traduits. Les commits de checkpoint déjà poussés sont `e435abc` et `24b733d` sur la branche S-12.

## Fichiers S-12 modifiés depuis le dernier checkpoint

- `apps/web/src/i18n.tsx` : clés FR/MG supplémentaires pour les statuts d’import et l’appel à l’action landing.
- `apps/web/src/pages/ImportPreviewPage.tsx` : statuts de ligne et erreur de chargement traduits.
- `apps/web/src/components/landing/SectionHero.tsx` : appels à l’action traduits.
- `NEXT_SESSION.md` et `CHANGELOG.md` : suivi actualisé.

## Validations récentes

- `git diff --check` : réussi.
- `pnpm --filter @cofound/shared build` : réussi.
- `pnpm --filter @cofound/web build` : réussi.
- `pnpm --filter @cofound/web lint` : réussi.
- Le chunk analytique reste lazy à 358,03 kB brut / 104,22 kB gzip.
- Aucun secret réel ajouté.

## Reste à faire pour S-12

Migrer les chaînes visibles restantes dans `TalentCard`, `SectionCTA`, `Navbar`, `ApplyModal`, `ActivationPage`, `DreamMatchPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `MyApplicationsPage` et `ProductHealthPage`. Traiter aussi la notice d’information de `ImportMappingPage`, puis ajouter un contrôle ciblé contre la réintroduction de textes visibles en dur. Relancer les validations finales, créer le commit de clôture et ouvrir la PR S-12.

## Suite de la Vague 5

Après fusion de S-12, traiter S-13 — documentation d’exploitation — puis S-14 — CGU et politique de confidentialité avec engagement de portabilité. Les PR de Vague 4 #73, #74 et #75 restent ouvertes indépendamment.
