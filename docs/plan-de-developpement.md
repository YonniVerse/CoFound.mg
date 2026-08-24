# Plan de développement — MVP CoFound.mg

**Version** : 1.0 — 20 août 2026
**Équipe** : 3 personnes — Yonni (CTO), Rino, Norman
**Portée** : blocs M1–M13 de [`mvp-scope.md`](./mvp-scope.md)

---

## 1. Principe de séquencement

Le MVP livre **la chaîne entière, fine**. Le séquencement suit donc la chaîne, mais avec une
inversion importante au démarrage :

> **On construit d'abord ce qui est impossible à ajouter après, ensuite ce qui est visible.**

Le pseudonymat, le RBAC, l'audit et les référentiels en base sont livrés en vague 0 non parce
qu'ils sont urgents, mais parce que chaque écran construit avant eux devrait être réécrit
après eux.

### Six vagues, chacune terminée par une démonstration verticale

| Vague | Thème | Fin de vague : ce qui marche de bout en bout |
|---|---|---|
| **V0** | Fondations | Un compte se connecte, une permission est refusée, une action est auditée |
| **V1** | La chaîne d'entrée | Un fichier Excel entre, un étudiant activé remplit son profil |
| **V2** | La rencontre | Deux étudiants se trouvent, se dévoilent et se parlent |
| **V3** | Le projet | Une équipe se forme autour d'un projet structuré et travaille dedans |
| **V4** | Le côté payant | Un incubateur trouve ce projet, publie un appel et le contacte |
| **V5** | Sécurité et finition | Un signalement est traité, tout est mesuré, la démo est rejouable |

**Règle** : une vague n'est pas terminée tant que son parcours n'est pas démontrable de bout
en bout sur l'environnement de recette. Une vague à 90 % ne vaut rien — c'est la conséquence
directe du raisonnement en chaîne.

---

## 2. Répartition entre les trois membres

### Principe : propriété par domaine vertical, pas par couche

Un découpage front/back à trois personnes crée deux problèmes : le développeur frontend
devient le goulot d'étranglement de tout le monde, et personne ne possède un parcours complet.

Chacun livre donc **son domaine de bout en bout** (API + interface), sauf le socle transversal.

| Membre | Domaine | Pourquoi lui |
|---|---|---|
| **Yonni** *(CTO)* | **Socle transversal** : monorepo, CI/CD, schéma et migrations, auth, RBAC, projections pseudonymes, audit, infrastructure et déploiement, observabilité. Puis : messagerie, notifications. | Backend engineering, conception d'API, Docker, GitHub Actions, Linux, Prisma. C'est aussi le rôle de l'architecte de tenir les garanties transversales. |
| **Rino** | **Identité et données** : import CSV/XLSX, invitations, activation, profil et onboarding, référentiels, **Dream-Match**, console établissement, modération. | NestJS et Prisma déjà pratiqués, data science pour le scoring, orientation sécurité pour l'import et la modération, et compétences de design pour les écrans d'onboarding. |
| **Norman** | **Découverte et projets** : design system, feeds, recherche, espace projet (BMC, tâches, candidatures), console partenaire. **Référent frontend** : relit toute l'interface, possède le design system. | Spécialiste frontend, React et Next.js, déjà auteur d'une partie du prototype. Le référent frontend garantit la cohérence visuelle sans être le goulot de tous les tickets. |

### Règles de collaboration

1. **Revue croisée obligatoire** sur `auth`, `rbac` et `privacy`. Ce sont les trois modules où
   une erreur est silencieuse et coûteuse — personne ne les fusionne seul.
2. **Norman relit toute l'interface**, même les écrans qu'il n'écrit pas. Le design system a
   un propriétaire unique.
3. **Le contrat d'API précède l'implémentation** : le schéma Zod partagé est écrit et fusionné
   avant que le front et le back partent en parallèle. C'est ce qui permet aux trois de
   travailler sans s'attendre.
4. **Aucun `main` direct** : branche par ticket, CI verte obligatoire, `dev` → `main` sur les
   fins de vague.

---

## 3. Backlog

Estimations en **jours-homme (j)**. Responsable : **Y** = Yonni · **R** = Rino · **N** = Norman.

### Vague 0 — Fondations

| # | Ticket | Dépend de | Resp. | Est. |
|---|---|---|---|---|
| F-01 | Monorepo pnpm : `apps/web`, `apps/api`, `packages/shared` — **`git mv frontend apps/web`** pour préserver l'historique | — | Y | 1 |
| F-02 | Docker Compose local : Postgres + API + web | F-01 | Y | 0,5 |
| F-03 | Pipeline CI GitHub Actions : lint, types, tests, build | F-01 | Y | 1 |
| F-04 | **Budget de performance vérifié en CI** (taille du bundle) | F-03 | N | 0,5 |
| F-05 | Schéma Prisma initial + migrations + extensions `pg_trgm` / `unaccent` | F-02 | Y | 2 |
| F-06 | Seed des référentiels (compétences, filières, secteurs, régions) | F-05 | R | 1 |
| F-07 | Module `auth` : argon2id, jeton d'accès en mémoire, rafraîchissement en cookie `httpOnly` avec rotation et détection de réutilisation | F-05 | Y | 3 |
| F-08 | Module `rbac` : guard global, refus par défaut, décorateurs de permission | F-07 | Y | 2 |
| F-09 | Module `privacy` : projections `TalentProfile` / `TalentIdentity`, fonction `peutVoirIdentite` | F-05 | Y | 2 |
| F-10 | Module `audit` : interceptor, table en écriture seule, droits SQL restreints | F-08 | Y | 1 |
| F-11 | `packages/shared` : schémas Zod, types, codes d'erreur | F-01 | Y | 1 |
| F-12 | i18n : i18next, extraction des clés, règle de lint anti-chaînes en dur | F-01 | N | 1,5 |
| F-13 | Reprise du design system du prototype dans `apps/web` + **corrections C1 à C5** | F-01 | N | 2 |
| F-14 | Client d'API typé côté web, remplaçant `fetchMock` | F-11 | N | 1 |
| F-15 | pg-boss : file de traitements, worker séparé | F-05 | Y | 1 |
| F-16 | Infrastructure : VPS, Caddy, Postgres managé, R2, déploiement automatisé | F-03 | Y | 2 |
| F-17 | Sauvegardes hors machine + **restauration testée une fois** | F-16 | Y | 1 |
| F-18 | Sentry, pino, sonde de disponibilité | F-16 | Y | 0,5 |
| F-19 | Suite de tests des **7 permissions négatives** (échoue tant que non implémenté) | F-08, F-09 | Y | 1,5 |

**Sous-total : 25,5 j** · *Chemin critique : F-01 → F-05 → F-07 → F-08 → F-09*

### Vague 1 — La chaîne d'entrée

| # | Ticket | Dépend de | Resp. | Est. |
|---|---|---|---|---|
| E-01 | Domaine `.mg` + SPF / DKIM / DMARC + service email | F-16 | Y | 1 |
| E-02 | Envoi transactionnel + gabarits d'email (i18n) | E-01, F-15 | Y | 1,5 |
| E-03 | Webhook de rebond → `ImportRow.result = BOUNCED` | E-02 | R | 1 |
| E-04 | Analyse CSV/XLSX, normalisation, encodages et accents | F-05 | R | 2 |
| E-05 | **Mapping de colonnes assisté** (interface) | E-04 | R | 2 |
| E-06 | **Prévisualisation ligne par ligne**, aucune écriture | E-04 | R | 1,5 |
| E-07 | Application du lot en une transaction + **idempotence** | E-06, F-15 | R | 2 |
| E-08 | Annulation d'un lot, relance groupée d'invitations | E-07 | R | 1 |
| E-09 | Jetons d'invitation hachés, expiration, relance | F-07 | Y | 1 |
| E-10 | Écran d'activation `/activation/:token` + choix du mot de passe | E-09, F-13 | N | 1 |
| E-11 | Écran de connexion + mot de passe oublié | F-07, F-13 | N | 1 |
| E-12 | Modèle de profil + API (public / privé) | F-09 | R | 1,5 |
| E-13 | **Onboarding progressif** : étapes courtes, reprise, indicateur de complétion | E-12, F-13 | R | 3 |
| E-14 | Relance de complétion dans l'espace personnel | E-13 | R | 0,5 |
| E-15 | Consentements : registre, écran, retrait | F-05 | Y | 1 |
| E-16 | Console établissement : squelette, membres, rôles | F-08, F-13 | R | 1,5 |
| E-17 | Console établissement : lots d'import + rapport (**y compris rebonds**) | E-07, E-03 | R | 1,5 |
| E-18 | Gestion des affiliations et statuts, **opération groupée par promotion** | E-07 | R | 1,5 |
| E-19 | Annuaire des affiliés (identité réelle, **sans le genre**) | E-18, F-09 | R | 1 |

**Sous-total : 26,5 j**

### Vague 2 — La rencontre

| # | Ticket | Dépend de | Resp. | Est. |
|---|---|---|---|---|
| M-01 | Recherche PostgreSQL : `tsvector`, `pg_trgm`, `unaccent` | F-05 | N | 1,5 |
| M-02 | API Feed Projets : filtres, pagination | M-01 | N | 1,5 |
| M-03 | Interface Feed Projets (reprise des composants du prototype) | M-02, F-13 | N | 2 |
| M-04 | API + interface Feed Talents (opt-in, cartes pseudonymisées) | M-01, F-09 | N | 2 |
| M-05 | Formulaire Dream-Match (profil recherché) | E-12 | R | 1,5 |
| M-06 | **Algorithme de scoring** en SQL : complémentarité, recouvrement, disponibilité, objectifs | M-05 | R | 3 |
| M-07 | **Affichage des facteurs explicatifs** de chaque suggestion | M-06 | R | 1,5 |
| M-08 | Retour « pas intéressé » et exclusion | M-06 | R | 0,5 |
| M-09 | Demande de contact : quotas, **refus silencieux** | F-09 | Y | 1,5 |
| M-10 | Dévoilement mutuel + création de la `Connection` | M-09 | Y | 1 |
| M-11 | Conversations et messages (API) | M-10 | Y | 2 |
| M-12 | Interface de messagerie (liste + fil, rafraîchissement) | M-11, F-13 | Y | 2 |
| M-13 | Blocage d'un utilisateur | M-11 | Y | 0,5 |
| M-14 | **Bouton de signalement** partout (profil, message, projet, publication) | F-05 | R | 1 |
| M-15 | Notifications : modèle, API, centre in-app | F-15 | Y | 2 |
| M-16 | Notifications par email sur les 4 événements décisifs | M-15, E-02 | Y | 1 |

**Sous-total : 24,5 j**

### Vague 3 — Le projet

| # | Ticket | Dépend de | Resp. | Est. |
|---|---|---|---|---|
| P-01 | Création de projet (titre + pitch), machine à états | F-08 | N | 1,5 |
| P-02 | **BMC guidé** : 9 blocs, exemples, **sauvegarde automatique** | P-01 | N | 3 |
| P-03 | Règle de transition `Brouillon → Recrutement` (BMC complet) | P-02 | N | 0,5 |
| P-04 | Postes ouverts + compétences requises | P-01 | N | 1 |
| P-05 | Candidature : API + écran candidat | P-04, F-09 | N | 1,5 |
| P-06 | File de candidatures côté porteur, accepter / refuser avec motif | P-05 | N | 2 |
| P-07 | **Relance automatique du porteur** au-delà d'un délai | P-06, F-15 | N | 0,5 |
| P-08 | Membres et rôles projet, dévoilement automatique entre membres | P-01, M-10 | N | 1,5 |
| P-09 | Tâches : CRUD, responsable, échéance, statut | P-08 | N | 2 |
| P-10 | Canal de discussion du projet (réutilise `Conversation`) | P-08, M-11 | Y | 1 |
| P-11 | Publications au nom du projet → Feed Projets | P-01, M-02 | N | 1,5 |
| P-12 | Export du projet (archive) | P-02, P-09 | Y | 1 |
| P-13 | Détail de projet public / privé selon le rôle | P-01, F-09 | N | 1,5 |

**Sous-total : 19 j**

### Vague 4 — Le côté payant

| # | Ticket | Dépend de | Resp. | Est. |
|---|---|---|---|---|
| B-01 | Demande d'accès partenaire (formulaire public) | F-05 | N | 1 |
| B-02 | Console staff : validation d'organisation, **activation capacité par capacité** | F-08, F-10 | R | 2 |
| B-03 | Profil vérifié de l'organisation | B-02 | N | 1 |
| B-04 | Recherche de projets partenaire : filtres avancés, **maturité du BMC** | M-01, P-02 | N | 2 |
| B-05 | Liste de suivi + notes internes privées | B-04 | N | 1 |
| B-06 | Entité `Opportunity` + publication (`appel à candidatures`) | B-02 | N | 2 |
| B-07 | Candidature à une opportunité (talent et projet) | B-06 | N | 1,5 |
| B-08 | Traitement des candidatures côté partenaire | B-07 | N | 1,5 |
| B-09 | Contact d'une équipe : **un seul message, pas de relance** | B-04, M-11 | N | 1 |
| B-10 | Recherche de talents (`RECRUIT`), profils pseudonymisés | M-04, F-09 | N | 1,5 |
| B-11 | Port `PaiementProvider` + entité `FinancialEngagement` (sans interface) | F-05 | Y | 1 |

**Sous-total : 15,5 j**

### Vague 5 — Sécurité et finition

| # | Ticket | Dépend de | Resp. | Est. |
|---|---|---|---|---|
| S-01 | File de modération priorisée | M-14 | R | 2 |
| S-02 | Décisions et sanctions graduées, gel automatique sur motif critique | S-01 | R | 2 |
| S-03 | Notification de la décision au signalant | S-02, M-15 | R | 0,5 |
| S-04 | Accès modérateur à l'identité **journalisé** | S-01, F-10 | R | 0,5 |
| S-05 | Console staff : journal d'audit, référentiels, santé produit | F-10 | R | 2 |
| S-06 | Export des données personnelles | E-15 | Y | 1 |
| S-07 | Écrans de gel, de compte sortant, de compte alumni | S-02 | N | 1 |
| S-08 | **`seed:demo`** : établissement, promotion, projets, partenaire, tous reconstructibles par commande | F-06 | R | 2 |
| S-09 | Tests E2E Playwright sur 3 parcours : activation → profil → candidature ; import → invitation ; partenaire → opportunité | tout | Y | 2 |
| S-10 | Passe de performance : budget, lazy loading, taille des images | F-04 | N | 2 |
| S-11 | Passe d'accessibilité et de responsive sur mobile réel | F-13 | N | 1,5 |
| S-12 | Passe i18n : aucune chaîne en dur restante | F-12 | N | 1 |
| S-13 | Documentation d'exploitation : déploiement, restauration, incident | F-17 | Y | 1 |
| S-14 | CGU et politique de confidentialité (avec l'engagement de portabilité) | — | Y | 1 |

**Sous-total : 19,5 j**

---

## 4. Récapitulatif et charge

| Vague | Charge | Yonni | Rino | Norman |
|---|---|---|---|---|
| V0 — Fondations | 25,5 j | 18,5 | 1 | 6 |
| V1 — Chaîne d'entrée | 26,5 j | 5,5 | 19 | 2 |
| V2 — Rencontre | 24,5 j | 10 | 7,5 | 7 |
| V3 — Projet | 19 j | 2 | 0 | 17 |
| V4 — Côté payant | 15,5 j | 1 | 2 | 12,5 |
| V5 — Finition | 19,5 j | 5 | 9 | 5,5 |
| **Total** | **130,5 j** | **42** | **38,5** | **50** |

**Durée calendaire à trois personnes à temps plein : ~9 à 11 semaines**, revues, corrections
et imprévus compris.

### Déséquilibres à corriger en cours de route

- **V0 est très chargée sur Yonni** — c'est structurel, le socle est indivisible. Rino et
  Norman travaillent en parallèle sur les référentiels, l'i18n et la reprise du design system,
  qui ne dépendent pas du socle.
- **V3 est presque entièrement sur Norman.** Rino, libéré de V1, y bascule : P-09 (tâches) et
  P-13 (détail de projet) sont les tickets les plus faciles à transférer.
- **Le chemin critique passe par F-05 → F-07 → F-08 → F-09.** Tant que ces quatre tickets ne
  sont pas fusionnés, la moitié du backlog est bloquée. Ce sont les seuls tickets qu'il faut
  protéger de toute interruption.

---

## 5. Risques techniques et mitigation

| # | Risque | Impact | Mitigation | Repli |
|---|---|---|---|---|
| **R1** | **Les invitations arrivent en indésirables.** L'unique porte d'entrée du produit est un email. | Critique — adoption nulle | SPF/DKIM/DMARC configurés en E-01, **avant** tout envoi ; montée en volume progressive ; webhook de rebond ; test réel sur les domaines des établissements pilotes | **L'établissement distribue une liste de liens d'activation** générée depuis sa console — le produit fonctionne sans email |
| **R2** | **Les fichiers réels ne ressemblent pas à nos hypothèses** (colonnes fantaisistes, doublons, emails absents) | Élevé | Mapping assisté + prévisualisation dès E-05/E-06 ; **obtenir un vrai fichier de l'ESP-Antsiranana en semaine 1** et le passer en test | Import manuel assisté par le staff pour le premier établissement |
| **R3** | **Fuite d'identité par un chemin oublié** | Critique — détruit la promesse centrale | Table séparée (jointure absente) + F-19 écrit **avant** les fonctionnalités + revue croisée obligatoire | — |
| **R4** | **Comptes créés, jamais activés** | Critique — chaîne rompue au premier maillon | Mesurer le taux d'activation dès le premier jour ; relance automatique à J+3 et J+10 ; **session d'accompagnement en présentiel** avec l'établissement pilote | Activation assistée pendant un amphi |
| **R5** | **Performance inacceptable sur un appareil réel** | Élevé | Budget vérifié en CI dès F-04 ; **tests sur un vrai Android d'entrée de gamme en 3G bridée**, pas sur un simulateur | Version allégée des feeds |
| **R6** | **Perte de données** | Critique | Base managée + sauvegardes hors machine + **restauration testée** (F-17) avant toute mise en production | — |
| **R7** | **Dépendance à une seule personne sur le socle** | Élevé | Revue croisée obligatoire sur `auth`, `rbac`, `privacy` ; documentation d'exploitation en S-13 | — |
| **R8** | **Dérive du périmètre** | Élevé | Une vague se termine par une démonstration verticale ; tout ajout non prévu passe en Should-have par défaut | — |
| **R9** | **Délai d'obtention du domaine `.mg`** | Moyen | Lancer la démarche **en semaine 1**, avant d'en avoir besoin | Domaine de repli en `.com` pour la recette |
| **R10** | **Aucun modérateur disponible au lancement** | Moyen | L'équipe fondatrice assure une permanence ; **afficher un délai honnête** (48 h) plutôt qu'un délai tenu par personne | — |
| **R11** | **La latence Europe–Madagascar est pire que prévu** | Moyen | **Mesurer réellement** depuis Antananarivo et Antsiranana avant de choisir la région ; ne jamais supposer | Basculer vers une région africaine si la mesure le justifie |

---

## 6. Migration du dépôt existant

Le dépôt `git@github.com:YonniVerse/CoFound.mg.git` est conservé, **avec son historique**.

```bash
# 1. Nettoyer l'arbre de travail actuel (fichiers modifiés non committés)
git status
git add -A && git commit -m "chore: état avant restructuration monorepo"

# 2. Créer la branche de restructuration
git checkout dev
git checkout -b chore/monorepo

# 3. Déplacer le frontend — git mv préserve le suivi des fichiers
mkdir -p apps
git mv frontend apps/web

# 4. Créer la structure du monorepo
mkdir -p apps/api packages/shared
# pnpm-workspace.yaml, package.json racine, tsconfig de base

# 5. Archiver les documents remplacés
git mv docs/PRD_CoFound_mg.md docs/archive/PRD_CoFound_mg.md
git mv docs/SPECS_CoFound_mg.md docs/archive/SPECS_CoFound_mg.md
```

> `git mv` préserve le suivi des fichiers ; `git log --follow apps/web/src/App.tsx` continuera
> de remonter l'historique complet.

**Les documents `PRD` et `SPECS` du prototype sont archivés, pas supprimés.** Ils décrivent un
produit de démonstration de hackathon (personas limités aux étudiants, critères de succès
orientés jury) que les présents documents remplacent — mais ils restent une référence utile
pour les maquettes d'écran.

---

## 7. Définition de « terminé »

Un ticket est terminé quand :

1. Le code est fusionné dans `dev` après revue.
2. La CI est verte : lint, types, tests, build, **budget de performance**.
3. Les permissions concernées sont couvertes par un test.
4. Aucune chaîne de caractères en dur n'a été introduite.
5. Le parcours est vérifié **sur mobile**, pas seulement sur écran large.

Une vague est terminée quand son **parcours de bout en bout** est démontrable sur
l'environnement de recette, avec le jeu de données reconstruit par `seed:demo`.
