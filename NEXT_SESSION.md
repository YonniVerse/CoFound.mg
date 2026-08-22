# Handoff CoFound.mg

**Dernière mise à jour** : 2026-08-22
**Vague** : Vague 4 — Le côté payant
**État** : audit global terminé ; PR #73, #74, #75 et #76 restent ouvertes
**Branche actuelle** : `dev`

## Audit global réalisé

Le rapport `audit-global-2026-08-22.md` couvre les 6 vagues et les 92 tickets du backlog. Il distingue les tickets fusionnés, regroupés, présents seulement dans une PR ouverte et les validations qui restent à faire sur staging. L’état GitHub actuel comporte quatre PR ouvertes : #73, #74, #75 pour la Vague 4 et #76 pour S-09. Les PR #77 à #81 de S-10 à S-14 sont fusionnées.

La validation globale de `dev` a réussi pour shared build, Prisma generate, typecheck, lint, tests, builds et budget bundle. Cette validation ne remplace pas la recette staging ; le détail du nombre de tests API (149/149) provient de l’audit précédent et les commandes globales du nouveau passage se sont terminées sans erreur.

## Travail effectué sans intervention externe

Les PR #73 (B-01), #74 (B-02) et #75 (synthèse B-02 à B-11) ont été auditées. Les branches ont été testées après la séquence correcte du monorepo : `@cofound/shared build`, `prisma generate`, tests API et typecheck, puis build/lint web.

Résultats : B-01 passe 139/139 tests API, B-02 passe 145/145, et la synthèse B-02 à B-11 passe 157/157. Les typechecks, builds frontend et lint frontend passent sur les trois branches. Le workflow CI officiel contient déjà `prisma generate` et `shared build` avant lint, typecheck, tests, build et budget ; aucune correction CI supplémentaire n’a été nécessaire.

Le rapport complet est `audit-vague-4-2026-08-22.md`. Il documente le stockage binaire absent pour les justificatifs, les migrations Neon non appliquées, le risque de doublon B-02 entre #74 et #75, les validations staging encore manquantes, les notifications, l’unicité du contact B-09, le pseudonymat RECRUIT et l’absence de paiement réel.

## Pourquoi les PR n’ont pas été fusionnées

B-01 est fonctionnel côté demande et métadonnées, mais le stockage binaire des justificatifs n’est pas implémenté. Fusionner en annonçant le parcours documentaire complet serait inexact. B-02 est empilée sur B-01 et doit être rebasée après sa décision. La PR #75 reprend une partie du périmètre B-02 et doit être comparée après #74 pour éviter un doublon ou une fusion incohérente.

Les migrations et les données de staging ne peuvent pas être appliquées sans accès Neon/staging et secrets de déploiement. Aucun secret n’a été demandé, exposé ou ajouté au dépôt.

## Prochaines étapes nécessitant une intervention ou un accès

1. Décider si B-01 peut être fusionné avec stockage de métadonnées uniquement, ou implémenter l’adaptateur R2/S3 avant fusion.
2. Rebaser/fusionner #73 puis #74, dédoublonner et rebaser #75, puis revalider la Vague 4.
3. Configurer les secrets et la cible staging, puis appliquer les migrations avec sauvegarde et retour arrière.
4. Exécuter le seed `demo-` dans Neon staging et tester B-01 à B-11 avec comptes pseudonymisés.
5. Rebaser #76 et exécuter S-09 avec staging, comptes pseudonymisés et variables `E2E_*`.
6. Ne déclarer les Vagues 4 et 5 terminées qu’après validation des justificatifs, notifications, interfaces partenaires, RBAC, pseudonymat, E2E et absence de paiement réel.
