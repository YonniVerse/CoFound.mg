> Fichier de reprise de contexte. Chargé automatiquement par `CLAUDE.md`.
> Mis à jour par la commande `/handoff` en fin de session.
>
> **Ne contient que l’état vivant.** L’historique va dans `CHANGELOG.md`, les décisions arrêtées
> dans `CLAUDE.md`, le détail dans `docs/`.

**Dernière mise à jour** : 2026-08-21
**Phase** : vague 0 (Fondations) — **F-01 à F-19 intégrés dans `dev`**
**Branche** : `dev`, alignée sur `origin/dev` (dernier commit `09f1155`)
**État du workspace** : propre

---

## 1. Où on en est

| Élément | État |
|---|---|
| Documentation produit, technique et business | ✅ Cadrage complet dans `docs/` |
| Monorepo pnpm | ✅ `apps/web`, `apps/api`, `packages/shared` |
| CI GitHub Actions | ✅ lint, typecheck, tests, build et budget bundle |
| Authentification et sessions | ✅ argon2id, JWT court, refresh cookie rotatif, réinitialisation |
| RBAC et confidentialité | ✅ Bearer global, permissions à refus par défaut, projections pseudonymes |
| Audit | ✅ écriture seule, interceptor et annotations des mutations sensibles |
| Contrats partagés et i18n | ✅ Zod partagé, codes d’erreur, fr/mg et catalogue lazy-loaded |
| Design system | ✅ tokens OKLCH, corrections C1 à C5, primitives partagées |
| Client HTTP web | ✅ `apps/web/src/lib/api-client.ts`, Bearer uniquement en mémoire |
| File de traitements | ✅ pg-boss sur PostgreSQL, worker séparé, service Compose dédié |
| Déploiement | ✅ image API/worker, Caddy, Compose production, workflow GHCR + SSH |
| Sauvegardes | ✅ dump PostgreSQL chiffré, R2, checksum, restauration vers base jetable |
| Observabilité | ✅ Sentry conditionnel, pino redacted, readiness PostgreSQL |
| Base de données Neon | ✅ Projet `CoFound.mg`, branche `main`, base `neondb`, migrations et seed appliqués |
| Tests négatifs RBAC et healthcheck | ✅ 12 tests API, tous passants |
| Budget JavaScript initial | ✅ 271 701 octets gzip, sous le cliquet de 290 221 |

Les pull requests finales sont fusionnées dans `dev` : [#20](https://github.com/YonniVerse/CoFound.mg/pull/20), [#21](https://github.com/YonniVerse/CoFound.mg/pull/21), [#22](https://github.com/YonniVerse/CoFound.mg/pull/22), [#23](https://github.com/YonniVerse/CoFound.mg/pull/23), [#24](https://github.com/YonniVerse/CoFound.mg/pull/24) et [#27](https://github.com/YonniVerse/CoFound.mg/pull/27).

---

## 2. Validation finale

Les commandes suivantes passent sur `dev` :

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check:bundle
```

La suite API compte actuellement **12 tests**. Les deux cas du readiness check couvrent PostgreSQL disponible et PostgreSQL indisponible avec réponse HTTP 503.

La base Neon `CoFound.mg` est créée dans le projet `autumn-scene-61665488`, sur la branche `main` (`br-snowy-credit-aragwop4`) et la base `neondb`. Les migrations `0001_initial` et `0002_auth_tokens` sont appliquées, les extensions `pg_trgm` et `unaccent` sont présentes, et le seed contient 8 filières, 6 régions, 8 secteurs et 10 compétences.

Le sandbox ne dispose pas de Docker. Le build Docker réel et le démarrage Compose de production restent donc à exécuter sur le VPS ou dans une machine équipée de Docker. La simulation `pnpm deploy --filter @cofound/api --prod --legacy` a confirmé que le runtime déployable contient Prisma et ses dépendances de production.

---

## 3. Prochaine action recommandée

La vague 0 est techniquement terminée. La prochaine séquence du plan est la **Vague 1 — chaîne d’entrée** : domaine et délivrabilité email (`E-01`), envoi transactionnel et gabarits (`E-02`), import CSV/XLSX et invitations (`E-03` à `E-09`), puis profil et onboarding (`E-12` à `E-15`).

Avant le premier déploiement de recette, effectuer les opérations d’exploitation suivantes :

| Action | Pourquoi | État |
|---|---|---|
| Renseigner les secrets de l’environnement GitHub `production` | Autoriser publication GHCR et déploiement SSH | ⬜ À faire |
| Créer `/srv/cofound/deploy/.env` sur le VPS | Fournir `DATABASE_URL`, `JWT_SECRET`, R2, backup et Sentry | ⬜ À faire |
| Renseigner `apps/api/.env` localement si nécessaire | Connecter un environnement local à Neon sans commiter le secret | ⬜ À faire |
| Vérifier le domaine Caddy et les enregistrements DNS | Obtenir le certificat TLS automatique | ⬜ À faire |
| Exécuter une sauvegarde puis `restore-test` | Vérifier la restauration avant la production | ⬜ À faire |
| Configurer SPF, DKIM et DMARC | Réduire le risque critique `R1` avant les invitations | ⬜ À faire |

---

## 4. Points de vigilance actifs

- **Le transport email de F-15 est volontairement provisoire** : la queue et le worker sont prêts, mais le fournisseur et les gabarits transactionnels relèvent de `E-02`. Les jobs de réinitialisation sont publiés sans jamais renvoyer le jeton brut par l’API.
- **La clé `BACKUP_ENCRYPTION_KEY` doit être distincte de `JWT_SECRET`**, conservée hors Git et récupérable lors d’une restauration. `RESTORE_DATABASE_URL` doit toujours pointer vers une base jetable.
- **Sentry est activé uniquement si `SENTRY_DSN` est défini**. Pino reste actif et redacted les cookies, Authorization, mots de passe et jetons.
- **Le healthcheck `/api/v1/health` dépend de PostgreSQL**. Une base indisponible doit empêcher le service API d’être considéré comme prêt.
- **Le budget actuel est un cliquet architectural**, pas encore l’objectif final de 200 Ko gzip. La baisse progressive reste à traiter dans `S-10`.
- **Ne jamais faire de `chmod -R` sur le dépôt.** Une copie antérieure depuis un support FAT/NTFS avait produit des modifications de mode sans changement de contenu.

---

## 5. Questions ouvertes

| # | Question | Bloque quoi | Pour qui |
|---|---|---|---|
| Q-1 | Montants des formules partenaires | Le business plan, pas le développement | CEO |
| Q-2 | `CoFound.mg` ou `CoFounder.mg` ? | Domaine, marque et supports | CEO |
| Q-3 | Statut juridique de l’entité | Contrats institutionnels | CEO |
| Q-4 | Établissement pilote et calendrier | Import réel et recette | CEO + Yonni |
| Q-5 | Fournisseur email transactionnel et configuration SPF/DKIM/DMARC | `E-01` et `E-02` | Yonni |

---

## 6. Répartition

| Membre | Domaine | Charge MVP |
|---|---|---|
| **Yonni** (CTO) | Socle transversal, infrastructure, auth/RBAC/privacy/audit, messagerie, notifications | 42 j |
| **Rino** | Import, invitations, profil et onboarding, Dream-Match, console établissement, modération | 38,5 j |
| **Norman** | Design system, feeds, recherche, espace projet, console partenaire | 50 j |

Total : **130,5 jours-homme**, soit environ 9 à 11 semaines à trois personnes à temps plein.

Backlog complet : [`docs/plan-de-developpement.md`](docs/plan-de-developpement.md).
