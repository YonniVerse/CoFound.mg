# Écrans — accès, compte et paramètres (UI-01 → UI-08)

> Format des fiches : voir [`README.md`](./README.md) §3. Les règles générales
> ([`principes.md`](./principes.md)) ne sont jamais répétées ici — elles s'appliquent.

**Tickets couverts** : `E-09`, `E-10`, `E-11`, `E-15`, `B-01`, `S-06`, `S-07`, `S-14`

---

## UI-01 — Accueil public

`/` · coquille **Publique** · fragment `landing` · ticket `F-13` · resp. **N**

**But** — Expliquer en dix secondes ce que fait CoFound, et orienter vers **le bon des deux
modes d'entrée**. Ce n'est pas une page de conversion vers une inscription : il n'y en a pas.

**Accès** — Public, sans session. Une personne déjà connectée y accède aussi (elle peut arriver
par un lien) : l'en-tête affiche alors *Accéder à mon espace* au lieu de *Se connecter*.

**Données** — Aucune donnée personnelle. Contenu éditorial local. Aucun chiffre d'usage réel
tant que les volumes ne sont pas défendables : un « 12 projets » affiché au lancement dessert
le produit.

**Structure (mobile d'abord)**
1. En-tête : logo, *Se connecter*.
2. Section d'ouverture : promesse, sous-titre, **trois portes d'entrée explicites**.
3. Comment ça marche — la chaîne : l'établissement importe → l'étudiant active → les profils se rencontrent → l'équipe se forme → le partenaire découvre.
4. Pour qui — étudiant, établissement, partenaire.
5. Ce qui protège : pseudonymat, certification par l'établissement, signalement. **Section obligatoire** : c'est le différenciateur, pas un argument secondaire.
6. Appel final + pied de page (CGU, confidentialité, contact).

**Les trois portes d'entrée** — remplacent le bouton d'inscription du prototype (D1) :

| Porte | Destination | Public |
|---|---|---|
| *J'ai reçu une invitation* | `/login` | Étudiant invité |
| *Je représente un établissement* | `/organization-request` | Hanta |
| *Je représente une organisation partenaire* | `/organization-request` | Miora |

**Composants** — Sections de `components/landing/`, `Button`, `LogoSVG`.

**États** — Statique. Pas d'état de chargement. Fonctionne hors ligne une fois en cache.

**Règles**
- **Seul écran où `framer-motion` est autorisé**, chargé avec ce fragment uniquement (`design-system.md` §5).
- Prérendue et servie par le CDN (`architecture.md` §1) : c'est la seule page dont la latence est visible par quelqu'un qui ne connaît pas encore le produit.
- Aucun témoin de mesure d'audience avant acceptation — le registre des consentements (TR-09) vaut aussi ici.
- Aucun visuel affichant un badge de genre sur une personne.

**i18n** — `landing.*`

**Fait quand** — Lisible à 360 px sans défilement horizontal · LCP < 2,5 s en 3G bridée · les trois portes mènent au bon écran · aucun chiffre d'usage inventé.

---

## UI-02 — Connexion

`/login` · coquille **Publique** · fragment `shell` · ticket `E-11` · resp. **N**

**But** — Ouvrir une session. Sur des connexions instables, c'est aussi l'écran qu'on ne veut
plus jamais revoir : la session est longue et se rafraîchit silencieusement (TR-02).

**Accès** — Public. Une session valide redirige immédiatement selon le rôle
([`navigation.md`](./navigation.md) §4).

**Données** — `POST /auth/login` : email, mot de passe. Réponse : jeton d'accès **en mémoire**,
jeton de rafraîchissement en cookie `httpOnly`. **Le jeton d'accès n'est jamais écrit dans
`localStorage`.**

**Structure** — Carte centrée, une colonne : email · mot de passe (bascule d'affichage) ·
*Se connecter* · *Mot de passe oublié* · une ligne rappelant qu'il n'y a pas d'inscription, avec
un lien vers `/organization-request`.

**Composants** — `Input`, `Label`, `Button`, `ErrorState` en ligne.

**États** — Repos · envoi (bouton désactivé, libellé changé) · identifiants invalides ·
**compte verrouillé** après échecs répétés (message annonçant la durée) · compte `INVITED`
(« ce compte n'est pas encore activé — vérifiez votre email d'invitation », avec renvoi) ·
compte `DISABLED` · hors ligne · erreur serveur.

**Règles**
- **Message d'échec identique** que l'email existe ou non. Distinguer les deux transforme l'écran en annuaire d'emails d'étudiants.
- Verrouillage progressif après échecs répétés (TR-02) : la durée restante est annoncée.
- `?next=` respecté après connexion.
- Champs `autocomplete` corrects (`username`, `current-password`) — sur mobile, la saisie manuelle d'un mot de passe est un point d'abandon.

**i18n** — `auth.login.*`

**Fait quand** — Aucune fuite d'existence de compte · verrouillage annoncé · jeton d'accès absent du stockage persistant · `?next` fonctionne.

---

## UI-03 — Mot de passe oublié et réinitialisation

`/forgot-password` · `/reset-password/:token` · coquille **Publique** · `E-11` · resp. **N**

**But** — Reprendre la main sur un compte sans passer par le support.

**Données** — `POST /auth/forgot-password` (email) · `POST /auth/reset-password` (jeton +
nouveau mot de passe). Jetons **hachés en base**, à usage unique, expirants.

**Structure** — Deux écrans : demande (email → confirmation), puis définition du nouveau mot de
passe avec indicateur de robustesse et règles affichées **avant** la saisie.

**États** — Repos · envoyé · jeton invalide · **jeton expiré** (avec bouton de nouvelle demande,
pas une impasse) · jeton déjà utilisé · succès (redirection vers `/login`).

**Règles**
- La confirmation d'envoi est **toujours la même**, que l'adresse existe ou non.
- Une réinitialisation réussie **révoque toutes les sessions** ; l'écran le dit explicitement.
- Règles de mot de passe affichées d'emblée, validées en direct, jamais découvertes après un échec d'envoi.

**i18n** — `auth.password.*`

**Fait quand** — Aucune fuite d'existence · jeton expiré traité comme un état, pas une erreur · révocation annoncée.

---

## UI-04 — Activation du compte

`/activation/:token` · coquille **Plein écran** · `E-10` · resp. **N**

**But** — Le premier contact d'un étudiant avec le produit. **C'est ici que se joue le taux
d'adoption d'une promotion entière** (`R4`, TAL-01). Tout ce qui peut être reporté est reporté.

**Accès** — Porteur d'un jeton d'invitation valide (30 jours, `INVITATION_EXPIRY_DAYS`).

**Données** — `GET /auth/activation/:token` → email masqué, nom de l'établissement invitant.
`POST /auth/activation` → mot de passe, consentements. Ouvre une session et redirige vers
`/onboarding`.

**Structure**
1. Bandeau de confiance : « *&lt;Établissement&gt;* vous a invité » + logo de l'établissement. Sans ce repère, l'email ressemble à une tentative d'hameçonnage.
2. Email pré-rempli, non modifiable.
3. Choix du mot de passe, règles affichées.
4. **Consentements** (TR-09) : CGU + politique de confidentialité en case obligatoire, cases distinctes et facultatives pour les usages accessoires. Jamais de case pré-cochée, jamais un consentement groupé.
5. *Activer mon compte*.

**États** — Vérification du jeton · valide · **jeton expiré** (bouton *Demander un nouveau lien* qui notifie l'établissement — sans quoi la personne est bloquée sans recours) · jeton déjà utilisé (redirection vers `/login`) · jeton inconnu · hors ligne · succès.

**Règles**
- **Trois champs maximum.** Le profil se remplit dans l'onboarding, pas ici.
- La version du texte consenti est enregistrée (`Consent.policy_version`).
- Aucune donnée personnelle affichée avant activation, hors l'email masqué et le nom de l'établissement.
- Repli du risque `R1` : cet écran fonctionne identiquement avec un lien distribué à la main par l'établissement. **Aucune dépendance à l'email au-delà du transport du lien.**

**i18n** — `auth.activation.*`

**Fait quand** — Chaque cas de jeton a son écran · consentements enregistrés avec leur version · parcours réalisable en moins de 60 s sur mobile · aucune impasse sur jeton expiré.

---

## UI-05 — Demande d'accès organisation

`/organization-request` · coquille **Publique** · fragment `landing` · `B-01` · resp. **N**

**But** — Le second mode d'entrée (D1) : établissements et partenaires demandent un accès,
validé **manuellement** par le staff (ADM-01, PAR-01).

**Accès** — Public.

**Données** — `POST /organization-requests` : type d'organisation, raison sociale, pays, région,
site, description, secteurs d'intérêt, contact (nom, fonction, email professionnel, téléphone),
pièces justificatives.

**Structure** — Formulaire en 3 étapes (`StepForm`) : l'organisation · le contact · les pièces
et la validation. Un encart annonce **le délai réel de traitement** et ce qui se passe ensuite.

**États** — Repos · envoi · succès (page de confirmation avec numéro de demande) · doublon
détecté · erreur de téléversement · hors ligne.

**Règles**
- **Le type d'organisation détermine ce qui est demandé**, pas ce qui est accordé : un établissement ne s'auto-attribue pas `CERTIFY_AFFILIATION`. Les capacités sont accordées une par une par le staff (UI-49).
- Le formulaire ne promet aucun délai que l'équipe ne tient pas.
- Anti-robot sans service tiers (le budget de performance et la règle « pas de dépendance externe » valent aussi ici).

**i18n** — `organizationRequest.*`

**Fait quand** — Une demande apparaît dans UI-49 · le demandeur reçoit un accusé · aucune capacité n'est déductible du formulaire.

---

## UI-06 — Statut du compte

`/account-status` · coquille **Talent** (réduite) · `S-07` · resp. **N**

**But** — Dire à quelqu'un ce qui lui arrive et ce qu'il peut faire. Un compte gelé qui se
heurte à des 403 sans explication devient un signalement au support, ou un départ.

**Accès** — Compte `FROZEN`, `LEAVING` ou `ALUMNI`. **En `FROZEN`, c'est la seule route
atteignable** — permission négative n° 7.

**Données** — `GET /me/status` : statut, motif, durée, date de fin, voie de contestation.

**Structure — un rendu par statut**

| Statut | Message | Ce qui reste ouvert |
|---|---|---|
| `FROZEN` | Motif, durée, date de levée, **comment contester** | Rien d'autre que cet écran |
| `LEAVING` | Fin de cursus : les projets restent accessibles | Tout, sauf Dream-Match et Feed Talents |
| `ALUMNI` | Statut alumni | Lecture et projets existants ; plus de candidature |

**États** — Chargement · un rendu par statut · erreur.

**Règles**
- Le motif est **factuel**, jamais moralisateur — c'est un écran de sanction, pas de réprimande.
- La voie de contestation est un vrai chemin (formulaire ou adresse), pas une phrase.
- En `FROZEN`, la navigation applicative est retirée de la coquille : aucune entrée qui mènerait à un 403.

**i18n** — `account.status.*`

**Fait quand** — Test de la permission négative n° 7 vert · chaque statut a son rendu · aucune entrée de navigation morte.

---

## UI-07 — Paramètres

`/settings` — onglets `account`, `notifications`, `privacy`, `blocks` · `E-15`, `S-06`, `M-13` · resp. **Y**

**But** — Tenir en écrans les engagements de TR-09 : consentements, portabilité, effacement,
blocages. Ce ne sont pas des lignes de CGU.

**Accès** — Tout compte connecté (hors `FROZEN`).

**Onglets**

| Onglet | Contenu | Règles |
|---|---|---|
| **Compte** | Email (lecture seule), mot de passe, langue, déconnexion locale et **globale**, demande de suppression | Un utilisateur ne supprime pas son compte lui-même (TR-01) : il **demande**, l'écran l'énonce sans détour et annonce le délai |
| **Notifications** | Matrice type d'événement × canal (in-app / email) | Une ligne par type de `NotificationPreference`. Un interrupteur global n'est pas un réglage, c'est un abandon déguisé |
| **Confidentialité** | Consentements en cours avec leur version et leur date, retrait possible · **genre** (facultatif, modifiable, effaçable) · visibilité dans le Feed Talents · masquage de la filière et de l'année · **export complet** | Voir ci-dessous |
| **Blocages** | Personnes bloquées, déblocage | Le blocage est symétrique et immédiat |

**Règles de l'onglet Confidentialité** — le plus sensible du produit :

- Le genre est modifiable et **effaçable**, avec une phrase disant exactement qui le lit : *personne, jamais — il n'est utilisé qu'en statistique agrégée d'au moins 5 personnes* (D8). C'est, avec UI-11, le seul endroit du produit où ce champ apparaît.
- Le **pseudonymat est expliqué honnêtement** : dans une petite promotion, filière + année + établissement peuvent suffire à reconnaître quelqu'un. D'où les options de masquage de la filière et de l'année, présentées **à cet endroit** et non enfouies (TR-04).
- L'export (TR-09) est asynchrone : demande → traitement → notification → lien de téléchargement expirant. L'écran annonce le délai.
- Le retrait d'un consentement dit ce qu'il entraîne, avant confirmation.

**États** — Chargement · repos · enregistrement · erreur par champ · export en cours · export prêt · hors ligne.

**i18n** — `settings.*`

**Fait quand** — Chaque consentement affiche sa version et sa date · le retrait fonctionne · l'export produit une archive complète · le genre est effaçable · aucune préférence perdue en cas de coupure.

---

## UI-08 — Erreurs, refus, page inconnue

`/403`, `/404`, repli global · toutes coquilles · `F-13` · resp. **N**

**But** — Qu'aucune impasse n'existe. Avec un RBAC à refus par défaut, le 403 n'est pas un
incident : c'est un état de fonctionnement normal.

**Rendus**

| Cas | Rendu |
|---|---|
| **403** | Ce qui manque (rôle, capacité, statut) sans révéler si la ressource existe · retour vers l'espace de la personne |
| **404** | Ressource introuvable ou plus disponible · retour · recherche |
| **500 / erreur non capturée** | Message neutre + *Réessayer* + identifiant d'incident à citer au support. Aucune trace technique à l'écran ; le détail va dans Sentry |
| **Fragment non chargé** | Cas fréquent en 3G : *Réessayer*, jamais l'écran d'erreur du navigateur |
| **Hors ligne** | `OfflineBanner` + contenu en cache, jamais une page blanche |

**Règles**
- La coquille et la navigation **restent affichées** : une erreur confinée à la zone de contenu se répare, une erreur plein écran fait fermer l'onglet.
- Un 403 renvoyé par l'API alors que la garde de route a laissé passer est **remonté à Sentry** : c'est une désynchronisation client/serveur, donc un défaut.
- Aucun message n'expose de nom de table, de route d'API ou de trace.

**i18n** — `errors.*`

**Fait quand** — Les cinq cas ont un rendu · aucun n'est une impasse · aucune information technique divulguée.
