# État courant — CoFound.mg

> Fichier de reprise de contexte. Chargé automatiquement par `CLAUDE.md`.
> Mis à jour par la commande `/handoff` en fin de session.
>
> **Ne contient que l'état vivant.** L'historique va dans `CHANGELOG.md`, les décisions
> arrêtées dans `CLAUDE.md`, le détail dans `docs/`.

**Dernière mise à jour** : 2026-08-20
**Phase** : vague 0 (Fondations) — `F-01` terminé

---

## 1. Où on en est

Cadrage terminé et validé. Le dépôt a été rapatrié dans `~/Lab/CoFound.mg` et
restructuré en monorepo pnpm (`F-01`).

| Élément | État |
|---|---|
| Documentation produit, technique, business | ✅ 9 documents dans `docs/` |
| Monorepo pnpm (`apps/web`, `packages/shared`) | ✅ `F-01` |
| Prototype frontend | ✅ déplacé en `apps/web`, historique git préservé |
| `pnpm dev` / `build` / `typecheck` / `lint` | ✅ tous verts |
| `packages/shared` | ✅ énumérations du domaine ; schémas Zod au ticket `F-11` |
| Backend `apps/api` | ⬜ inexistant — ticket `F-05` |
| Infrastructure | ⬜ rien de provisionné |

---

## 2. Prochaine action

> **Ticket `F-03` — pipeline CI GitHub Actions** (lint, types, tests, build).

C'est le prochain à faire parce que tout est déjà vert : la CI verrouille cet état avant
que le backend n'arrive. Elle doit aussi porter `F-04` (budget de performance) — le build
actuel produit **959 Ko de JS (293 Ko gzip)**, très au-dessus du budget de 200 Ko fixé
dans `docs/architecture.md` §6. Le découpage de bundle est à traiter au ticket `S-10`,
mais le seuil doit être posé dès maintenant, sinon il ne le sera jamais.

Ensuite, le chemin critique : **`F-05` → `F-07` → `F-08` → `F-09`**.
Tant que ces quatre tickets ne sont pas fusionnés, la moitié du backlog est bloquée.

Backlog complet : `docs/plan-de-developpement.md`.

---

## 3. Actions à lancer en parallèle, dès maintenant

Ces trois-là ont un délai externe et doivent partir avant le code :

| Action | Pourquoi maintenant | Qui |
|---|---|---|
| **Enregistrer le domaine `.mg`** | Démarches locales via le registre national, délai incompressible. La délivrabilité email en dépend. | Yonni |
| **Obtenir un vrai fichier d'étudiants de l'ESP-Antsiranana** | Risque `R2` : les fichiers réels ne ressemblent jamais aux hypothèses. À tester avant d'écrire le parseur. | Rino |
| **3 entretiens de validation partenaires** | Hypothèses `H1` et `H4` du business plan — les deux qui peuvent tuer le projet. | CEO |

---

## 4. Questions ouvertes

| # | Question | Bloque quoi | Pour qui |
|---|---|---|---|
| Q-1 | Montants des formules partenaires | Le business plan, pas le développement | CEO |
| Q-2 | `CoFound.mg` ou `CoFounder.mg` ? Les deux apparaissent dans les documents | Domaine, marque, tous les supports | CEO |
| Q-3 | Statut juridique de l'entité et échéance | Contrats institutionnels | CEO |
| Q-4 | Quel établissement pilote en premier, et quand ? | Le calendrier de lancement | CEO + Yonni |
| Q-5 | Fournisseur de base managée retenu (Neon / Supabase / Aiven) | Ticket `F-16` | Yonni |

---

## 5. Points de vigilance actifs

- **Vercel pointe encore sur `frontend/`.** Le répertoire racine du projet Vercel doit
  passer à **`apps/web`**, sinon le prochain déploiement échouera. Action manuelle, hors dépôt.
- **Le bundle pèse 959 Ko (293 Ko gzip)**, contre un budget de 200 Ko. Cause principale :
  aucun découpage de code, plus `recharts` et `framer-motion` chargés d'emblée. Ticket `S-10`.
- **Corrections à appliquer au prototype** lors de sa reprise dans `apps/web` (ticket `F-13`) :
  - `C1` — retirer `isFemale` et `FemaleBadge` **des profils de personnes** (garder
    `isFemaleImpact` sur les projets)
  - `C2` — unifier le pseudonymat dans les feeds (`ProjectCard` affiche encore le nom en clair)
  - `C3` — sortir le type `sector` du code, le mettre en base
  - `C4` — supprimer `SignupPage` (il n'y a plus d'inscription)
  - `C5` — passer `SchoolLeaderboard` en vue privée
- **`R1` — délivrabilité des invitations** : c'est le risque numéro un du produit. SPF, DKIM et
  DMARC doivent être configurés **avant** le premier envoi. Repli prévu : l'établissement
  distribue une liste de liens d'activation générée depuis sa console.

---

## 6. Répartition

| Membre | Domaine | Charge MVP |
|---|---|---|
| **Yonni** (CTO) | Socle transversal, infrastructure, auth/RBAC/privacy/audit, messagerie, notifications | 42 j |
| **Rino** | Import, invitations, profil et onboarding, Dream-Match, console établissement, modération | 38,5 j |
| **Norman** | Design system (**référent frontend**), feeds, recherche, espace projet, console partenaire | 50 j |

Total : **130,5 jours-homme** — soit ~9 à 11 semaines calendaires à trois à temps plein.
