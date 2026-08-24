# Écrans — onboarding et profil (UI-09 → UI-12)

**Tickets couverts** : `E-12`, `E-13`, `E-14`, `F-09`
**Bloc de périmètre** : M2 (profil et onboarding progressif), M3 (pseudonymat)

---

## UI-09 — Onboarding progressif

`/onboarding` · coquille **Plein écran** · `E-13` · resp. **R**

**But** — Produire les données structurées sans lesquelles le matching, les feeds et les
analytics n'existent pas — **sans faire abandonner personne**. Un formulaire de 40 questions en
une fois, sur mobile en 3G, ne se termine pas (TAL-02).

**Accès** — Compte `ACTIVE`. Accessible à tout moment depuis `/me` tant que la complétion est
partielle.

**Données** — `GET /me/onboarding` (état et étape courante) · `PATCH /me/profile` (par étape,
sauvegarde automatique). Alimente `TalentProfile`, `TalentSkill`, et `TalentIdentity` pour les
champs privés.

**Structure — 6 étapes courtes, 5 questions maximum chacune**

| # | Étape | Contenu | Compte dans les 60 % |
|---|---|---|---|
| 1 | **Toi** | Prénom, nom, photo (facultative) — champs **privés**, `TalentIdentity` | oui |
| 2 | **Ton parcours** | Filière, année, niveau — référentiels | oui |
| 3 | **Ce que tu sais faire** | 3 à 8 compétences (`ReferenceCombobox`) | oui |
| 4 | **Ce que tu veux faire** | Objectifs entrepreneuriaux, secteurs qui t'intéressent | oui |
| 5 | **Ta disponibilité** | Heures par semaine, taille d'équipe souhaitée, préférence d'établissement | oui |
| 6 | **Ta visibilité** | Pseudonyme, présence dans le Feed Talents, masquage filière/année, **genre (facultatif)** | non |

**L'étape 6 est la plus importante du produit.** Elle porte trois éléments :

1. **Le pseudonyme et son explication.** On dit ce qui est visible d'un profil pseudonymisé (compétences, filière, année, établissement, disponibilité) et ce qui ne l'est pas (nom, photo, contact). On emploie le mot **pseudonymat** et on dit franchement que dans une petite promotion, filière + année + établissement peuvent suffire à reconnaître quelqu'un — **c'est le moment exact où on le dit** (TR-04), pas dans les CGU.
2. **Les options de masquage** de la filière et de l'année, présentées comme la réponse à ce qui vient d'être dit.
3. **Le genre**, facultatif, avec la phrase qui dit qui le lit : *personne, jamais — uniquement en statistique agrégée d'au moins 5 personnes* (D8). Une option *Je préfère ne pas répondre* explicite, au même niveau que les autres.

**Composants** — `StepForm`, `ReferenceCombobox`, `ReferenceSelect`, `AutoSaveIndicator`, `FileDropzone`, `CompletionMeter`.

**États** — Chargement de l'état · saisie · enregistrement automatique · **hors ligne** (saisie conservée localement, envoi rejoué au retour du réseau) · erreur de validation par champ · reprise à l'étape sauvegardée · terminé.

**Règles**
- **Interruptible partout.** Un bouton *Continuer plus tard* sur chaque étape, aucun avertissement culpabilisant à la sortie.
- Reprise à l'étape exacte après fermeture du navigateur.
- La complétion est calculée par l'API, jamais par le front — c'est elle qui conditionne le Dream-Match et le Feed Talents (`MIN_PROFILE_COMPLETION`).
- Les compétences viennent du référentiel ; **aucune saisie libre** qui créerait un référentiel parallèle ingérable.
- Aucune étape ne demande deux fois la même information.
- Le téléversement de photo est facultatif et **ne bloque jamais** : c'est l'étape la plus coûteuse en réseau.

**i18n** — `onboarding.*`

**Fait quand** — Chaque étape se sauvegarde seule · fermeture puis réouverture reprend au bon endroit · une coupure réseau ne perd aucune saisie · l'étape 6 explique le pseudonymat dans les termes ci-dessus · le genre est sautable en un geste.

---

## UI-10 — Mon profil

`/me` · coquille **Talent** · `E-12` · resp. **R**

**But** — Le point de retour de l'espace personnel : ce que je suis, ce qui me manque, où en
sont mes engagements.

**Accès** — Soi-même, tout statut sauf `FROZEN` et `DISABLED`.

**Données** — `GET /me` : profil complet (vue privée de soi), complétion, affiliations, projets,
candidatures en cours, demandes de contact en attente.

**Structure (mobile d'abord)**
1. En-tête : avatar, nom, pseudonyme, filière, année, **badge de certification par l'établissement**.
2. **Bande de complétion** si < 100 % : ce qui manque, en une action par manque (« ajoute 2 compétences »). C'est la relance du ticket `E-14`, à cet endroit — jamais un dialogue modal à la connexion.
3. Raccourcis : mes projets · mes candidatures · mes demandes de contact.
4. Compétences, objectifs, secteurs, disponibilité.
5. Encart **« Comment les autres me voient »** : bascule entre la vue pseudonymisée et la vue révélée, **rendue par le même `TalentIdentity` que les feeds**. C'est ce qui rend le pseudonymat crédible : la personne le vérifie elle-même.
6. Lien vers `/me/edit` et `/settings`.

**Composants** — `TalentIdentity`, `SeededAvatar`, `CompletionMeter`, `SkillTag`, `EmptyState`.

**États** — Chargement (squelette) · profil incomplet · profil complet · aucun projet · aucune candidature · erreur · hors ligne.

**Règles**
- **Le genre n'apparaît pas ici**, même pour soi : il vit dans `/me/edit` et `/settings > confidentialité`. Le profil est ce qu'on montre ; le genre n'est jamais montré.
- La bande de complétion est informative, jamais culpabilisante, et disparaît à 100 %.
- Les états `LEAVING` et `ALUMNI` affichent un encart expliquant ce qui change pour eux.

**i18n** — `profile.me.*`

**Fait quand** — L'aperçu « comment les autres me voient » utilise strictement le même composant que les feeds · la relance de complétion propose des actions, pas un pourcentage · aucun genre affiché.

---

## UI-11 — Édition du profil

`/me/edit` · coquille **Talent** · `E-12` · resp. **R**

**But** — Modifier après coup ce que l'onboarding a collecté, sans repasser par un parcours en
étapes.

**Accès** — Soi-même, `ACTIVE` ou `LEAVING`.

**Données** — `PATCH /me/profile` (public) · `PATCH /me/identity` (privé). **Deux endpoints
distincts** : la séparation `TalentProfile` / `TalentIdentity` du modèle se lit jusque dans
l'interface.

**Structure** — Sections dépliables, chacune enregistrable indépendamment :

| Section | Champs | Nature |
|---|---|---|
| Identité | Prénom, nom, photo, téléphone, région | **Privée** — visible uniquement après dévoilement |
| Présentation | Pseudonyme, titre, bio | Publique |
| Parcours | Filière, année, niveau | Publique, masquable |
| Compétences | Référentiel, 3 à 12 | Publique |
| Aspirations | Objectifs, secteurs | Publique |
| Disponibilité | Heures/semaine, taille d'équipe | Publique |
| **Genre** | Facultatif, effaçable | **Ni publique ni partagée — lue par personne** |

**Règles**
- Chaque section indique **explicitement si son contenu est public ou privé**. Sans cette mention, personne ne sait ce qu'il expose — et c'est là que naissent les mauvaises surprises.
- La section Genre porte, à côté du champ, la phrase de D8 et un bouton *Effacer cette donnée*.
- Enregistrement par section, avec `AutoSaveIndicator`. Aucun bouton *Tout enregistrer* en bas d'un formulaire long : sur mobile, il est hors écran quand on en a besoin.
- Modifier son pseudonyme est possible ; l'écran prévient que les personnes déjà en contact voient le nouveau.

**i18n** — `profile.edit.*`

**Fait quand** — Public et privé sont visuellement distincts · l'écriture passe par deux endpoints séparés · le genre est effaçable en un geste · chaque section s'enregistre seule.

---

## UI-12 — Profil public d'un talent

`/talents/:id` · coquille **Talent** · fragment `discovery` · `F-09`, `M-04` · resp. **N**

**But** — Évaluer quelqu'un **sur ses compétences**, pas sur son identité. C'est l'écran où le
pseudonymat produit sa valeur.

**Accès** — Comptes connectés. Partenaires avec `RECRUIT`. Le rendu dépend entièrement de ce que
l'API renvoie.

**Données** — `GET /talents/:id` → `TalentView`. **Sans dévoilement, l'API ne charge pas
`TalentIdentity`** : il n'existe aucun chemin par lequel un nom pourrait apparaître.

**Structure**
1. En-tête : `TalentIdentity` (pseudonymisé ou révélé) + affiliation certifiée + disponibilité.
2. Titre et bio.
3. Compétences apportées.
4. Ce qu'il cherche (issu du profil Dream-Match, si renseigné).
5. Objectifs et secteurs.
6. **Bloc d'action** selon la relation :

| Relation | Action |
|---|---|
| Aucune | *Demander un contact* (ouvre UI-20) |
| Demande envoyée | *Demande envoyée* — désactivé. **Jamais « refusée »** : le refus est silencieux (TAL-05) |
| Contact accepté | *Envoyer un message* → UI-21 |
| Projet commun | Identité révélée automatiquement (`ConnectionSource.PROJECT`) |
| Bloqué | Profil inaccessible, comme s'il n'existait pas |

7. *Signaler* (`ReportDialog`), toujours accessible et jamais mis en avant.

**États** — Chargement · pseudonymisé · révélé · demande en attente · quota de demandes atteint (`MAX_PENDING_CONNECTION_REQUESTS`, message expliquant la limite) · bloqué · 404 · erreur.

**Règles**
- **Aucun genre, aucun badge dérivé du genre** (correction `C1`).
- L'émetteur d'une demande voit *sans réponse*, jamais *refusée* — le refus silencieux protège les deux parties (TAL-05).
- Un compte `LEAVING` reste consultable par ses contacts mais **sort du Feed Talents et du Dream-Match** : sa fiche l'indique.
- Aucun compteur de vues de profil : ce serait un signal comportemental, exclu en V1 (D9).

**i18n** — `profile.public.*`

**Fait quand** — Le composant d'identité est le seul chemin d'affichage du nom · le refus n'est jamais distinguable de l'absence de réponse · aucun genre ni badge dérivé · le quota de demandes est expliqué quand il bloque.
