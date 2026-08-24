# Navigation, routes et coquilles — CoFound.mg

> La carte complète du MVP : **55 écrans**, leurs adresses, qui y accède, dans quelle coquille
> ils s'affichent et dans quel fragment ils sont chargés.

**Version** : 1.0 — 20 août 2026
**Documents liés** : [`principes.md`](./principes.md) · [`design-system.md`](./design-system.md) · `docs/architecture.md` §5

---

## 1. Conventions d'adresse

- **Les adresses sont en anglais**, comme le reste du code. L'interface est traduite, pas l'URL : des adresses localisées imposeraient un routage par langue pour un bénéfice nul, et casseraient tous les liens le jour où le malgache arrive (`S10`).
- Nom de ressource au pluriel : `/projects`, `/talents`, `/opportunities`.
- Les consoles sont préfixées par leur acteur : `/institution/…`, `/partner/…`, `/staff/…`. Le préfixe est ce qui rend le découpage du paquet et la garde d'accès lisibles d'un coup d'œil.
- Un identifiant dans l'adresse est **opaque** (ULID). Jamais un identifiant séquentiel — il révélerait le volume réel de la plateforme, information commerciale au lancement.
- L'état d'une liste (filtres, page, tri) vit dans la **chaîne de requête**, jamais dans l'état React seul : un filtre doit être partageable et survivre à un rechargement.

---

## 2. Les quatre coquilles

| Coquille | Composant | Écrans | Structure |
|---|---|---|---|
| **Publique** | `PublicShell` | UI-01 à UI-05, UI-08 | En-tête léger + pied de page. Aucune donnée de session. |
| **Talent** | `AppShell` | UI-06 à UI-33 | Mobile : en-tête + **barre de navigation basse (5 entrées)**. Bureau : colonne latérale gauche persistante. |
| **Console** | `ConsoleShell` | UI-34 à UI-55 | Mobile : en-tête + menu en feuille latérale. Bureau : colonne latérale de sections + fil d'Ariane. Vouvoiement. |
| **Plein écran** | `FocusShell` | UI-04, UI-09, UI-24, UI-26 | Aucune navigation, une seule sortie explicite. Réservé aux parcours qu'il ne faut pas interrompre. |

### Navigation basse (mobile, coquille talent) — 5 entrées, pas 6

| Entrée | Adresse | Pastille |
|---|---|---|
| Projets | `/projects` | — |
| Talents | `/talents` | — |
| Dream-Match | `/dream-match` | Nombre de nouvelles suggestions |
| Messages | `/messages` | Nombre de conversations non lues |
| Moi | `/me` | Point si le profil est incomplet ou une notification non lue |

Le reste (notifications, demandes de contact, mes candidatures, paramètres) est accessible
depuis `/me` et depuis l'en-tête. **Cinq entrées est un plafond, pas un objectif** : au-delà,
les cibles tactiles passent sous 44 px sur un écran de 360 px.

---

## 3. Carte des routes

Légende des accès — les statuts sont ceux de `AccountStatus`, les rôles ceux d'`architecture.md` §5.

### Public — aucune session requise

| Écran | Adresse | Fragment | Notes |
|---|---|---|---|
| UI-01 Accueil | `/` | `landing` | Prérendue et servie par le CDN |
| UI-02 Connexion | `/login` | `shell` | |
| UI-03 Mot de passe oublié / réinitialisation | `/forgot-password` · `/reset-password/:token` | `shell` | |
| UI-04 Activation | `/activation/:token` | `shell` | Jeton à usage unique, 30 jours |
| UI-05 Demande d'accès organisation | `/organization-request` | `landing` | Le second mode d'entrée (D1) |
| UI-08 Erreurs | `/403` · `/404` · repli global | `shell` | |

### Talent — `ACTIVE`, `LEAVING`, `ALUMNI` sauf mention contraire

| Écran | Adresse | Fragment | Accès particulier |
|---|---|---|---|
| UI-06 Statut du compte | `/account-status` | `shell` | **Seule route atteignable en `FROZEN`** |
| UI-07 Paramètres | `/settings` (onglets `account`, `notifications`, `privacy`, `blocks`) | `shell` | |
| UI-09 Onboarding | `/onboarding` | `shell` | Interruptible — jamais bloquant |
| UI-10 Mon profil | `/me` | `shell` | |
| UI-11 Édition du profil | `/me/edit` | `shell` | Seul écran affichant le genre de la personne |
| UI-12 Profil d'un talent | `/talents/:id` | `discovery` | Vue pseudonymisée ou révélée selon l'API |
| UI-13 Feed Projets | `/projects` | `discovery` | Ouvert à tous les comptes connectés |
| UI-14 Feed Talents | `/talents` | `discovery` | Talents + partenaires `RECRUIT`. **Hors du feed en `LEAVING`** |
| UI-15 Recherche | `/search` | `discovery` | |
| UI-16 Profil Dream-Match | `/dream-match/profile` | `discovery` | |
| UI-17 Suggestions Dream-Match | `/dream-match` | `discovery` | Exige `MIN_PROFILE_COMPLETION` (60 %). **Fermé en `LEAVING`** |
| UI-18 Opportunités | `/opportunities` | `discovery` | |
| UI-19 Détail d'une opportunité | `/opportunities/:id` | `discovery` | Candidature fermée en `ALUMNI` |
| UI-20 Demandes de contact | `/connections` | `messaging` | |
| UI-21 Messagerie | `/messages` · `/messages/:conversationId` | `messaging` | Participants uniquement |
| UI-22 Notifications | `/notifications` | `messaging` | |
| UI-23 Signaler / bloquer | dialogue transverse | `shell` | Depuis profil, message, projet, publication |
| UI-29b Mes candidatures | `/applications` | `project` | Fermé en `ALUMNI` |

### Projet

| Écran | Adresse | Fragment | Accès |
|---|---|---|---|
| UI-24 Création | `/projects/new` | `project` | Tout talent `ACTIVE` |
| UI-25 Espace projet — aperçu | `/projects/:id` | `project` | **Deux rendus** : public / membre |
| UI-26 BMC | `/projects/:id/bmc` | `project` | Écriture : `OWNER`/`MEMBER`. Lecture publique **bloc par bloc** |
| UI-27 Équipe et postes | `/projects/:id/team` | `project` | Administration : `OWNER` |
| UI-28 Candidatures reçues | `/projects/:id/applications` | `project` | `OWNER` |
| UI-30 Tâches | `/projects/:id/tasks` | `project` | Membres |
| UI-31 Canal de discussion | `/projects/:id/channel` | `messaging` | Membres |
| UI-32 Publications | `/projects/:id/posts` | `project` | `OWNER` |
| UI-33 Paramètres du projet | `/projects/:id/settings` | `project` | `OWNER` |

### Console établissement — `ORG_MEMBER` d'une organisation `INSTITUTION` avec `CERTIFY_AFFILIATION`

| Écran | Adresse | Rôle minimal |
|---|---|---|
| UI-34 Vue d'ensemble | `/institution` | `ORG_VIEWER` |
| UI-35 Nouvel import | `/institution/imports/new` | `ORG_MANAGER` |
| UI-36 Lots et rapports | `/institution/imports` · `/institution/imports/:id` | `ORG_VIEWER` |
| UI-37 Affiliations | `/institution/affiliations` | `ORG_MANAGER` |
| UI-38 Annuaire | `/institution/directory` | `ORG_VIEWER` |
| UI-39 Membres et rôles | `/institution/members` | `ORG_ADMIN` |
| UI-40 Opportunités | `/institution/opportunities` | `ORG_MANAGER` + `PUBLISH_OPPORTUNITY` |

### Console partenaire — `ORG_MEMBER` d'une organisation vérifiée

| Écran | Adresse | Capacité requise |
|---|---|---|
| UI-41 Vue d'ensemble | `/partner` | — |
| UI-42 Profil de l'organisation | `/partner/profile` | `ORG_ADMIN` |
| UI-43 Recherche de projets | `/partner/projects` | `RECRUIT` |
| UI-44 Liste de suivi | `/partner/watchlist` | `RECRUIT` |
| UI-45 Fiche projet | `/partner/projects/:id` | `RECRUIT` |
| UI-46 Recherche de talents | `/partner/talents` | `RECRUIT` |
| UI-47 Contact | dialogue depuis UI-45 / UI-46 | `RECRUIT` |
| UI-48 Opportunités et candidatures | `/partner/opportunities` · `/partner/opportunities/:id` | `PUBLISH_OPPORTUNITY` |

### Console staff — rôle plateforme `STAFF`

| Écran | Adresse | Rôle staff |
|---|---|---|
| UI-49 Organisations et capacités | `/staff/organizations` | `SUPER_ADMIN` |
| UI-50 Supervision des imports | `/staff/imports` | `OPS_ADMIN` |
| UI-51 File de modération | `/staff/moderation` | `MODERATOR` |
| UI-52 Détail d'un signalement | `/staff/moderation/:id` | `MODERATOR` |
| UI-53 Journal d'audit | `/staff/audit` | `SUPER_ADMIN` |
| UI-54 Référentiels | `/staff/reference-data` | `SUPER_ADMIN` |
| UI-55 Santé produit | `/staff/health` | `OPS_ADMIN` |

---

## 4. Gardes d'accès

Une route se **déclare** avec ses conditions. Une route non déclarée n'est pas atteignable :
c'est le refus par défaut d'`architecture.md` §5 transposé au routage.

```tsx
// Forme attendue — la garde est déclarative, jamais une condition dans le composant
<Route
  path="/institution/imports/new"
  handle={{ requires: { status: ['ACTIVE'], orgRole: ['ORG_ADMIN', 'ORG_MANAGER'],
                        capability: 'CERTIFY_AFFILIATION' } }}
  element={<NewImportPage />}
/>
```

### Ordre d'évaluation

1. **Pas de session** → redirection vers `/login?next=<adresse>`. L'adresse demandée est conservée : envoyer quelqu'un sur le feed après connexion lui fait perdre ce qu'il cherchait.
2. **Compte `FROZEN`** → redirection systématique vers `/account-status`, quelle que soit la route. Permission négative n° 7.
3. **Compte `DISABLED`** → session détruite, retour à `/login` avec explication.
4. **Statut insuffisant pour la route** (par exemple `ALUMNI` sur une candidature) → l'écran s'affiche, **l'action est désactivée avec son motif**. On n'interdit pas la lecture quand seule l'écriture est fermée.
5. **Rôle ou capacité insuffisants** → écran 403 (UI-08) nommant ce qui manque.
6. **403 renvoyé par l'API alors que la garde a laissé passer** → écran 403 également, **et remontée à Sentry** : c'est une désynchronisation entre le client et le serveur, donc un défaut à corriger, pas un cas normal.

### Redirection après connexion

Par défaut, `?next` s'il est présent. Sinon, selon le rôle : `TALENT` → `/projects` ·
`ORG_MEMBER` d'un établissement → `/institution` · `ORG_MEMBER` d'un partenaire → `/partner` ·
`STAFF` → `/staff/moderation`.

Une personne cumulant un profil talent et un rôle d'organisation — cas explicitement prévu par
le modèle d'acteurs (D3) — arrive sur son espace talent et bascule par un sélecteur de contexte
dans l'en-tête. **Il n'existe pas deux comptes pour une personne.**

### Onboarding — incitatif, jamais bloquant

Après activation, redirection vers `/onboarding`. La personne peut sortir à toute étape :
son profil est utilisable à 60 % de complétion (`MIN_PROFILE_COMPLETION`), et un formulaire de
40 questions en une fois, sur mobile en 3G, ne se termine pas (`specs-fonctionnelles.md` TAL-02).

Ce que la complétion insuffisante ferme réellement :

| Complétion | Conséquence |
|---|---|
| < 60 % | Pas de suggestions Dream-Match (UI-17), pas de présence dans le Feed Talents. **Tout le reste est ouvert.** |
| ≥ 60 % | Tout est ouvert |

La relance vit dans une bande de progression sur `/me` et un rappel discret dans l'en-tête —
jamais un dialogue modal à chaque connexion.

---

## 5. Chargement, erreurs et hors-ligne au niveau du routage

- Chaque fragment chargé paresseusement a un **squelette de coquille** pendant son chargement, pas une page blanche.
- Un échec de chargement de fragment (coupure en plein téléchargement, cas fréquent en 3G) affiche un écran de reprise avec bouton *Réessayer*, jamais l'écran d'erreur générique du navigateur.
- La coquille applicative est mise en cache par le service worker (PWA installable, `architecture.md` §1) : hors ligne, la navigation reste possible et chaque écran affiche son état hors-ligne (`principes.md` §5).
- Une erreur non capturée est confinée à la zone de contenu : **la navigation ne disparaît jamais**. Un écran cassé sans issue est un abandon.
