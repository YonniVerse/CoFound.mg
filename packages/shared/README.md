# @cofound/shared

Code partagé entre `apps/web` et `apps/api` : énumérations du domaine, schémas de
validation et codes d'erreur.

**Raison d'être** : c'est le bénéfice principal du TypeScript de bout en bout. Sans ce
paquet, chaque règle de validation serait écrite deux fois et les deux versions
divergeraient. Voir `docs/stack-technique-et-justifications.md` §13.

## État

| Contenu | Ticket | État |
|---|---|---|
| Énumérations du domaine | `F-01` | ✅ |
| Schémas de validation Zod | `F-11` | ⬜ |
| Codes d'erreur | `F-11` | ⬜ |

## Convention

Le paquet **exporte ses sources TypeScript**, sans étape de compilation. Les consommateurs
les transpilent (Vite le fait nativement). Quand `apps/api` sera initialisé au ticket
`F-05`, sa configuration de compilation devra inclure ce paquet.

## Règle

Ne mettre ici que ce qui est **réellement partagé** par le web et l'API. Un type utilisé
d'un seul côté reste de ce côté — un paquet partagé qui devient un fourre-tout est un
couplage déguisé.
