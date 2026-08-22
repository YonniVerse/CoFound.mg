# Handoff CoFound.mg

**Dernière mise à jour** : 2026-08-22
**Vague** : Vague 4 — Le côté payant
**État** : audit réalisé, Vague 4 non fusionnée
**Branche actuelle** : `dev`

## Audit Vague 4

Le rapport complet est dans `audit-vague-4-2026-08-22.md`. Les trois PR ouvertes sont #73 pour B-01, #74 pour B-02 et #75 pour la synthèse B-02 à B-11. Aucune n’est fusionnée dans `dev`.

B-01 et B-02 ont été testés sur leurs branches respectives après reconstruction de `@cofound/shared` et `prisma generate` : B-01 passe 139/139 tests API et B-02 passe 145/145. La branche de synthèse B-02 à B-11 passe 157/157 tests API. Les typechecks, builds web et lint web passent sur les trois branches.

## Blocages réels

B-01 ne stocke actuellement que les métadonnées des justificatifs ; aucun adaptateur R2/S3 binaire n’est présent. La clôture documentaire complète est donc bloquée jusqu’à décision et implémentation du stockage.

Les migrations Neon de la Vague 4 doivent être appliquées et testées en staging avec une sauvegarde et une possibilité de retour arrière. Les écrans partenaires, les notifications de décisions, l’unicité du contact B-09, le pseudonymat RECRUIT de B-10 et l’absence de paiement réel pour B-11 doivent être démontrés sur staging.

La PR #74 est empilée sur #73. La PR #75 reprend une partie du périmètre B-02 tout en ciblant `dev` ; il faut éviter un doublon lors de la fusion.

## Validation et reproductibilité

Les premiers tests de branche échouaient avant `shared build` et `prisma generate`, avec exports shared absents et client Prisma obsolète. La procédure correcte est désormais documentée : reconstruire shared, générer Prisma, puis lancer tests/typecheck/build/lint. Les contrôles GitHub détaillés ne sont pas accessibles via l’intégration actuelle ; seuls les résultats locaux sont confirmés.

## Prochaines étapes

1. Revoir #73 et trancher le stockage des justificatifs.
2. Fusionner #73, rebaser #74 sur `dev`, puis retester et fusionner #74.
3. Rebaser #75 sur `dev`, vérifier les doublons B-02 et fusionner uniquement après validation.
4. Appliquer les migrations Neon sur staging, exécuter le seed `demo-` et réaliser la recette B-01 à B-11.
5. Ne déclarer la Vague 4 terminée qu’après validation documentaire, RBAC, pseudonymat, contact unique, notifications et port financier hors plateforme.
