# Reprise de session

**Dernière mise à jour** : 2026-08-22
**Phase** : harmonisation visuelle de la page détail projet
**Vague / ticket** : M-05 — découverte, feed et expérience responsive
**Branche actuelle** : `dev`

## 1. État actuel

La page détail projet `/projects/:id` a été harmonisée avec le langage visuel de `FeedPage`. Les quatre modifications de code ont été commitées et poussées séparément sur `origin/dev`. Le dépôt local est propre et synchronisé.

## 2. Tâches terminées

Le layout de la page détail reprend la largeur, le padding, les gaps et l’alignement du feed. Le panneau latéral utilise le même offset sticky de 90 px et reste aligné au début.

Les actions du projet utilisent désormais la même densité que les actions du feed : boutons `sm`, hauteur `h-9`, rayon `rounded-lg`, padding homogène, typographie responsive et ombre réduite.

La carte équipe reprend la surface, le rayon, l’ombre, la hiérarchie du titre, les espacements et la densité d’avatar du feed. Le contenu principal reprend une hiérarchie responsive pour les titres, paragraphes, tags et cartes de rôles.

## 3. Fichiers importants modifiés

- `apps/web/src/pages/ProjectDetailPage.tsx` : layout, bouton Retour et sticky de la page détail.
- `apps/web/src/components/project/ProjectActionCard.tsx` : boutons et carte d’action.
- `apps/web/src/components/project/ProjectTeamCard.tsx` : carte équipe et densité des membres.
- `apps/web/src/components/project/ProjectContent.tsx` : typographie, espacements et cartes de contenu.

## 4. Validations et problèmes connus

Le typecheck web, le lint web, la compilation de `@cofound/shared` et le build web ont réussi après les modifications.

Une installation complète avec `pnpm install --frozen-lockfile` échoue dans cet environnement lors de la compilation native d’`argon2`, car aucun compilateur C (`cc`) n’est disponible. Les validations ont été exécutées avec les dépendances déjà installées via `pnpm install --frozen-lockfile --ignore-scripts`.

La validation visuelle finale dans un navigateur desktop sur `/projects/:id` reste recommandée pour vérifier les retours à la ligne et la densité sur les différentes largeurs.

## 5. Prochaine action

Ouvrir `/projects/:id` et `/feed` côte à côte en desktop puis en mobile, comparer les boutons et les tailles de texte, et signaler tout écart visuel restant.

## 6. Décisions et contexte de reprise

La page détail conserve ses titres de niveau page plus grands que les cartes du feed, mais partage désormais la même grammaire de composants : `bg-card`, `rounded-xl`, `shadow-2xs`, boutons compacts et typographie responsive. Aucun changement d’architecture, de périmètre, de RBAC, de données privées ou de stack n’a été introduit.

Commits publiés : `5ecefc4`, `9109150`, `bb407c6` et `cec3962`. Les commits documentaires précédents liés au sticky sont `85041a2` et `29ce0c4`.
