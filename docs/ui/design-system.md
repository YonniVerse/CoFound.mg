# Design system — CoFound.mg

> **Source unique des valeurs visuelles.** Aucune fiche d'écran ne cite une couleur, une
> taille de police ou un espacement : elle cite un **token** ou un **composant** défini ici.
> C'est ce qui a tué la spécification précédente — elle décrivait une palette verte que le
> produit n'a plus.

**Version** : 1.0 — 20 août 2026
**Propriétaire** : **Norman**. Toute modification de ce document ou de `apps/web/src/index.css` passe par lui.
**Implémentation** : `apps/web/src/index.css` · primitives dans `apps/web/src/components/ui/`

---

## 1. Ce qui est repris du prototype, et ce qui ne l'est pas

Le design system du prototype est **conservé** (`mvp-scope.md` §7) : tokens OKLCH, échelles
d'ombres et de rayons, typographie Inter + Sora auto-hébergée, primitives shadcn/Radix.

Ce qui change au ticket `F-13` :

| Changement | Raison |
|---|---|
| `FemaleBadge` retiré des profils de personnes | Correction `C1` — le genre n'est jamais un attribut affiché d'une personne |
| Tokens `--female` / `--female-light` renommés `--impact` / `--impact-light` | Le token ne sert plus qu'au badge **d'impact féminin d'un projet**. Garder le nom `female` invite à le réutiliser sur une personne, c'est-à-dire à refaire l'erreur. |
| `SectorBadge` ne dérive plus sa couleur ni son emoji d'un type codé en dur | Correction `C3` — les secteurs viennent de la base |
| `SignupPage` supprimée | Correction `C4` — il n'y a pas d'inscription (D1) |

---

## 2. Couleurs

Espace **OKLCH**, défini dans `:root`. Les valeurs ci-dessous sont la référence ; on utilise
**toujours** le nom de classe Tailwind associé, jamais la valeur.

| Rôle | Token | Classe | Emploi |
|---|---|---|---|
| Fond de page | `--background` | `bg-background` | Fond général |
| Texte principal | `--foreground` | `text-foreground` | Tout texte de lecture |
| Surface | `--surface` | `bg-surface` | Fonds de section, en-têtes de tableau |
| Carte | `--card` | `bg-card` | Cartes, panneaux, dialogues |
| **Primaire** — indigo (teinte 265) | `--primary` | `bg-primary` / `text-primary` | Action principale, état actif, liens |
| Primaire foncé | `--primary-dark` | `hover:bg-primary-dark` | Survol de l'action principale |
| Primaire clair | `--primary-light` | `bg-primary-light` | Fond d'élément sélectionné, badge sobre |
| **Secondaire** — orange sienne (teinte 45) | `--secondary` | `bg-secondary` | Accent business : opportunités, partenaires. **Jamais** pour une action destructrice |
| Atténué | `--muted` / `--muted-foreground` | `bg-muted` / `text-muted-foreground` | Métadonnées, libellés secondaires |
| Accent | `--accent` | `bg-accent` | Survol de ligne, séparation douce |
| **Destructif** | `--destructive` | `bg-destructive` | Suppression, refus, gel, désactivation — **uniquement** |
| Bordure | `--border` | `border-border` | Toute bordure |
| Anneau de focus | `--ring` | `ring-ring` | Focus clavier. Ne jamais le supprimer |
| **Impact projet** (ex-`--female`) | `--impact` / `--impact-light` | `bg-impact-light text-impact` | Badge d'impact féminin **d'un projet** |

### Règles

- **Le vert n'existe pas dans la palette.** Un « succès » s'exprime par `primary` + une icône + un libellé, pas par une couleur introuvable dans les tokens.
- Aucune valeur hexadécimale, `rgb()` ou `oklch()` littérale dans un composant. Si une nuance manque, elle s'ajoute ici, par Norman.
- Aucune information portée par la couleur seule (`principes.md` §11).
- **Pas de thème sombre au MVP.** Il doublerait la surface de revue visuelle pour un besoin nul en pilote. La variante `dark` reste déclarée dans `index.css` : l'ajouter plus tard consiste à définir un second jeu de tokens, sans toucher aux composants.

---

## 3. Typographie

| Rôle | Police | Graisse | Classe | Emploi |
|---|---|---|---|---|
| Titres | **Sora** (`--font-heading`) | 600–800 | `font-heading` | `h1`–`h6`, appliqué globalement |
| Texte | **Inter Variable** (`--font-sans`) | 400–600 | `font-sans` | Corps, étiquettes, boutons |
| Monospace | JetBrains Mono | 400 | `font-mono` | Jetons, identifiants techniques, extraits de fichier d'import |

Échelle (mobile → bureau) :

| Niveau | Mobile | Bureau | Emploi |
|---|---|---|---|
| Titre de page | `text-2xl` | `text-3xl` | Un seul `h1` par écran |
| Section | `text-lg` | `text-xl` | `h2` |
| Titre de carte | `text-base` | `text-lg` | `h3` |
| Corps | `text-sm` | `text-base` | Lecture |
| Métadonnée | `text-xs` | `text-sm` | Dates, compteurs, mentions légales |

Les polices sont **auto-hébergées** via `@fontsource` — aucun appel à un service tiers, ni
pour la police, ni pour une icône, ni pour une image. Une dépendance réseau supplémentaire
depuis Madagascar est un coût de latence pur.

---

## 4. Espacement, rayons, ombres

- **Espacement** : échelle Tailwind par défaut. Rythme vertical d'une page : `space-y-6` entre sections, `gap-4` entre cartes, `p-4` (mobile) / `p-6` (bureau) dans une carte.
- **Largeur de contenu** : `max-w-2xl` pour une colonne de lecture (feed, formulaire), `max-w-7xl` pour une console. Gouttières : `px-4` mobile, `px-6` au-delà.
- **Rayons** : `--radius` = `0.75rem`. `rounded-lg` pour les cartes et dialogues, `rounded-md` pour les champs et boutons, `rounded-full` pour les badges et avatars.
- **Ombres** : `shadow-xs` au repos sur une carte, `shadow-md` au survol d'un élément cliquable, `shadow-lg` pour les surfaces flottantes (dialogue, menu, feuille). Au-delà : réservé à la page d'accueil publique.

---

## 5. Mouvement

`framer-motion` est présent dans le prototype et **pèse sur le budget de performance**
(`principes.md` §12).

| Usage | Décision |
|---|---|
| Transitions d'état simples (survol, ouverture d'un panneau, apparition d'un badge) | `tw-animate-css` / transitions CSS. **Suffisant partout dans l'application.** |
| Animations composées de la page d'accueil publique | `framer-motion` autorisé, **chargé paresseusement avec la page d'accueil uniquement** |
| Espace applicatif (feed, projet, consoles, messagerie) | `framer-motion` **interdit** — c'est du poids de paquet pour un gain nul sur un appareil d'entrée de gamme |

Durées : 150 ms pour un retour d'interaction, 250 ms pour une transition de mise en page. Rien
au-delà de 300 ms. `prefers-reduced-motion` désactive tout mouvement non essentiel.

---

## 6. Primitives existantes

Dans `apps/web/src/components/ui/` — shadcn au-dessus de Radix. **On ne réécrit jamais une
primitive à la main** : le piège du focus, le clavier et l'ARIA sont déjà traités.

Disponibles : `button` · `input` · `textarea` · `label` · `checkbox` · `radio-group` ·
`select` · `switch` · `dialog` · `sheet` · `progress` · `chart` · `LogoSVG` · `LogoIconSVG`.

À ajouter au fil des tickets, **par Norman** :

| Primitive | Ticket qui la déclenche | Note |
|---|---|---|
| `card` | `F-13` | Formalise le motif de carte déjà dupliqué dans le prototype |
| `badge` | `F-13` | Socle de tous les badges du catalogue |
| `tabs` | `P-01` | Onglets de l'espace projet |
| `dropdown-menu` | `F-13` | Menus d'action des listes |
| `tooltip` | `M-07` | Facteurs explicatifs du Dream-Match |
| `toast` | `F-14` | Retour des actions asynchrones — une seule instance globale |
| `table` | `E-17` | Consoles uniquement ; devient une liste de cartes sous 768 px |
| `skeleton` | `F-13` | État de chargement obligatoire de §5 des principes |
| `pagination` | `M-02` | Pagination serveur |
| `combobox` | `E-13` | Sélection de compétences avec recherche |
| `avatar` | `F-13` | Remplace `shared/Avatar.tsx`, aligné sur `avatarSeed` |

---

## 7. Où placer un composant

```
apps/web/src/
  components/
    ui/         primitives shadcn/Radix — génériques, sans logique métier
    shared/     composants CoFound transverses — voir composants-partages.md
    <domaine>/  composants d'un seul domaine : feed/, project/, institution/, partner/, staff/
    layout/     coquilles de page et navigation
  pages/        un fichier par écran, il n'y contient aucun style — il compose
```

**Règle de promotion** : un composant monte dans `shared/` au **troisième** usage, **et**
seulement s'il sert dans au moins **deux domaines**. Deux usages dans le même domaine ne
justifient pas une abstraction — ils justifient une copie qu'on relira plus tard.

**Règle de revue** : toute création ou modification dans `ui/` ou `shared/` demande la revue de
Norman. Les composants de domaine restent à la main de leur propriétaire.

**Règle de nommage** : `PascalCase.tsx` pour les composants CoFound, `kebab-case.tsx` pour les
primitives shadcn (convention de l'outil, conservée pour que `shadcn add` reste utilisable).
Les noms sont en anglais, comme le reste du code.

---

## 8. Découpage du paquet

Le budget de 200 Ko gzip est vérifié en CI (`F-04`). Découpage attendu :

| Fragment | Contenu | Chargement |
|---|---|---|
| `shell` | Coquille applicative, navigation, authentification, primitives | Immédiat |
| `landing` | Page d'accueil publique + `framer-motion` | Route `/` uniquement |
| `discovery` | Feeds, recherche, Dream-Match | À la demande |
| `project` | Espace projet, BMC, tâches | À la demande |
| `messaging` | Messagerie et notifications | À la demande |
| `institution` | Console établissement | À la demande |
| `partner` | Console partenaire | À la demande |
| `staff` | Console staff | À la demande |
| `charts` | `recharts` | **Jamais** dans un fragment autre que celui de l'écran qui l'affiche |

Un étudiant ne télécharge jamais le code d'une console. C'est la première source d'économie du
budget, avant toute micro-optimisation.

---

## 9. Iconographie

`lucide-react`, importé icône par icône. Taille 18 px dans les listes et la navigation, 20 px
dans les boutons, 40 px dans les états vides. Épaisseur de trait 1,5.

Une icône seule n'est jamais un bouton sans `aria-label`. Une icône ne remplace jamais un
libellé dans une barre d'action principale — sur mobile, une rangée d'icônes sans texte se
devine, et se devine mal.
