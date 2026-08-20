# Écrans — console partenaire (UI-41 → UI-48)

**Tickets couverts** : `B-03` à `B-10`
**Bloc de périmètre** : M11 — **c'est le côté qui paie** (D2) · **Persona : Miora**

> **Voix : vouvoiement.** Cette console est vue par des incubateurs, des entreprises et des
> institutions publiques : c'est la surface commerciale du produit.
>
> Hypothèse de monétisation en cours de validation (`PAR-02`) : **consulter est gratuit,
> contacter et publier sont payants.** L'interface ne doit donc jamais mélanger les deux : ce
> qui se paie doit être identifiable.

---

## UI-41 — Vue d'ensemble

`/partner` · coquille **Console** · fragment `partner` · `B-03` · resp. **N**

**But** — Reprendre là où on s'était arrêté : le suivi, les candidatures à traiter, les
opportunités en cours.

**Accès** — `ORG_MEMBER` d'une organisation vérifiée.

**Données** — `GET /partner/overview` : liste de suivi, candidatures reçues en attente,
opportunités actives, nouveaux projets correspondant aux secteurs d'intérêt.

**Structure** — Bandeau d'état de vérification si elle est incomplète · projets suivis récemment
mis à jour · candidatures à traiter · opportunités et leur échéance · nouveaux projets dans les
secteurs déclarés.

**États** — Chargement · **organisation en attente de vérification** (accès en lecture seule, avec ce qu'il manque et qui contacter) · premier usage (guide vers la recherche de projets) · usage courant · erreur.

**Règles**
- Les capacités absentes ne sont pas des boutons grisés : la section correspondante n'existe pas, et un encart explique comment l'obtenir.
- Aucun agrégat écosystème : l'analytique de marché est explicitement hors MVP (`PAR-08`, V2). Un chiffre faux vendu à un ministère coûte plus cher que l'absence de chiffre.

**i18n** — `partner.overview.*`

**Fait quand** — Une organisation non vérifiée comprend son état · aucune capacité non accordée n'est suggérée comme disponible · aucun agrégat écosystème.

---

## UI-42 — Profil de l'organisation

`/partner/profile` · `B-03` · resp. **N**

**But** — Le profil vérifié qui donne du poids au contact. Un étudiant contacté par une
structure inconnue ne répond pas.

**Accès** — `ORG_ADMIN` en écriture, autres rôles en lecture.

**Données** — `GET`/`PATCH /organizations/:id` : raison sociale, type, pays, région, logo,
description, secteurs d'intérêt, site, contacts, pièces justificatives, statut de vérification.

**Structure** — Formulaire par sections · **aperçu « comment les étudiants vous voient »**, avec
le même composant que celui utilisé côté talent · état de vérification et ce qui reste à
fournir · capacités accordées, en lecture seule.

**Règles**
- **Les capacités ne sont jamais modifiables ici.** Elles sont accordées une par une par le staff (UI-49, ADM-01). L'écran les affiche avec leur date d'octroi.
- Le badge de vérification est distinct de la certification d'affiliation : **seul un établissement certifie** (D4). Deux libellés différents, jamais confondus.
- Modifier les informations légales repasse l'organisation en vérification, et l'écran le dit avant.

**i18n** — `partner.profile.*`

**Fait quand** — Les capacités sont en lecture seule · l'aperçu correspond à la vue réelle des étudiants · les deux badges ne sont pas confondus.

---

## UI-43 — Recherche de projets (dealflow)

`/partner/projects` · `B-04` · resp. **N**

**But** — **La fonction pour laquelle le partenaire paiera.** L'écran le plus important de cette
console.

**Accès** — Capacité `RECRUIT`.

**Données** — `GET /partner/projects?filters` — projections publiques, **jamais d'identité de
personne** (permission négative n° 5).

**Filtres** — Secteur · état · région · établissement · **maturité du BMC** (`completion`, filtre
qui n'existe nulle part ailleurs) · taille d'équipe · **pluridisciplinarité de l'équipe** ·
postes ouverts · impact féminin déclaré du projet.

**Structure** — `FilterBar` + liste de `ProjectCard` en variante `partner` (maturité du BMC
visible) · tri par date ou par maturité · enregistrement d'une recherche dans la liste de suivi.

**États** — Chargement · résultats · **vide** (au lancement, l'état probable : dire honnêtement que la plateforme démarre, proposer d'élargir les filtres et de publier une opportunité pour attirer des candidatures) · vide après filtrage · erreur.

**Règles**
- **La pluridisciplinarité est un filtre de premier plan** : c'est la promesse commerciale du produit (« des équipes complémentaires »), et elle doit être vérifiable, pas seulement affirmée.
- Aucune identité de membre d'équipe, quel que soit le filtre. Les équipes sont pseudonymisées jusqu'au dévoilement (permission négative n° 5).
- Aucune facette de genre, y compris pour mesurer la mixité d'une équipe : la mixité se lit en agrégat, jamais projet par projet (D8).

**i18n** — `partner.search.*`

**Fait quand** — La maturité du BMC filtre réellement · aucune identité n'est atteignable · aucune facette de genre · l'état vide est honnête sur la phase de démarrage.

---

## UI-44 — Liste de suivi et notes internes

`/partner/watchlist` · `B-05` · resp. **N**

**But** — Suivre un dealflow dans la durée, sans tableur parallèle.

**Accès** — Capacité `RECRUIT`. **Les notes sont privées à l'organisation.**

**Données** — `GET`/`POST`/`DELETE /partner/watchlist` · notes internes rattachées à un projet.

**Structure** — Liste des projets suivis avec leur évolution depuis le dernier passage (état,
maturité du BMC, nouveaux membres) · note interne par projet · retrait du suivi.

**Règles**
- **Les notes internes ne sont jamais visibles de l'équipe du projet.** L'écran le dit à côté du champ : c'est la condition pour qu'elles soient utilisées franchement.
- Elles sont visibles des autres cadres de la même organisation — l'écran le dit aussi.
- Retirer un projet du suivi supprime les notes après confirmation.

**i18n** — `partner.watchlist.*`

**Fait quand** — Les notes sont invisibles de l'équipe suivie · la portée des notes est écrite à l'écran · les évolutions depuis le dernier passage sont visibles.

---

## UI-45 — Fiche projet, vue partenaire

`/partner/projects/:id` · `B-04`, `B-09` · resp. **N**

**But** — Lire un projet **avec une grille de lecture homogène** : c'est ce que le BMC apporte
au partenaire.

**Accès** — Capacité `RECRUIT`.

**Données** — `GET /projects/:id` avec le contexte partenaire — blocs de BMC publics uniquement,
équipe pseudonymisée, aucun accès aux tâches ni au canal (permission négative n° 6).

**Structure** — En-tête (titre, état, secteur, région, maturité du BMC) · pitch · **BMC public,
bloc par bloc** · équipe pseudonymisée avec compétences et filières · postes ouverts ·
publications · actions : *Suivre* · *Contacter l'équipe* (UI-47) · *Signaler*.

**Règles**
- Les blocs de BMC non publiés par l'équipe **ne sont pas affichés en grisé** : ils sont absents. Montrer l'existence d'un contenu qu'on n'a pas le droit de lire est une fuite d'information de forme.
- Ni tâches, ni canal, ni budget : hors du droit d'un partenaire (permission négative n° 6).
- La pluridisciplinarité de l'équipe est affichée par les **filières**, jamais par les personnes.

**i18n** — `partner.projectDetail.*`

**Fait quand** — Aucun bloc privé n'est deviné · aucune identité n'apparaît · tâches et canal sont inatteignables (permission négative n° 6, testée).

---

## UI-46 — Recherche de talents

`/partner/talents` · `B-10` · resp. **N**

**But** — Sourcing pour stage, alternance, programme.

**Accès** — Capacité `RECRUIT`. **Profils pseudonymisés exclusivement** (PAR-03).

**Données** — `GET /talents?filters` — **le même endpoint que le Feed Talents** (UI-14), avec les
mêmes projections. Un endpoint distinct pour les partenaires créerait un second chemin à
sécuriser, donc un second chemin à oublier.

**Structure** — Identique à UI-14, avec le bloc de contact partenaire.

**Règles**
- **Un seul message de contact par talent** (`PARTNER_CONTACT_MESSAGE_LIMIT = 1`), sans relance possible. La limite est annoncée **avant** l'envoi : on ne vend pas le droit de harceler.
- Le contact suit le même protocole de consentement que pour un talent (TAL-05) : sans réponse, rien ne se passe, et le partenaire voit *sans réponse*.
- Aucune facette de genre. Aucune identité avant dévoilement.

**i18n** — `partner.talentSearch.*`

**Fait quand** — Le même endpoint et les mêmes composants qu'UI-14 sont utilisés · la limite d'un message est appliquée côté serveur et annoncée côté client · aucune identité n'apparaît.

---

## UI-47 — Contacter une équipe ou un talent

Dialogue depuis UI-45 et UI-46 · `B-09` · resp. **N**

**But** — Ouvrir une relation, une seule fois, proprement.

**Données** — `POST /partner/contacts` : cible (projet ou talent), message.

**Structure du dialogue** — Rappel de la cible · **avertissement explicite : « vous disposez
d'un seul message pour ce projet, sans relance possible »** · zone de message · aperçu de la
signature (organisation, cadre, badge de vérification) · envoi.

**États** — Repos · envoi · succès · **quota déjà utilisé** (l'écran montre le message déjà envoyé et sa date — jamais un simple refus) · cible ayant bloqué l'organisation · erreur.

**Règles**
- La signature affiche **l'organisation vérifiée**, pas seulement la personne : c'est ce qui donne son poids au message et permet à l'étudiant de décider en connaissance de cause.
- L'absence de réponse n'est jamais présentée comme un refus (TAL-05).
- La limite est appliquée **côté serveur**. Le client la rappelle, il ne la garantit pas.

**i18n** — `partner.contact.*`

**Fait quand** — Un second message est impossible et l'écran montre le premier · la signature porte l'organisation vérifiée · l'absence de réponse n'est jamais un refus.

---

## UI-48 — Opportunités et candidatures reçues

`/partner/opportunities` · `/partner/opportunities/:id` · `B-06`, `B-07`, `B-08` · resp. **N**

**But** — Publier un appel à candidatures et traiter ce qui revient. **Partagé avec la console
établissement (UI-40)** : une seule entité typée (D10), un seul écran.

**Accès** — Capacité `PUBLISH_OPPORTUNITY`.

**Données** — CRUD sur `/opportunities` · `GET /opportunities/:id/applications` ·
`POST /opportunity-applications/:id/decide`.

**Structure**
- **Liste** : opportunités publiées, état, échéance, nombre de candidatures, brouillons.
- **Composition** (`StepForm`) : type (au MVP, seul `CALL_FOR_APPLICATIONS` est proposé) · titre · description · critères d'éligibilité · dates · lieu ou distanciel · places · pièces demandées · **aperçu tel que les étudiants le verront**, avant publication.
- **Candidatures reçues** : `DataList` — candidat (**talent pseudonymisé** ou **projet**), message, pièces, date, état. Actions : présélectionner, accepter, refuser avec motif.

**Règles**
- L'identité d'un candidat talent **n'est révélée qu'à l'acceptation**, exactement comme pour une candidature de projet (TR-04). Un appel à candidatures n'est pas une dérogation au pseudonymat.
- Un refus porte un motif, transmis au candidat.
- Le type d'opportunité est lu depuis l'énumération : activer `CONTEST` ou `EVENT` en V2 doit être de la configuration, pas du développement (D10).
- L'aperçu avant publication est obligatoire : une opportunité mal rédigée envoyée à toute la communauté ne se rattrape pas.

**i18n** — `opportunity.manage.*` (**partagé** avec UI-40)

**Fait quand** — Le code est strictement partagé avec UI-40 · l'identité n'apparaît qu'à l'acceptation · ajouter un type ne demande qu'une clé de traduction · l'aperçu existe.
