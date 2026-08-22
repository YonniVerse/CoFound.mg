# Reprise de session

**Dernière mise à jour** : 2026-08-22
**Phase** : panneau droit de connexion — cards colorées
**Vague / ticket** : E-11 — connexion et accès
**Branche actuelle** : `dev`

## 1. État actuel

La card Communauté affiche désormais un fond bleu opaque `bg-primary`, avec texte en `text-primary-foreground` et bordure `border-primary/80`. La card Impact collectif affiche désormais un fond rouge sémantique `bg-destructive`, avec texte `text-destructive-foreground` et bordure `border-destructive/80`.

## 2. Tâches terminées

Le contraste de la card « Avancer ensemble » a été corrigé : le fond n’est plus transparent et le titre, le label, la méta-information et les avatars restent lisibles sur le bleu.

Le texte `Chaque parcours compte` a été supprimé de la card « 50/50 en mouvement ». La barre de progression a été adaptée au nouveau fond rouge en utilisant `destructive-foreground` avec une opacité maîtrisée.

Les autres éléments du panneau restent inchangés : cinq cards en grille de deux colonnes, première card sur `col-span-2`, aucune liaison SVG ni tiret entre les cards, et page verrouillée en `h-screen overflow-hidden`.

## 3. Fichiers importants modifiés

- `apps/web/src/pages/LoginPage.tsx` : fonds, bordures et contrastes des cards Communauté et Impact ; retrait de la méta-information Impact.
- `NEXT_SESSION.md` et `CHANGELOG.md` : handoff de session.

Le commit de code publié est `957a308`. Le commit précédent de structure est `32f770d`.

## 4. Validations et problèmes connus

Le typecheck web, le lint web, la compilation de `@cofound/shared` et le build web ont réussi. `dev` local et `origin/dev` sont synchronisés et propres.

La card Communauté utilise le token primaire opaque et la card Impact le token sémantique destructif. Si la charte produit demande un rouge spécifique différent du token `destructive`, il faudra remplacer ce token par une couleur de marque validée.

## 5. Prochaine action

Ouvrir `/login` sur un viewport desktop et vérifier le contraste du bleu et du rouge en français et en malgache. Vérifier que le texte supprimé n’apparaît plus et que les cards restent entièrement visibles.

## 6. Décisions et contexte de reprise

Les couleurs ont été réalisées avec les tokens du design system plutôt qu’avec des hexadécimaux arbitraires. Aucun changement d’architecture, de données, de RBAC ou de stack n’a été introduit.
