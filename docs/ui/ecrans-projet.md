# Écrans — projet et espace collaboratif (UI-24 → UI-33)

**Tickets couverts** : `P-01` à `P-13`
**Bloc de périmètre** : M4 (projet et BMC), M6 (candidature et équipe), M8 (espace projet)

> Rappel de la machine à états (`architecture.md` §4) : `DRAFT → RECRUITING → ACTIVE`, plus
> `PAUSED` et `ARCHIVED`. **La seule transition contrainte est `DRAFT → RECRUITING`**, qui exige
> un BMC complet (D6). La structuration est une porte vers la visibilité, jamais une barrière à
> l'entrée.

---

## UI-24 — Création d'un projet

`/projects/new` · coquille **Plein écran** · fragment `project` · `P-01` · resp. **N**

**But** — Transformer une idée en objet suivi, **en moins de deux minutes**.

**Accès** — Tout talent `ACTIVE`. Le créateur devient `OWNER`.

**Données** — `POST /projects` : titre, pitch, secteur, région. Rien d'autre.

**Structure** — Un seul écran : titre · pitch (limite de caractères annoncée) · secteur ·
région · *Créer*. Un encart explique ce qui vient ensuite : le projet naît en **Brouillon**,
visible de l'équipe seule, et le BMC ouvrira la publication.

**États** — Repos · envoi · erreur de validation par champ · succès (redirection vers UI-26, le BMC) · hors ligne (brouillon local conservé).

**Règles**
- **Quatre champs, pas cinq.** D6 est explicite : le BMC n'est jamais exigé pour créer. Tout écran de création qui demande davantage contredit une décision arrêtée.
- Aucune promesse de visibilité : l'écran dit que le projet est en Brouillon et ce que cela signifie.
- Après création, on arrive sur le BMC — c'est l'étape suivante logique, proposée sans être imposée.

**i18n** — `project.create.*`

**Fait quand** — Un projet se crée avec titre + pitch + secteur + région uniquement · il naît en `DRAFT` · l'état est expliqué.

---

## UI-25 — Espace projet, aperçu

`/projects/:id` · coquille **Talent** · fragment `project` · `P-13` · resp. **N**

**But** — Un écran, **deux rendus** selon la relation à l'équipe. C'est l'écran où la permission
négative n° 6 se vérifie.

**Accès et rendus**

| Observateur | Ce qu'il voit |
|---|---|
| **Membre** (`OWNER`, `MEMBER`) | Tout : onglets BMC, équipe, candidatures, tâches, discussion, publications, paramètres |
| **Extérieur** | Titre, pitch, secteur, région, état, équipe **pseudonymisée**, postes ouverts, **blocs de BMC explicitement rendus publics**, publications, bouton *Candidater* |
| **Partenaire `RECRUIT`** | Comme extérieur, plus la maturité du BMC, plus *Contacter l'équipe* (un message) — voir UI-45 |
| **Extérieur sur un `DRAFT`** | **404.** Un brouillon n'existe pas pour l'extérieur — pas de 403, qui révélerait son existence |

**Données** — `GET /projects/:id` — la réponse ne contient **que** ce à quoi l'appelant a droit.
Le front ne masque rien : ce qu'il ne reçoit pas n'existe pas pour lui.

**Structure** — En-tête (titre, `ProjectStatusBadge`, secteur, région, `ProjectImpactBadge` si
déclaré, équipe en avatars) · pitch · postes ouverts · BMC public s'il y en a · publications
récentes · actions. Pour un membre : barre d'onglets vers UI-26 à UI-33.

**États** — Chargement · membre · extérieur · partenaire · projet `PAUSED` (bandeau) · `ARCHIVED` (lecture seule, bandeau) · 404 · 403 · erreur.

**Règles**
- L'équipe est affichée **pseudonymisée pour l'extérieur**, révélée entre membres (dévoilement automatique au projet commun, `ConnectionSource.PROJECT`).
- Le bouton *Candidater* est absent pour un membre, pour un candidat en attente, et pour un compte `ALUMNI` (qui ne peut plus candidater) — chaque absence est expliquée plutôt que silencieuse.
- *Signaler* accessible depuis cet écran (UI-23).

**i18n** — `project.overview.*`

**Fait quand** — Un non-membre n'obtient ni tâches, ni canal, ni blocs de BMC privés (permission négative n° 6, testée) · un `DRAFT` renvoie 404 à l'extérieur · l'équipe est pseudonymisée pour l'extérieur.

---

## UI-26 — Business Model Canvas guidé

`/projects/:id/bmc` · coquille **Plein écran** en édition · fragment `project` · `P-02`, `P-03` · resp. **N**

**But** — Structurer la réflexion **et** donner aux partenaires une grille de lecture homogène
de tous les projets. C'est le pilier « structuration » du produit.

**Accès** — Écriture : `OWNER`, `MEMBER`. Lecture publique **bloc par bloc**, selon un réglage
de visibilité par bloc.

**Données** — `GET /projects/:id/bmc` · `PATCH /projects/:id/bmc` (par bloc, sauvegarde
automatique). `blocks` en JSONB, `completion` calculée côté serveur.

**Structure**
- **Mobile — un bloc à la fois.** La grille à 9 cases du BMC classique est illisible sous 768 px : on affiche une liste de 9 cartes, on ouvre celle qu'on remplit, on navigue avec *Précédent / Suivant*. C'est la décision de mise en page la plus importante de cet écran.
- **Bureau** — grille de 9 blocs dans l'ordre de `BMC_BLOCKS`, édition en place.
- Chaque bloc porte : son intitulé, **une explication**, **un exemple contextualisé** (un exemple malgache, concret, pas un extrait de manuel), la zone de saisie, l'état de complétion, le réglage de visibilité publique.
- En-tête permanent : `BmcCompletionMeter` (n/9) + `AutoSaveIndicator`.
- Encart de transition : quand les 9 blocs sont remplis, *Publier le projet* apparaît et déclenche `DRAFT → RECRUITING`.

**États** — Chargement · vide (9 blocs à remplir, avec l'ordre conseillé) · en cours · **enregistrement** · **hors ligne avec brouillon local** · conflit d'édition simultanée · complet · lecture seule (non-membre, ou projet `ARCHIVED`).

**Règles**
- **Sauvegarde automatique obligatoire**, par bloc, après une pause de saisie. Sur une connexion instable, perdre 20 minutes de rédaction signifie ne jamais recommencer (M4).
- Hors ligne : la saisie est conservée localement et envoyée au retour du réseau. Aucun message d'erreur qui donnerait envie de fermer l'onglet.
- Édition simultanée par deux membres : dernier enregistrement gagnant **avec avertissement visible** et conservation de la version écrasée dans l'historique du bloc. Silence sur un écrasement = donnée perdue sans témoin.
- La transition vers `RECRUITING` est refusée tant que la complétion n'est pas atteinte, **et l'écran dit quels blocs manquent** — jamais un bouton grisé sans explication.
- Le réglage de visibilité par bloc est explicite : ce qui est public est marqué comme tel, à côté du bloc.

**i18n** — `project.bmc.*` (les 9 intitulés, 9 explications, 9 exemples)

**Fait quand** — Un bloc se remplit et se sauvegarde seul · une coupure réseau ne perd rien · la grille est utilisable à 360 px · la transition indique les blocs manquants · la visibilité par bloc est respectée par l'API.

---

## UI-27 — Équipe et postes ouverts

`/projects/:id/team` · coquille **Talent** · fragment `project` · `P-04`, `P-08` · resp. **N**

**But** — Constituer et gouverner l'équipe, et dire **quel profil manque**.

**Accès** — Lecture : membres. Administration : `OWNER`.

**Données** — `GET /projects/:id/members` · `POST`/`PATCH`/`DELETE /projects/:id/positions`.

**Structure**
1. **Membres** — `TalentIdentity` **révélé** (dévoilement automatique entre membres), rôle projet (`OWNER`/`MEMBER`), rôle fonctionnel déclaré, date d'entrée. Actions `OWNER` : changer un rôle, retirer un membre (`ConfirmDialog`).
2. **Postes ouverts** — intitulé, description, compétences requises (référentiel), temps attendu, ouvert/fermé. Un poste ouvert alimente le Feed Projets et le Dream-Match.

**États** — Chargement · équipe seule · postes ouverts · aucun poste (« ouvre un poste pour apparaître dans les recherches » — l'action, pas le constat) · erreur.

**Règles**
- Le dernier `OWNER` ne peut pas se retirer : l'écran propose de transmettre la propriété d'abord.
- Retirer un membre ne supprime pas le dévoilement déjà acquis : il est irréversible pour la paire (TR-04). L'écran le dit avant de confirmer.
- Les compétences d'un poste viennent du référentiel — elles sont la donnée d'entrée du matching, pas du texte.

**i18n** — `project.team.*`

**Fait quand** — Le dévoilement entre membres est automatique · le dernier propriétaire ne peut pas se retirer · les postes alimentent le feed et le Dream-Match.

---

## UI-28 — Candidatures reçues

`/projects/:id/applications` · coquille **Talent** · fragment `project` · `P-05`, `P-06`, `P-07` · resp. **N**

**But** — Permettre au porteur de choisir, **et lui rappeler de répondre**. Une candidature sans
réponse est le premier motif d'abandon d'une plateforme de mise en relation (PRJ-04).

**Accès** — `OWNER` du projet.

**Données** — `GET /projects/:id/applications` · `POST /applications/:id/accept` · `/reject`
(avec motif).

**Structure** — File par état (En attente · Acceptées · Refusées), chaque carte portant :
`TalentIdentity` **pseudonymisé tant que la candidature n'est pas acceptée** (TR-04), poste
visé, message, compétences, ancienneté de la candidature.

Actions : *Accepter* (crée le `ProjectMember`, révèle l'identité, ouvre la conversation) ·
*Refuser* avec **motif choisi dans une liste courte** + commentaire facultatif.

**États** — Chargement · file · **vide** (« aucune candidature — vérifie que tes postes ouverts décrivent bien les compétences recherchées », avec lien vers UI-27) · **relance** (bandeau sur les candidatures de plus de `APPLICATION_REMINDER_DAYS` jours : « 3 personnes attendent ta réponse depuis 7 jours ») · traitement · erreur.

**Règles**
- **L'identité du candidat n'est révélée qu'à l'acceptation** — c'est TR-04 appliqué à ce parcours.
- Le refus **exige un motif** : un refus sans motif est ce qui fait qu'on ne recandidate jamais nulle part. Le motif est transmis au candidat.
- La relance automatique du porteur (`P-07`) se voit ici **et** en notification. Elle protège la confiance de tout le monde, pas seulement du candidat.
- Accepter alors qu'aucun poste n'est ouvert reste possible : l'équipe prime sur le formalisme.

**i18n** — `project.applications.*`

**Fait quand** — L'identité n'apparaît qu'après acceptation · le refus porte un motif transmis · la relance apparaît au-delà du délai · l'état vide oriente vers les postes ouverts.

---

## UI-29 — Candidater, et mes candidatures

Dialogue depuis UI-25 · liste sur `/applications` · fragment `project` · `P-05` · resp. **N**

**But** — Rejoindre un projet, et suivre ses candidatures sans avoir à retourner sur chaque
projet.

**Accès** — Talent `ACTIVE` non-membre. **Fermé aux `ALUMNI`** (`architecture.md` §5) et aux
comptes gelés.

**Données** — `POST /projects/:id/applications` · `GET /me/applications` ·
`POST /applications/:id/withdraw`.

**Structure du dialogue** — Poste visé (ou candidature spontanée) · message · rappel de ce que
le porteur verra : **compétences, filière, année, disponibilité — pas le nom**. Cette phrase
n'est pas décorative : elle est ce qui permet de candidater sans se sentir exposé.

**Structure de la liste** — Une ligne par candidature : projet, poste, état, date, motif de refus
s'il y en a un, action *Retirer* tant que l'état est `PENDING`.

**États** — Repos · envoi · succès · **déjà candidaté** (une seule candidature `PENDING` par projet et par personne, contrainte du modèle) · projet fermé au recrutement · non éligible (`ALUMNI`, avec motif) · liste vide · erreur.

**Règles**
- Le motif de refus est affiché au candidat — c'est la contrepartie de l'exigence faite au porteur.
- Retirer une candidature est possible et sans conséquence affichée.
- Aucun classement, aucun score de candidature : hors périmètre (M6).

**i18n** — `project.apply.*` · `project.myApplications.*`

**Fait quand** — Une seule candidature en attente par projet · le retrait fonctionne · le motif de refus est visible · un `ALUMNI` comprend pourquoi il ne peut pas candidater.

---

## UI-30 — Tâches

`/projects/:id/tasks` · coquille **Talent** · fragment `project` · `P-09` · resp. **N**

**But** — Suivre l'exécution. Le minimum utile, pas un gestionnaire de projet.

**Accès** — Membres du projet, uniquement (permission négative n° 6).

**Données** — CRUD sur `/projects/:id/tasks` : titre, description, responsable, échéance, statut
(`TaskStatus`).

**Structure**
- **Mobile — liste groupée par statut.** Pas de tableau kanban à colonnes horizontales : le glisser-déposer sur 360 px est un piège, et le défilement horizontal masque des colonnes entières.
- **Bureau** — quatre colonnes (À faire, En cours, Bloquée, Terminée), déplacement possible.
- Création rapide en une ligne, détail en feuille latérale.
- Filtres : mes tâches · en retard · par responsable.

**États** — Chargement · vide (« ajoute la première tâche » + 3 exemples de départ contextualisés) · liste · **tâches en retard mises en évidence** · enregistrement · erreur · hors ligne (modifications en file).

**Règles**
- Le statut porte un libellé, jamais une couleur seule.
- L'assignation notifie la personne (`M-15`).
- Une échéance proche déclenche une notification ; l'écran ne dépend pas d'elle pour être lisible.
- Hors périmètre du MVP : dépendances entre tâches, jalons, sous-tâches (PRJ-05, V2).

**i18n** — `project.tasks.*`

**Fait quand** — Aucun non-membre n'atteint cet écran · la liste mobile est utilisable sans glisser-déposer · l'assignation notifie · les retards se voient.

---

## UI-31 — Canal de discussion du projet

`/projects/:id/channel` · coquille **Talent** · fragment `messaging` · `P-10` · resp. **Y**

**But** — Garder les décisions dans le projet plutôt que dans WhatsApp. C'est là que les équipes
étudiantes perdent leur mémoire.

**Accès** — Membres uniquement. **Ni l'établissement, ni un partenaire, ni le staff hors
signalement** (permission négative n° 1).

**Données** — Réutilise `Conversation` avec `type = PROJECT` — **un seul modèle de message, un
seul mécanisme de lecture, un seul chemin de signalement** que la messagerie directe.

**Structure** — Identique au fil de UI-21, avec les membres du projet et les mentions.

**Règles** — Celles de UI-21 s'appliquent intégralement. Différences : plusieurs participants,
identités révélées par appartenance au projet, et un membre retiré perd l'accès au canal tout en
conservant le dévoilement déjà acquis.

**i18n** — `project.channel.*`

**Fait quand** — Le canal réutilise strictement les composants de UI-21 · un cadre d'établissement n'y accède pas (permission négative n° 1, testée).

---

## UI-32 — Publications du projet

`/projects/:id/posts` · coquille **Talent** · fragment `project` · `P-11` · resp. **N**

**But** — Le canal par lequel un projet devient visible des partenaires. Alimente le Feed
Projets.

**Accès** — `OWNER`.

**Données** — CRUD sur `/projects/:id/posts` : type (`PostType`), contenu, secteur, expiration.

**Structure** — Composeur (type, contenu, expiration) + liste des publications avec leur portée
et leur date d'expiration.

**Règles**
- Au MVP, seuls `SEEKING_COLLABORATOR` et `UPDATE` sont pertinents : `SEEKING_MENTORSHIP` et `SEEKING_FUNDING` existent dans l'énumération mais **leurs fonctionnalités sont hors périmètre** (mentorat et financement en V2). Ils ne sont pas proposés au composeur — ajouter le type se fera sans changement d'écran.
- Une publication expirée disparaît du feed mais reste visible de l'équipe, avec son état.
- Publier depuis un projet en `DRAFT` est impossible : un brouillon n'a pas de vitrine.

**i18n** — `project.posts.*`

**Fait quand** — Une publication apparaît dans le Feed Projets · l'expiration la retire du feed sans la supprimer · aucun `DRAFT` ne publie.

---

## UI-33 — Paramètres du projet

`/projects/:id/settings` · coquille **Talent** · fragment `project` · `P-01`, `P-12` · resp. **N**

**But** — Piloter l'état du projet, sa visibilité, et **garantir qu'une équipe n'est jamais
prisonnière de la plateforme**.

**Accès** — `OWNER`.

**Structure**
1. Informations générales (titre, pitch, secteur, région, impact féminin déclaré).
2. **État du projet** — les transitions autorisées depuis l'état courant, chacune avec sa condition affichée :

| Transition | Condition |
|---|---|
| `DRAFT → RECRUITING` | BMC complet (D6) — sinon, **les blocs manquants sont listés** |
| `RECRUITING → ACTIVE` | Équipe constituée |
| `ACTIVE → RECRUITING` | Nouveau poste ouvert |
| `* → PAUSED` | Aucune |
| `* → ARCHIVED` | `ConfirmDialog` avec confirmation saisie |

3. **Visibilité des blocs de BMC**, récapitulée ici en plus de UI-26.
4. **Export du projet** (`P-12`) — archive complète : BMC, tâches, membres, publications. Asynchrone, notifié, lien expirant.
5. Transmission de la propriété.

**Règles**
- Une transition impossible n'est pas un bouton grisé : elle affiche **ce qui manque**.
- L'archivage est réversible tant que rien n'est supprimé ; l'écran le dit pour éviter la peur du bouton.
- L'export est un engagement de gouvernance, pas une option de confort : si un établissement quitte la plateforme, ses étudiants perdent le badge de certification, **jamais leurs données ni leurs projets** (PRJ-12). L'écran porte cette phrase.

**i18n** — `project.settings.*`

**Fait quand** — Chaque transition affiche sa condition · l'export produit une archive complète · l'archivage demande une confirmation saisie · la garantie de portabilité est écrite à l'écran.
