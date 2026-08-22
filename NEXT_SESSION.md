# Handoff CoFound.mg

**Dernière mise à jour** : 2026-08-22
**Vague** : Vague 5 — Sécurité et finition
**Ticket courant** : S-12 en cours
**Branche actuelle** : `feat/S-12-i18n`
**État du workspace** : modifications S-12 locales non commités au moment de cette mise à jour.

## État exact

S-09 est publié dans la [PR #76](https://github.com/YonniVerse/CoFound.mg/pull/76), mais la validation réelle sur recette reste conditionnée aux variables `E2E_*`, aux comptes authentifiés et au jeton d’activation.

S-10 et S-11 ont été fusionnés dans `dev` via les PR [#77](https://github.com/YonniVerse/CoFound.mg/pull/77) et [#78](https://github.com/YonniVerse/CoFound.mg/pull/78). Les validations locales correspondantes sont réussies.

S-12 progresse depuis `origin/dev`. Le dictionnaire FR/MG et les composants suivants utilisent maintenant i18n pour leurs textes visibles structurants : `FeedErrorWidget`, `ProfileCard`, `ProjectCard`, `TalentCard`, `ProjectsFeedPage`, `ImportMappingPage`, `ImportPreviewPage`, `SectionHero`, `SectionCTA` et `ApplyModal`. Sont couverts les actions de feed, erreurs, filtres, états vides, import, statuts de ligne, compteurs, CTA marketing et formulaire de candidature.

## Commits S-12 déjà poussés

- `e435abc refactor(vague5): centraliser les libelles i18n des feeds`
- `24b733d refactor(vague5): traduire la previsualisation d import`
- `2051f87 refactor(vague5): traduire les actions de la landing`
- `8a0bb30 refactor(vague5): traduire la carte talent`

## Fichiers modifiés depuis le dernier checkpoint

- `apps/web/src/i18n.tsx` : clés FR/MG des CTA et du formulaire de candidature.
- `apps/web/src/components/landing/SectionCTA.tsx` : textes CTA traduits.
- `apps/web/src/components/applications/ApplyModal.tsx` : titre, validations, labels et actions traduits.
- `NEXT_SESSION.md` et `CHANGELOG.md` : suivi actualisé.

## Validations récentes

- `git diff --check` : réussi.
- `pnpm --filter @cofound/shared build` : réussi.
- `pnpm --filter @cofound/web build` : réussi.
- `pnpm --filter @cofound/web lint` : réussi.
- Le chunk analytique reste lazy à 358,03 kB brut / 104,22 kB gzip.
- Aucun secret réel ajouté.

## Reste à faire pour S-12

Migrer les chaînes visibles restantes dans `Navbar`, `ActivationPage`, `DreamMatchPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `MyApplicationsPage`, `ProductHealthPage`, `ProjectPostsPage` et la notice d’information de `ImportMappingPage`. Ajouter ensuite un contrôle ciblé contre la réintroduction de textes visibles en dur, relancer les validations finales, créer le commit de clôture et ouvrir la PR S-12.

## Suite de la Vague 5

Après fusion de S-12, traiter S-13 — documentation d’exploitation — puis S-14 — CGU et politique de confidentialité avec engagement de portabilité. Les PR de Vague 4 #73, #74 et #75 restent ouvertes indépendamment.
