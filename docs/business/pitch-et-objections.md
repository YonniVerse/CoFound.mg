# Pitch, arguments et objections — CoFound.mg

> **Destinataires : le CEO et l'équipe.** Ce document sert à défendre le projet devant un jury,
> un investisseur, un bailleur ou un directeur d'établissement.
>
> Principe : **on met en avant le raisonnement, pas la liste des fonctionnalités.** Un jury
> compétent retient une équipe qui sait pourquoi elle a écarté quelque chose, pas une équipe
> qui énumère ce qu'elle a construit.

**Version** : 1.0 — 20 août 2026

---

## 1. Le récit, en trois minutes

**Le problème (30 s)**
À Madagascar, des milliers d'étudiants ont des idées et des compétences. Presque aucun ne
monte un projet. Pas par manque d'envie — par manque de **complémentarité** : un informaticien
ne connaît que des informaticiens, une juriste ne connaît que des juristes. Et quand une
équipe se forme quand même, personne ne la prend au sérieux, parce que rien ne prouve qui elle
est ni ce qu'elle vaut.

**L'idée (30 s)**
CoFound.mg est une plateforme **fermée et certifiée** où les établissements inscrivent
eux-mêmes leurs étudiants. On y trouve des collaborateurs **d'autres filières**, on y
structure son projet avec un Business Model Canvas, et on devient visible des incubateurs, des
entreprises et des institutions.

**Ce qui la rend différente (45 s)**
Trois choses qu'un groupe Facebook ne peut pas faire.
1. **Certifier.** Quand un incubateur voit un profil, il sait que la personne est réellement
   étudiante dans cet établissement, dans cette filière. Ce n'est pas déclaratif.
2. **Structurer.** Un projet ne devient visible qu'avec un Business Model Canvas rempli. Un
   partenaire lit dix dossiers comparables au lieu de dix messages.
3. **Protéger.** Avant qu'un contact soit accepté, ni le nom ni la photo ne sont visibles. On
   se rencontre sur des compétences. Pour beaucoup d'étudiantes, c'est la différence entre
   participer et rester en dehors.

**Le modèle (30 s)**
Les établissements ne paient pas — on veut le maximum d'étudiants. Ce sont les partenaires qui
paient, parce que c'est eux qui cherchent : des projets où investir, des jeunes à recruter,
des candidats pour leurs programmes. Ils sont là, vérifiés, structurés.

**Où on en est (45 s)**
Un périmètre défini, une architecture arrêtée et documentée, un prototype d'interface, et un
plan de développement chiffré. On sait ce qu'on construit, dans quel ordre, et **pourquoi on a
écarté le reste**.

---

## 2. Les cinq messages à faire passer

| # | Message | Formulation |
|---|---|---|
| 1 | **On a inversé le modèle économique** | « Les établissements ne paient pas. Faire payer le côté qui crée la valeur aurait détruit la valeur. » |
| 2 | **On a conçu la chaîne, pas des fonctionnalités** | « Du fichier Excel de la scolarité jusqu'à l'incubateur qui contacte une équipe. Un maillon manquant met tout à zéro. » |
| 3 | **On a construit d'abord ce qui est impossible à ajouter après** | « Le pseudonymat n'est pas un affichage, c'est une décision de schéma de base de données. On ne peut pas l'ajouter dans six mois. » |
| 4 | **On sait ce qu'on a exclu et pourquoi** | « Pas de paiement, pas d'IA, pas de forum. Trois exclusions, trois raisons produit. » |
| 5 | **On sait ce qu'on ne prouve pas encore** | « Notre MVP ne prouve pas que les partenaires paieront. Ça, c'est le pilote qui le dira. » |

---

## 3. Traduire les choix techniques en arguments

Chaque choix se dit en une phrase compréhensible par un non-technicien, suivie de son
implication.

| Choix | Ce qu'on dit |
|---|---|
| **Pas d'inscription, comptes provisionnés** | « On ne peut pas s'inscrire sur CoFound. C'est l'établissement qui inscrit ses étudiants. C'est ce qui rend le badge crédible : personne ne peut se déclarer étudiant. » |
| **Identité dans une table séparée** | « Le nom et la photo ne sont pas *cachés* à l'affichage, ils ne sont **pas chargés** par le serveur. Il n'y a donc pas de bouton, pas d'oubli, pas de fuite possible. » |
| **Algorithme explicable, pas d'IA** | « Avec deux cents utilisateurs, un modèle d'IA n'a rien à apprendre. On a fait un algorithme qui explique chaque suggestion. Un établissement peut le justifier à ses étudiants — une boîte noire, non. » |
| **Pas d'argent sur la plateforme** | « Faire transiter des fonds pour compte de tiers est une activité réglementée. On trace l'engagement, l'argent circule directement de l'investisseur à l'équipe. On a conçu la frontière avant d'avoir le partenariat opérateur, pour que ce partenariat soit un branchement et pas une réécriture. » |
| **SSE plutôt que WebSocket** | « On a besoin de recevoir des notifications, pas d'un canal permanent dans les deux sens. On a donc évité 30 Ko de bibliothèque sur des connexions où chaque kilooctet compte, et on gagne la reconnexion automatique quand le réseau saute. » |
| **Application statique servie par CDN** | « La page se charge depuis le point de présence le plus proche au lieu de traverser l'océan Indien à chaque visite. » |
| **Redimensionnement des photos côté navigateur** | « On ne fait pas envoyer 4 Mo à quelqu'un en 3G. » |
| **Permissions négatives testées** | « "L'université ne peut pas lire les messages de ses étudiants" n'est pas une promesse commerciale chez nous, c'est un test automatisé qui doit passer avant chaque mise en production. » |
| **Budget de performance dans la CI** | « Si une modification alourdit l'application au-delà du budget fixé, elle est refusée automatiquement. Sinon un budget de performance n'est qu'une intention. » |
| **Coût d'infrastructure ≈ 5 €/mois** | « Aucun de nos coûts n'est facturé par utilisateur. On peut multiplier les étudiants par cent sans que la facture suive. C'est ce qui rend la gratuité soutenable. » |

---

## 4. Objections probables et réponses

### Sur le produit

**« Pourquoi pas simplement un groupe Facebook ou WhatsApp ? »**
> Un groupe ne peut ni certifier ni structurer. Un incubateur qui reçoit un message WhatsApp
> ne sait pas si la personne est vraiment étudiante, et n'a aucun moyen de comparer dix
> projets. Nous, on lui donne des dossiers vérifiés et comparables. Et surtout : sur Facebook,
> une étudiante est jugée sur sa photo avant ses compétences. Ici, la photo n'existe pas
> tant qu'elle n'a pas accepté le contact.

**« L'anonymat, ça n'empêchera pas de deviner qui c'est dans une petite promo. »**
> Vous avez raison, et c'est pour ça qu'on ne dit pas « anonymat » mais **pseudonymat**. On ne
> promet pas l'impossible : on retire le nom, la photo et le genre au moment où se fait le
> premier jugement. Ça suffit à déplacer l'évaluation vers les compétences. Et l'utilisateur
> est prévenu du niveau réel de protection au moment où il remplit son profil — on ne lui vend
> pas une sécurité qu'on ne peut pas tenir.

**« Le Business Model Canvas obligatoire, ce n'est pas décourageant ? »**
> Il l'aurait été à la création — c'est d'ailleurs ce que prévoyait notre première version, et
> on l'a corrigé. On crée un projet avec un titre et un pitch. Le Canvas devient obligatoire
> pour **rendre le projet visible**. La structuration est une porte vers la visibilité, pas une
> barrière à l'entrée.

**« Vous n'avez pas de messagerie temps réel, pas de forum, pas de mobile ? »**
> Pas au lancement, et ce sont des décisions. Un forum vide dit au premier visiteur que
> personne n'est là — on l'ouvrira quand une question trouvera une réponse en vingt-quatre
> heures. Le temps réel s'ajoute sans rien changer à notre API. L'application mobile viendra
> quand on aura des utilisateurs actifs à retenir ; c'est pour ça que notre backend est déjà
> une API et pas un site web.

### Sur le modèle économique

**« Comment gagnez-vous de l'argent si les établissements ne paient pas ? »**
> Les partenaires paient. Un incubateur cherche des projets, une entreprise cherche des
> stagiaires, un bailleur cherche des porteurs à impact. Ils viennent parce que les jeunes sont
> là — et les jeunes sont là parce que c'est gratuit pour leur établissement. Faire payer
> l'établissement, ce serait facturer précisément ce qui crée notre valeur.

**« Vous n'aurez aucun revenu la première année. »**
> Par choix. Facturer un partenaire avant qu'il ait trouvé un projet, c'est vendre une
> promesse. Le laisser chercher gratuitement six mois puis lui présenter l'usage constaté,
> c'est vendre un résultat. Notre infrastructure coûte environ cinq euros par mois — on peut
> se le permettre.

**« Le marché malgache est-il assez grand pour ça ? »**
> Le nombre de partenaires capables de payer à Madagascar est fini, et il est petit. C'est
> précisément le calcul central de notre business plan : combien de partenaires payants nous
> faut-il pour couvrir nos coûts, et ce nombre est-il atteignable. Si la réponse est non, le
> modèle change — et on préfère le savoir maintenant.

**« Et si une université refuse de vous donner les emails de ses étudiants ? »**
> C'est notre hypothèse la plus risquée, et on la teste en premier. Si un établissement
> refuse, tout le modèle s'arrête — donc on ne construit pas six mois avant de poser la
> question. Le pilote passe avant le reste.

### Sur l'équipe et l'exécution

**« Vous êtes trois étudiants, comment tenez-vous ça ? »**
> On ne le tient pas tout entier, et c'est pour ça qu'on a réduit. Notre MVP fait passer la
> chaîne complète, en version fine. On a exclu tout ce qui pouvait s'ajouter plus tard sans
> réécriture, et gardé tout ce qui ne peut pas s'ajouter après coup. Nos manques — commercial,
> juridique — sont identifiés, on ne prétend pas les couvrir.

**« Que se passe-t-il si l'un de vous part ? »**
> C'est un vrai risque, et c'est pourquoi trois modules — l'authentification, les permissions,
> la confidentialité — sont relus par deux personnes avant chaque fusion, et pourquoi la
> documentation d'exploitation fait partie du périmètre du MVP.

**« Vous stockez des données personnelles d'étudiants. Comment les protégez-vous ? »**
> Trois mécanismes structurels. Les données privées sont dans une table séparée que les
> requêtes publiques n'interrogent jamais. Toute action sensible — un import, une
> certification, l'accès d'un modérateur à une identité — est inscrite dans un journal en
> écriture seule. Et chaque statistique publiée porte un seuil minimal de cinq individus,
> sans quoi « une femme sur trois en M1 » désigne quelqu'un.

**« Qu'est-ce qui vous empêche d'être copiés ? »**
> Techniquement, rien. Ce qui protège, ce sont les relations avec les établissements et la
> base de talents certifiés. Un concurrent devra convaincre les mêmes services de scolarité,
> un par un. C'est lent pour nous — et ça l'est autant pour lui.

---

## 5. Ce qu'on assume ne pas savoir

**À dire spontanément, avant qu'on le demande.** C'est le passage qui distingue une équipe
lucide d'une équipe qui récite.

- On ne sait pas encore si les établissements accepteront de fournir leurs listes. C'est notre
  hypothèse numéro un et on la teste en premier.
- On ne sait pas ce qu'un partenaire malgache est prêt à payer. On a la méthode pour le
  découvrir — des entretiens, pas des projections.
- On ne sait pas si notre algorithme de matching produit de bonnes équipes. Personne ne peut
  le savoir avant d'avoir des équipes. On mesure la pluridisciplinarité dès le premier jour
  pour le savoir dans six mois.
- On ne sait pas si les étudiants créeront des projets ou seulement des profils. C'est ce que
  le pilote nous dira.

---

## 6. Script de démonstration

**Principe** : montrer **une chaîne complète**, pas un catalogue d'écrans. Le fil narratif est
plus important que le nombre de fonctionnalités montrées.

| # | Ce qu'on montre | Ce qu'on dit |
|---|---|---|
| 1 | Console établissement — dépôt d'un fichier Excel | « Voici la liste réelle d'une promotion. Le service de scolarité n'a rien à reformater : c'est nous qui nous adaptons à ses colonnes. » |
| 2 | Prévisualisation ligne par ligne | « Rien n'est encore créé. Il voit ce qui va se passer avant que ça se passe. Trois adresses sont invalides, il le sait tout de suite. » |
| 3 | Email d'invitation → activation | « L'étudiant ne s'inscrit pas. Il est déjà reconnu, déjà certifié. » |
| 4 | Onboarding progressif | « En étapes courtes. Il peut s'arrêter et reprendre — c'est pensé pour une connexion mobile qui saute. » |
| 5 | Dream-Match, **avec les facteurs affichés** | « Voilà pourquoi ce profil est proposé : trois compétences recherchées, filière complémentaire, disponibilité compatible. On peut l'expliquer à un étudiant. » |
| 6 | **Le profil sans nom ni photo** | « À cet instant, on ne sait pas qui c'est. On sait ce qu'elle sait faire. C'est tout l'objet. » |
| 7 | Demande de contact → acceptation → dévoilement | « Le dévoilement est mutuel. Elle a décidé. » |
| 8 | Création d'un projet, puis BMC | « Titre et pitch suffisent pour commencer. Mais pour devenir visible, il faut remplir le Canvas. » |
| 9 | Passage en Recrutement, candidature reçue, acceptation | « Une équipe pluridisciplinaire vient de se former. C'est exactement le problème qu'on attaque. » |
| 10 | **Console partenaire** : recherche filtrée, lecture du BMC, contact | « Voilà le côté qui paie. Un incubateur qui voit dix dossiers comparables au lieu de dix messages WhatsApp. » |
| 11 | Signalement → file de modération | « On promet un espace sûr. Voilà le mécanisme qui l'honore, pas la phrase qui le promet. » |

**Prévoir** : le jeu de démonstration est reconstructible par une commande (`seed:demo`). Une
base bricolée à la main n'est rejouable ni pour une présentation, ni après un incident.

**Prévoir aussi** : une capture vidéo du parcours complet, au cas où la connexion serait
mauvaise le jour J. C'est une précaution, pas un aveu.

---

## 7. Phrases à ne jamais dire

| ❌ Ne pas dire | ✅ Dire à la place |
|---|---|
| « On utilise l'intelligence artificielle pour le matching » | « On utilise un algorithme explicable, et on dit pourquoi » |
| « On a choisi cette stack parce que c'est moderne » | « On l'a choisie pour telle contrainte précise, et voici ce qu'on a écarté » |
| « Notre plateforme est 100 % anonyme » | « Pseudonymat : nom, photo et genre masqués jusqu'au dévoilement mutuel » |
| « On sera rentables en trois ans » *(sans le calcul)* | « Voici combien de partenaires payants il nous faut, et voici combien il en existe » |
| « On peut tout faire » | « Voici ce qu'on a exclu du lancement, et pourquoi » |
| « Les investisseurs pourront investir directement sur la plateforme » | « On formalise et on trace les engagements. L'argent circule directement de l'investisseur à l'équipe, parce qu'encaisser pour compte de tiers est une activité réglementée. » |
| « On n'a pas eu le temps de faire X » | « X est en V2 parce que [raison produit] » |

> La dernière ligne est la plus importante. **« On n'a pas eu le temps » est la seule phrase
> qui puisse faire perdre.** Chaque exclusion du périmètre a une justification produit écrite
> dans [`mvp-scope.md`](../mvp-scope.md) — il suffit de la donner.
