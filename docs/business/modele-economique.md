# Modèle économique — CoFound.mg

> **Destinataire principal : le CEO.** Ce document est une aide à la décision produite depuis
> la direction technique. Il ne remplace pas le business plan : il fournit la structure du
> modèle, la méthode de fixation des prix, les coûts réels d'infrastructure et les questions
> qui restent à trancher.
>
> **Tous les chiffres marqués `[HYP]` sont des hypothèses à valider.** Ils sont là pour rendre
> le raisonnement manipulable, pas pour être cités tels quels.

**Version** : 1.0 — 20 août 2026

---

## 1. Le retournement décidé le 20 août 2026

Le cahier des charges initial disait : *« plateforme vendue aux institutions, gratuite pour
les étudiants »*.

La décision prise est différente et plus forte :

> **Les établissements ne paient pas. Les partenaires paient.**

### Pourquoi c'est le bon modèle

CoFound est une **marketplace à deux faces**. Dans ce type de marché, la règle est constante :
on subventionne le côté qui **crée** la valeur, et on monétise le côté qui la **capte**.

| Côté | Rôle | Prix |
|---|---|---|
| Étudiants + établissements | Créent la densité de talents — la seule chose rare | **Gratuit** |
| Partenaires (incubateurs, entreprises, ONG, institutions) | Captent cette densité : dealflow, sourcing, visibilité | **Payant** |

C'est le modèle d'Indeed (candidats gratuits, employeurs payants), de Doctolib (patients
gratuits, praticiens payants), de la plupart des places de marché qui ont tenu.

**Faire payer l'établissement aurait été l'erreur classique** : facturer le côté rare, donc en
limiter le volume, donc détruire ce qui fait la valeur du côté payant. Un établissement qui
hésite six mois sur une facture, c'est 400 étudiants absents et un incubateur qui ne trouve
rien.

### La conséquence produit, directe

> **Le côté partenaire n'est pas un module secondaire. C'est le produit vendu.**

C'est pourquoi la console partenaire est dans le Must-have du MVP (bloc M11) et non repoussée
en V2. Un MVP qui ne montrerait que l'expérience étudiante démontrerait la mission sans le
modèle économique.

---

## 2. Ce que chaque segment achète réellement

La règle de fixation des prix n'est pas « combien ça nous coûte » mais **« combien coûte
aujourd'hui l'alternative que nous remplaçons »**. C'est la seule base défendable en
négociation.

| Segment | Ce qu'il cherche | Son alternative actuelle | Ce que cette alternative lui coûte |
|---|---|---|---|
| **Incubateur / accélérateur** | Du dealflow qualifié, hors du même vivier de trois écoles de Tana | Tournée physique des campus, appels à candidatures diffusés sur Facebook | Déplacements, temps de chargé de programme, et surtout **des places de programme mal remplies** |
| **Entreprise** | Stagiaires et jeunes recrues avec un profil vérifié | Annonces, relations informelles, cabinets | Coût d'un recrutement raté, temps de tri de candidatures non vérifiées |
| **ONG / bailleur** | Des projets à impact, mesurables, dans un secteur ou une région donnés | Appels à projets diffusés à l'aveugle | Dossiers hors sujet, difficulté à justifier l'impact auprès de son propre bailleur |
| **Institution publique / ministère** | Une lecture de l'entrepreneuriat étudiant national | Enquêtes ponctuelles, remontées d'établissements | Coût d'une étude, et données périmées à la publication |

**Question centrale à trancher par le CEO** : pour chacun de ces segments, quel est le montant
de l'alternative ? C'est ce chiffre — pas notre coût d'infrastructure — qui fixe le prix.

---

## 3. Ce qui est gratuit, ce qui est payant

### Recommandation : consulter est gratuit, agir est payant

| | Gratuit | Payant |
|---|---|---|
| **Étudiants** | Tout | — |
| **Établissements** | Tout : import, gestion des affiliations, annuaire, tableau de bord, publication d'appels internes | — |
| **Partenaires** | Créer un profil vérifié · consulter les feeds · **rechercher des projets et lire les BMC publics** | **Contacter** une équipe ou un talent · **publier** une opportunité · analytics écosystème *(V2)* · sondages *(V2)* |

**Pourquoi cette frontière précisément** :

- **Consulter gratuitement maximise la découverte.** Un partenaire qui ne peut rien voir avant
  de payer ne paiera jamais — il n'a aucun moyen d'évaluer si la densité vaut le prix. La
  gratuité de la consultation est notre meilleur argument commercial : *« regardez vous-même
  ce qu'il y a dedans »*.
- **Contacter est le moment de la valeur.** C'est là que le partenaire obtient ce qu'il est
  venu chercher. C'est le point de facturation naturel, et il est facile à expliquer.
- **Publier est le moment de la visibilité.** Un appel à candidatures diffusé auprès de
  plusieurs milliers d'étudiants vérifiés remplace une campagne physique.

### Le garde-fou éthique, non négociable

Ce qui est payant ne doit **jamais** dégrader l'expérience étudiante ni la sécurité :

- Un partenaire payant n'obtient **aucun accès privilégié à l'identité** d'un talent. Le
  dévoilement reste consenti, quel que soit le montant payé.
- Un partenaire payant reste soumis à la **limite d'un seul message de contact** sans réponse.
  On ne vend pas le droit de harceler.
- Aucune donnée nominative n'est vendue, jamais. C'est aussi une contrainte technique inscrite
  dans le modèle de données.

> Ce garde-fou n'est pas de la posture : c'est ce qui protège le côté gratuit, donc l'actif
> qui donne de la valeur au côté payant. Un étudiant qui se sent démarché part.

---

## 4. Structure tarifaire proposée

`[HYP]` — structure à valider, montants à remplir par le CEO après entretiens de validation.

| Formule | Cible | Contenu | Prix `[HYP]` |
|---|---|---|---|
| **Découverte** — gratuit | Tout partenaire vérifié | Profil, consultation illimitée, 0 contact, 0 publication | 0 |
| **Programme** | Incubateurs, ONG | N contacts par mois, N publications d'opportunité, candidatures illimitées | à définir |
| **Institution** | Entreprises, ministères, bailleurs | Contacts illimités, publications illimitées, analytics écosystème *(V2)*, sondages *(V2)*, plusieurs comptes cadres | à définir |

### Comment fixer les montants — méthode, pas invention

1. **Entretiens de validation** : rencontrer 5 à 8 partenaires cibles et poser trois questions —
   *comment recrutez-vous vos candidats aujourd'hui ? combien ça vous coûte en temps et en
   argent ? qu'est-ce qui vous manque le plus ?*
2. **Ancrer sur leur alternative** (§2), jamais sur notre coût d'infrastructure — qui est
   dérisoire et ne doit pas servir de référence.
3. **Vérifier la capacité à payer** : un incubateur financé par un bailleur international et une
   PME locale n'ont pas le même budget. La grille doit être segmentée, quitte à négocier au cas
   par cas la première année.
4. **Commencer plus haut que l'instinct.** Baisser un prix est facile, l'augmenter après avoir
   signé dix contrats est très difficile.
5. **Facturer à l'année, pas au mois.** Cycle de décision institutionnel, trésorerie, coût de
   recouvrement — tout pousse dans ce sens.

### Une piste complémentaire à évaluer

Une part significative des partenaires potentiels (incubateurs, ONG) est elle-même financée
par des bailleurs — IECD, Initiative International, AFD, EDBM figurent d'ailleurs parmi les
partenaires du hackathon. **Le sponsoring institutionnel est un canal de revenu distinct** :
un bailleur peut financer l'accès de dix incubateurs, ou financer la plateforme comme
infrastructure d'écosystème. Cette piste mérite d'être explorée en parallèle du modèle par
abonnement — le cycle de vente est plus long mais le ticket est sans commune mesure.

---

## 5. Séquencement de la monétisation

**Ne pas monétiser trop tôt est une décision, pas une hésitation.**

| Phase | Durée `[HYP]` | Objectif | Revenu |
|---|---|---|---|
| **Amorçage** | Mois 0–6 | 2 à 3 établissements pilotes, densité de talents, premiers projets réels | 0 — **tout est gratuit, partenaires compris** |
| **Validation** | Mois 6–12 | 5 à 10 partenaires actifs gratuitement ; mesurer ce qu'ils utilisent réellement | 0 à symbolique |
| **Monétisation** | Mois 12–24 | Activation de la grille sur les partenaires qui ont pris l'habitude d'utiliser l'outil | Premier revenu récurrent |
| **Industrialisation** | Mois 24+ | Analytics, sondages, sponsoring institutionnel | Diversification |

**Pourquoi cette patience est un argument, pas une faiblesse** : facturer un partenaire avant
qu'il ait trouvé un projet sur la plateforme, c'est vendre une promesse. Le laisser trouver
gratuitement pendant six mois, puis lui présenter la facture avec l'usage constaté, c'est
vendre un résultat. Le taux de conversion et le prix acceptable n'ont rien à voir.

**Conséquence à assumer devant un jury ou un investisseur** : le chiffre d'affaires de la
première année est proche de zéro **par choix**. Le seuil de rentabilité annoncé en troisième
année dans le cahier des charges est cohérent avec ce séquencement — à condition que le
business plan le justifie par des hypothèses explicites (§6).

---

## 6. Structure de coûts

### Ce que la direction technique peut chiffrer avec certitude

| Poste | Aujourd'hui | À 24 mois |
|---|---|---|
| Infrastructure complète (CDN, VPS, base managée, stockage, email, supervision) | **≈ 5 €/mois** | **≈ 60–115 €/mois** |
| Domaine `.mg` | ≈ 30 €/an | ≈ 30 €/an |

**Deux propriétés du modèle technique qui comptent pour le business plan** :

1. **Aucun poste n'est facturé par utilisateur actif.** La croissance du nombre d'étudiants —
   gratuite par construction — ne fait pas exploser la facture. C'est le résultat direct des
   choix d'architecture (pas de service d'authentification tiers facturé au MAU, pas de PaaS
   facturé à l'usage).
2. **La sortie réseau est gratuite** partout où elle compte. C'est la ligne qui surprend le
   plus souvent dans les infrastructures cloud, et elle est éliminée.

> **Implication stratégique** : le coût marginal d'un étudiant supplémentaire est
> quasi nul. Rien, techniquement, ne s'oppose à une croissance rapide du côté gratuit — ce qui
> valide la stratégie de subvention.

### Les postes que la direction technique ne peut pas chiffrer

| Poste | À remplir par le CEO |
|---|---|
| Rémunération de l'équipe | Le poste dominant, de loin |
| Démarchage commercial | Déplacements, temps, matériel de vente |
| Modération | Après un certain volume, ce n'est plus tenable par les fondateurs |
| Juridique | CGU, contrats institutionnels, statut de l'entité |
| Communication et acquisition | Événements campus, contenus |

---

## 7. Risques du modèle

| # | Risque | Pourquoi il est réel | Atténuation |
|---|---|---|---|
| **B1** | **L'amorçage à deux faces échoue** : pas assez de talents pour intéresser un partenaire, pas assez de partenaires pour intéresser les étudiants | Le risque numéro un de toute marketplace | Démarrer **très concentré** : un établissement, une ville, quelques secteurs. La densité locale bat le volume dispersé. |
| **B2** | **Les partenaires utilisent gratuitement et ne convertissent jamais** | La frontière gratuit/payant est peut-être mal placée | Mesurer dès le premier jour **quelle action précède un contact payant** ; ajuster la frontière sur des données, pas sur une intuition |
| **B3** | **La gratuité des établissements est mal comprise** — « si c'est gratuit, c'est que ça ne vaut rien » | Réflexe institutionnel courant | Formuler explicitement : *« gratuit pour vous parce que ce sont les partenaires qui paient pour accéder à vos talents »*. Le modèle devient un argument de valorisation de l'établissement. |
| **B4** | **Dépendance à un petit nombre de partenaires payants** | Sur un marché étroit, cinq clients peuvent représenter la totalité du revenu | Diversifier tôt : abonnement, sponsoring institutionnel, bailleurs |
| **B5** | **Un incident de sécurité ou de modération** | Nous détenons des données d'étudiants mineurs ou jeunes majeurs, et nous promettons un espace sûr | Modération dans le MVP ; pseudonymat garanti par le schéma ; journal d'audit ; relecture externe du module d'authentification |
| **B6** | **Un concurrent gratuit et généraliste** (groupes Facebook, WhatsApp) | Ils existent déjà et sont gratuits | Notre différence n'est pas la mise en relation, c'est **la certification institutionnelle et la structuration**. Un groupe Facebook ne peut ni certifier ni structurer. |

---

## 8. Indicateurs à suivre dès le premier jour

La plateforme doit produire ces chiffres nativement — ils sont dans le module analytique du
MVP. **Ce sont les mêmes chiffres qui pilotent le produit et qui alimentent le business plan.**

### Santé de la chaîne

| Indicateur | Pourquoi | Seuil d'alerte `[HYP]` |
|---|---|---|
| **Taux d'activation** (comptes activés / comptes créés) | Premier maillon. S'il casse, tout casse. | < 40 % |
| **Taux de complétion de profil** | Alimente le matching | < 50 % |
| Projets créés par 100 étudiants activés | Mesure l'intention entrepreneuriale réelle | — |
| **Taux de sortie du Brouillon** | Mesure si le BMC est une porte ou un mur | < 30 % |
| Candidatures par projet en recrutement | Mesure la liquidité | — |
| **Délai de réponse à une candidature** | Prédit l'abandon | > 7 jours |
| Taux d'acceptation d'une demande de contact | Mesure la qualité du matching | — |

### Santé du modèle économique

| Indicateur | Pourquoi |
|---|---|
| Partenaires actifs / partenaires inscrits | Mesure l'utilité réelle, pas l'inscription |
| Contacts émis par partenaire actif | Le futur point de facturation — mesurer avant de facturer |
| Opportunités publiées et candidatures reçues | Prouve la valeur au partenaire, chiffres en main |
| Établissements ayant ré-importé au semestre suivant | **Le meilleur signal de rétention institutionnelle** |

### Mission

| Indicateur | Pourquoi |
|---|---|
| **Part des équipes pluridisciplinaires** | C'est la promesse fondatrice : « profils trop similaires » |
| **Part des équipes mixtes** *(agrégé, seuil ≥ 5)* | Rend l'ODD 5 mesurable au lieu d'être affirmé |
| Projets accompagnés ou financés | Impact final |
| Volume et délai de traitement des signalements | Tient la promesse de sécurité |

> **La part des équipes pluridisciplinaires est l'indicateur le plus important du produit.**
> C'est le seul qui prouve que CoFound fait quelque chose qu'un groupe Facebook ne fait pas.

---

## 9. Ce qui reste à trancher

| # | Question | Pour qui |
|---|---|---|
| Q-B1 | Quel est le montant de l'alternative pour chaque segment partenaire ? *(§2)* | CEO — entretiens de validation |
| Q-B2 | Les montants des formules Programme et Institution | CEO |
| Q-B3 | Combien d'établissements pilotes visés en année 1, et lesquels ? | CEO |
| Q-B4 | Le sponsoring institutionnel est-il un canal prioritaire ou opportuniste ? | CEO |
| Q-B5 | Quel est le statut juridique de l'entité, et à quelle échéance ? | CEO |
| Q-B6 | Quelle rémunération de l'équipe est intégrée au plan, à partir de quand ? | CEO |
| Q-B7 | Confirmation de la marque : `CoFound.mg` ou `CoFounder.mg` ? *(les deux apparaissent dans les documents)* | CEO |
