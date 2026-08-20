# Composants partagés — catalogue et contrats

> **À consulter avant d'écrire un composant.** Si ce qu'on s'apprête à écrire figure ici, on
> l'utilise. Trois développeurs et leurs agents produisent trois cartes de projet différentes
> en une semaine si personne ne tient ce catalogue.

**Version** : 1.0 — 20 août 2026
**Emplacement** : `apps/web/src/components/shared/` sauf mention contraire
**Propriétaire** : **Norman**. Ajout ou modification = revue obligatoire.
**Règle de promotion** : un composant entre ici au 3ᵉ usage **et** dans au moins 2 domaines.

Chaque fiche donne : le contrat (propriétés), les états, les règles non négociables. Aucune
valeur visuelle — elles sont dans [`design-system.md`](./design-system.md).

---

## 1. Identité et personnes

### `TalentIdentity` — **le composant le plus important du produit**

Le **seul** composant autorisé à afficher le nom d'une personne. Aucun écran n'écrit
`{talent.firstName}`.

```ts
type TalentView =
  | { revealed: false; id: string; pseudonym: string; avatarSeed: string }
  | { revealed: true;  id: string; pseudonym: string; avatarSeed: string;
      firstName: string; lastName: string; photoKey: string | null }

interface TalentIdentityProps {
  talent: TalentView
  size?: 'sm' | 'md' | 'lg'
  /** Affiche la mention « profil pseudonymisé » sous le nom. Vrai par défaut sur les feeds. */
  explainPseudonymity?: boolean
  /** Affiche l'établissement certificateur à côté du nom. */
  affiliation?: { organizationName: string; certified: boolean } | null
}
```

**Règles**

- `revealed: false` → pseudonyme + avatar généré depuis `avatarSeed`. Il n'existe aucun chemin de code menant à un nom : le champ n'est pas dans le type.
- `revealed: true` → nom et photo réels. Le passage de l'un à l'autre est décidé **par l'API seule** (`peutVoirIdentite`, `architecture.md` §5).
- **Aucune propriété `gender`**, à aucun moment, sous aucune forme.
- `certified: true` n'est vrai que pour une affiliation d'établissement (D4). Le libellé est « certifié par », jamais « vérifié ».

### `SeededAvatar`

Avatar déterministe dérivé d'`avatarSeed` — la même personne a toujours le même avatar, sans
que celui-ci révèle quoi que ce soit.

```ts
interface SeededAvatarProps {
  seed: string
  photoKey?: string | null   // n'existe que sur une vue révélée
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
```

**Règles** : la graine est `avatarSeed`, **jamais le nom** — dériver l'avatar du nom fait fuiter les initiales sur une vue pseudonymisée. Décoratif : `alt=""`.

### `TalentCard`

Carte de talent des feeds et suggestions. Consomme `TalentView`, donc pseudonymisée par
construction. Correction `C2` du prototype : **une seule règle d'identité dans les deux feeds**.

```ts
interface TalentCardProps {
  talent: TalentView
  headline: string
  skills: ReferenceItem[]        // ce qu'il apporte, 3 max + « +N »
  seeking?: ReferenceItem[]      // ce qu'il cherche, 3 max
  availabilityHours: number | null
  field: ReferenceItem
  cohortYear: number | null
  action?: React.ReactNode       // « Demander un contact », etc.
  matchFactors?: MatchFactor[]   // uniquement sur les suggestions Dream-Match
}
```

---

## 2. Projets

### `ProjectCard`

```ts
interface ProjectCardProps {
  project: {
    id: string; title: string; pitch: string
    status: ProjectStatus
    sector: ReferenceItem; region: ReferenceItem | null
    isFemaleImpact: boolean
    openPositionsCount: number
    memberCount: number
    publishedAt: string | null
  }
  /** Vue pseudonymisée de l'équipe. Jamais un nom en clair. */
  owner: TalentView
  variant?: 'feed' | 'compact' | 'partner'
}
```

**Règles**

- L'auteur passe par `TalentIdentity` — correction `C2` : le prototype affichait `author.name` en clair dans le feed alors que les cartes de profil étaient pseudonymisées. Deux règles dans le même feed, dont une violait le pseudonymat.
- `sector` est un **`ReferenceItem` venant de la base** (correction `C3`), jamais une valeur d'union TypeScript.
- Aucun compteur de candidatures visible publiquement : c'est une information de porteur, pas de vitrine.

### `ProjectStatusBadge`

`ProjectStatus` → libellé du lexique (`principes.md` §14) + icône. **Jamais la couleur seule.**
Un `DRAFT` n'apparaît que pour l'équipe : il n'est visible nulle part ailleurs.

### `ProjectImpactBadge`

Badge « Impact féminin » **d'un projet** (`isFemaleImpact`), tokens `--impact`. Remplace
`FemaleBadge`, qui disparaît des personnes (correction `C1`). Ce composant ne prend **aucune**
donnée de personne.

### `BmcCompletionMeter`

Complétion du BMC en pourcentage + nombre de blocs remplis sur 9. Sert dans l'espace projet, la
recherche partenaire (filtre de maturité) et la garde de transition `DRAFT → RECRUITING` (D6).
Un état « BMC incomplet » indique **quels blocs manquent**, jamais seulement un chiffre.

---

## 3. Référentiels

### `ReferenceSelect` / `ReferenceCombobox`

Toute sélection de compétence, filière, secteur ou région passe par là.

```ts
interface ReferenceItem { id: string; slug: string; labelKey: string }

interface ReferenceSelectProps {
  kind: 'skill' | 'field' | 'sector' | 'region'
  value: string | string[] | null
  onChange: (value: string | string[] | null) => void
  multiple?: boolean
  max?: number
}
```

**Règles** : options chargées depuis l'API, avec **état de chargement et état d'erreur**
(`principes.md` §8). Le libellé affiché est la traduction de `labelKey`. Aucune liste d'options
écrite dans le code du front.

### `SkillTag` · `SectorBadge`

Affichent un `ReferenceItem` traduit. `SectorBadge` ne code en dur ni couleur ni emoji par
secteur : les secteurs sont ajoutés en base sans déploiement (ADM-05).

---

## 4. États d'écran

### `EmptyState`

```ts
interface EmptyStateProps {
  icon: LucideIcon
  title: string          // ce qui se passe
  description: string    // pourquoi
  action?: { label: string; onClick?: () => void; to?: string }   // la sortie de l'impasse
  variant?: 'empty' | 'filtered'   // « rien encore » ≠ « rien pour ces filtres »
}
```

`variant='filtered'` propose systématiquement la réinitialisation des filtres. Confondre les
deux fait croire que la plateforme est morte alors qu'un filtre est trop étroit
(`principes.md` §6).

### `ErrorState` · `ForbiddenState` · `NotFoundState`

Message compréhensible, cause quand elle est connue, **bouton de reprise ou chemin de retour**.
`ForbiddenState` nomme ce qui manque (« cet écran demande la capacité *Recruter* »), sans
divulguer l'existence ou non de la ressource visée.

### `LoadingSkeleton`

Squelettes calqués sur les mises en page réelles : `SkeletonCard`, `SkeletonList`,
`SkeletonTable`, `SkeletonForm`. **Aucun tourniquet centré** dans l'espace applicatif, et aucun
décalage de contenu à l'arrivée des données.

### `OfflineBanner`

Bandeau persistant en haut de la zone de contenu dès la perte de réseau. Indique ce qui est en
attente d'envoi. Jamais un dialogue modal : on ne bloque pas quelqu'un parce que son réseau a
faibli.

---

## 5. Actions et retours

### `ConfirmDialog`

Toute action irréversible passe par là : archiver un projet, annuler un lot d'import, geler un
compte, bloquer une personne, retirer une candidature.

```ts
interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel: string          // le verbe de l'action, jamais « OK »
  destructive?: boolean
  /** Saisie d'un mot exact pour les actions de masse et les sanctions. */
  requireTypedConfirmation?: string
}
```

**Règle** : `requireTypedConfirmation` est **obligatoire** pour toute action portant sur plus
d'une personne (passage d'une promotion en `Sortant`, annulation d'un lot appliqué) et pour
toute sanction de modération.

### `Toast`

Une seule instance globale. Confirme les actions asynchrones, propose *Annuler* quand c'est
possible. Ne porte **jamais** une information qu'on doit pouvoir relire : un rapport d'import ne
se lit pas dans une notification éphémère.

### `AutoSaveIndicator`

`Enregistré` · `Enregistrement…` · `Non enregistré — hors ligne`, avec l'horodatage du dernier
enregistrement réussi. Obligatoire sur onboarding (UI-09) et BMC (UI-26).

### `ReportDialog`

Dialogue de signalement, disponible depuis un profil, un message, un projet et une publication
(ticket `M-14`).

```ts
interface ReportDialogProps {
  target: { type: 'USER' | 'MESSAGE' | 'PROJECT' | 'POST'; id: string }
}
```

**Règles** : motifs issus de `ReportReason` (jamais de texte libre seul) ; après envoi, l'écran
annonce le **délai réel de traitement (48 h)** — un délai honnête vaut mieux qu'une promesse
que personne ne tient (`R10`) ; l'option *Bloquer aussi cette personne* est proposée dans la
même foulée.

---

## 6. Listes et données

### `DataList`

Composant de liste des consoles. **Tableau au-dessus de 768 px, liste de cartes en dessous** —
c'est le composant qui rend la règle de `principes.md` §4 automatique au lieu d'être une
intention.

```ts
interface DataListProps<T> {
  items: T[]
  columns: Array<{ key: string; label: string; render: (item: T) => ReactNode
                   priority: 1 | 2 | 3 }>   // priorité 1 = visible aussi en carte mobile
  bulkActions?: Array<{ label: string; onRun: (ids: string[]) => void; destructive?: boolean }>
  emptyState: React.ReactNode
  pagination: { page: number; pageSize: number; total: number }
}
```

Pagination **serveur** exclusivement. Les actions groupées passent par `ConfirmDialog` avec
confirmation saisie.

### `FilterBar`

Filtres synchronisés avec la chaîne de requête, jetons de filtres actifs retirables un par un,
bouton *Tout réinitialiser*, compteur de résultats.

**Règle absolue** : aucune facette de genre, sur aucun écran. Filtrer sur un champ privé est une
fuite d'information (TR-07).

### `AggregateMetric`

Toute statistique agrégée passe par là.

```ts
interface AggregateMetricProps {
  label: string
  value: number | null
  /** Effectif sous-jacent. Sous MIN_AGGREGATION_THRESHOLD, la valeur n'est pas affichée. */
  populationSize: number
  unit?: 'count' | 'percent'
}
```

**Règle** : si `populationSize < MIN_AGGREGATION_THRESHOLD` (= 5), le composant affiche
« effectif insuffisant » et **ignore `value`** même si l'API l'a renvoyée. Une seconde barrière
côté client sur la règle la plus lourde de conséquences du produit (TR-09) coûte dix lignes.

### `Amount`

`{ amount: number; currency: string }` → montant formaté selon la locale. Aucun symbole écrit à
la main, aucun montant sans devise (règle 3 de `CLAUDE.md`). Inutilisé au MVP — présent pour que
le premier écran financier n'ait rien à réécrire.

### `RelativeTime`

« il y a 2 jours », avec la date complète en infobulle et dans l'attribut `title`. Formatage par
i18n, jamais par concaténation.

---

## 7. Saisie

### `StepForm`

Ossature des parcours en étapes : onboarding (UI-09), import (UI-35), création de projet (UI-24).

Fournit : indicateur d'étape, sauvegarde automatique par étape, reprise à l'étape courante après
fermeture, navigation avant/arrière sans perte, validation Zod par étape.

**Règle** : cinq questions par étape au maximum, et la sortie est toujours possible.

### `FileDropzone`

Téléversement avec **redimensionnement côté client** avant envoi (`AVATAR_MAX_DIMENSION`),
téléversement direct vers R2 par URL présignée, barre de progression, annulation, liste blanche
de types affichée avant la sélection. Une photo de 4 Mo envoyée telle quelle sur une connexion
3G est un abandon garanti (TR-12).

---

## 8. Composants du prototype et leur devenir

| Composant existant | Devenir | Ticket |
|---|---|---|
| `shared/Avatar.tsx` | Remplacé par `SeededAvatar` — l'avatar dérive d'`avatarSeed`, plus du nom | `F-13` |
| `shared/FemaleBadge.tsx` | **Supprimé** des personnes ; devient `ProjectImpactBadge` pour les projets | `F-13` (C1) |
| `shared/SectorBadge.tsx` | Conservé, vidé de son référentiel codé en dur | `F-13` (C3) |
| `shared/SkillTag.tsx` | Conservé, prend un `ReferenceItem` | `F-13` |
| `feed/ProjectCard.tsx` | Conservé, auteur passé par `TalentIdentity` | `F-13` (C2) |
| `feed/ProfileCard.tsx` | Devient `TalentCard`, consomme `TalentView` | `F-13` (C2) |
| `feed/ParityWidget.tsx` | **Retiré du feed.** La mixité se lit en agrégat dans les consoles, pas sur la surface la plus consultée | `F-13` |
| `feed/SuggestedProfilesWidget.tsx` | Conservé, alimenté par le vrai Dream-Match | `M-07` |
| `impact/SchoolLeaderboard.tsx` | Déplacé en vue privée de la console établissement | `F-13` (C5) |
| `impact/ImpactChart.tsx`, `ImpactKPIs.tsx` | Déplacés dans le fragment `institution`, passés par `AggregateMetric` | `S1` |
| `impact/SecurityNotice.tsx` | Conservé, réemployé sur les écrans de pseudonymat | `F-13` |
| `pages/SignupPage.tsx` | **Supprimée** — il n'y a pas d'inscription | `F-13` (C4) |
| `pages/ImpactPage.tsx` (publique) | Retirée du public ; son contenu alimente UI-34 | `F-13` (C5) |
| `data/*Api.ts` + `hooks/use*Data.ts` | Remplacés par le client d'API typé ; l'interface ne change pas | `F-14` |
