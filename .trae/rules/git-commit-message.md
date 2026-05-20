---
alwaysApply: true
scene: git_message
---

## ⚠️ Langue

TOUS les messages de commit sont en français, sans exception.
Sujet, corps, footer — tout. Même sur un dépôt avec du code en anglais.

## Format

Conventional Commits : `<type>(<scope>): <sujet>`

- Sujet : mode impératif, minuscule, sans point final, max 72 caractères
- Scope : un nom commun au singulier — le module ou domaine concerné
- Corps (optionnel) : expliquer le *pourquoi*, pas le quoi — retour à 72 chars
- Footer (optionnel) : `Closes #123`, `BREAKING CHANGE: <description>`

## Types

| Type     | Quand l'utiliser                                      |
|----------|-------------------------------------------------------|
| feat     | Nouvelle fonctionnalité visible par l'utilisateur     |
| fix      | Correction de bug                                     |
| refactor | Réécriture sans changement de comportement            |
| perf     | Amélioration de performance                           |
| style    | Formatage, espaces — aucun changement logique         |
| test     | Ajout ou mise à jour de tests                         |
| docs     | Documentation uniquement                             |
| chore    | Build, outillage, dépendances, config CI              |
| revert   | Annulation d'un commit précédent                      |

## Règles

1. Un seul changement logique par commit — ne jamais mélanger des sujets distincts
2. Le sujet répond à : « Si appliqué, ce commit va… »
3. Ne jamais mentionner un nom de fichier dans le sujet (c'est dans le diff)
4. Éviter les verbes vagues : mettre à jour, modifier, changer, divers
5. Préférer des verbes précis : ajouter, supprimer, remplacer, extraire,
   renommer, exposer, simplifier, valider, mettre en cache, ignorer, réordonner
6. Breaking change : ajouter `!` après le type — `feat(api)!: …`
   et toujours ajouter un footer `BREAKING CHANGE:`

## Exemples

```
feat(auth): ajouter la connexion OAuth2 via GitHub

Remplace l'ancien flux identifiant/mot de passe.
L'utilisateur est redirigé vers /tableau-de-bord après consentement.

Closes #88
```

```
fix(panier): empêcher les doublons lors d'un double-clic rapide
```

```
refactor(logger): extraire le formateur dans un module indépendant
```

```
chore(deps): mettre à jour Vite vers 5.2 et aligner les dépendances Rollup
```
```
perf(recherche): mettre en cache les suggestions d'autocomplétion 60 s dans Redis
```
## Anti-patterns (ne jamais générer)

- `fix: bug fix`
- `update: various changes`
- `feat: ajouter une nouvelle fonctionnalité`  ← trop vague
- `WIP: pas encore terminé`
- `fix(auth.ts): update auth.ts`  ← nom de fichier + verbe vague