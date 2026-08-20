# Écrans — console établissement (UI-34 → UI-40)

**Tickets couverts** : `E-05`, `E-06`, `E-07`, `E-08`, `E-16` à `E-19`
**Bloc de périmètre** : M10 (console établissement) · **Persona : Hanta**

> **Voix : vouvoiement** (`principes.md` §13). Cette console est un outil institutionnel.
>
> C'est aussi le module dont dépend toute la chaîne : *« un espace projet magnifique sans moyen
> de créer les comptes ne produit rien »* (`mvp-scope.md` §1).

---

## UI-34 — Vue d'ensemble

`/institution` · coquille **Console** · fragment `institution` · `E-16` · resp. **R**

**But** — Donner à l'établissement une raison de revenir, et un point de départ pour agir.

**Accès** — `ORG_VIEWER` et au-dessus, organisation de type `INSTITUTION` avec
`CERTIFY_AFFILIATION`.

**Données** — `GET /institution/overview` : compteurs d'affiliés par statut, taux d'activation,
taux de complétion de profil, projets créés par état, derniers lots d'import.

**Structure**
1. Bandeau d'action : *Importer une promotion* — l'action principale de cette console, en évidence.
2. Cartes de mesure via `AggregateMetric` : affiliés, comptes activés, profils complétés, projets créés.
3. Derniers lots d'import avec leur état et un accès direct au rapport.
4. Alertes : invitations non activées depuis plus de 10 jours, adresses en rebond à corriger.

**États** — Chargement · **premier usage (aucun import)** : l'écran devient un guide en trois étapes vers le premier import, sans aucun chiffre à zéro · usage courant · erreur.

**Règles**
- **Aucun chiffre en dessous de `MIN_AGGREGATION_THRESHOLD` n'est affiché** (`AggregateMetric`). Sur une petite promotion, un pourcentage désigne quelqu'un.
- **Aucune donnée de genre**, ni ici, ni ailleurs dans cette console (permission négative n° 4). Le tableau de bord analytique complet, mixité comprise, est en `S1` — hors MVP.
- Un tableau de bord affichant des zéros le jour du lancement est moins convaincant que pas de tableau de bord (`mvp-scope.md` S1) : d'où l'état « premier usage » qui remplace les compteurs par un chemin.

**i18n** — `institution.overview.*`

**Fait quand** — Le premier usage n'affiche aucun zéro · aucun agrégat sous le seuil · aucune donnée de genre · l'action principale est atteignable en un geste.

---

## UI-35 — Nouvel import

`/institution/imports/new` · coquille **Console** en mode assistant · `E-05`, `E-06`, `E-07` · resp. **R**

**But** — Peupler la plateforme **en une opération que l'établissement doit réussir du premier
coup**. C'est le module critique du MVP.

**Accès** — `ORG_ADMIN` ou `ORG_MANAGER`.

**Données** — `POST /institution/imports` (dépôt) → analyse → `PATCH` (mapping) →
`GET .../preview` → `POST .../apply`. **Rien n'est créé avant l'application** (`architecture.md`
§3.1).

**Les quatre étapes** (`StepForm`, progression toujours visible)

### Étape 1 — Dépôt
CSV **et** XLSX, encodages multiples, accents. Zone de dépôt + sélecteur. Taille maximale et
formats annoncés **avant** la sélection. Un modèle de fichier téléchargeable est proposé — sans
jamais l'imposer : *on s'adapte à son fichier, pas l'inverse* (ETB-02).

### Étape 2 — Mapping de colonnes assisté
Pour chaque colonne détectée, une correspondance proposée vers un champ attendu (email **clé**,
nom, prénom, filière, niveau, année d'entrée, genre facultatif, matricule facultatif), avec
**trois lignes d'exemple issues du fichier réel** sous chaque colonne. Les colonnes non
reconnues sont ignorables explicitement. Un champ obligatoire non mappé bloque, en le disant.

> Le mapping assisté est ce qui traite le risque `R2` : les fichiers réels ne ressemblent jamais
> aux hypothèses.

### Étape 3 — Prévisualisation ligne par ligne
Tableau (`DataList`) des lignes analysées avec, pour chacune, le résultat **prévu** :
`CREATED` · `UPDATED` · `SKIPPED_DUPLICATE` · `ERROR` avec son motif. Compteurs en tête. Filtre
*n'afficher que les erreurs*. Possibilité de revenir au mapping sans reperdre le fichier.

**Aucun compte n'existe à ce stade.** L'écran l'affirme explicitement : c'est ce qui rend
l'opération réessayable sans dégât, donc utilisable par un service de scolarité sans compétence
technique.

### Étape 4 — Application
`ConfirmDialog` avec **confirmation saisie** (action de masse) rappelant les compteurs.
Application en **une seule transaction** : comptes créés en `INVITED` et invitations mises en
file. Puis redirection vers le rapport (UI-36).

**États** — Dépôt · analyse en cours (fichier volumineux : progression, jamais un écran figé) ·
fichier illisible (message actionnable : encodage, séparateur, feuille XLSX vide) · mapping
incomplet · prévisualisation · application en cours · appliqué · échec (aucune écriture partielle) · hors ligne.

**Règles**
- **Idempotence visible** : ré-importer le même fichier affiche `SKIPPED_DUPLICATE`, et l'écran explique que rien n'est dupliqué, qu'aucun mot de passe n'est réinitialisé et qu'aucun compte gelé n'est réactivé. L'établissement ré-importera au semestre suivant : c'est la condition pour que le module serve deux fois.
- La colonne genre est importable **et invisible ensuite** : elle alimente `TalentIdentity.gender`, que personne ne relit individuellement — pas même le cadre qui a déposé le fichier. **L'écran le dit à l'étape 2.**
- Aucune étape ne perd le fichier déposé.
- Le parcours est faisable sur mobile, mais l'écran assume que le dépôt se fait sur ordinateur : la prévisualisation est optimisée pour un grand écran, sans devenir inutilisable sur un petit.

**i18n** — `institution.import.*`

**Fait quand** — Un CSV accentué en Windows-1252 et un XLSX passent tous deux · la prévisualisation ne crée rien · un ré-import ne duplique rien · un échec ne laisse aucune écriture partielle · **testé sur un vrai fichier de l'ESP-Antsiranana** (`R2`).

---

## UI-36 — Lots d'import et rapports

`/institution/imports` · `/institution/imports/:id` · `E-08`, `E-17`, `E-03` · resp. **R**

**But** — Le suivi après coup, et la **boucle des rebonds** — la contrainte technique
transformée en service.

**Accès** — `ORG_VIEWER` en lecture ; annulation et relance : `ORG_MANAGER`.

**Données** — `GET /institution/imports` · `GET /institution/imports/:id` (lignes, résultats,
rebonds) · `POST .../cancel` · `POST .../resend-invitations`.

**Structure**
- **Liste** : date, auteur, fichier, état (`ImportBatchStatus`), compteurs, activations depuis.
- **Détail** : compteurs en tête (créés / mis à jour / ignorés / erreurs / **rebonds**), tableau des lignes filtrable par résultat, et deux actions : *Relancer les invitations non activées* et *Annuler ce lot*.
- **Section « Adresses à corriger »** : la liste des `BOUNCED`, exportable. C'est le « 12 adresses invalides, voici lesquelles » de la spécification (ETB-02) — la fonctionnalité la plus visiblement utile de la console.

**États** — Chargement · liste · vide (guide vers le premier import) · lot en cours d'application · appliqué · annulé · échoué · **rebonds arrivés après coup** (le détail se met à jour des heures plus tard, l'écran l'indique).

**Règles**
- L'annulation d'un lot appliqué exige une confirmation saisie et énonce précisément ce qui est défait.
- La relance groupée respecte la validité de 30 jours (`INVITATION_EXPIRY_DAYS`) et affiche le nombre d'invitations qui repartiront.
- **Repli du risque `R1`** : un bouton *Télécharger les liens d'activation* produit la liste des liens, à distribuer par l'établissement si l'email n'arrive pas. Le produit fonctionne sans email.

**i18n** — `institution.imports.*`

**Fait quand** — Les rebonds apparaissent dans le rapport · la relance groupée fonctionne · l'annulation est explicite et confirmée · le repli par liens de secours existe.

---

## UI-37 — Affiliations et statuts

`/institution/affiliations` · `E-18` · resp. **R**

**But** — Maintenir la véracité du badge de certification dans le temps. Un badge qui ment ne
vaut rien, et c'est le badge qui porte la valeur commerciale.

**Accès** — `ORG_MANAGER` et au-dessus.

**Données** — `GET /institution/affiliations?filters` · `PATCH /affiliations/:id` ·
`POST /institution/affiliations/bulk-status`.

**Structure** — `DataList` : personne, filière, promotion, statut d'affiliation
(`AffiliationStatus`), statut de compte, date d'activation. Filtres : promotion, filière,
statut. **Sélection multiple et action groupée.**

**L'opération groupée est une exigence, pas un confort** (ETB-03) : le passage d'une promotion
entière en `Sortant` en fin d'année est l'usage normal. La faire ligne par ligne sur 300
étudiants garantit qu'elle ne sera jamais faite.

**Règles**
- Action groupée = `ConfirmDialog` avec **confirmation saisie**, récapitulant le nombre exact de personnes touchées et ce que le changement entraîne pour elles (un compte `LEAVING` sort du Dream-Match et du Feed Talents).
- L'établissement ne modifie **que ses propres affiliations**.
- Chaque changement est audité (`AuditLog`) ; l'écran l'annonce.
- **Aucune colonne de genre**, ni comme donnée, ni comme filtre (permission négative n° 4).

**i18n** — `institution.affiliations.*`

**Fait quand** — Le passage groupé d'une promotion fonctionne et est confirmé par saisie · aucune affiliation d'un autre établissement n'est modifiable · aucune colonne de genre.

---

## UI-38 — Annuaire des affiliés

`/institution/directory` · `E-19` · resp. **R**

**But** — Permettre à l'établissement de repérer et d'orienter ses étudiants.

**Accès** — `ORG_VIEWER` et au-dessus, **limité à ses propres affiliés**.

**Données** — `GET /institution/directory` — profils **en identité réelle**, parce que
l'établissement connaît déjà ses étudiants : il a fourni la liste. **Sans le genre.**

**Structure** — `DataList` : nom, filière, promotion, complétion du profil, projets, statut de
compte, dernière connexion. Fiche en feuille latérale.

**Règles — les trois interdits de cet écran**

1. **Aucun genre**, en affichage comme en filtre (permission négative n° 4).
2. **Aucun profil d'un autre établissement en identité réelle** : les personnes non affiliées apparaissent en vue pseudonymisée, comme pour tout le monde (permission négative n° 3).
3. **Aucun accès aux conversations ni aux projets** de ces personnes (permissions négatives n° 1 et n° 2). L'annuaire mène au profil, jamais au contenu privé.

**i18n** — `institution.directory.*`

**Fait quand** — Les trois interdits sont couverts par des tests (permissions négatives n° 1 à 4) · l'export de l'annuaire est audité · aucune donnée de genre n'est atteignable.

---

## UI-39 — Membres et rôles de l'organisation

`/institution/members` · `E-16` · resp. **R**

**But** — Le premier cadre invite ses collègues et répartit les droits (ETB-01).

**Accès** — `ORG_ADMIN`.

**Données** — `GET`/`POST`/`PATCH`/`DELETE /organizations/:id/members` — rôles
`ORG_ADMIN`, `ORG_MANAGER`, `ORG_VIEWER`.

**Structure** — Liste des cadres avec rôle et état d'invitation · *Inviter un collègue* (email +
rôle) · modification de rôle · retrait.

**Règles**
- **Ce que chaque rôle permet est affiché à côté du sélecteur**, pas dans une aide séparée : sans cela, tout le monde est nommé administrateur.
- Le dernier `ORG_ADMIN` ne peut être ni rétrogradé ni retiré.
- Toute modification est auditée.

**i18n** — `institution.members.*`

**Fait quand** — Les droits de chaque rôle sont lisibles au moment du choix · le dernier administrateur est protégé · les changements sont audités.

---

## UI-40 — Opportunités de l'établissement

`/institution/opportunities` · `E-16`, `B-06` · resp. **N**

**But** — Concours interne, appel à candidatures, information de promotion (ETB-06).

**Accès** — `ORG_MANAGER` et au-dessus, avec la capacité `PUBLISH_OPPORTUNITY`.

**Règles** — **Cet écran est le même composant que UI-48** (console partenaire). Une opportunité
est une entité unique typée (D10) : deux implémentations séparées seraient deux fois le même
code et deux fois les mêmes bugs. Seul diffère le contexte d'organisation.

**i18n** — `opportunity.manage.*` (espace de noms **partagé** avec la console partenaire)

**Fait quand** — Le code est strictement partagé avec UI-48 · la capacité `PUBLISH_OPPORTUNITY` conditionne l'accès · une opportunité publiée apparaît dans UI-18.
