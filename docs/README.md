# Documentation CoFound.mg — index

Ordre de lecture recommandé pour quelqu'un qui découvre le projet.

## Produit et technique

| # | Document | Contenu | Pour qui |
|---|---|---|---|
| 1 | [`specs-fonctionnelles.md`](./specs-fonctionnelles.md) | Toutes les fonctionnalités par acteur, avec accès, données et dépendances. Exhaustif, sans arbitrage de périmètre. | Tous |
| 2 | [`mvp-scope.md`](./mvp-scope.md) | Must / Should / Won't, avec la justification produit de chaque exclusion | Tous |
| 3 | [`stack-technique-et-justifications.md`](./stack-technique-et-justifications.md) | Registre de décisions techniques : options, critères, recommandation, compromis assumé | Technique |
| 4 | [`architecture.md`](./architecture.md) | Schémas d'architecture, flux critiques, RBAC, budget de performance | Technique |
| 5 | [`modele-de-donnees.md`](./modele-de-donnees.md) | 32 entités du MVP, relations, index, contraintes | Technique |
| 6 | [`plan-de-developpement.md`](./plan-de-developpement.md) | 6 vagues, ~70 tickets, répartition, risques, migration du dépôt | Technique |

## Business

| # | Document | Contenu | Pour qui |
|---|---|---|---|
| 7 | [`business/modele-economique.md`](./business/modele-economique.md) | Le modèle, la méthode de fixation des prix, les coûts réels, les indicateurs | **CEO** |
| 8 | [`business/business-plan-canevas.md`](./business/business-plan-canevas.md) | Structure du business plan, formules financières, hypothèses à défendre | **CEO** |
| 9 | [`business/pitch-et-objections.md`](./business/pitch-et-objections.md) | Récit, arguments, objections et réponses, script de démonstration | **CEO + équipe** |

---

## Les décisions à connaître avant toute contribution

| # | Décision | Où c'est justifié |
|---|---|---|
| D1 | **Aucune inscription publique.** Les comptes étudiants sont provisionnés par import de l'établissement. | `specs-fonctionnelles.md` §0 |
| D2 | **Les établissements ne paient pas.** 100 % du revenu vient des partenaires. | `business/modele-economique.md` §1 |
| D5 | **Aucun flux monétaire sur la plateforme**, même après partenariat opérateur. | `specs-fonctionnelles.md` TR-13 |
| D6 | **Le BMC est obligatoire pour sortir du Brouillon**, jamais pour créer. | `mvp-scope.md` M4 |
| D7 | **Pseudonymat, pas anonymat.** Le mot est employé tel quel dans le produit. | `specs-fonctionnelles.md` TR-04 |
| D8 | **Le genre n'est jamais visible individuellement**, par personne — staff compris. | `architecture.md` §5 |
| D9 | **Matching déterministe et explicable.** Pas d'apprentissage automatique en V1. | `mvp-scope.md` M5 |

---

## Documents remplacés

`docs/archive/PRD_CoFound_mg.md` et `docs/archive/SPECS_CoFound_mg.md` décrivent le prototype
de démonstration de hackathon (personas limités aux étudiants, critères de succès orientés
jury). Ils sont **conservés comme référence pour les maquettes d'écran**, mais ne font plus
autorité sur le périmètre ni sur la stack.
