# Écrans — découverte, Dream-Match et opportunités (UI-13 → UI-19)

**Tickets couverts** : `M-01` à `M-08`, `B-07`
**Bloc de périmètre** : M5 (deux feeds, recherche, Dream-Match), M11 (opportunités)

> Les trois surfaces de découverte sont **non redondantes** (TR-06) : le Dream-Match pousse peu
> de résultats scorés et expliqués, les feeds tirent beaucoup de résultats antéchronologiques,
> la recherche répond à une intention précise. Ne jamais fusionner l'une dans l'autre.

---

## UI-13 — Feed Projets

`/projects` · coquille **Talent** · fragment `discovery` · `M-02`, `M-03` · resp. **N**

**But** — Le marché : ce qui bouge, ce qui recrute. C'est aussi la vitrine que les partenaires
consultent.

**Accès** — Tout compte connecté, hors `FROZEN`.

**Données** — `GET /projects?filters&cursor` — projections publiques uniquement. Les projets en
`DRAFT` **ne sont jamais renvoyés** à quelqu'un d'extérieur à l'équipe.

**Structure (mobile d'abord)**
1. En-tête : titre, accès à la recherche, accès aux filtres (feuille latérale sur mobile).
2. Jetons de filtres actifs, retirables.
3. Liste verticale de `ProjectCard`, pagination par curseur (*Charger la suite*, pas de défilement infini : sur un réseau instable, le défilement infini empêche de revenir où on en était).
4. Bureau : colonne latérale droite avec *Suggestions du Dream-Match* (3 max) et *Opportunités en cours*.

**Filtres** — Secteur · état (`RECRUITING`, `ACTIVE`) · région · compétence recherchée · postes ouverts uniquement · établissement · **impact féminin déclaré du projet**. Tri : antéchronologique **uniquement** — aucun classement algorithmique en V1 (D9), et l'écran ne propose donc pas de sélecteur de tri qui laisserait croire le contraire.

**Composants** — `ProjectCard`, `FilterBar`, `EmptyState`, `SkeletonCard`, `Pagination`.

**États**
- Chargement : squelettes de cartes, pas de tourniquet.
- **Vide (aucun projet)** : au lancement, c'est l'état par défaut. Message : « aucun projet publié pour l'instant » + **action : *Crée le tien* et *Complète ton profil pour être trouvé***.
- **Vide après filtrage** : distinct, avec réinitialisation.
- Erreur, hors ligne (dernière page en cache, bandeau).

**Règles**
- L'auteur d'un projet passe par `TalentIdentity` — correction `C2`.
- `sector` vient du référentiel — correction `C3`.
- Aucun badge de genre sur une personne ; le badge d'impact est **au projet** (correction `C1`).
- Poids de page < 300 Ko données comprises (`architecture.md` §6) : pas d'image de couverture par projet en V1.

**i18n** — `discovery.projectFeed.*`

**Fait quand** — Les filtres sont dans l'URL et survivent au rechargement · les deux états vides sont distincts et proposent une action · aucun `DRAFT` visible de l'extérieur · budget de page respecté.

---

## UI-14 — Feed Talents

`/talents` · coquille **Talent** · fragment `discovery` · `M-04` · resp. **N**

**But** — Être trouvé sans avoir à chercher (TAL-07), et trouver « un designer disponible ».

**Accès** — Talents connectés · partenaires avec `RECRUIT`. **Ne contient que les profils en
opt-in** (`visible_in_talent_feed`), et **jamais les comptes `LEAVING`**.

**Données** — `GET /talents?filters&cursor` → liste de `TalentView` **toujours non révélées**.
L'endpoint ne joint pas `TalentIdentity`, quel que soit l'appelant.

**Structure** — Identique à UI-13, avec des `TalentCard`. Un encart d'en-tête indique à la
personne si **elle-même** est visible dans ce feed, avec un lien direct vers le réglage : le
feed est le meilleur endroit pour rappeler qu'on n'y est pas.

**Filtres** — Compétence · filière · année · disponibilité minimale · établissement · secteur d'intérêt. **Aucune facette de genre, jamais** (TR-07).

**États** — Chargement · vide (« sois le premier à te rendre visible » + activation en un geste) · vide après filtrage · non éligible (profil < 60 % : message + lien vers l'onboarding) · erreur · hors ligne.

**Règles**
- Toutes les cartes sont pseudonymisées, sans exception, **y compris pour un partenaire** (permission négative n° 5).
- L'opt-in est révocable à tout moment, et le feed le rappelle.
- Un partenaire consultant ce feed dispose d'**un seul message de contact** par talent (`PARTNER_CONTACT_MESSAGE_LIMIT`) : la limite est annoncée avant, pas après.

**i18n** — `discovery.talentFeed.*`

**Fait quand** — Aucun profil non opt-in ni `LEAVING` ne remonte · aucune facette de genre n'existe · les cartes sont identiques pour un talent et pour un partenaire.

---

## UI-15 — Recherche

`/search?q=` · coquille **Talent** · fragment `discovery` · `M-01` · resp. **N**

**But** — Répondre à une intention précise, là où les feeds répondent à « qu'est-ce qui bouge ».

**Données** — `GET /search?q&type` — recherche PostgreSQL `tsvector` + `pg_trgm` + `unaccent`.
Trois portées : projets, talents, opportunités.

**Structure** — Champ de recherche persistant · onglets par portée avec compteurs · résultats
réutilisant `ProjectCard` / `TalentCard` · filtres de la portée active.

**États** — Vide initial (**propositions utiles** : compétences les plus recherchées, secteurs actifs — pas un écran blanc) · recherche en cours · aucun résultat (avec suggestions de correction) · erreur · hors ligne.

**Règles**
- La recherche est **tolérante aux accents et aux fautes** — indispensable sur des noms de filières et de compétences saisis au clavier mobile.
- **Une recherche n'expose jamais un champ masqué, y compris via un filtre** (TR-07) : pas de recherche par nom sur un profil non dévoilé, pas de facette de genre.
- Antirebond de 300 ms, requête annulable, jamais une requête par frappe.

**i18n** — `discovery.search.*`

**Fait quand** — « telecom » trouve « Télécom » · aucun champ privé n'est atteignable par la recherche ou par un filtre · l'état initial propose quelque chose.

---

## UI-16 — Profil Dream-Match

`/dream-match/profile` · coquille **Talent** · fragment `discovery` · `M-05` · resp. **R**

**But** — Décrire **le collaborateur recherché**, pas ce qu'on est (TAL-03). C'est la donnée
d'entrée du scoring.

**Accès** — Talents `ACTIVE` dont le profil atteint `MIN_PROFILE_COMPLETION`.

**Données** — `GET`/`PUT /me/dream-match` → `DreamMatchProfile` + `DreamMatchSkill`.

**Structure** — Formulaire court, une colonne :
1. Compétences recherchées avec **importance** (3 niveaux) — `ReferenceCombobox`.
2. Disponibilité minimale attendue.
3. Taille d'équipe souhaitée.
4. Préférence d'établissement : `SAME` / `ANY` / `OTHER`.
5. Secteurs.
6. Encart explicatif : **comment le score est calculé**, en une phrase par facteur, avant même d'avoir des résultats.

**Règles**
- L'encart explicatif est obligatoire : l'explicabilité est un argument commercial (D9), et elle commence avant les résultats.
- Aucun champ de genre, aucune préférence dérivée du genre (D8).
- Modifier ce profil invalide les suggestions en cache et le dit.

**i18n** — `matching.profile.*`

**Fait quand** — Un profil incomplet renvoie vers l'onboarding avec ce qui manque · aucune donnée de genre n'entre dans le formulaire · les facteurs sont expliqués avant les résultats.

---

## UI-17 — Suggestions Dream-Match

`/dream-match` · coquille **Talent** · fragment `discovery` · `M-06`, `M-07`, `M-08` · resp. **R**

**But** — Répondre à « je ne sais pas qui chercher », et traiter le problème n° 2 du cahier des
charges : *tout mon entourage a exactement mon profil*.

**Accès** — Talents `ACTIVE`, profil ≥ 60 %, profil Dream-Match renseigné. **Fermé aux comptes
`LEAVING`** (`architecture.md` §5).

**Données** — `GET /me/matches` → liste de `TalentView` **non révélées** + score + **facteurs
explicatifs** + `POST /me/matches/:id/dismiss`.

**Structure** — Peu de résultats (10 au maximum), une carte par suggestion :
1. `TalentCard` pseudonymisée.
2. **Bloc « proposé parce que »** — les facteurs, en toutes lettres :

| Facteur | Formulation affichée |
|---|---|
| Couverture des compétences recherchées | « 3 des compétences que tu cherches » |
| **Complémentarité** | « filière complémentaire à la tienne » |
| **Recouvrement** (malus) | « peu de recouvrement avec tes propres compétences » |
| Disponibilité | « disponibilité compatible » |
| Objectifs | « objectifs entrepreneuriaux alignés » |
| Secteur | « intéressé par le même secteur » |

3. Actions : *Demander un contact* · *Pas intéressé* (exclusion durable, `M-08`).

**États** — Chargement · suggestions · **aucune suggestion** (le plus probable au lancement : expliquer que la population est encore petite, proposer d'élargir les critères et de consulter le Feed Talents — jamais laisser croire que personne ne correspond) · profil incomplet · erreur.

**Règles**
- **Le score numérique n'est pas affiché.** Un « 78 % de compatibilité » ne veut rien dire pour la personne et invite à comparer des chiffres arbitraires. Les facteurs, eux, se comprennent et se vérifient.
- Les facteurs sont **toujours** affichés — une suggestion sans explication est une boîte noire, ce que le produit refuse (D9).
- Aucun signal comportemental, aucune donnée de genre n'entre dans le calcul, et l'écran le dit dans une note de bas de liste.
- *Pas intéressé* exclut durablement, sans notifier la personne concernée.

**i18n** — `matching.suggestions.*`

**Fait quand** — Chaque suggestion affiche ses facteurs · aucun score numérique · l'état vide est constructif · aucune donnée de genre ni signal comportemental.

---

## UI-18 — Opportunités

`/opportunities` · coquille **Talent** · fragment `discovery` · `B-06`, `B-07` · resp. **N**

**But** — Le canal par lequel un partenaire ou un établissement s'adresse à toute la communauté.

**Accès** — Tout compte connecté.

**Données** — `GET /opportunities?filters` — au MVP, **seul le type `CALL_FOR_APPLICATIONS` est
activé** (D10), mais l'interface affiche le type : activer un second type ne doit demander
aucune modification d'écran.

**Structure** — Liste de cartes : organisation émettrice (avec badge de vérification), type,
titre, échéance, places, éligibilité résumée. Filtres : secteur, échéance, type, émetteur.

**États** — Chargement · vide (« aucune opportunité ouverte pour l'instant » + proposition de notification à la prochaine publication) · vide après filtrage · erreur.

**Règles**
- Une échéance dépassée n'est pas masquée : elle est marquée *Clôturée*, avec la candidature désactivée. Faire disparaître une opportunité fait douter de l'avoir rêvée.
- Le type est rendu par un libellé traduit issu de l'énumération, jamais codé en dur écran par écran.

**i18n** — `opportunity.list.*`

**Fait quand** — Ajouter un type d'opportunité ne demande qu'une clé de traduction · les opportunités clôturées restent visibles et clairement marquées.

---

## UI-19 — Détail d'une opportunité et candidature

`/opportunities/:id` · coquille **Talent** · fragment `discovery` · `B-07` · resp. **N**

**But** — Comprendre, vérifier son éligibilité, candidater — en tant que **personne ou en tant
que projet** (`ApplicantType`).

**Accès** — Tout compte connecté en lecture. Candidature fermée aux comptes `ALUMNI`
(`architecture.md` §5) et aux comptes gelés.

**Données** — `GET /opportunities/:id` · `POST /opportunities/:id/applications`.

**Structure**
1. En-tête : organisation, type, titre, échéance avec compte à rebours, places.
2. Description, critères d'éligibilité, pièces demandées.
3. **Bloc de candidature** : choix *Je candidate en mon nom* / *au nom d'un projet* (liste des projets dont on est `OWNER`), message, pièces jointes.
4. État de sa propre candidature s'il y en a une.

**États** — Chargement · ouverte · **clôturée** · déjà candidaté (état affiché, retrait possible) · non éligible (motif) · envoi · succès · erreur · 404.

**Règles**
- Candidater au nom d'un projet demande d'être `OWNER` de ce projet ; la liste ne propose rien d'autre.
- Les pièces jointes passent par `FileDropzone` (liste blanche, redimensionnement côté client, URL présignée).
- L'état de sa candidature est visible **ici et dans `/applications`** — deux entrées, une seule source.

**i18n** — `opportunity.detail.*`

**Fait quand** — Les deux types de candidature fonctionnent · une opportunité clôturée n'accepte plus rien et le dit · le retrait est possible avant l'échéance.
