# Principes d'interface — CoFound.mg

> **À lire avant d'écrire un seul écran.** Ce document ne décrit aucune page : il décrit ce
> qui est vrai sur **toutes** les pages. Une fiche d'écran ne répète jamais ces règles, elle
> les suppose acquises.
>
> Destinataires : les trois développeurs **et leurs agents de code**. Si une fiche d'écran
> contredit ce document, c'est la fiche qui a tort.

**Version** : 1.0 — 20 août 2026
**Propriétaire** : Norman (référent frontend) · arbitrage : Yonni (CTO)
**Documents liés** : [`design-system.md`](./design-system.md) · [`navigation.md`](./navigation.md) · [`composants-partages.md`](./composants-partages.md)

---

## 1. Le pseudonymat est un type, pas une condition d'affichage

C'est la règle la plus importante du produit côté interface, et la seule dont la violation
détruit la promesse centrale.

L'API applique la garantie par **absence de jointure** (`docs/modele-de-donnees.md` §2) : la
donnée privée n'est pas masquée, elle n'est pas chargée. L'interface applique la même
garantie **par le typage** : un composant qui n'a pas reçu d'identité ne peut pas en afficher
une, parce que le champ n'existe pas dans son type.

```ts
// packages/shared — union discriminée, jamais un objet avec des champs optionnels
type TalentView =
  | { revealed: false; pseudonym: string; avatarSeed: string; fieldId: string; ... }
  | { revealed: true;  pseudonym: string; firstName: string; lastName: string; photoKey: string | null; ... }
```

**Ce qui est interdit :**

| Interdit | Pourquoi |
|---|---|
| `talent.firstName ?? talent.pseudonym` | Le champ ne doit pas exister quand il n'est pas autorisé — sinon il finit dans le cache, les outils de développement et un futur `console.log`. |
| `{canSeeIdentity && <Name/>}` dispersé dans les écrans | Une condition oubliée est une fuite. La condition est calculée **une fois**, par l'API. |
| Un type `Talent` unique avec des champs `firstName?: string` | Rend la fuite typable, donc possible. |

**Ce qui est obligatoire :** un composant unique, `<TalentIdentity>` ([`composants-partages.md`](./composants-partages.md)), qui accepte `TalentView` et décide seul du rendu. Aucun écran n'affiche un nom autrement.

> Conséquence directe pour les agents de code : si vous avez besoin d'un nom que l'API ne
> renvoie pas, **la réponse n'est jamais de le demander autrement**. C'est que l'écran n'y a
> pas droit.

## 2. Le genre n'existe pas dans l'interface

Un seul écran du produit affiche le genre d'une personne : **le formulaire où elle renseigne
le sien** (UI-11) et son écran de confidentialité (UI-07). Nulle part ailleurs — ni carte, ni
profil, ni annuaire d'établissement, ni console staff, ni filtre de recherche.

- Aucun composant ne prend `gender` en propriété.
- Aucun filtre, aucune facette, aucun tri ne porte sur le genre. **Pouvoir filtrer par genre équivaut à l'afficher** (`specs-fonctionnelles.md` TR-07).
- Le badge d'impact féminin est une caractéristique **de projet** revendiquée par l'équipe (`isFemaleImpact`), jamais une caractéristique de personne. Correction `C1` du prototype : `FemaleBadge` disparaît des profils.
- Les chiffres de mixité n'apparaissent qu'en agrégat, et seulement au-dessus de `MIN_AGGREGATION_THRESHOLD` (= 5). En dessous : **l'écran affiche « effectif insuffisant pour publier ce chiffre »**, jamais un `—` ambigu, jamais un zéro.

## 3. Le refus par défaut vaut aussi dans l'interface

L'API refuse par défaut (`architecture.md` §5). L'interface applique **trois couches, dans cet ordre** :

1. **La route** est déclarée avec les statuts de compte et les rôles qui y donnent droit. Une route sans déclaration n'est pas atteignable.
2. **L'action** (bouton, entrée de menu) n'est pas rendue quand la capacité manque. Masquer n'est pas protéger — c'est éviter de proposer une impasse.
3. **La réponse 403** est traitée comme un état normal de l'écran, avec un message qui dit ce qui manque. Une page blanche ou un écran de chargement infini sur un 403 est un défaut bloquant.

> Ne jamais coder « l'utilisateur a le droit donc j'affiche » sans que l'API le confirme. Le
> client ne décide de rien ; il reflète.

## 4. Mobile d'abord — 360 px, Android d'entrée de gamme, 3G

La cible n'est pas « responsive », c'est **un téléphone à 60 € sur un réseau instable**.

| Largeur de référence | Ce qu'elle représente |
|---|---|
| **360 px** | La référence. Toute maquette commence ici. |
| 768 px | Tablette, ajout d'une seconde colonne. |
| 1280 px | Bureau, ajout des colonnes latérales et des consoles. |

Règles :

- Aucune colonne latérale n'est indispensable à la compréhension d'un écran : ce qu'elle contient est secondaire par définition, puisqu'elle disparaît sur mobile.
- Les tableaux des consoles ne se transforment pas en tableaux à défilement horizontal sur mobile : ils deviennent des **listes de cartes**. Un tableau de 9 colonnes sur 360 px est inutilisable.
- Cibles tactiles : **44 × 44 px minimum**, y compris les icônes de barre d'action.
- Les actions destructrices ne sont jamais à portée de pouce des actions courantes.
- Une page se lit sans zoom, sans défilement horizontal, à 360 px. C'est un critère de revue, pas un objectif.

## 5. Six états, sur chaque écran, sans exception

Un écran n'est pas terminé tant que les six sont traités. C'est le premier point de la revue.

| État | Traitement attendu |
|---|---|
| **Chargement** | Squelette calqué sur la mise en page finale — jamais un tourniquet centré, jamais un décalage de contenu à l'arrivée des données. |
| **Vide** | Une phrase qui explique, **une action qui sort de l'impasse**. Voir §6. |
| **Vide après filtrage** | Distinct du vide : « aucun résultat pour ces filtres » + bouton de réinitialisation. Confondre les deux fait croire que la plateforme est morte. |
| **Erreur** | Message compréhensible + bouton *Réessayer*. Le détail technique va dans Sentry, pas à l'écran. |
| **Hors ligne / réseau interrompu** | Bandeau persistant, données déjà chargées conservées, envois mis en attente. Une coupure réseau ne doit jamais faire perdre une saisie. |
| **Refusé (403) / introuvable (404)** | Écran dédié, explicite, avec un chemin de retour. |

## 6. Un écran vide n'est pas une erreur — c'est l'écran le plus vu de la semaine 1

Au lancement pilote, la plateforme est vide : pas de projets, pas de talents visibles, pas
d'opportunités. Le premier étudiant à se connecter verra des feeds vides. C'est structurel, et
c'est le moment où il décide s'il revient.

**Chaque état vide est donc une surface produit à part entière**, spécifiée dans la fiche
d'écran, avec :

- ce qui se passe (« personne n'a encore publié de projet dans ta filière »),
- **ce que la personne peut faire maintenant** (« crée le tien », « élargis tes filtres », « complète ton profil pour apparaître dans les suggestions »),
- jamais de faux contenu, jamais de compteur à zéro présenté comme une statistique.

## 7. Aucune chaîne en dur — et un espace de clés par domaine

Règle 1 des règles non négociables (`CLAUDE.md`). Une règle ESLint la fait respecter (ticket `F-12`).

- Format d'une clé : `domaine.ecran.element` — par exemple `discovery.projectFeed.emptyTitle`.
- **Un fichier de traduction par domaine**, pas un `fr.json` unique : `locales/fr/discovery.json`, `locales/fr/project.json`, `locales/fr/institution.json`… Trois développeurs qui éditent le même fichier de traduction produisent un conflit par jour.
- Les espaces de clés sont attribués écran par écran dans les fiches. **Ne pas en inventer un nouveau sans l'ajouter à la fiche.**
- Les libellés des référentiels (compétences, filières, secteurs, régions) viennent de la base via `label_key` — ils ne sont **jamais** écrits dans les fichiers de traduction du front.
- Pluriels, dates et nombres passent par le formateur d'i18n, jamais par une concaténation.

## 8. Aucun référentiel en dur

Règle 2. Compétences, filières, secteurs, régions, types d'organisation sont chargés depuis
l'API. Correction `C3` du prototype : le type `sector` codé en dur disparaît.

Conséquence d'interface : **les listes déroulantes de référentiel ont un état de chargement et
un état d'erreur**, comme n'importe quelle donnée distante. Un `<Select>` qui suppose ses
options disponibles synchroniquement est un défaut.

## 9. Tout montant porte sa devise

Règle 3. Aucun montant n'est affiché sans sa devise, aucun composant ne prend `amount: number`
seul — la propriété est `{ amount, currency }`. Le formatage passe par un utilitaire unique,
paramétré par la locale (`DEFAULT_CURRENCY = 'MGA'`). Aucun symbole écrit à la main.

*Au MVP, aucun écran n'affiche de montant* (D5, `FinancialEngagement` sans interface). La règle
existe pour que le premier écran qui en affichera un n'ait rien à réécrire.

## 10. Les formulaires longs se sauvegardent seuls et se reprennent

Onboarding (UI-09) et BMC (UI-26) sont concernés, et tout formulaire de plus de deux écrans.

- Sauvegarde automatique après une pause de saisie, indicateur d'état visible (`Enregistré`, `Enregistrement…`, `Non enregistré — hors ligne`).
- Reprise à l'étape où la personne s'est arrêtée, y compris après fermeture du navigateur.
- Aucun formulaire de plus de **cinq questions par écran**. L'interview d'onboarding est progressive et interruptible (`specs-fonctionnelles.md` TAL-02).
- Étiquettes toujours visibles — jamais un texte indicatif en guise d'étiquette.
- Validation par le schéma Zod partagé, la même règle qu'à l'API. Message d'erreur sous le champ, pas dans une alerte.

> « Perdre 20 minutes de rédaction de BMC sur une connexion instable signifie ne jamais
> recommencer. » — `mvp-scope.md` M4.

## 11. Accessibilité — les points qui bloquent la revue

- Contraste **AA** minimum sur tout texte, y compris les libellés secondaires et les badges.
- Focus clavier visible partout ; aucun `outline: none` sans remplacement.
- **Jamais la couleur seule** pour porter une information : un état de projet, un résultat d'import, une priorité de signalement portent toujours un libellé.
- Toute image porte une alternative textuelle ; les avatars générés sont décoratifs (`alt=""`).
- Les changements asynchrones (résultat d'envoi, arrivée d'un message) sont annoncés via une région `aria-live`.
- Les dialogues et menus utilisent les primitives Radix — piège du focus et échappement gérés. **Ne pas réécrire un dialogue à la main.**
- Aucune animation indispensable à la compréhension ; `prefers-reduced-motion` respecté.

## 12. Performance — le budget est une contrainte, pas une intention

Budget (`architecture.md` §6, vérifié en CI au ticket `F-04`) :

| Métrique | Budget |
|---|---|
| JavaScript initial (gzip) | **< 200 Ko** |
| LCP en 3G lente sur appareil bas de gamme | **< 2,5 s** |
| Poids d'une page de feed, données comprises | **< 300 Ko** |

Conséquences directes sur la façon d'écrire les écrans :

- **Découpage par route.** Chaque console (établissement, partenaire, staff) est un fragment chargé à la demande. Un étudiant ne télécharge jamais le code de la console partenaire.
- **`recharts` n'est jamais dans le paquet initial.** Tout écran de graphique est chargé paresseusement. Idem pour l'éditeur de BMC et la messagerie.
- Images téléversées **redimensionnées côté client** avant envoi (`AVATAR_MAX_DIMENSION = 512`), téléversement direct vers R2 par URL présignée.
- Listes longues paginées côté serveur ; pas de chargement de 500 lignes pour en montrer 20.
- Icônes importées une par une depuis `lucide-react`, jamais le paquet entier.

---

## 13. Ton et voix

Une plateforme qui tutoie un directeur d'établissement dans sa console d'administration perd
sa crédibilité institutionnelle ; une plateforme qui vouvoie un étudiant de 20 ans dans son
feed sonne comme une administration.

| Contexte | Voix |
|---|---|
| Espace talent (feed, profil, projet, messagerie, onboarding) | **Tutoiement**, ton direct et chaleureux |
| Console établissement, console partenaire, console staff | **Vouvoiement**, ton professionnel et sobre |
| Emails transactionnels | La voix du destinataire : tutoiement vers un étudiant, vouvoiement vers un cadre |
| Messages d'erreur et écrans juridiques | Neutres, sans humour, sans excuse superflue |

Autres règles de langue :

- Écriture inclusive **par les formes neutres** (« l'équipe », « les personnes », « qui »), jamais par les points médians : ils sont mal lus par les lecteurs d'écran et alourdissent une interface déjà dense.
- Pas d'emoji dans les libellés d'interface. Ils dépendent de la police du système et vieillissent mal ; les icônes sont des icônes.
- On dit **pseudonymat**, jamais « anonymat » (D7). Le produit assume que la ré-identification reste possible en petite promotion, et l'explique au moment où la personne complète son profil.

---

## 14. Lexique — le mot français employé pour chaque valeur du domaine

Trois développeurs sans lexique produisent trois vocabulaires. Le code reste en anglais
(`CLAUDE.md`), l'interface emploie **exclusivement** la colonne du milieu.

**Statut de compte** (`AccountStatus`)

| Valeur | Libellé d'interface | Clé i18n |
|---|---|---|
| `INVITED` | Invité | `account.status.invited` |
| `ACTIVE` | Actif | `account.status.active` |
| `FROZEN` | Gelé | `account.status.frozen` |
| `LEAVING` | Sortant | `account.status.leaving` |
| `ALUMNI` | Alumni | `account.status.alumni` |
| `DISABLED` | Désactivé | `account.status.disabled` |

**État de projet** (`ProjectStatus`)

| Valeur | Libellé | Clé i18n |
|---|---|---|
| `DRAFT` | Brouillon | `project.status.draft` |
| `RECRUITING` | Recrutement | `project.status.recruiting` |
| `ACTIVE` | Actif | `project.status.active` |
| `PAUSED` | En pause | `project.status.paused` |
| `ARCHIVED` | Archivé | `project.status.archived` |

**Candidature** (`ApplicationStatus`) : `PENDING` → En attente · `ACCEPTED` → Acceptée · `REJECTED` → Refusée · `WITHDRAWN` → Retirée.

**Tâche** (`TaskStatus`) : `TODO` → À faire · `DOING` → En cours · `BLOCKED` → Bloquée · `DONE` → Terminée.

**Résultat de ligne d'import** (`ImportRowResult`) : `CREATED` → Compte créé · `UPDATED` → Mis à jour · `SKIPPED_DUPLICATE` → Déjà présent, ignoré · `ERROR` → Erreur · `BOUNCED` → Adresse invalide.

**Vocabulaire produit**

| On dit | On ne dit pas | Pourquoi |
|---|---|---|
| Pseudonymat, profil pseudonymisé | Anonymat, profil anonyme | D7 — honnêteté sur la ré-identification |
| Dévoilement | Révélation, déblocage | Terme employé dans toute la documentation |
| Demande de contact | Invitation, mise en relation | « Invitation » est réservé à l'entrée sur la plateforme |
| Invitation | Inscription | Il n'y a pas d'inscription (D1) |
| Poste ouvert | Offre, annonce | « Offre » relève du recrutement salarié |
| Candidature | Postulation, application | — |
| Affiliation certifiée par l'établissement | Vérifié, validé | Seul un établissement certifie (D4) |
| Opportunité | Appel, concours, événement | Entité unique typée (D10) |
| Signalement | Plainte, report | — |

---

## 15. Checklist de revue d'un écran

Un écran est **terminé** quand les treize lignes sont vraies. Cette liste complète, côté
interface, la définition de « terminé » du `plan-de-developpement.md` §7.

- [ ] Les **six états** de §5 sont implémentés et visibles en recette.
- [ ] L'état **vide** propose une action, il ne constate pas.
- [ ] Aucune chaîne en dur ; les clés sont dans l'espace de noms annoncé par la fiche.
- [ ] Aucun référentiel en dur ; les listes viennent de l'API avec leurs états de chargement.
- [ ] Aucun champ d'identité affiché hors d'une `TalentView` **révélée** par l'API.
- [ ] Le genre n'apparaît nulle part, ni en affichage, ni en filtre, ni en tri.
- [ ] Le **403** est traité comme un état d'écran, pas comme une panne.
- [ ] Lisible et utilisable à **360 px** sans défilement horizontal ; cibles ≥ 44 px.
- [ ] Contraste AA, focus visible, aucune information portée par la seule couleur.
- [ ] Aucun composant nouveau qui duplique le catalogue de [`composants-partages.md`](./composants-partages.md).
- [ ] Rien d'ajouté au paquet initial : les dépendances lourdes de l'écran sont chargées paresseusement.
- [ ] Les permissions concernées sont couvertes par un test.
- [ ] Vérifié **sur un vrai téléphone**, pas seulement dans un émulateur redimensionné.
