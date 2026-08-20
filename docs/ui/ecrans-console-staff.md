# Écrans — console staff CoFound (UI-49 → UI-55)

**Tickets couverts** : `B-02`, `S-01` à `S-05`, `ADM-02`, `ADM-05`, `ADM-06`
**Bloc de périmètre** : M12 (modération), M13 (socle) · **Utilisateurs : l'équipe fondatrice**

> **Voix : vouvoiement, ton sobre.** Ces écrans servent à décider et à sanctionner ; ils ne
> cherchent ni à séduire ni à rassurer.
>
> Au lancement, il n'y a **aucun modérateur dédié** : l'équipe fondatrice assure une permanence
> (`R10`). Ces écrans doivent donc être utilisables par quelqu'un qui n'y passe pas ses
> journées — chaque décision porte son contexte, rien ne suppose une habitude.

---

## UI-49 — Organisations et capacités

`/staff/organizations` · coquille **Console** · fragment `staff` · `B-02` · resp. **R**

**But** — Valider les demandes d'accès et accorder les capacités **une par une** (ADM-01). C'est
la porte d'entrée du côté qui paie et du côté qui certifie : rien n'y est automatique.

**Accès** — `SUPER_ADMIN`.

**Données** — `GET /staff/organization-requests` · `POST .../approve` · `/reject` ·
`POST /organizations/:id/capabilities` · `DELETE …`.

**Structure**
1. **File des demandes** (UI-05) : entité, type, pays, contact, pièces, date. Détail avec les pièces consultables.
2. Décision : *Approuver* (crée l'organisation et le compte du premier cadre) ou *Refuser* avec motif.
3. **Octroi des capacités**, une case par capacité, chacune avec ce qu'elle débloque :

| Capacité | Ce qu'elle débloque | Restriction |
|---|---|---|
| `CERTIFY_AFFILIATION` | Import, affiliations, annuaire | **Organisations de type `INSTITUTION` uniquement** (D4) — l'interface l'interdit, la base aussi |
| `PUBLISH_OPPORTUNITY` | Publication d'appels à candidatures | — |
| `RECRUIT` | Recherche de projets et de talents, contact | — |

Les capacités `MENTOR`, `FUND`, `SURVEY`, `ANALYTICS` sont **affichées comme non activables au
MVP**, pas masquées : le staff doit savoir qu'elles existent et qu'elles ne sont pas oubliées.

**Règles**
- **Chaque octroi est audité** avec son auteur et sa date (`OrganizationCapability.granted_by`).
- Accorder `CERTIFY_AFFILIATION` à une organisation qui n'est pas un établissement est impossible — c'est ce qui protège la valeur du badge.
- Le retrait d'une capacité annonce ses conséquences avant confirmation.

**i18n** — `staff.organizations.*`

**Fait quand** — Une capacité s'accorde et se retire individuellement · `CERTIFY_AFFILIATION` est refusée hors `INSTITUTION` · chaque décision est auditée.

---

## UI-50 — Supervision des imports

`/staff/imports` · `ADM-02` · resp. **R**

**But** — Le support de premier niveau des établissements. Quand un import échoue, c'est ici
qu'on comprend pourquoi avant que l'établissement n'appelle.

**Accès** — `OPS_ADMIN`.

**Données** — `GET /staff/imports` — tous les lots, toutes organisations confondues.

**Structure** — `DataList` : organisation, date, auteur, état, compteurs, taux d'erreur, taux
d'activation depuis. Filtres : organisation, état, période, **lots à taux d'erreur anormal**.
Détail identique à UI-36, en lecture, avec le diagnostic technique en plus.

**Règles**
- Le staff **diagnostique et relance**, il ne modifie pas les données d'un établissement à sa place.
- Toute action sur un lot d'une autre organisation est auditée.
- Le taux d'activation par lot est la mesure du risque `R4` (« comptes créés, jamais activés ») : **il est en tête de l'écran**, pas enfoui dans un détail.

**i18n** — `staff.imports.*`

**Fait quand** — Un lot en échec est diagnosticable sans accès à la base · le taux d'activation est visible par lot · toute action est auditée.

---

## UI-51 — File de modération

`/staff/moderation` · `S-01` · resp. **R**

**But** — Traiter les signalements dans un ordre défendable, en 24–48 h (TR-08).

**Accès** — `MODERATOR`.

**Données** — `GET /staff/reports?filters` — file priorisée, avec assignation.

**Structure** — `DataList` : priorité, motif, type d'objet, date, ancienneté, personne assignée,
état. Filtres : priorité, motif, état, assignation. Tri par défaut : **priorité, puis
ancienneté**. Bandeau d'alerte sur tout signalement approchant les 48 h.

**Règles**
- Les motifs critiques (`CRITICAL_REPORT_REASONS`) apparaissent en tête et signalent le **gel automatique déjà appliqué** — le modérateur doit savoir que la personne est déjà gelée avant de décider.
- L'assignation évite le double traitement : un signalement pris est marqué comme tel.
- **Le délai annoncé aux utilisateurs (48 h) est affiché ici aussi.** Une équipe qui ne voit pas sa propre promesse la tient moins bien.

**i18n** — `staff.moderation.*`

**Fait quand** — La priorisation est visible et défendable · le gel automatique est signalé · aucun signalement ne dépasse silencieusement 48 h.

---

## UI-52 — Détail d'un signalement et décision

`/staff/moderation/:id` · `S-02`, `S-03`, `S-04` · resp. **R**

**But** — Décider en connaissance de cause, avec une traçabilité complète. C'est l'écran le plus
sensible de la console : c'est le seul endroit du produit où du contenu privé s'ouvre.

**Accès** — `MODERATOR`.

**Données** — `GET /staff/reports/:id` — signalement, contexte de l'objet visé, historique des
deux personnes, décisions passées. **L'accès aux identités et aux conversations est journalisé
au moment de l'ouverture** (`S-04`, TR-10).

**Structure**
1. Le signalement : motif, description, date, signalant.
2. **L'objet visé, en contexte** : le message avec les échanges qui l'entourent, le profil, le projet, la publication.
3. Historique des deux comptes : signalements antérieurs, sanctions passées.
4. **Bandeau permanent : « votre consultation de ces éléments est enregistrée dans le journal d'audit »** — visible avant l'ouverture du contenu, pas après.
5. Décision : `WARNING` · `FREEZE` (avec durée) · `DISABLE` · `CONTENT_REMOVED` · **classement sans suite**, avec motif obligatoire dans tous les cas.

**Règles**
- **L'accès du modérateur à une identité ou à une conversation est journalisé, systématiquement, sans exception** (`architecture.md` §5). C'est la seule brèche autorisée dans le pseudonymat, et son prix est la traçabilité intégrale.
- **Même ici, le genre n'est pas lisible** (permission négative n° 4) : aucun rôle, staff compris, ne lit le genre d'un individu.
- Toute sanction passe par `ConfirmDialog` avec **confirmation saisie**.
- Le classement sans suite exige un motif, comme une sanction : une file qui se vide sans trace n'est pas une modération.
- **Le signalant est notifié de la décision** (`S-03`) — c'est ce qui distingue un bouton *Signaler* d'une promesse tenue.

**i18n** — `staff.moderation.detail.*`

**Fait quand** — Chaque ouverture de contenu privé écrit une ligne d'audit · le bandeau apparaît avant le contenu · le genre reste inaccessible · le signalant reçoit la décision · toute sanction est confirmée par saisie.

---

## UI-53 — Journal d'audit

`/staff/audit` · `S-05`, `ADM-04` · resp. **R**

**But** — Répondre à « qui a fait ça, quand, et pourquoi ». Indispensable dès qu'on certifie,
qu'on modère et qu'on gèle des comptes.

**Accès** — `SUPER_ADMIN`.

**Données** — `GET /staff/audit?filters` — **lecture seule, sans exception**.

**Structure** — `DataList` : horodatage, acteur, rôle, action, type et identifiant d'objet,
adresse IP, métadonnées dépliables. Filtres : acteur, action, type d'objet, période.
Export CSV — **lui-même audité**.

**Règles**
- **Aucune modification, aucune suppression, aucune action de masse.** L'écran n'expose que la lecture, en cohérence avec les droits SQL restreints (`modele-de-donnees.md` §7).
- Les actions tracées obligatoirement : import d'étudiants, changement de statut, certification, gel/dégel, décision de modération, **accès aux identités par un modérateur**, changement de capacité d'organisation, export de données.
- Les métadonnées ne doivent jamais faire réapparaître une donnée privée : le journal enregistre **qu'un accès a eu lieu**, pas le contenu consulté.

**i18n** — `staff.audit.*`

**Fait quand** — Aucun bouton d'écriture n'existe · les huit actions obligatoires apparaissent · l'export est lui-même journalisé · aucune donnée privée ne transite par les métadonnées.

---

## UI-54 — Référentiels

`/staff/reference-data` · `S-05`, `ADM-05` · resp. **R**

**But** — Ajouter une filière, une compétence, un secteur ou une région **sans déploiement**.
C'est la condition posée à l'extension panafricaine, et la contrepartie de la règle « aucun
référentiel en dur ».

**Accès** — `SUPER_ADMIN`.

**Données** — CRUD sur `/staff/reference-data/:kind` — `Skill`, `Field`, `Sector`, `Region`.

**Structure** — Onglet par référentiel · `DataList` : libellé, `slug`, `label_key`, catégorie,
actif, ordre d'affichage, **nombre d'usages** · création, modification, activation/désactivation,
réordonnancement.

**Règles**
- **On désactive, on ne supprime pas** : une compétence supprimée casserait les profils qui la référencent. `is_active = false` la retire des sélecteurs sans toucher à l'existant, et l'écran l'explique.
- Créer une entrée crée une **clé i18n**, pas un libellé : l'écran demande la clé et la traduction française, et signale les traductions manquantes pour les autres langues (`SUPPORTED_LOCALES`).
- Le nombre d'usages est affiché avant toute désactivation.

**i18n** — `staff.referenceData.*`

**Fait quand** — Ajouter une filière ne demande aucun déploiement · rien n'est supprimable · les entrées créées portent une clé i18n · les usages sont visibles avant désactivation.

---

## UI-55 — Santé produit

`/staff/health` · `ADM-06` · resp. **R**

**But** — Savoir si le produit fonctionne, au sens produit et non au sens serveur. Version
réduite au MVP.

**Accès** — `OPS_ADMIN`.

**Données** — `GET /staff/health` — agrégats plateforme.

**Indicateurs du MVP** — **taux d'activation** (mesure de `R4`, en tête) · complétion moyenne des
profils · projets créés par état · taux de mise en relation acceptée · **délai médian de réponse
aux candidatures** (mesure la promesse de PRJ-04) · volume et délai de traitement de la
modération · taux de rebond des invitations (mesure de `R1`).

**Structure** — Cartes `AggregateMetric` + graphiques d'évolution — **`recharts` chargé
paresseusement dans le seul fragment `staff`** (`design-system.md` §8).

**Règles**
- **Aucune donnée nominative**, jamais : cet écran ne descend pas à l'individu.
- Seuil d'agrégation appliqué comme partout (`MIN_AGGREGATION_THRESHOLD`).
- **Aucun indicateur de mixité ici** : la mixité se lit dans la console de l'établissement concerné, sur ses propres affiliés, au-dessus du seuil (D8).
- Les séries temporelles et les cohortes sont explicitement V2 (`ANA-01`) : ne pas les anticiper avec des graphiques vides.

**i18n** — `staff.health.*`

**Fait quand** — Le taux d'activation est visible dès le premier jour · aucun agrégat sous le seuil · aucune donnée nominative · `recharts` absent du paquet initial.
