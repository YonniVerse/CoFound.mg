---
description: Clôture la session — met à jour NEXT_SESSION.md et CHANGELOG.md pour que la prochaine session reprenne sans perte de contexte
argument-hint: [note libre sur la session, optionnel]
allowed-tools: Bash(git status:*), Bash(git log:*), Bash(git diff:*), Bash(git branch:*), Read, Edit, Write, Glob, Grep
---

# Handoff de fin de session

Tu clôtures une session de travail sur **CoFound.mg**. Objectif : la prochaine session doit
pouvoir reprendre **sans poser une seule question**.

Note libre fournie par Yonni : $ARGUMENTS

## Contexte automatique

- Branche et état : !`git status -sb 2>/dev/null | head -30`
- Commits de la session : !`git log --oneline -20 2>/dev/null`
- Fichiers modifiés non committés : !`git diff --stat 2>/dev/null | tail -20`
- Branches : !`git branch -a 2>/dev/null | head -20`

## Ce que tu dois faire

### 1. Reconstituer ce qui s'est passé

Relis la conversation de cette session **et** le contexte git ci-dessus. Identifie :

- Ce qui a été **livré** (code fusionné, fichiers créés, tickets terminés)
- Ce qui a été **décidé** — et notamment ce qui s'écarte des décisions `D1` à `D12` de
  `CLAUDE.md` ou des documents de `docs/`
- Ce qui est **en cours**, à quel endroit précis, et ce qu'il reste à faire dessus
- Ce qui est **bloqué**, et par quoi ou par qui
- Les **questions ouvertes** apparues pendant la session
- Les **pièges rencontrés** qu'il serait coûteux de redécouvrir

### 2. Mettre à jour `NEXT_SESSION.md`

Réécris le fichier en conservant sa structure en 6 sections. Règles :

- **Ce fichier décrit l'état vivant, pas l'historique.** Retire ce qui est devenu faux ou
  résolu — ne l'accumule pas.
- La section **« Prochaine action »** contient **une seule action**, formulée assez précisément
  pour être démarrée sans réflexion préalable : identifiant de ticket, fichiers concernés,
  commande à lancer.
- Les questions ouvertes indiquent **ce qu'elles bloquent** et **pour qui elles sont**.
- Les points de vigilance sont ceux encore actifs. Un point traité disparaît.
- Actualise la date et la phase en tête de fichier.
- **Vise moins de 150 lignes.** Un fichier de reprise trop long n'est pas lu.

### 3. Ajouter une entrée à `CHANGELOG.md`

Insère une nouvelle section **en haut**, sous l'en-tête, au format :

```
## AAAA-MM-JJ — <titre court et concret de ce qui a été fait>
```

Puis les rubriques pertinentes : **Décidé · Ajouté · Modifié · Retiré · En cours · Bloqué**.
N'écris que les rubriques qui ont du contenu.

Pour chaque décision, note **la raison en une ligne**. Une décision sans sa raison sera
re-débattue dans trois mois.

Ne modifie jamais les entrées existantes du changelog.

### 4. Répercuter les décisions durables

Si la session a produit une décision qui **vaut pour toutes les sessions futures** — et pas
seulement pour l'état courant :

- Une décision produit ou technique structurante → l'ajouter au tableau correspondant de
  `CLAUDE.md`
- Un changement de périmètre → mettre à jour `docs/mvp-scope.md`
- Un changement d'architecture, de modèle de données ou de stack → mettre à jour le document
  concerné dans `docs/`

**Signale explicitement chaque mise à jour de ce type dans ta réponse.** Ce sont les seules
modifications documentaires qui engagent au-delà de la session.

### 5. Rendre compte

Termine par un résumé court, en français :

- Ce qui a bougé pendant la session
- La prochaine action retenue
- Les décisions durables répercutées, et où
- Ce qui reste en attente d'une réponse humaine

## Règles

- **En français**, comme toute la documentation du projet.
- **Aucune invention.** Si tu n'as pas la preuve qu'un ticket est terminé, écris qu'il est en
  cours. Un état de reprise faux coûte plus cher qu'un état incomplet.
- **Ne commite rien**, sauf si Yonni le demande explicitement.
- Si un écart avec les décisions `D1` à `D12` de `CLAUDE.md` a été introduit sans discussion,
  **signale-le comme un point de vigilance** plutôt que de l'entériner silencieusement.
