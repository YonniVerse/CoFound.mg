# État courant — CoFound.mg

> Fichier de reprise de contexte. Chargé automatiquement par `CLAUDE.md`.
> Mis à jour par la commande `/handoff` en fin de session.
>
> **Ne contient que l'état vivant.** L'historique va dans `CHANGELOG.md`, les décisions
> arrêtées dans `CLAUDE.md`, le détail dans `docs/`.

**Dernière mise à jour** : 2026-08-20
**Phase** : vague 0 (Fondations) — `F-01` terminé, `F-02` à `F-19` restants
**Branche** : `dev`, alignée sur `origin/dev` (dernier commit `30a05a7`)

---

## 1. Où on en est

| Élément | État |
|---|---|
| Documentation produit, technique, business | ✅ 9 documents dans `docs/` |
| Dépôt rapatrié dans `~/Lab/CoFound.mg` | ✅ historique et remote intacts |
| Monorepo pnpm — `apps/web`, `packages/shared` | ✅ `F-01` |
| `pnpm dev` / `build` / `typecheck` / `lint` | ✅ tous verts |
| `packages/shared` | ✅ énumérations et invariants ; schémas Zod au ticket `F-11` |
| Backend `apps/api` | ⬜ dossier vide avec un README — ticket `F-05` |
| CI, Docker Compose, infrastructure | ⬜ rien — tickets `F-02`, `F-03`, `F-16` |

Le web tourne sur `http://localhost:5173` avec des données simulées
(`apps/web/src/data/*Api.ts`), derrière la même interface que la future API.

---

## 2. Prochaine action

> **Ticket `F-03` — pipeline CI GitHub Actions.**
> Créer `.github/workflows/ci.yml` : `pnpm install --frozen-lockfile`, puis
> `pnpm lint`, `pnpm typecheck`, `pnpm build`. Node 22, pnpm 11, cache pnpm.

À faire maintenant **parce que tout est vert** : la CI verrouille cet état avant que le
backend n'arrive. Un dépôt dont la CI naît rouge est un dépôt où personne ne regarde la CI.

`pnpm test` n'a encore rien à exécuter — ne pas l'ajouter au workflow avant `F-19`, sinon
l'étape échoue ou ment.

### Décision à prendre dans le même ticket — `F-04`, budget de performance

Le build produit **959 Ko de JS (293 Ko gzip)**, contre les 200 Ko fixés dans
`docs/architecture.md` §6. Poser le seuil à 200 Ko rendrait la CI rouge immédiatement.

**Approche recommandée — le cliquet** : fixer le plafond à la valeur actuelle, de sorte
qu'aucune modification ne puisse aggraver la situation, et le descendre par paliers au
ticket `S-10`. La CI reste verte et exploitable, et le budget cible reste inscrit dans
l'architecture comme objectif, pas comme fiction.

Ensuite, chemin critique : **`F-05` → `F-07` → `F-08` → `F-09`**. Tant que ces quatre
tickets ne sont pas fusionnés, la moitié du backlog est bloquée.

Backlog complet : `docs/plan-de-developpement.md`.

---

## 3. Actions à lancer en parallèle, dès maintenant

Ces trois-là ont un délai externe et doivent partir avant le code.

| Action | Pourquoi maintenant | Qui |
|---|---|---|
| **Corriger le répertoire racine Vercel** → `apps/web` | Le projet pointe encore sur `frontend/`. Le prochain déploiement échouera. Action manuelle, hors dépôt. | Yonni |
| **Enregistrer le domaine `.mg`** | Démarches locales via le registre national, délai incompressible. La délivrabilité email en dépend. | Yonni |
| **Obtenir un vrai fichier d'étudiants de l'ESP-Antsiranana** | Risque `R2` : les fichiers réels ne ressemblent jamais aux hypothèses. À tester avant d'écrire le parseur. | Rino |
| **3 entretiens de validation partenaires** | Hypothèses `H1` et `H4` — les deux qui peuvent tuer le projet. | CEO |

---

## 4. Questions ouvertes

| # | Question | Bloque quoi | Pour qui |
|---|---|---|---|
| Q-1 | Montants des formules partenaires | Le business plan, pas le développement | CEO |
| Q-2 | `CoFound.mg` ou `CoFounder.mg` ? Les deux apparaissent dans les documents | Domaine, marque, tous les supports | CEO |
| Q-3 | Statut juridique de l'entité et échéance | Contrats institutionnels | CEO |
| Q-4 | Quel établissement pilote en premier, et quand ? | Le calendrier de lancement | CEO + Yonni |
| Q-5 | Fournisseur de base managée (Neon / Supabase / Aiven) | Tickets `F-02` et `F-16` | Yonni |

---

## 5. Points de vigilance actifs

- **Bundle à 959 Ko (293 Ko gzip)** contre un budget de 200 Ko. Causes : aucun découpage de
  code, `recharts` et `framer-motion` chargés d'emblée. Ticket `S-10`. Voir §2 pour le
  contournement retenu en attendant.
- **Le prototype n'a jamais eu `strict` activé.** Il l'est depuis `F-01`, et six erreurs
  préexistantes rendaient déjà le build rouge avant cette session. Tout nouveau code repris
  du prototype peut en révéler d'autres — le typecheck avant commit n'est pas optionnel.
- **Ne jamais faire de `chmod -R` sur le dépôt.** Une copie antérieure depuis un support
  FAT/NTFS avait passé 218 fichiers en `755`, produisant 218 fichiers « modifiés » sans un
  seul changement de contenu. Si ça se reproduit :
  `git ls-files -s | awk -F'\t' '$1 ~ /^100644/ {print $2}' | tr '\n' '\0' | xargs -0 chmod 644`
- **Corrections à appliquer au prototype** au ticket `F-13` :
  - `C1` — retirer `isFemale` et `FemaleBadge` **des profils de personnes** (garder
    `isFemaleImpact` sur les projets)
  - `C2` — unifier le pseudonymat dans les feeds (`ProjectCard` affiche encore le nom en clair)
  - `C3` — sortir le type `sector` du code, le mettre en base
  - `C4` — supprimer `SignupPage` (il n'y a plus d'inscription)
  - `C5` — passer `SchoolLeaderboard` en vue privée
- **`R1` — délivrabilité des invitations** : risque numéro un du produit. SPF, DKIM et DMARC
  configurés **avant** le premier envoi. Repli : l'établissement distribue une liste de liens
  d'activation générée depuis sa console.

---

## 6. Répartition

| Membre | Domaine | Charge MVP |
|---|---|---|
| **Yonni** (CTO) | Socle transversal, infrastructure, auth/RBAC/privacy/audit, messagerie, notifications | 42 j |
| **Rino** | Import, invitations, profil et onboarding, Dream-Match, console établissement, modération | 38,5 j |
| **Norman** | Design system (**référent frontend**), feeds, recherche, espace projet, console partenaire | 50 j |

Total : **130,5 jours-homme**, soit ~9 à 11 semaines à trois à temps plein.
