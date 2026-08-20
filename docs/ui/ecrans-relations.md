# Écrans — mise en relation, messagerie, notifications (UI-20 → UI-23)

**Tickets couverts** : `M-09` à `M-16`
**Bloc de périmètre** : M3 (dévoilement), M7 (messagerie), M9 (notifications), M12 (signalement)

---

## UI-20 — Demandes de contact

`/connections` — onglets `received`, `sent` · coquille **Talent** · fragment `messaging` · `M-09`, `M-10` · resp. **Y**

**But** — Ouvrir une relation de façon **consentie et symétrique**. C'est le seul chemin vers le
dévoilement, hors projet commun.

**Accès** — Talents connectés, hors `FROZEN`.

**Données** — `GET /connection-requests?direction=` · `POST /connection-requests` ·
`POST /connection-requests/:id/accept` · `/decline`. L'acceptation crée la `Connection`, pose
`revealed_at` et ouvre la `Conversation`.

**Structure**
- **Reçues** : carte par demande — `TalentIdentity` **pseudonymisé** (l'identité n'arrive qu'à l'acceptation), message d'accompagnement, compétences, deux actions : *Accepter* et *Refuser*, plus *Signaler* et *Bloquer*.
- **Envoyées** : état de chaque demande, avec les libellés du refus silencieux ci-dessous, et le compteur de quota restant.

**Le refus silencieux — la règle qui structure cet écran** (TAL-05)

| Réalité en base | Ce que voit l'émetteur | Ce que voit le destinataire |
|---|---|---|
| `PENDING` | *En attente* | La demande dans sa liste |
| `ACCEPTED` | *Acceptée* + identité révélée | Identité révélée |
| `DECLINED` | ***Sans réponse*** | La demande disparaît |
| `EXPIRED` | *Sans réponse* | — |

`DECLINED` et `EXPIRED` sont **indistinguables** côté émetteur. Aucune notification de refus
n'existe. Dire non doit être sans coût social : c'est la condition pour que Sarah utilise le
produit.

**États** — Chargement · liste · **vide** (« aucune demande pour l'instant » + lien vers le Dream-Match) · quota atteint (`MAX_PENDING_CONNECTION_REQUESTS` = 10, avec l'explication : le garde-fou existe contre le démarchage de masse) · envoi · erreur.

**Règles**
- L'identité n'apparaît **qu'après** acceptation, des deux côtés simultanément — le dévoilement est mutuel et irréversible pour la paire.
- Bloquer depuis cette liste ferme la demande sans notification.
- Un partenaire n'apparaît jamais ici : son contact est unidirectionnel et limité à un message (UI-47).

**i18n** — `connections.*`

**Fait quand** — Aucun chemin ne permet de distinguer un refus d'une absence de réponse · l'identité n'arrive qu'à l'acceptation · le quota est expliqué quand il bloque.

---

## UI-21 — Messagerie

`/messages` · `/messages/:conversationId` · coquille **Talent** · fragment `messaging` · `M-11`, `M-12`, `M-13` · resp. **Y**

**But** — Converser après acceptation. Sans elle, un match ne débouche sur rien.

**Accès** — **Participants de la conversation, uniquement.** Ni l'établissement de l'étudiant,
ni un partenaire, ni le staff hors signalement (permission négative n° 1).

**Données** — `GET /conversations` · `GET /conversations/:id/messages?since=` ·
`POST /conversations/:id/messages`. Un seul modèle pour les conversations directes et les
canaux de projet (`ConversationType`).

**Structure**
- **Mobile** : liste des conversations, puis le fil en plein écran. Deux écrans, jamais une vue partagée compressée.
- **Bureau** : liste à gauche, fil à droite.
- Fil : `TalentIdentity` **révélé** (on ne converse qu'après dévoilement), messages groupés par jour, état de lecture, champ de saisie, pièce jointe légère, *Signaler* et *Bloquer* dans le menu de la conversation.

**Transport** — **Requêtes classiques avec rafraîchissement**, pas de temps réel au MVP (M7).
Le contrat (`POST message`, `GET messages since X`) est **choisi pour que l'ajout du canal SSE
en `S7` soit purement additif** : aucun écran ne change. Rafraîchissement à intervalle sur la
conversation ouverte, arrêté quand l'onglet est masqué.

**États** — Chargement · liste vide (« tes conversations s'ouvriront après une demande de contact acceptée » + lien vers le Dream-Match) · conversation vide · envoi en cours · **échec d'envoi avec renvoi** (le message reste dans le champ, jamais perdu) · hors ligne (file d'envoi, rejouée au retour) · interlocuteur bloqué · interlocuteur désactivé · erreur.

**Règles**
- Un message n'est **jamais** perdu par une coupure : file locale, indicateur *en attente d'envoi*.
- Pièces jointes légères, liste blanche, redimensionnement côté client.
- Bloquer coupe immédiatement les deux sens et masque l'historique à l'auteur du blocage.
- Aucune notification de « en train d'écrire », aucun accusé de lecture en temps réel : hors périmètre, et coûteux en requêtes sur un réseau facturé à la donnée.

**i18n** — `messaging.*`

**Fait quand** — Un cadre d'établissement n'atteint aucune conversation (permission négative n° 1, testée) · un envoi hors ligne part au retour du réseau · le contrat d'API supporte l'ajout de SSE sans changement d'écran.

---

## UI-22 — Centre de notifications

`/notifications` · coquille **Talent** · fragment `messaging` · `M-15`, `M-16` · resp. **Y**

**But** — Le retour sur la plateforme. Sans rappel, une place de marché à deux faces est morte
au deuxième jour (TR-05).

**Accès** — Tout compte connecté hors `FROZEN`.

**Données** — `GET /notifications?cursor` · `POST /notifications/:id/read` ·
`POST /notifications/read-all`. Préférences dans `/settings` (UI-07).

**Types au MVP** — invitation reçue · demande de contact · contact accepté · candidature reçue ·
candidature traitée · **relance de candidature sans réponse** (`APPLICATION_REMINDER_DAYS`) ·
tâche assignée · échéance proche · opportunité correspondant au profil · décision de modération.

**Structure** — Liste antéchronologique, non lues distinguées, groupement par jour, chaque
entrée mène **directement à l'objet concerné**. Bouton *Tout marquer comme lu*.

**États** — Chargement · liste · vide (« tout est à jour ») · erreur · hors ligne.

**Règles**
- Une notification qui ne mène nulle part n'existe pas : chaque type a sa destination.
- Le compteur de la navigation est cohérent avec la liste — un badge qui ne se vide pas est un défaut signalé au support en boucle.
- Les emails ne doublent que **quatre** événements décisifs (M9 : invitation, contact accepté, candidature reçue, candidature traitée). Le reste reste in-app : le coût de la donnée et la saturation des boîtes sont des réalités locales (TR-05).
- La décision de modération notifie **le signalant** (`S-03`), pas seulement la personne sanctionnée.

**i18n** — `notifications.*`

**Fait quand** — Chaque type mène à sa destination · le compteur est cohérent · seuls les quatre événements décisifs partent par email · les préférences sont respectées.

---

## UI-23 — Signaler et bloquer

Dialogue transverse · fragment `shell` · `M-14` · resp. **R**

**But** — Rendre opérante la promesse de sécurité psychologique. **Non négociable**
(`mvp-scope.md` M12) : on promet un environnement sûr à des jeunes femmes.

**Accès** — Tout compte connecté. Point d'entrée depuis **quatre objets** : un profil (UI-12),
un message (UI-21), un projet (UI-25), une publication (UI-13).

**Données** — `POST /reports` : `{ targetType, targetId, reason, description }`.
`POST /blocks` pour le blocage.

**Structure du dialogue**
1. Motif — issu de `ReportReason` : harcèlement, discours haineux, spam, fraude, contenu toxique. **Listé, jamais en texte libre seul.**
2. Description facultative.
3. Case *Bloquer aussi cette personne*, cochée par défaut pour les motifs critiques.
4. Envoi.
5. Confirmation annonçant **le délai réel de traitement — 48 h** (`R10`) et le fait que le signalant sera notifié de la décision.

**Règles**
- Le bouton *Signaler* est présent partout et **discret partout** : accessible sans être une invitation.
- Les motifs critiques (`CRITICAL_REPORT_REASONS` : harcèlement, discours haineux) déclenchent un gel automatique temporaire côté serveur ; l'interface ne le promet pas au signalant, elle annonce seulement le délai.
- Un signalement ne notifie **jamais** la personne visée de l'identité du signalant.
- Après envoi, l'objet signalé est masqué à l'auteur du signalement s'il a aussi bloqué.

**i18n** — `moderation.report.*`

**Fait quand** — Les quatre points d'entrée existent · le délai annoncé est celui que l'équipe tient · le signalant reçoit la décision (`S-03`) · l'anonymat du signalant est préservé.
