# État courant — CoFound.mg

> Fichier de reprise de contexte. Chargé automatiquement par `CLAUDE.md`.
> Mis à jour par la commande `/handoff` en fin de session.
>
> **Ne contient que l'état vivant.** L'historique va dans `CHANGELOG.md`, les décisions
> arrêtées dans `CLAUDE.md`, le détail dans `docs/`.

**Dernière mise à jour** : 2026-08-20
**Phase** : cadrage terminé, développement non démarré

---

## 1. Où on en est

Le cadrage complet est terminé : périmètre, architecture, modèle de données, plan de
développement et documents business sont écrits et validés par Yonni.

**Aucune ligne de code du MVP n'a été écrite.** Ce qui existe :

| Élément | État | Où |
|---|---|---|
| Documentation produit, technique, business | ✅ 9 documents | `docs/` |
| Prototype frontend (React 19 + Vite, design system, 5 pages, données simulées) | ✅ ~4 300 lignes | dépôt GitHub, branche `dev`, dossier `frontend/` |
| Backend | ⬜ inexistant | — |
| Monorepo | ⬜ non restructuré | — |
| Infrastructure | ⬜ rien de provisionné | — |

---

## 2. Prochaine action

> **Ticket `F-01` — restructuration en monorepo pnpm.**

```bash
cd <dépôt>
git checkout dev
git add -A && git commit -m "chore: état avant restructuration monorepo"
git checkout -b chore/monorepo
mkdir -p apps packages/shared apps/api
git mv frontend apps/web          # git mv préserve l'historique
mkdir -p docs/archive
git mv docs/PRD_CoFound_mg.md docs/archive/
git mv docs/SPECS_CoFound_mg.md docs/archive/
# puis : pnpm-workspace.yaml, package.json racine, tsconfig de base
```

Puis enchaîner sur le chemin critique : **`F-05` → `F-07` → `F-08` → `F-09`**.
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

- **L'arbre de travail local du dépôt prototype est sale** (fichiers `.agents/skills/`, docs,
  README modifiés non committés). À committer ou nettoyer **avant** `F-01`.
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
