# Spécifications fonctionnelles — CoFound.mg

> **Portée : exhaustive.** Ce document décrit tout ce que la plateforme doit savoir faire à
> terme. Il ne contient aucun arbitrage de périmètre — celui-ci est dans
> [`mvp-scope.md`](./mvp-scope.md).
>
> Chaque fonctionnalité porte un horizon indicatif : **[V1]** cible produit à 12 mois ·
> **[V2]** 13–24 mois · **[V3]** 25–36 mois.
>
> Format de chaque fiche : *But · Accès · Données · Dépendances*.

**Version** : 1.0 — 20 août 2026
**Statut** : validé par le CTO (Yonni)

---

## 0. Décisions de cadrage qui gouvernent cette spec

Ces décisions ont été arbitrées avant rédaction. Elles expliquent les écarts avec le
cahier des charges initial (`CoFound.mg_doc_version1.pdf`).

| # | Décision | Conséquence |
|---|---|---|
| D1 | **Aucune inscription publique.** Les comptes étudiants sont provisionnés par import de l'établissement. | Le module d'import devient critique ; un second parcours d'entrée existe pour les organisations (demande validée manuellement). |
| D2 | **Les établissements ne paient pas.** 100 % du revenu vient des partenaires. | Le côté partenaire n'est pas un module secondaire, c'est le produit vendu. |
| D3 | **Découplage Personne / Organisation / Affiliation** avec capacités activables, au lieu de 7 rôles plats. | Ajouter un type d'organisation est une valeur d'énumération, pas une refonte. |
| D4 | **Seuls les établissements certifient.** Associations et clubs donnent une affiliation déclarative. | La valeur du badge est préservée. |
| D5 | **Aucun flux monétaire sur la plateforme**, y compris après partenariat opérateur. On modélise l'engagement, le règlement se fait directement au bénéficiaire. | CoFound reste intermédiaire technique, jamais détenteur de fonds. |
| D6 | **Le BMC est obligatoire pour sortir du Brouillon**, jamais pour créer un projet. | La structuration est une porte de crédibilité, pas une barrière d'entrée. |
| D7 | **Pseudonymat, pas anonymat.** Le terme est employé tel quel dans le produit. | Honnêteté sur le risque de ré-identification en petite promotion. |
| D8 | **Le genre est collecté (facultatif), jamais public, jamais dans le matching**, exploité uniquement en agrégat avec seuil minimal de 5 individus. | L'impact ODD 5 devient mesurable au lieu d'être affirmé. |
| D9 | **Matching déterministe et explicable en V1.** Aucun apprentissage automatique, aucun signal comportemental. | Cold start assumé ; l'explicabilité est un argument commercial. |
| D10 | **Sondages, concours, événements, appels et offres fusionnés** dans une entité `Opportunité` typée. | Activer un type est de la configuration, pas du développement. |
| D11 | **Architecture i18n dès le premier écran**, `currency` porté par chaque montant, référentiels en base. | Extension panafricaine possible sans réécriture. |
| D12 | **Web responsive mobile-first maintenant, application native en V2.** | Le backend doit être une API consommable par plusieurs clients. |

---

## Modèle d'acteurs

```
Personne (compte)
  ├─ peut avoir un Profil Talent (étudiant / diplômé / alumni)
  ├─ peut être Membre d'une Organisation (avec un rôle dans cette organisation)
  └─ peut être Staff CoFound (admin / modérateur)

Organisation (entité morale)
  ├─ type : ÉTABLISSEMENT | INCUBATEUR | ENTREPRISE | ONG | INSTITUTION_PUBLIQUE | ASSOCIATION
  └─ capacités accordées par CoFound :
       CERTIFIER_AFFILIATION · ACCOMPAGNER · FINANCER
       PUBLIER_OPPORTUNITÉ · SONDER · ANALYTICS · RECRUTER

Affiliation = lien Talent ↔ Organisation
  ├─ certifiante : oui / non   (seul un ÉTABLISSEMENT peut certifier)
  └─ statut : actif | sortant | alumni | suspendu
```

**Pourquoi ce modèle plutôt que 7 rôles plats :**

- Ajouter « association » ou « fondation » = une valeur d'énumération, pas un 8ᵉ arbre de permissions.
- Une université avec son incubateur interne est **une** organisation avec **deux** capacités, pas deux comptes.
- Une personne peut être étudiante *et* cadre d'une association étudiante — cas fréquent qu'une typologie plate ne sait pas représenter.
- Les permissions se calculent : `capacité de l'organisation × rôle dans le contexte × statut du compte`. Un seul moteur à tester.

---

# A. Socle transverse

## TR-01 — Provisioning et cycle de vie des comptes **[V1]**

- **But** : créer les comptes sans inscription publique, et refléter la réalité académique dans le temps.
- **Accès** : création par un établissement (import) ou par le staff CoFound (organisations). L'utilisateur ne peut ni créer ni supprimer son compte lui-même ; il peut demander la suppression.
- **Données** : email, statut (`invité`, `actif`, `gelé`, `sortant`, `alumni`, `désactivé`), date d'invitation, date d'activation, dernière connexion, motif et durée de gel, auteur de chaque changement d'état.
- **Dépend de** : TR-02, ETB-02, TR-10.

**Transitions**

```
Invité   --(activation)-->        Actif
Actif    --(sanction)-->          Gelé      --(levée)--> Actif
Actif    --(fin de cursus)-->     Sortant   --(délai contractuel)--> Alumni
*        --(décision admin)-->    Désactivé   (données conservées, accès coupé)
```

**Règles à figer**
- Validité d'une invitation : 30 jours, relançable.
- Un compte `Sortant` conserve l'accès complet à ses projets mais **sort du Dream-Match et du Feed Talents**.
- Un compte `Alumni` peut mentorer mais ne peut plus candidater.

## TR-02 — Authentification **[V1]**

- **But** : prouver l'identité de façon sûre sur des connexions instables.
- **Accès** : tous.
- **Données** : hash de mot de passe (argon2id), jetons de rafraîchissement, appareil et IP de connexion, jetons d'activation et de réinitialisation à usage unique et expirants (stockés hachés).
- **Dépend de** : TR-01.
- **Périmètre V1** : activation par lien mailé, connexion, mot de passe oublié, déconnexion locale et globale, verrouillage progressif après échecs répétés.
- **[V2]** : second facteur TOTP **obligatoire** pour les comptes organisation et staff, journal des sessions actives, SSO établissement.

**Contrainte contexte** : sessions longues et rafraîchissement silencieux. Reconnecter un étudiant à chaque coupure réseau est un motif d'abandon.

## TR-03 — Autorisations (RBAC contextuel) **[V1]**

- **But** : un moteur de permissions unique et testable, plutôt que des conditions dispersées.
- **Accès** : configuré par le staff CoFound.
- **Données** : rôle plateforme, capacités de l'organisation, rôle dans l'organisation, rôle dans le projet, statut du compte.
- **Formule** : `statut du compte ET rôle plateforme ET (rôle contextuel OU capacité d'organisation)`. **Refus par défaut.**
- **Dépend de** : TR-01, ETB-01, PAR-01.

## TR-04 — Pseudonymat et dévoilement progressif **[V1]**

- **But** : permettre l'évaluation sur les compétences, protéger les personnes exposées, rendre la levée d'anonymat volontaire et symétrique.
- **Accès** : tous les talents.
- **Données** : deux projections d'un même profil.
  - *Vue publique* : pseudonyme, avatar généré, établissement, filière, année, compétences, secteurs, objectifs, disponibilité, badge « certifié par l'établissement », ancienneté.
  - *Vue privée* : nom, prénom, photo, **genre**, téléphone, email, liens externes, région précise.
- **Règles**
  - Le dévoilement est **mutuel et irréversible pour la paire concernée**.
  - Il est automatique à l'entrée dans un projet commun.
  - Un modérateur accède aux identités uniquement dans le cadre d'un signalement, et cet accès est journalisé.
  - Le genre n'est visible que par la personne elle-même — jamais par un établissement, un partenaire ou le staff, y compris après dévoilement.
- **Dépend de** : TAL-02, TAL-05, TR-10.

**Honnêteté produit** : dans une petite promotion, filière + année + établissement peuvent suffire à ré-identifier quelqu'un. On l'appelle **pseudonymat**, on l'explique à l'utilisateur au moment où il complète son profil, et on lui laisse masquer sa filière ou son année.

## TR-05 — Notifications **[V1]**

- **But** : sans rappel, une plateforme de mise en relation est vide au deuxième jour.
- **Accès** : tous, avec préférences par canal et par type.
- **Données** : type d'événement, destinataire, canal (in-app / email), état lu, préférences, historique d'envoi.
- **Événements** : invitation reçue, demande de contact, contact accepté, candidature reçue, candidature traitée, tâche assignée, échéance proche, proposition de mentorat, opportunité correspondant au profil, décision de modération.
- **Dépend de** : quasiment tous les modules.
- **[V2]** : résumé quotidien par email, notifications push web, SMS pour les événements critiques via l'opérateur partenaire.

**Contrainte contexte** : privilégier un résumé plutôt qu'un email par événement. Le coût de la data et la saturation des boîtes sont des réalités locales.

## TR-06 — Feeds **[V1]**

- **But** : donner un point d'entrée vivant à la plateforme, distinct de la recherche.

Trois surfaces de découverte **non redondantes** :

| Surface | Mécanique | Répond à |
|---|---|---|
| **Dream-Match** | Poussé, scoré, personnalisé, expliqué, peu de résultats | « Je ne sais pas qui chercher » |
| **Feed Talents** | Tiré, antéchronologique + filtres, beaucoup de résultats | « Je cherche un designer disponible » |
| **Feed Projets** | Le marché : ce qui recrute, cherche un mentor ou un financement | « Qu'est-ce qui bouge ? » — et c'est la vitrine des partenaires |

- **Accès** : Feed Projets — tous les comptes. Feed Talents — talents, et partenaires ayant la capacité `RECRUTER`.
- **Données** : publication (auteur = projet, type, contenu, tags, portée, expiration), interactions, filtres.
- **Ordonnancement V1** : **antéchronologique + filtres explicites, aucun classement algorithmique.** Sur une communauté de quelques centaines de personnes, un feed algorithmique n'a rien à apprendre et rend le produit opaque.
- **[V2]** : remontée des publications proches du profil.
- **Dépend de** : PRJ-10, TAL-07, TR-04.

## TR-07 — Recherche et découverte **[V1]**

- **But** : trouver un profil, un projet, une organisation, une opportunité.
- **Accès** : selon le rôle.
- **Données** : index sur compétences, filières, établissements, secteurs, régions, états de projet, disponibilité.
- **Dépend de** : TR-03, TR-04.

**Règle de sécurité** : la recherche ne doit jamais exposer un champ masqué, **y compris via un filtre**. Filtrer sur un champ privé est une fuite d'information — pouvoir filtrer par genre équivaut à afficher le genre.

## TR-08 — Signalement et modération **[V1]**

- **But** : rendre la promesse de sécurité psychologique opérante.
- **Accès** : signaler = tous ; traiter = modérateur ; sanctionner = admin opérationnel.
- **Données** : signalement (objet visé, motif, description, auteur, date), file priorisée, décision, sanction, historique permanent.
- **Pipeline** : réception → classification et priorisation → analyse humaine (24–48 h) → décision (48–72 h) → historisation. Gel automatique temporaire sur motif critique (harcèlement, menace).
- **Motifs** : harcèlement, discours haineux, spam, fraude, contenu toxique.
- **Dépend de** : TR-01, TR-10.
- **[V2]** : pré-classification automatique, détection de spam. **[V3]** : détection de signaux faibles de comportements toxiques.

## TR-09 — Confidentialité, consentements, portabilité **[V1]**

- **But** : tenir les engagements du cahier des charges autrement qu'en paragraphe de CGU.
- **Accès** : chaque utilisateur pour ses propres données.
- **Données** : registre des consentements (finalité, version du texte, date, retrait), export complet, demande de suppression.
- **Règles**
  - Minimisation des données collectées.
  - Aucune conversation privée exploitée pour l'entraînement de modèles.
  - **Seuil minimal d'agrégation : 5 individus.** Aucune statistique publiée sur un groupe plus petit — sans ce seuil, « 1 femme sur 3 en M1 Télécom » désigne quelqu'un.
- **Dépend de** : TR-10, ANA-01.

## TR-10 — Journal d'audit **[V1]**

- **But** : pouvoir répondre à « qui a fait ça, quand, et pourquoi ». Indispensable dès qu'on certifie, qu'on modère et qu'on gèle des comptes.
- **Accès** : staff CoFound ; extraits visibles par l'organisation concernée.
- **Données** : acteur, rôle, action, objet, horodatage, métadonnées, adresse IP. **Écriture seule.**
- **Actions tracées** : import d'étudiants, changement de statut, certification, gel/dégel, décision de modération, **accès aux identités par un modérateur**, changement de capacité d'organisation, export de données.

## TR-11 — Internationalisation et localisation **[architecture V1, malgache V1.5]**

- **But** : rendre l'extension linguistique et géographique possible sans réécriture.
- **Données** : clés de traduction, langue préférée de l'utilisateur, code pays et fuseau de l'organisation, **code devise porté par chaque montant**.
- **Règle** : aucun texte en dur, dès le premier écran. Une règle de lint le fait respecter.

## TR-12 — Fichiers et médias **[V1]**

- **But** : avatars, pièces jointes de projet, documents d'opportunité, fichiers d'import.
- **Données** : métadonnées, propriétaire, portée de visibilité, taille, type MIME.
- **Règles** : liste blanche de types, quota par projet, **redimensionnement côté client avant envoi** (une photo de 4 Mo sur une connexion 3G est un abandon garanti), téléversement direct vers le stockage par URL présignée.
- **[V2]** : analyse antivirus, purge automatique.

## TR-13 — Frontière de paiement **[port en V1, adaptateurs en V2]**

- **But** : isoler dès maintenant tout ce qui touche à l'argent derrière une interface stable.
- **Données** : engagement financier (émetteur, bénéficiaire, montant, **devise**, type `investissement|don|subvention|prix`, statut, référence externe, preuve).
- **Cycle de vie** : `Proposé → Accepté par l'équipe → En cours de règlement → Confirmé (bilatéralement) → Clôturé`, plus `Refusé` et `Annulé`.
- **Implémentations**
  - **[V1]** `HorsPlateforme` — confirmation déclarative bilatérale, **aucune circulation de fonds**.
  - **[V2]** `MobileMoney` — initiation via l'opérateur partenaire, **règlement direct au bénéficiaire**. CoFound n'est jamais détenteur des fonds.
- **Dépend de** : PRJ-08, PAR-05.

**Pourquoi cette frontière existe avant la fonctionnalité** : encaisser des fonds pour compte de tiers est une activité réglementée (agrément, KYC/LBC-FT, obligations de reporting) et engagerait notre responsabilité en cas de litige entre un investisseur et une équipe étudiante. Le jour où un opérateur signe, c'est **un adaptateur**, pas une réécriture.

---

# B. Talent — étudiant, jeune diplômé, alumni

## TAL-01 — Activation du compte **[V1]**

- **But** : premier contact avec le produit. C'est là que se joue le taux d'adoption d'une promotion entière.
- **Accès** : porteur d'un jeton d'invitation valide.
- **Données** : jeton, mot de passe choisi, acceptation des CGU et consentements.
- **Dépend de** : TR-01, TR-02, ETB-02.

## TAL-02 — Profil et interview d'onboarding **[V1]**

- **But** : produire les données structurées sans lesquelles le matching, les feeds et les analytics n'existent pas.
- **Accès** : le talent pour son profil ; vue publique pour les autres (TR-04).
- **Données** : compétences (référentiel + niveau auto-déclaré), filière, année, établissement(s), objectifs entrepreneuriaux, préférences de collaboration (taille d'équipe, type de projet, secteurs), disponibilité en heures/semaine, préférences comportementales, langues, région. **Genre : facultatif, jamais public, jamais utilisé par le matching.**
- **Dépend de** : TAL-01, TR-11.

**Règle produit** : l'interview est **progressive et interruptible**. Le profil est utilisable à 60 % de complétion. Un indicateur de progression et une relance dans l'espace personnel incitent à compléter. Un formulaire de 40 questions en une fois, sur mobile et en 3G, ne se termine pas.

## TAL-03 — Profil Dream-Match **[V1]**

- **But** : décrire le collaborateur recherché, pas seulement ce qu'on est.
- **Données** : compétences recherchées et leur importance, complémentarité souhaitée, disponibilité minimale, préférence d'établissement (même / indifférent / autre), secteurs.
- **Dépend de** : TAL-02.

## TAL-04 — Suggestions de collaborateurs **[V1]**

- **But** : répondre à « je ne sais pas qui chercher ».
- **Accès** : talents actifs ayant complété leur profil.
- **Données** : score de correspondance, **facteurs explicatifs affichés**, historique des suggestions, retours (« pas intéressé » → exclusion).
- **Dépend de** : TAL-02, TAL-03.

**Algorithme V1 — déterministe et explicable**

| Facteur | Effet |
|---|---|
| Couverture des compétences recherchées | + |
| **Complémentarité** — compétences différentes | **+ (bonus)** |
| **Recouvrement total des compétences** | **− (malus)** |
| Compatibilité de disponibilité | + |
| Alignement des objectifs entrepreneuriaux | + |
| Proximité de secteur | + |

Le bonus de complémentarité et le malus de recouvrement sont le cœur du dispositif : ils traitent le problème « profils trop similaires » identifié dans le cahier des charges. Chaque facteur est **affiché à l'utilisateur** (« proposé parce que : 3 compétences que tu cherches, disponibilité compatible, filière complémentaire »).

**Exclusions explicites en V1** : aucun signal comportemental, aucun apprentissage automatique, aucune donnée de genre.

- **[V2]** : pondération apprise sur les équipes qui ont tenu. **[V3]** : prédiction de stabilité d'équipe.

## TAL-05 — Demande de contact et dévoilement **[V1]**

- **But** : ouvrir la relation de façon consentie et symétrique.
- **Données** : demande (émetteur, destinataire, message, statut), date de dévoilement.
- **Règles** : quota de demandes en attente pour éviter le démarchage de masse ; **refus silencieux** (l'émetteur voit « sans réponse », jamais « refusé ») ; blocage possible.
- **Dépend de** : TR-04, TAL-06.

## TAL-06 — Messagerie privée **[V1]**

- **But** : converser après acceptation.
- **Accès** : les deux parties d'une mise en relation acceptée.
- **Données** : conversation, messages, accusés de lecture, blocage, signalement.
- **Règles** : **inaccessible aux établissements et aux partenaires**, y compris à l'établissement dont l'étudiant dépend. Accès modérateur uniquement sur signalement, et journalisé.
- **Dépend de** : TAL-05, TR-08.

## TAL-07 — Visibilité dans le Feed Talents **[V1]**

- **But** : être trouvé sans avoir à chercher.
- **Accès** : opt-in du talent, révocable à tout moment.
- **Données** : disponibilité déclarée, type d'opportunité recherché, mise en avant temporaire.
- **Dépend de** : TR-06, TR-04.

## TAL-08 — Échanges communautaires **[V2]**

- **But** : entraide, retours d'expérience, questions — répondre à la « peur du jugement social ».
- **Accès** : tous les talents ; les cadres d'organisation publient sous identité certifiée et **ne peuvent pas publier anonymement**.
- **Données** : sujet, catégorie, messages, réactions, publication anonyme optionnelle (l'auteur réel reste connu du système pour la modération), signalements.
- **Format** : **forum asynchrone, pas de chat.** Léger en bande passante, indexable, la valeur reste consultable des mois après.
- **Dépend de** : TR-08, TR-05.

---

# C. Projets et espace collaboratif

## PRJ-01 — Création et cycle de vie **[V1]**

- **But** : transformer une idée en objet suivi.
- **Accès** : tout talent actif. Le créateur devient propriétaire.
- **Données** : titre, pitch, secteur, région, état, dates, propriétaires, visibilité.
- **États complets (cible)** : `Brouillon`, `Recrutement`, `Actif`, `Recherche de mentorat`, `Recherche de financement`, `Incubé`, `En pause`, `Archivé`, `Abandonné`.
- **Règle clé (D6)** : création possible avec **titre + pitch uniquement**. Le BMC devient obligatoire pour **sortir du Brouillon**.
- **Dépend de** : TAL-01, PRJ-02.

## PRJ-02 — Business Model Canvas guidé **[V1]**

- **But** : structurer la réflexion, et fournir aux partenaires une grille de lecture homogène de tous les projets.
- **Accès** : membres en écriture ; mentors en lecture et commentaire ; visibilité publique paramétrable **bloc par bloc**.
- **Données** : 9 blocs (segments de clientèle, proposition de valeur, canaux, relations clients, revenus, ressources clés, activités clés, partenaires clés, structure des coûts), contenu, historique, complétude, commentaires de mentor.
- **Règles** : chaque bloc porte une explication et un exemple contextualisé ; **sauvegarde automatique** — sur une connexion instable, perdre 20 minutes de rédaction signifie ne jamais recommencer.
- **Dépend de** : PRJ-01.
- **[V2]** : comparaison à des BMC de référence, alertes de cohérence.

## PRJ-03 — Membres, rôles et recrutement **[V1]**

- **But** : constituer et gouverner l'équipe.
- **Accès** : propriétaires pour l'administration ; membres en lecture.
- **Données** : membre, rôle projet (`propriétaire`, `membre`, `mentor`, `observateur`), rôle fonctionnel déclaré, dates d'entrée et de sortie, postes ouverts (intitulé, compétences, temps attendu).
- **Dépend de** : PRJ-01, TR-03.

## PRJ-04 — Candidatures **[V1]**

- **But** : rejoindre un projet, et permettre au porteur de choisir.
- **Accès** : tout talent actif candidate ; les propriétaires traitent.
- **Données** : candidature (candidat, poste visé, message, statut `en attente / acceptée / refusée / retirée`, motif de refus).
- **Règles** : **relance automatique du porteur** au-delà d'un délai. Une candidature sans réponse est le premier motif d'abandon d'une plateforme de mise en relation ; le rappel protège la confiance de tout le monde, pas seulement du candidat.
- **Dépend de** : PRJ-03, TR-05, TR-04 (l'identité du candidat n'est révélée qu'à l'acceptation).

## PRJ-05 — Tâches **[V1]**

- **But** : suivre l'exécution.
- **Accès** : membres.
- **Données** : titre, description, responsable, dates, statut (`à faire`, `en cours`, `bloqué`, `terminé`), priorité, historique.
- **Dépend de** : PRJ-03.
- **[V2]** : dépendances entre tâches, jalons, sous-tâches.

## PRJ-06 — Canal de discussion du projet **[V1]**

- **But** : garder les décisions dans le projet plutôt que dans WhatsApp — c'est là qu'on perd la mémoire des équipes étudiantes.
- **Accès** : membres ; mentors sur canal dédié.
- **Données** : canaux, messages, mentions, pièces jointes.
- **Dépend de** : PRJ-03.

## PRJ-07 — Notes collaboratives **[V2]**

- **But** : documenter (comptes rendus, recherche, décisions).
- **Accès** : droits granulaires par note (lecture / écriture / privée aux propriétaires).
- **Données** : note, contenu, auteurs, droits, versions.
- **Dépend de** : PRJ-03.

## PRJ-08 — Budget et suivi financier **[V1, déclaratif]**

- **But** : apprendre à piloter un budget et rendre le projet lisible pour un financeur.
- **Accès** : membres avec droit finance ; mentors en lecture si autorisé.
- **Données** : ligne budgétaire, entrée/sortie, montant **et devise**, catégorie, date, responsable, justificatif optionnel, engagements financiers rattachés (TR-13).
- **Règle** : **aucun flux monétaire réel.** C'est un registre, pas un compte.
- **Dépend de** : PRJ-03, TR-13.

## PRJ-09 — Calendrier **[V1]**

- **But** : vue unifiée des échéances (tâches, jalons, événements auxquels l'équipe est inscrite).
- **Dépend de** : PRJ-05, PAR-06.

## PRJ-10 — Publications au nom du projet **[V1]**

- **But** : alimenter le Feed Projets. C'est le canal par lequel un projet devient visible des partenaires.
- **Accès** : propriétaires.
- **Données** : type (`recherche de collaborateur`, `recherche de mentorat`, `recherche de financement`, `avancement`), contenu, tags, expiration.
- **Dépend de** : PRJ-01, TR-06.

## PRJ-11 — Mentorat **[V1]**

- **But** : ouvrir un accès contrôlé de l'accompagnateur à l'espace projet.
- **Accès** : proposition par le partenaire ou demande par le projet ; **acceptation explicite du projet obligatoire**.
- **Données** : relation de mentorat, périmètre d'accès accordé **case par case** (BMC, tâches, budget), période, commentaires, comptes rendus.
- **Dépend de** : PRJ-03, PAR-04, TR-03.

## PRJ-12 — Export et portabilité **[V1]**

- **But** : garantir aux équipes qu'elles ne sont jamais prisonnières de la plateforme.
- **Accès** : propriétaires.
- **Données** : archive du projet (BMC, tâches, budget, notes, membres).

**Engagement de gouvernance associé** : si un établissement cesse d'utiliser la plateforme, ses étudiants perdent le **badge de certification**, jamais leurs données ni leurs projets. À écrire dans les CGU.

## PRJ-13 — Espace vitrine public du projet **[V2]**

- **But** : une page partageable hors plateforme, pour candidater à des concours externes.

---

# D. Établissement affiliant

## ETB-01 — Compte organisation et cadres **[V1]**

- **But** : donner à l'établissement un espace administratif propre.
- **Accès** : créé par le staff CoFound après démarchage. Le premier cadre invite ses collègues.
- **Données** : raison sociale, type, pays, région, logo, cadres et rôles (`administrateur`, `gestionnaire`, `observateur`), capacités activées.
- **Dépend de** : ADM-01, TR-03.

## ETB-02 — Import des étudiants **[V1 — module critique]**

- **But** : peupler la plateforme sans inscription, en une opération que l'établissement doit réussir du premier coup.
- **Accès** : cadre `administrateur` ou `gestionnaire`.
- **Données** : lot d'import (fichier source, auteur, date, statut), lignes (données brutes, résultat, erreur), mapping de colonnes, comptes créés.
- **Champs attendus** : email (clé), nom, prénom, filière, niveau, année d'entrée, genre (facultatif), matricule (facultatif).
- **Dépend de** : TR-01, TR-10, TR-12.

**Exigences non négociables**

| Exigence | Pourquoi |
|---|---|
| CSV **et** XLSX, encodages multiples, accents | On ne peut pas imposer un format à un service de scolarité |
| **Mapping de colonnes assisté** | On s'adapte à son fichier, pas l'inverse |
| **Prévisualisation avant exécution**, rapport ligne par ligne | Rend l'opération réessayable sans dégât |
| **Idempotence** | Ré-importer le même fichier ne duplique rien, ne réinitialise aucun mot de passe, ne réactive pas un compte gelé. L'établissement ré-importera au semestre suivant. |
| Reprise sur erreur partielle, annulation d'un lot | Un import raté ne doit pas être un incident |
| **Retour des rebonds email dans le rapport** | « 12 adresses invalides, voici lesquelles » — une contrainte technique transformée en service |

## ETB-03 — Gestion des affiliations et des statuts **[V1]**

- **But** : maintenir la véracité du badge de certification dans le temps.
- **Accès** : cadres de l'établissement.
- **Données** : affiliation (talent, établissement, statut, filière, promotion, période, `certifiante = vrai`), historique des changements.
- **Règles** : un talent peut avoir plusieurs affiliations ; un établissement ne modifie que la sienne ; le passage d'une promotion entière en `Sortant` doit être une **opération groupée**.
- **Dépend de** : ETB-02, TR-01, TR-10.

## ETB-04 — Annuaire des talents de l'établissement **[V1]**

- **But** : permettre à l'établissement de repérer et d'orienter ses étudiants.
- **Accès** : cadres, **limité à ses propres affiliés**.
- **Données** : profils **en identité réelle** — l'établissement connaît déjà ses étudiants, il a fourni la liste. Les profils d'autres établissements restent en **vue pseudonymisée**. **Le genre n'est jamais visible individuellement.**
- **Dépend de** : ETB-03, TR-04.

## ETB-05 — Tableau de bord institutionnel **[V1]**

- **But** : donner à l'établissement une raison de revenir. C'est ce qui transforme un import en usage.
- **Accès** : cadres.
- **Données agrégées** : taux d'activation, profils complétés, projets créés et leurs états, secteurs représentés, taux de projets pluridisciplinaires, **part des équipes mixtes** (seuil d'agrégation), opportunités saisies, mentorats en cours, **sa position au classement inter-établissements en vue privée**.
- **Dépend de** : ANA-01, TR-09.

**Note** : le classement des établissements reste **privé**. Publier un classement où la plupart des établissements figurent en bas est contre-productif pendant la phase de démarchage commercial.

## ETB-06 — Publication d'opportunités internes **[V1]**

- Concours interne, appel à candidatures, information de promotion. Réutilise PAR-06.

## ETB-07 — Ce que l'établissement ne peut **pas** faire

*Ces interdictions sont des tests automatisés, pas des promesses commerciales.*

1. Lire une messagerie privée ou un canal de projet, y compris ceux de ses propres affiliés.
2. Modifier ou supprimer le contenu d'un projet.
3. Voir l'identité réelle d'un talent affilié à une autre organisation.
4. Consulter le genre d'un individu identifié (agrégat uniquement, seuil ≥ 5).
5. Empêcher un projet d'exister.

## ETB-08 — Connexion au système d'information **[V3]**

Synchronisation automatique des inscriptions, SSO.

---

# E. Partenaire — incubateur, entreprise, ONG, institution publique

## PAR-01 — Demande d'accès et profil vérifié **[V1]**

- **But** : le second mode d'entrée sur la plateforme, celui du côté payant.
- **Accès** : formulaire public de demande → **validation manuelle par le staff CoFound** → création du compte et activation des capacités.
- **Données** : entité, type, pays, secteurs d'intérêt, description, logo, documents justificatifs, cadres, capacités accordées, statut de vérification.
- **Dépend de** : ADM-01, TR-03.

## PAR-02 — Recherche de projets (dealflow) **[V1]**

- **But** : la fonction pour laquelle le partenaire paiera.
- **Accès** : partenaires vérifiés.
- **Données** : filtres (secteur, état, région, établissement, maturité du BMC, taille d'équipe, pluridisciplinarité), listes de suivi, notes internes privées.
- **Dépend de** : PRJ-01, TR-07.

**Hypothèse de monétisation** (à valider avec le CEO) : **consulter est gratuit, contacter et publier sont payants.** Voir [`business/modele-economique.md`](./business/modele-economique.md).

## PAR-03 — Recherche de talents **[V1]**

- **But** : sourcing pour stage, alternance, recrutement, programme.
- **Accès** : partenaires ayant la capacité `RECRUTER`. **Profils pseudonymisés uniquement** ; le contact suit le même protocole de consentement que pour les talents (TAL-05).
- **Règle anti-démarchage** : un partenaire dispose d'**un seul message de contact** par talent ou par projet. Sans réponse, pas de relance.
- **Dépend de** : TR-06, TR-04.

## PAR-04 — Proposition d'accompagnement **[V1]**

- **But** : devenir mentor d'un projet, avec un accès explicitement consenti.
- **Dépend de** : PRJ-11.

## PAR-05 — Engagement financier **[V1 déclaratif / V2 opérateur]**

- **But** : formaliser une intention d'investissement, un don ou une subvention, et la suivre jusqu'à confirmation.
- **Accès** : partenaires avec capacité `FINANCER` ; **acceptation obligatoire par les propriétaires du projet**.
- **Données** : cf. TR-13, plus conditions annoncées, échéancier, pièces jointes.
- **Dépend de** : TR-13, PRJ-08.

## PAR-06 — Opportunités : concours, appels, programmes, événements **[V1]**

*Entité unique typée (D10).*

- **But** : le canal par lequel un partenaire s'adresse à toute la communauté.
- **Accès** : partenaires avec capacité `PUBLIER_OPPORTUNITÉ` ; candidature par les talents et par les projets.
- **Données** : type (`concours`, `appel à candidatures`, `programme d'incubation`, `offre de financement`, `événement`, `offre de stage`), titre, description, critères d'éligibilité, dates, lieu ou distanciel, places, pièces demandées ; candidatures et statuts ; inscriptions pour les événements.
- **Dépend de** : TR-05, TR-06, PRJ-01.

## PAR-07 — Sondages **[V1]**

- **But** : outil de connaissance de la population étudiante — un des services que le partenaire achète.
- **Accès** : partenaires avec capacité `SONDER` ; réponse volontaire des talents.
- **Données** : questionnaire, ciblage (filière, établissement, région, secteur), réponses **anonymisées à la collecte**, résultats agrégés avec seuil minimal.
- **Règles** : un partenaire ne voit **jamais** une réponse individuelle rattachable. Quota de sondages pour éviter la sur-sollicitation.
- **Dépend de** : ANA-01, TR-09.

## PAR-08 — Analytique écosystème **[V2]**

- **But** : vendre la lecture du marché — où sont les talents, dans quels secteurs, quelles dynamiques.
- **Accès** : capacité `ANALYTICS`. **Données agrégées et anonymisées uniquement**, jamais nominatives — contrainte explicite pour le cadre gouvernemental.
- **Dépend de** : ANA-01, TR-09.

## PAR-09 — Abonnement et facturation **[V2]**

Formules, quotas, historique. Facturation classique hors plateforme.

## PAR-10 — Espace partenaire public **[V2]**

Page vitrine consultable par les étudiants, historique des projets soutenus.

---

# F. Association et club étudiant

## ASSO-01 — Affiliation déclarative **[V2]**

- **But** : rendre visibles les communautés étudiantes sans diluer la valeur de la certification.
- **Données** : affiliation avec `certifiante = faux`, rôle dans l'association.
- **Règle** : affichée distinctement du badge établissement, avec un libellé différent (« membre déclaré » vs « certifié par »).

## ASSO-02 — Événements et publications **[V2]**

Réutilise PAR-06, sans capacité de financement ni d'analytics.

---

# G. Staff CoFound

## ADM-01 — Gestion des organisations **[V1]**
Validation des demandes, création des comptes établissement, activation **capacité par capacité**, suspension.

## ADM-02 — Supervision des imports **[V1]**
Vue de tous les lots, diagnostic, relance, annulation. C'est le support de premier niveau des établissements.

## ADM-03 — File de modération **[V1]**
Traitement priorisé, décisions, sanctions graduées (avertissement, gel temporaire, désactivation). Cf. TR-08.

## ADM-04 — Consultation du journal d'audit **[V1]**
Cf. TR-10.

## ADM-05 — Référentiels de la plateforme **[V1]**
Compétences, filières, secteurs, régions, types d'organisation. **En base, versionnés, avec clés i18n — jamais en dur dans le code.** Sans quoi chaque nouvelle filière est un déploiement et l'extension à un autre pays est impossible.

## ADM-06 — Santé produit **[V1 réduit]**
Activation, rétention, projets créés, taux de match, délai de réponse aux candidatures, volume de modération.

## ADM-07 — Support et accès délégué **[V2]**
Prise de contrôle d'un compte à des fins de support, **avec consentement de l'utilisateur et journalisation systématique**.

---

# H. Analytique — module transversal

## ANA-01 — Socle analytique **[V1 réduit]**

- **But** : produire les indicateurs des trois tableaux de bord (établissement, partenaire, staff) depuis une source unique.
- **Règles** : agrégation uniquement, **seuil minimal de 5 individus**, aucune donnée nominative exposée hors de l'établissement d'origine, journalisation de tout export.
- **Indicateurs** : activation, complétion de profil, projets par état et par secteur, pluridisciplinarité des équipes, mixité, mentorats, engagements financiers, opportunités et candidatures, délais de réponse.
- **[V2]** : cohortes, rétention, séries temporelles. **[V3]** : indicateurs prédictifs de stabilité d'équipe.

---

# Matrice d'accès de synthèse

| Ressource | Talent | Établissement (ses affiliés) | Partenaire vérifié | Staff |
|---|---|---|---|---|
| Profil — vue publique | ✅ | ✅ | ✅ | ✅ |
| Profil — identité réelle | après dévoilement ou projet commun | ✅ | après dévoilement | modérateur sur signalement, **tracé** |
| **Genre individuel** | soi uniquement | ❌ | ❌ | ❌ |
| Messagerie privée | participants | ❌ | ❌ | modérateur sur signalement, **tracé** |
| Canal de projet | membres | ❌ | ❌ | modérateur sur signalement, **tracé** |
| BMC | membres + mentors | ❌ | si public ou mentor | lecture |
| Budget projet | membres | ❌ | mentor si autorisé | lecture |
| Tableau de bord agrégé | ❌ | ses affiliés | écosystème | tout |
| Import d'étudiants | ❌ | ✅ | ❌ | supervision |
| Publier une opportunité | ❌ | ✅ | selon capacité | ✅ |
| Engagement financier | accepter | ❌ | proposer | lecture |

---

# Fonctionnalités que ni le cahier des charges ni la liste d'acteurs initiale ne mentionnaient

Ajoutées après analyse, parce qu'un produit réel ne fonctionne pas sans elles :

- **Notifications** (TR-05) — sans rappel, une marketplace à deux faces est morte au deuxième jour.
- **Découverte et recherche de projets** (TR-07) — « rejoindre un projet » suppose qu'on le trouve.
- **Workflow de candidature** (PRJ-04) — recevoir, comparer, répondre. Un flux, pas un bouton.
- **Journal d'audit** (TR-10) — obligatoire dès qu'on certifie et qu'on sanctionne.
- **Export et portabilité** (PRJ-12) — condition de la confiance dans un modèle B2B2C.
- **Registre de consentements** (TR-09) — le cahier des charges promet « consentement explicite » : c'est une fonctionnalité, pas une phrase de CGU.
- **Internationalisation** (TR-11) — une « infrastructure nationale » inclusive qui n'existe qu'en français contredit sa propre mission.
- **Frontière de paiement** (TR-13) — la seule façon d'accueillir un opérateur sans réécrire le domaine.
