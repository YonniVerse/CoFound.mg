# Handoff CoFound.mg

**Dernière mise à jour** : 2026-08-22
**Vague** : Vague 5 — Sécurité et finition
**État** : S-12, S-13 et S-14 fusionnés dans `dev`
**Branche actuelle** : `dev`
**Commit actuel** : `bf547d7` avant la mise à jour de ce handoff

## État final de la Vague 5

S-10 et S-11 avaient été fusionnés dans `dev` via les PR #77 et #78. La suite de la Vague 5 est maintenant fusionnée dans l’ordre prévu : S-12 via la PR #79, S-13 via la PR #80 et S-14 via la PR #81.

S-12 a centralisé les chaînes visibles principales en français et malgache dans les feeds, la landing, la navigation, l’import, les candidatures, l’authentification, Dream Match, la console santé et le feed projet. Les validations locales étaient vertes.

S-13 a ajouté `docs/runbook-exploitation.md`, qui documente le déploiement, les prérequis VPS, les sauvegardes hors machine, la restauration vers une base jetable, la classification P0–P3 et la réponse aux incidents. Aucun secret réel n’est documenté.

S-14 a ajouté `apps/web/src/pages/LegalPage.tsx`, les routes `/legal/terms` et `/legal/privacy`, les liens légaux dans le Footer et les labels FR/MG. Le contenu couvre les CGU, le pseudonymat, les consentements, les droits, l’export et l’engagement de portabilité. Il est explicitement soumis à une revue juridique humaine avant publication contractuelle.

## Validations finales

- `git diff --check` : réussi.
- `pnpm --filter @cofound/shared build` : réussi.
- `pnpm --filter @cofound/web build` : réussi.
- `pnpm --filter @cofound/web lint` : réussi sans erreur ni avertissement.
- `dev` est alignée sur `origin/dev` et le workspace est propre.
- Le chunk analytique reste lazy à environ 358 kB brut / 104 kB gzip.

## Points non clôturés

La validation E2E réelle de S-09 sur recette reste à exécuter avec les variables `E2E_*`, les comptes authentifiés et le jeton d’activation fournis par l’équipe. Les CGU et la politique de confidentialité doivent recevoir une validation juridique humaine avant utilisation contractuelle.

Les PR ouvertes de Vague 4 #73, #74 et #75 restent indépendantes de la clôture technique de la Vague 5.

## Prochaines étapes

1. Fournir les variables et comptes de recette, puis exécuter S-09 sur l’environnement réel.
2. Organiser la revue juridique de S-14 et remplacer les coordonnées génériques par les contacts officiels hors dépôt.
3. Mettre à jour `audit-vagues-2026-08-22.md` avec cette clôture technique et les réserves restantes.
