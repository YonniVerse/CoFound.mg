# Canevas de business plan — CoFound.mg

> **Destinataire : le CEO.** Le business plan n'existe pas encore ; ce document en fournit la
> structure, les données que la direction technique peut garantir, et **la liste des
> hypothèses qu'il faudra défendre**.
>
> Il ne s'agit pas de remplir des cases. Un business plan crédible se juge sur **la qualité
> des hypothèses et l'honnêteté sur ce qu'on ignore**, pas sur la précision apparente des
> chiffres.

**Version** : 1.0 — 20 août 2026
**Document lié** : [`modele-economique.md`](./modele-economique.md)

---

## Avertissement méthodologique

Le cahier des charges initial affirme un *« seuil de rentabilité prévu au début de la
troisième année »*. **Cette affirmation n'est aujourd'hui adossée à aucun calcul disponible.**

Devant un jury, un investisseur ou un bailleur, une affirmation de ce type appelle
immédiatement une question : *sur quelles hypothèses ?* Y répondre par « nous l'avons estimé »
coûte plus cher que de ne rien avoir affirmé.

**Deux options, une seule bonne** :
- ❌ Garder la phrase sans le calcul.
- ✅ Produire le calcul, avec ses hypothèses nommées — et assumer que certaines sont fragiles.

---

## 1. Structure attendue du business plan

### Section 1 — Problème et marché

| À produire | Source |
|---|---|
| Le problème, chiffré | Statistiques nationales sur l'enseignement supérieur et l'emploi des jeunes — **citer les sources, dater les chiffres** |
| Taille du marché adressable | Nombre d'établissements supérieurs à Madagascar, effectifs étudiants, nombre d'incubateurs et de structures d'accompagnement actives |
| Pourquoi maintenant | Croissance de la pénétration mobile, dynamique entrepreneuriale, existence de programmes de soutien |

> **Piège à éviter** : le marché adressable n'est pas « tous les étudiants de Madagascar ».
> C'est le nombre d'établissements atteignables **et** le nombre de partenaires **capables de
> payer**. Le second chiffre est le vrai plafond du revenu, et il est petit. Le donner
> soi-même, avant qu'on le demande, est un signe de sérieux.

### Section 2 — Solution et différenciation

Trois différenciateurs, dans cet ordre :

1. **La certification institutionnelle.** Aucun réseau social ne peut certifier qu'une personne
   est bien étudiante dans un établissement donné. C'est la barrière à l'entrée la plus solide.
2. **La structuration imposée** (Business Model Canvas). Transforme des idées en dossiers
   comparables — c'est ce qui rend le dealflow exploitable pour un partenaire.
3. **Le pseudonymat et la mise en relation par compétences.** Répond à un problème social réel
   et documenté.

> **À ne pas revendiquer** : « le matching par intelligence artificielle ». Ce n'est pas ce qui
> est construit en V1, et un interlocuteur averti le détectera. L'argument défendable est
> l'inverse et il est plus fort : *un algorithme explicable, parce qu'avec deux cents
> utilisateurs, une boîte noire n'aurait rien à apprendre et ne pourrait pas être justifiée
> auprès d'un établissement.*

### Section 3 — Modèle économique

→ Reprendre [`modele-economique.md`](./modele-economique.md) intégralement.

Le point à mettre en avant : **le retournement du modèle**. Établissements gratuits,
partenaires payants. C'est la décision structurante et elle se défend en une phrase.

### Section 4 — Go-to-market

| Question | Ce qu'il faut y répondre |
|---|---|
| Quel établissement pilote, et pourquoi lui ? | L'ESP-Antsiranana est l'évidence : l'équipe y est, la relation existe, le déploiement peut être accompagné physiquement |
| Comment on convainc un établissement ? | Argument : gratuit, valorise vos étudiants, vous donne une visibilité que vous n'avez pas, et vous rend visible des partenaires |
| Qui porte le démarchage, et avec quel matériel ? | — |
| Comment on passe du 1ᵉʳ au 10ᵉ établissement ? | La preuve par le pilote : des chiffres réels, pas une promesse |
| Comment on attire les premiers partenaires ? | Le réseau du hackathon (IECD, Initiative International, EDBM, Maison de l'Entrepreneuriat) est un point de départ direct |

> **Le pilote n'est pas une étape administrative, c'est l'actif commercial numéro un.** Un
> établissement avec 300 comptes activés, 20 projets et 2 partenaires actifs vaut plus que dix
> lettres d'intention.

### Section 5 — Équipe

Les profils techniques sont dans le dossier de candidature. **Ce qui manque et qui sera
demandé** :

- Qui porte le commercial et l'institutionnel ?
- Qui porte le juridique et l'administratif ?
- Quels manques sont assumés, et comment on prévoit de les combler ?

> Nommer un manque est plus crédible que prétendre qu'une équipe de trois étudiants couvre
> tout. Un investisseur cherche des gens lucides, pas des gens complets.

### Section 6 — Modèle financier

→ §2 ci-dessous.

### Section 7 — Risques

→ Reprendre §7 de [`modele-economique.md`](./modele-economique.md), en y ajoutant les risques
non techniques : réglementaire, dépendance à un bailleur, départ d'un fondateur.

---

## 2. Modèle financier — les formules, à remplir

### Revenu

```
Revenu_année_N =
      (partenaires_payants_N  ×  prix_moyen_annuel)
    + (sponsoring_institutionnel_N)
```

**Les trois variables à estimer, et rien d'autre** :

| Variable | Comment l'estimer honnêtement |
|---|---|
| `partenaires_payants_N` | Partir du **nombre total de partenaires capables de payer à Madagascar** (chiffre fini et petit), appliquer une part de marché atteignable. **Ne jamais partir d'un pourcentage du nombre d'étudiants.** |
| `prix_moyen_annuel` | Issu des entretiens de validation (§2 du modèle économique), pas d'une intuition |
| `sponsoring_institutionnel_N` | Le plus incertain. À traiter comme un **scénario haut**, jamais comme une hypothèse centrale. |

### Coûts

```
Coûts_année_N =
      infrastructure          ← chiffré et garanti, voir ci-dessous
    + rémunérations           ← poste dominant, à définir
    + démarchage commercial
    + juridique et administratif
    + modération              ← devient un poste réel au-delà d'un certain volume
```

### Ce que la direction technique garantit

| Poste | Valeur | Fiabilité |
|---|---|---|
| Infrastructure année 1 | **≈ 60 €/an** | Élevée — architecture connue, aucun coût variable par utilisateur |
| Infrastructure année 2 | **≈ 700–1 400 €/an** | Élevée |
| Coût marginal d'un étudiant supplémentaire | **≈ 0** | Élevée — c'est une propriété des choix d'architecture |

> *Conversion indicative : ≈ 5 000 MGA pour 1 € — **à actualiser au moment de la rédaction**,
> le taux évolue.*

**Ce qui découle de ces chiffres, et qu'il faut dire explicitement** : l'infrastructure ne sera
jamais le poste qui décide de la rentabilité. **Le seuil de rentabilité de CoFound est
entièrement déterminé par le coût de l'équipe et le rythme de conversion des partenaires.**
Le business plan doit donc concentrer sa démonstration sur ces deux variables — c'est un
message beaucoup plus solide qu'un tableau d'infrastructure détaillé.

### Seuil de rentabilité

```
Seuil atteint quand :
    partenaires_payants × prix_moyen  ≥  rémunérations + coûts fixes
```

**Le calcul à produire, dans ce sens** : *combien de partenaires payants faut-il pour couvrir
les coûts ?* Puis : *ce nombre est-il atteignable au vu du nombre total de partenaires
existant à Madagascar ?*

> Si la réponse est « il nous en faut 40 et il en existe 25 dans le pays », le modèle doit
> changer — et il vaut infiniment mieux le découvrir maintenant que devant un investisseur.
> C'est le calcul le plus utile de tout le business plan.

---

## 3. Les hypothèses à défendre

Chacune doit être **nommée, chiffrée, et accompagnée de ce qui se passe si elle est fausse**.

| # | Hypothèse | Si elle est fausse |
|---|---|---|
| H1 | Un établissement accepte d'importer sa liste d'étudiants | **Le modèle entier s'arrête.** À tester en premier, avant toute autre chose. |
| H2 | Le taux d'activation des comptes dépasse 40 % | La densité ne se forme pas, les partenaires ne trouvent rien |
| H3 | Les étudiants créent des projets, pas seulement des profils | Il n'y a pas de dealflow, donc rien à vendre |
| H4 | Les partenaires malgaches ont un budget pour du sourcing en ligne | Il faut basculer vers le sponsoring institutionnel comme canal principal |
| H5 | Le prix acceptable est supérieur au coût de vente | Le modèle par abonnement ne tient pas à cette échelle |
| H6 | Un établissement ré-importe au semestre suivant | La base d'utilisateurs vieillit et s'éteint |
| H7 | La modération reste tenable par les fondateurs jusqu'à N utilisateurs | Il faut recruter plus tôt que prévu — poste de coût à anticiper |

> **H1 et H4 sont les deux hypothèses qui peuvent tuer le projet.** Elles doivent être testées
> par des entretiens réels, pas par du raisonnement. Trois rendez-vous suffisent à savoir.

---

## 4. Ce que la plateforme produira comme preuves

Argument à faire valoir : **le produit génère lui-même les données qui valident le business
plan.** Les indicateurs du §8 de [`modele-economique.md`](./modele-economique.md) sont
natifs — ce ne sont pas des mesures ajoutées après coup pour un rapport.

| Après 3 mois de pilote, on saura | Ce que ça valide |
|---|---|
| Le taux d'activation réel | H2 |
| Le nombre de projets par 100 étudiants | H3 |
| Le taux de sortie du Brouillon | Que le BMC est une porte et non un mur |
| Le nombre de contacts émis par les partenaires | Le point de facturation, avant de facturer |
| La part d'équipes pluridisciplinaires | **La promesse fondatrice du produit** |

> Un business plan appuyé sur trois mois de données réelles de pilote n'a rien à voir avec un
> business plan projeté. C'est la raison pour laquelle le pilote passe avant la levée de
> fonds, et non l'inverse.

---

## 5. Checklist avant diffusion du business plan

- [ ] Toute affirmation chiffrée renvoie à une hypothèse nommée ou à une source datée
- [ ] Le seuil de rentabilité est **calculé**, pas affirmé
- [ ] Le nombre de partenaires payants nécessaires est comparé au **nombre existant** dans le pays
- [ ] Les hypothèses fragiles sont identifiées comme telles
- [ ] Aucune revendication d'IA ou de fonctionnalité non construite
- [ ] Les manques de l'équipe sont nommés
- [ ] La marque est cohérente partout — `CoFound.mg` ou `CoFounder.mg`, il faut trancher
- [ ] Les montants portent leur devise et le taux de conversion est daté
- [ ] Le document dit **ce qu'on ne sait pas encore**
