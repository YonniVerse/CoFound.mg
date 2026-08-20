# Périmètre du MVP — CoFound.mg

> **Cadrage** : ce MVP est défini comme **le premier jalon d'un produit réellement lancé**,
> pas comme une démonstration de hackathon. Le critère d'arbitrage n'est pas « qu'est-ce
> qu'on montre » mais « quel est le plus petit produit dont la sortie a une valeur réelle
> pour quelqu'un ».

**Version** : 1.0 — 20 août 2026
**Documents liés** : [`specs-fonctionnelles.md`](./specs-fonctionnelles.md) · [`plan-de-developpement.md`](./plan-de-developpement.md)

---

## 1. Méthode d'arbitrage

CoFound n'est pas un produit à fonctionnalités indépendantes, c'est une **chaîne** :

```
Établissement importe → Étudiant active → Étudiant complète son profil
   → Étudiant trouve / est trouvé → Équipe se forme → Projet se structure (BMC)
      → Projet devient visible → Partenaire le découvre et le contacte
```

Un maillon manquant met la sortie à zéro. Un espace projet magnifique sans moyen de créer
les comptes ne produit rien. Un matching parfait sans messagerie ne produit rien. Un côté
partenaire absent supprime le modèle économique en entier.

### Règle retenue

> **On livre la chaîne entière, fine. Jamais une portion de chaîne, épaisse.**

Chaque bloc du Must-have est réduit à ce qui fait passer le maillon. Tout ce qui
*approfondit* un maillon déjà fonctionnel bascule en Should ou en V2.

### Corollaire — ce qui rend l'arbitrage défendable

> **On ne coupe jamais une couture, on ne coupe que du volume.**

Le pseudonymat, le RBAC, l'audit, les référentiels en base et la frontière de paiement
sont dans le Must-have **malgré leur faible visibilité**, parce que les ajouter après coup
signifie réécrire tout ce qui aura été construit entre-temps.

À l'inverse, le budget de projet, les sondages ou le tableau de bord institutionnel sont
de la fonctionnalité pure : les ajouter au mois 6 ne coûte pas plus cher qu'aujourd'hui.

---

## 2. Les cinq profils et leur problème n°1

| Profil | Problème n°1 | Ce qui le résout au minimum |
|---|---|---|
| **Hanta** — responsable entrepreneuriat / scolarité | « Je dois montrer que mon établissement produit des entrepreneurs, et je n'ai aucune visibilité sur ce que font mes étudiants » | Importer sa liste sans galère, et voir que ses étudiants créent des projets |
| **Rino** — étudiant porteur d'idée | « J'ai une idée, tout mon entourage a exactement mon profil » | Publier son projet, dire quel profil il cherche, recevoir des candidatures d'autres filières |
| **Norman** — étudiant en recherche de projet | « Je sais faire des choses, je ne sais pas sur quoi les appliquer » | Parcourir les projets qui recrutent, filtrer par compétence, candidater |
| **Sarah** — étudiante | « Je n'ose pas me montrer, on ne me juge pas sur mes compétences » | Un profil réellement pseudonymisé, un dévoilement qu'elle contrôle, un bouton signaler qui aboutit |
| **Miora** — chargée de programme en incubateur | « Mon appel à candidatures ne touche que trois écoles de Tana et je reçois des dossiers vides » | Chercher des projets par filtre, publier une opportunité, contacter une équipe, lire un BMC structuré |

---

## 3. MUST-HAVE

### M1 — Provisioning, activation, authentification
**Résout** : Hanta (faire entrer sa promotion), tous (exister).

Import CSV/XLSX avec **mapping de colonnes assisté, prévisualisation, rapport ligne par
ligne, idempotence, annulation de lot** · invitation par email · activation par jeton ·
connexion, déconnexion, mot de passe oublié · sessions longues avec rafraîchissement
silencieux.

*Hors périmètre de ce bloc* : SSO, second facteur, synchronisation automatique avec le SI.

> **Pourquoi l'idempotence est dans le Must** : l'établissement ré-importera son fichier au
> semestre suivant. Un import qui duplique les comptes ou réinitialise les mots de passe à
> la deuxième utilisation détruit la relation commerciale. Ce n'est pas du raffinement,
> c'est la condition pour que le module serve deux fois.

### M2 — Profil et onboarding progressif
**Résout** : tous. Alimente le matching, les feeds et les analytics.

Interview découpée en étapes courtes, **interruptible et reprenable**, avec indicateur de
complétion et relance dans l'espace personnel. Compétences (référentiel en base), filière,
année, objectifs, disponibilité, préférences, secteurs. Genre facultatif et privé.

*Hors périmètre* : import LinkedIn, CV, portfolio, niveaux de compétence validés.

### M3 — Pseudonymat et dévoilement
**Résout** : Sarah. C'est le différenciateur du produit.

Deux projections d'un même profil appliquées **au niveau de l'API, pas de l'affichage** ·
demande de contact · acceptation · dévoilement mutuel irréversible · dévoilement
automatique à l'entrée dans un projet commun · blocage.

> **Pourquoi c'est non négociable au lancement** : si les endpoints renvoient tout et qu'on
> masque côté client, la donnée fuite (outils de développement, cache, requête directe).
> Rendre un modèle pseudonyme après coup, c'est réécrire chaque endpoint et chaque test.
> C'est la dette la plus chère qu'on puisse contracter sur ce produit précis.

### M4 — Projet et Business Model Canvas
**Résout** : Rino. Pilier « structuration ».

Création avec titre + pitch en Brouillon · BMC guidé, 9 blocs, exemples contextualisés,
**sauvegarde automatique** · postes ouverts · transitions `Brouillon → Recrutement →
Actif` · états `En pause` et `Archivé`.

*Hors périmètre* : les 9 états complets (on en garde 5), versionnement du BMC, page vitrine
publique.

> Sur la sauvegarde automatique : sur une connexion mobile malgache, perdre 20 minutes de
> rédaction de BMC signifie ne jamais recommencer.

### M5 — Découverte : deux feeds, recherche, Dream-Match
**Résout** : Norman (explorer), Rino (être vu), Miora (sourcer).

**Feed Projets** antéchronologique + filtres · **Feed Talents** en opt-in, cartes
pseudonymisées · **Dream-Match** : formulaire du profil recherché + suggestions scorées
**avec affichage des facteurs**.

*Hors périmètre* : classement algorithmique des feeds, apprentissage automatique, signaux
comportementaux.

> **Pourquoi le Dream-Match reste dans le Must alors que le ML est exclu** : le calcul
> déterministe est peu coûteux, et c'est le seul endroit du produit où l'on répond à
> « profils trop similaires » — le problème n°2 du cahier des charges — par un mécanisme
> explicite (bonus de complémentarité, malus de recouvrement). Son explicabilité est un
> argument commercial : un établissement ne peut pas défendre une boîte noire auprès de ses
> étudiants.

### M6 — Candidature et constitution d'équipe
**Résout** : Norman (rejoindre), Rino (choisir).

Candidature avec message · file côté porteur · accepter / refuser avec motif · **relance
automatique du porteur** au-delà d'un délai · entrée dans l'équipe avec un rôle.

*Hors périmètre* : entretiens, tests, scoring de candidature.

### M7 — Messagerie privée
**Résout** : Sarah, Norman, Rino. Sans elle, un match ne débouche sur rien.

Conversation un-à-un après mise en relation acceptée · pièces jointes légères · blocage ·
signalement depuis la conversation.

*Hors périmètre du Must* : **le transport temps réel.** On livre en requêtes classiques
avec rafraîchissement.

> Ce n'est pas WhatsApp. On échange trois messages pour convenir d'un rendez-vous, pas trois
> cents. L'ajout d'un canal SSE plus tard est **additif** : le contrat d'API
> (`POST message`, `GET messages depuis X`) ne change pas.

### M8 — Espace projet minimal
**Résout** : l'équipe une fois formée.

Membres et rôles · tâches (titre, responsable, échéance, statut) · canal de discussion du
projet.

*Hors périmètre du Must* : budget, notes collaboratives, calendrier, mentorat.

### M9 — Notifications
**Résout** : le retour sur la plateforme.

Centre de notifications in-app · emails transactionnels sur les événements décisifs
(invitation, contact accepté, candidature reçue, candidature traitée).

*Hors périmètre* : résumé quotidien, push web, SMS.

### M10 — Console établissement
**Résout** : Hanta.

Import et suivi des lots · gestion des statuts d'affiliation, y compris en masse pour une
promotion · relance d'invitations · annuaire de ses propres affiliés en identité réelle ·
**permissions négatives testées**.

*Hors périmètre du Must* : le tableau de bord analytique (→ S1).

### M11 — Console partenaire
**Résout** : Miora. **C'est le côté qui paie.**

Compte créé par le staff après validation · profil vérifié de la structure · recherche de
projets avec filtres et liste de suivi · lecture du BMC public · **publication d'une
Opportunité** (type `appel à candidatures` uniquement) · réception et traitement des
candidatures · contact d'une équipe (un seul message, pas de relance).

*Hors périmètre du Must* : mentorat avec accès à l'espace projet, engagement financier,
sondages, événements, analytics écosystème, facturation.

### M12 — Signalement et modération
**Résout** : la promesse faite à Sarah.

Signalement depuis un profil, un message, un projet, une publication · file priorisée ·
décisions graduées (avertissement, gel temporaire, désactivation) · notification de la
décision au signalant.

> **Non négociable.** On promet un environnement sûr à des jeunes femmes. Ouvrir la
> plateforme sans le mécanisme qui honore cette promesse, c'est le seul risque capable de
> tuer le projet en un seul incident.

### M13 — Socle invisible
RBAC contextuel à refus par défaut · journal d'audit sur les actions sensibles · clés i18n
dès le premier écran · registre des consentements · export des données · référentiels en
base et versionnés · **entité `EngagementFinancier` et port `PaiementProvider` définis,
seule implémentation `HorsPlateforme`**.

> Tout ce bloc coûte peu maintenant et devient une réécriture plus tard. C'est la partie de
> l'arbitrage la plus fermement défendue.

---

## 4. SHOULD-HAVE

| # | Fonctionnalité | Pourquoi juste après, et pas avant |
|---|---|---|
| **S1** | Tableau de bord de l'établissement | Un tableau de bord affichant des zéros le jour du lancement est **moins convaincant que pas de tableau de bord du tout**. Il devient l'argument de reconduction dès qu'il y a trois semaines de données. |
| **S2** | Budget du projet (déclaratif) | Une équipe qui vient de se former n'a pas de budget. Le module devient utile à l'étape financement, structurellement en aval de tout le reste. |
| **S3** | Calendrier du projet | Vue d'agrégation pure, aucune donnée nouvelle. Sans valeur tant qu'il n'y a pas beaucoup d'échéances. |
| **S4** | Mentorat avec accès gradué | Suppose des projets assez mûrs pour être accompagnés. Et c'est la permission la plus délicate du produit : mieux vaut la construire en observant de vrais mentors qu'en la devinant. |
| **S5** | Résumé quotidien par email | Optimise une rétention qui n'existe pas encore. |
| **S6** | Notes collaboratives | Les équipes utilisent déjà Google Docs. Se battre contre lui au lancement est un mauvais combat : mieux vaut d'abord être l'endroit où vit le lien vers le document. |
| **S7** | Messagerie temps réel (SSE) | Ajout additif sur M7, sans changement de contrat d'API. |
| **S8** | Sondages partenaires | Envoyer un questionnaire à des utilisateurs qui n'ont pas fini leur onboarding produit des données inexploitables. Outil de densité. |
| **S9** | Types d'Opportunité supplémentaires | L'entité existe déjà (M11) : activer un type est de la configuration. |
| **S10** | Traduction malgache | L'architecture est en M13 ; la traduction est un travail de contenu déclenchable à tout moment. |

---

## 5. WON'T-HAVE pour le MVP

| Exclu | Justification produit | Horizon |
|---|---|---|
| **Investissement, don, paiement mobile money** | Pas parce que c'est difficile : **parce que l'objet à financer n'existe pas encore.** On n'investit pas dans un projet créé il y a trois semaines. Concevoir un parcours de financement sans observer un seul vrai dossier, c'est le concevoir à l'aveugle. On livre la frontière (M13), pas la fonctionnalité. | V2 |
| **Analytique écosystème pour partenaires** | Un tableau de bord de marché construit sur 200 profils et 15 projets donne des chiffres faux, et **un chiffre faux vendu à un ministère coûte plus cher que l'absence de chiffre**. | V2 |
| **Échanges communautaires / forum** | **Un forum vide est un signal négatif puissant** — il dit au premier visiteur que personne n'est là. On l'ouvre quand la densité garantit une réponse en 24 h et qu'une équipe de modération existe. | V2 |
| **Associations et affiliations déclaratives** | Ajouter une deuxième source d'affiliation avant d'avoir rodé la première brouille le seul signal que les partenaires achètent : la certification par l'établissement. | V2 |
| **Application mobile native** | Le web responsive couvre le besoin. Le natif se justifie par le push et l'usage hors ligne, qui supposent une base d'utilisateurs actifs à retenir. | V2 |
| **Écriture hors ligne / synchronisation** | La résolution de conflits est un problème difficile. Mal faite, elle fait perdre des données — pire que l'absence de mode hors ligne. Projet à part entière, pas option de MVP. | V2 |
| **Matching par apprentissage automatique** | Rien à apprendre sans historique d'équipes. Un modèle entraîné sur 40 mises en relation produit du bruit présenté comme de l'intelligence. | V2/V3 |
| **Réputation, notation, score comportemental** | Pénaliserait structurellement les nouveaux arrivants, c'est-à-dire tout le monde au lancement. | V2+ |
| **Classement public des établissements** | Contre-productif pendant le démarchage : on ne vend pas un produit à une école en publiant qu'elle est 14ᵉ. Conservé en vue privée (S1). | — |
| **SSO et synchronisation du SI** | Suppose un service informatique en face. Le CSV a l'immense avantage que **n'importe quel service de scolarité sait le produire**. | V3 |
| **Facturation en ligne des partenaires** | Automatiser la facturation avant d'avoir stabilisé ce qui est payant fige un modèle économique non arrêté. | V2 |
| **Page vitrine publique du projet** | Suppose des projets assez aboutis pour être montrés dehors. | V2 |

---

## 6. Ce que ce MVP prouve — et ce qu'il ne prouve pas

**Il prouve**
- Que la chaîne complète fonctionne de bout en bout, d'un fichier Excel de scolarité jusqu'à un incubateur qui contacte une équipe pluridisciplinaire.
- Que le pseudonymat est réel et pas cosmétique — garanti par la structure du schéma, pas par du masquage d'affichage.
- Que le modèle économique a un support technique : le côté payant existe et fonctionne.
- Que l'architecture supporte les V2/V3 sans réécriture : frontière de paiement, référentiels en base, i18n, RBAC.

**Il ne prouve pas**
- Que les établissements signent — c'est du démarchage.
- Que les partenaires paient — il faut le business plan et des entretiens de validation.
- Que le matching produit de bonnes équipes — seul le temps le dira, et c'est précisément pourquoi la V1 collecte les données qui le mesureront.

> Assumer publiquement cette seconde liste vaut mieux que la masquer. C'est ce qui distingue
> une équipe qui sait où elle en est d'une équipe qui récite son pitch.

---

## 7. Corrections à apporter au prototype existant

Issues de l'audit du dépôt `YonniVerse/CoFound.mg` (branche `dev`, commit `2c7999e`).

| # | Correction | Raison |
|---|---|---|
| **C1** | Retirer `isFemale` et `FemaleBadge` **des profils de personnes** | Le prototype affiche une icône de genre sur chaque profil féminin du feed. C'est **exactement le mécanisme que la plateforme existe pour supprimer** : le genre est signalé avant toute évaluation des compétences, sur la surface la plus consultée. `isFemaleImpact` sur un **projet** est en revanche légitime et conservé — c'est une caractéristique revendiquée par l'équipe. La mesure de l'inclusion se fait dans les statistiques agrégées, ce qui est plus fort : on prouve l'impact par les chiffres au lieu de l'afficher par un badge. |
| **C2** | Unifier le pseudonymat dans les feeds | `ProjectCard` affiche `author.name` en clair, `ProfileCard` affiche un nom partiel. Deux règles différentes dans le même feed, dont une viole le pseudonymat. |
| **C3** | Sortir `sector` du code | Union TypeScript en dur. Contredit ADM-05 : ajouter un secteur ne doit pas être un déploiement. |
| **C4** | Supprimer `SignupPage` | Il n'y a plus d'inscription (D1). Remplacée par `/activation/:token` et `/login`. |
| **C5** | Déplacer `SchoolLeaderboard` en vue privée | Voir Won't-have. |

**Ce qui est conservé tel quel** : le design system (tokens OKLCH, échelles d'ombres et de
rayons, typographie Inter + Sora auto-hébergée), les primitives shadcn/Radix, la landing
page, le pattern `fetchMock` → hooks (l'UI ne connaît déjà pas la source de ses données,
brancher le vrai backend est un remplacement de fonction).
