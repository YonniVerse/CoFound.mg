# Spécifications d'interface — CoFound.mg

> **Le contrat commun de trois développeurs et de leurs agents de code.**
> 55 écrans, un design system, un catalogue de composants, une carte de routes.

**Version** : 1.0 — 20 août 2026
**Portée** : MVP uniquement — blocs M1 à M13 de [`../mvp-scope.md`](../mvp-scope.md)
**Propriétaire** : Norman (référent frontend) · arbitrage : Yonni (CTO)

---

## 1. Pourquoi ce dossier existe

Trois personnes développent en parallèle, chacune assistée d'un agent de code. Sans contrat
partagé, on obtient trois cartes de projet différentes, deux règles de pseudonymat
contradictoires dans le même feed — l'erreur `C2` du prototype — et un fichier de traductions
en conflit permanent.

Ce dossier répond à une seule question : **qu'est-ce qu'un développeur, ou son agent, doit
savoir avant d'écrire un écran, et qu'il ne peut pas deviner en lisant le code ?**

Il **ne remplace pas** : le périmètre (`mvp-scope.md`), les règles d'accès
(`architecture.md` §5), le modèle (`modele-de-donnees.md`) ni le backlog
(`plan-de-developpement.md`). Il les traduit en écrans.

---

## 2. Ordre de lecture

### Avant d'écrire quoi que ce soit — obligatoire

| # | Document | Ce qu'on y trouve |
|---|---|---|
| 1 | [`principes.md`](./principes.md) | Les 15 règles vraies sur **tous** les écrans : pseudonymat typé, genre absent, refus par défaut, six états, mobile d'abord, i18n, accessibilité, performance, ton, lexique, **checklist de revue** |
| 2 | [`design-system.md`](./design-system.md) | Tokens, typographie, mouvement, primitives, **où placer un composant**, découpage du paquet |
| 3 | [`navigation.md`](./navigation.md) | Les 55 routes, les 4 coquilles, les gardes d'accès |
| 4 | [`composants-partages.md`](./composants-partages.md) | Le catalogue et les contrats — **à consulter avant d'écrire un composant** |

### Puis la fiche de l'écran qu'on construit

| Document | Écrans | Tickets |
|---|---|---|
| [`ecrans-acces.md`](./ecrans-acces.md) | UI-01 → UI-08 — accueil, connexion, activation, demande d'accès, statut de compte, paramètres, erreurs | `E-09` à `E-11`, `E-15`, `B-01`, `S-06`, `S-07` |
| [`ecrans-profil.md`](./ecrans-profil.md) | UI-09 → UI-12 — onboarding, mon profil, édition, profil public | `E-12`, `E-13`, `E-14`, `F-09` |
| [`ecrans-decouverte.md`](./ecrans-decouverte.md) | UI-13 → UI-19 — Feed Projets, Feed Talents, recherche, Dream-Match, opportunités | `M-01` à `M-08`, `B-07` |
| [`ecrans-relations.md`](./ecrans-relations.md) | UI-20 → UI-23 — demandes de contact, messagerie, notifications, signalement | `M-09` à `M-16` |
| [`ecrans-projet.md`](./ecrans-projet.md) | UI-24 → UI-33 — création, BMC, équipe, candidatures, tâches, canal, publications, paramètres | `P-01` à `P-13` |
| [`ecrans-console-etablissement.md`](./ecrans-console-etablissement.md) | UI-34 → UI-40 — import, rapports, affiliations, annuaire, membres | `E-05` à `E-08`, `E-16` à `E-19` |
| [`ecrans-console-partenaire.md`](./ecrans-console-partenaire.md) | UI-41 → UI-48 — dealflow, suivi, contact, opportunités | `B-03` à `B-10` |
| [`ecrans-console-staff.md`](./ecrans-console-staff.md) | UI-49 → UI-55 — organisations, imports, modération, audit, référentiels, santé | `B-02`, `S-01` à `S-05` |

---

## 3. Format d'une fiche d'écran

Chaque fiche suit la même structure. Ce qui n'y figure pas est régi par `principes.md`.

```
## UI-nn — Nom de l'écran
adresse · coquille · fragment · ticket · responsable

**But**        une phrase : le problème d'utilisateur résolu
**Accès**      statuts de compte, rôles, capacités — et ce qui est refusé
**Données**    endpoints consommés, projection, ce qui n'est jamais chargé
**Structure**  mobile d'abord, puis ce que le bureau ajoute
**Composants** ceux du catalogue, ceux à créer
**États**      les six de principes.md §5, plus ceux propres à l'écran
**Règles**     ce qui est spécifique à cet écran, et pourquoi
**i18n**       l'espace de clés réservé
**Fait quand** critères vérifiables, pas des intentions
```

**Aucune fiche ne cite une couleur, une taille de police ou une valeur d'espacement.** Elles
sont dans le design system, une seule fois. C'est ce qui a tué la spécification du prototype :
elle décrivait une palette verte que le produit n'a plus.

---

## 4. Règles d'usage, pour les humains comme pour les agents

1. **Lire `principes.md` avant la fiche.** La fiche suppose les principes acquis et ne les répète pas.
2. **Ne pas inventer un espace de clés i18n** qui ne figure pas dans la fiche. C'est ce qui évite les conflits dans les fichiers de traduction.
3. **Ne pas créer un composant sans avoir consulté le catalogue.** Un composant entre dans `shared/` au 3ᵉ usage et dans 2 domaines, avec la revue de Norman.
4. **Si la fiche est fausse ou incomplète, on corrige la fiche dans le même commit que le code.** Une spécification qui diverge du produit est pire que pas de spécification : elle est crue.
5. **Si une fiche contredit une décision de `CLAUDE.md` ou d'`architecture.md`, la fiche a tort.** Le signaler plutôt que l'appliquer.
6. **Aucune fiche n'autorise à contourner le pseudonymat, le refus par défaut ou l'absence de genre.** Ces trois règles n'ont pas d'exception d'écran.

---

## 5. Ce que ces spécifications ne couvrent pas

| Absent | Où c'est traité |
|---|---|
| Gabarits d'emails transactionnels | Ticket `E-02` |
| Textes des CGU et de la politique de confidentialité | Ticket `S-14` |
| Maquettes haute fidélité | Il n'y en a pas, et il n'en faut pas : le design system tient les valeurs visuelles, les fiches tiennent la structure |
| Écrans Should-have (tableau de bord établissement, budget, calendrier, mentorat, sondages) | Après le MVP — `mvp-scope.md` §4 |
| Écrans Won't-have (financement, forum, analytique écosystème, vitrine publique) | `mvp-scope.md` §5 |

---

## 6. Deux constats à garder en tête

**55 écrans pour 130,5 jours-homme.** C'est un peu plus de deux jours par écran, socle,
backend et infrastructure compris. La marge est mince : chaque écran ajouté au périmètre doit
en retirer un autre, et tout ce qui n'est pas dans ces fiches est un Should-have par défaut
(`plan-de-developpement.md`, risque `R8`).

**Les écrans vides sont la surface la plus vue de la semaine 1.** Au lancement pilote, les
feeds, les suggestions et les opportunités sont vides. Chaque état vide est spécifié comme une
surface produit, avec une action — jamais comme un constat.
