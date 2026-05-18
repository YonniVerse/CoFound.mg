# PRD — CoFound.mg 
**Plateforme de Co-Fondateurs Étudiants — Madagascar**
**Version 1.0 — Hackathon ITOVIA 2025-2026**

---

## 1. Vision du Produit

CoFound.mg est une plateforme web qui connecte des étudiants de formations différentes pour co-fonder des startups. L'algorithme de matching repose sur la **complémentarité des compétences**, pas la similarité.

Le produit répond à deux constats :
1. Les meilleures startups naissent d'équipes pluridisciplinaires — mais les grandes écoles malgaches fonctionnent en silos étanches.
2. Les femmes étudiantes représentent 50% des talents disponibles mais moins de 20% des fondateurs de startups en Afrique — des barrières structurelles invisibles les freinent.

**Promesse produit :** En moins de 10 minutes sur CoFound.mg, un étudiant publie son projet ou son profil de compétences, et reçoit des suggestions de co-fondateurs complémentaires.

---

## 2. Contexte Hackathon

- **Événement :** Hackathon ITOVIA — École Polytechnique de Madagascar
- **Thème obligatoire :** Inclusion des besoins spécifiques des femmes
- **Format de présentation :** Démo live (prototype frontend fonctionnel avec données mock)
- **Objectif démo :** Convaincre le jury de la valeur du produit, de la qualité de l'expérience utilisateur, et de l'impact sur l'inclusion féminine

---

## 3. Utilisateurs Cibles

### Persona 1 — L'Étudiant Porteur d'Idée
- Profil type : Étudiant en informatique ou gestion avec une idée de startup
- Problème : A une idée mais manque de compétences complémentaires (marketing, design, expertise métier)
- Besoin : Trouver des co-fondateurs fiables et complémentaires hors de son cercle social

### Persona 2 — L'Étudiant Chercheur de Projet
- Profil type : Étudiant en design, droit, médecine, ou autre filière non-tech
- Problème : Veut contribuer à une startup mais ne sait pas où trouver des projets ou des équipes
- Besoin : Être visible auprès des porteurs de projets qui ont besoin de ses compétences

### Persona 3 — L'Étudiante (dimension inclusive)
- Profil type : Étudiante de toute filière
- Problème supplémentaire : Syndrome de l'imposteur, manque de réseaux mixtes, peur du jugement
- Besoin : Un espace sécurisé pour participer à l'entrepreneuriat sans exposition immédiate

---

## 4. Stack Technique

| Couche | Technologie |
|--------|-------------|
| Framework | React (Vite) |
| Styling | Tailwind CSS |
| Composants UI | Shadcn/UI |
| Routing | React Router v6 |
| State management | useState / useContext (pas de Redux pour le MVP) |
| Données | Mock data statique (JSON) — pas de backend pour le hackathon |
| Icons | Lucide React |
| Animations | CSS Tailwind transitions + Framer Motion pour les éléments clés |

---

## 5. Design System

### 5.1 Palette de couleurs

| Token | Valeur | Usage |
|-------|--------|-------|
| `--primary` | `#16a34a` (vert 600) | CTA principaux, accents, liens actifs |
| `--primary-dark` | `#15803d` (vert 700) | Hover states |
| `--primary-light` | `#dcfce7` (vert 100) | Badges, backgrounds doux |
| `--foreground` | `#0f172a` (slate 900) | Texte principal |
| `--muted` | `#64748b` (slate 500) | Texte secondaire, labels |
| `--border` | `#e2e8f0` (slate 200) | Bordures, séparateurs |
| `--background` | `#ffffff` | Fond principal |
| `--surface` | `#f8fafc` (slate 50) | Cards, panels |
| `--female-badge` | `#a855f7` (purple 500) | Indicateurs dimension féminine |

### 5.2 Typographie

| Rôle | Police | Taille |
|------|--------|--------|
| Display / Hero | `Sora` (Google Fonts) — bold 700-800 | 48-72px |
| Headings | `Sora` — semibold 600 | 24-36px |
| Body | `Inter` | 14-16px |
| Labels / Meta | `Inter` — medium 500 | 12-13px |

### 5.3 Principes visuels

- **Minimalisme pro** — inspiré YCombinator : beaucoup de blanc, typographie forte, contenu qui parle
- Pas d'animations superflues — seulement là où elles ajoutent de la valeur (transitions de page, hover sur cards)
- Cards avec ombres légères (`shadow-sm`), border-radius modéré (`rounded-xl`)
- Vert comme couleur signature — pas de gradient, couleur franche
- La dimension féminine est exprimée via des indicateurs discrets en violet (pas envahissant)

---

## 6. Architecture des Pages

### 6.1 Vue d'ensemble

```
/                     → Landing Page (guest)
/signup               → Inscription (choix du mode)
/login                → Connexion
/onboarding           → Création de profil (étapes)
/feed                 → Feed principal (post-login)
/projects             → Explorer les projets
/projects/:id         → Page détail projet
/profiles             → Explorer les co-fondateurs
/profiles/:id         → Page profil co-fondateur
/messages             → Messagerie
/dashboard            → Mon tableau de bord
/profile/me           → Mon profil (édition)
/impact               → Dashboard parité publique
```

---

## 7. Spécifications des Pages

---

### Page 1 — Landing Page `/`

**Objectif :** Expliquer le produit, convaincre, convertir en inscription. Pas de flou — un visiteur comprend ce qu'est CoFound.mg en 10 secondes.

**Structure (sections dans l'ordre) :**

#### Section Hero
- **Headline :** "Trouve ton co-fondateur. Lance ta startup." (typographie massive, Sora 700)
- **Sous-titre :** "CoFound.mg connecte les étudiants de formations différentes pour créer des équipes qui changent Madagascar."
- **2 CTA :** `Rejoindre la plateforme` (vert, primary) + `Voir les projets` (outline, ghost)
- **Visual :** Illustration ou mockup de 3 cards de profils différents (informatique + gestion + design) qui se "connectent" — statique mais évocatrice
- **Social proof :** "200+ étudiants · 5 écoles partenaires · 10 startups lancées" (chiffres mock en ligne, style sobre)

#### Section "Comment ça marche" (3 étapes)
- Titre : "Simple. Complémentaire. Efficace."
- Step 1 : **Crée ton profil** — Décris tes compétences et ce que tu cherches (icon: user)
- Step 2 : **Explore ou publie** — Publie ton projet ou explore les profils disponibles (icon: search)
- Step 3 : **Connecte-toi** — Envoie un message, forme ton équipe, lance ta startup (icon: handshake)
- Design : 3 colonnes, numéros larges en vert, description concise

#### Section "Pour qui ?"
- Tableau ou cards de 5 profils (informatique, gestion, médecine, design, droit)
- Pour chaque profil : ce qu'il apporte / ce qu'il cherche
- Visuel propre, sobre, lisible

#### Section "Inclusion Féminine" (obligatoire — thème hackathon)
- Titre : "50% des talents. Pleinement impliquées."
- Stat headline : "Moins de 20% des fondateurs de startups en Afrique sont des femmes. Miaraka change ça."
- 3 features mises en avant (icône + titre + 1 ligne) :
  - 🔒 Espace sécurisé — Profil visible uniquement aux femmes en option
  - 🤝 Réseau de mentores — Accès à des entrepreneures établies
  - 📊 Tableau de bord parité — La parité rendue visible en temps réel
- Fond légèrement teinté (vert très clair ou slate 50) pour distinguer la section

#### Section Témoignages (mock)
- 3 témoignages de profils fictifs réalistes (noms malgaches)
- Card avec photo avatar, nom, école, quote courte
- Ex : "J'avais l'idée, il me manquait le dev. Miaraka m'a connecté à Hery en 2 jours." — Fara, ISCAM

#### Footer
- Logo + tagline "Ensemble, nous construisons l'Afrique de demain."
- Liens : À propos · Contact · Politique de confidentialité
- Liens réseaux sociaux (icônes)

---

### Page 2 — Inscription `/signup`

**Objectif :** Créer un compte rapidement. Pas de friction.

**Champs :**
- Prénom + Nom
- Email universitaire (avec helper text : "Utilisez votre email d'école pour la vérification")
- École (dropdown avec liste mock des écoles partenaires)
- Filière / Domaine d'études
- Mot de passe + Confirmation
- Checkbox CGU

**Post-signup :** Redirection vers `/onboarding`

---

### Page 3 — Onboarding `/onboarding`

**Objectif :** Compléter le profil en 3 étapes guidées. Gamifié avec une progress bar.

**Structure :**
- Progress bar en haut : "Étape 1/3 · 2/3 · 3/3"
- Boutons "Précédent" / "Suivant"

**Étape 1 — Ton profil**
- Photo de profil (upload ou avatar généré)
- Bio courte (140 caractères max)
- Compétences techniques (tags sélectionnables : React, Python, Finance, UX Design, Marketing, Droit, etc.)
- Compétences soft skills (tags : Leadership, Communication, Créativité, Analyse...)

**Étape 2 — Ce que tu cherches**
- Mode principal : `J'ai une idée de projet` | `Je cherche un projet` | `Les deux`
- Si "J'ai une idée" → champs : Nom du projet, secteur, compétences manquantes dans l'équipe
- Disponibilité : Full-time / Soirs & weekends / Flexible

**Étape 3 — Inclusion & Visibilité**
- Genre (optionnel) — avec explication claire pourquoi on demande (pour le dashboard parité)
- Si femme : option "Rendre mon profil visible aux femmes en premier" (toggle)
- Option "Équipe paritaire" : "Je préfère des suggestions d'équipes mixtes" (toggle)
- Visibilité générale : Public / Connexions seulement

---

### Page 4 — Feed `/feed`

**Objectif :** Page principale post-login. Découvrir projets et co-fondateurs. Effet LinkedIn.

**Layout :**
- Sidebar gauche (fixe, desktop) : Navigation principale
- Colonne centrale : Feed de cards
- Sidebar droite (desktop) : Suggestions + Stats parité rapides

**Navigation sidebar gauche :**
- 🏠 Feed
- 🔍 Explorer Projets
- 👥 Explorer Profils
- 💬 Messages (badge compteur)
- 📊 Impact & Parité
- 👤 Mon Profil
- ⚙️ Paramètres

**Filtres au-dessus du feed :**
`Tous` · `Projets` · `Co-fondateurs` · `Pour moi`

**Types de cards dans le feed :**

*Card Projet :*
- Badge secteur (ex: "HealthTech") en vert
- Titre du projet + description courte (2 lignes)
- École du fondateur + avatar
- Tags compétences recherchées (ex: "Dev React" "UX Design" "Marketing")
- Badge 🔵 "Impact Féminin" si applicable
- CTA : `Voir le projet` + `Exprimer mon intérêt`
- Métadonnées : "Publié il y a 2 jours · 3 candidatures"

*Card Co-fondateur :*
- Avatar + Nom + École
- Tags compétences (ce qu'il apporte)
- Ce qu'il cherche (1 ligne)
- Badge violet 🟣 si profil féminin (discret, optionnel selon les préférences)
- CTA : `Voir le profil` + `Contacter`

**Sidebar droite :**
- "Profils suggérés pour toi" (3 mini-cards)
- Mini dashboard parité : "35% de profils féminins cette semaine 📈"

---

### Page 5 — Détail Projet `/projects/:id`

**Objectif :** Page complète d'un projet pour décider de candidater.

**Sections :**
- Header : Nom du projet + badge secteur + date de publication
- Description complète du projet (vision, problème résolu, stade actuel)
- **Équipe actuelle** : Avatars des fondateurs avec leurs rôles
- **Compétences recherchées** : Cards des rôles manquants (ex: "Dev Backend", "Designer UX")
- Informations pratiques : Disponibilité requise, localisation, remote/présentiel
- Badges : Impact Féminin · Équipe Paritaire recherchée
- CTA principal : `Postuler à ce projet` (bouton vert large)
- CTA secondaire : `Envoyer un message`

---

### Page 6 — Détail Profil `/profiles/:id`

**Objectif :** Voir le profil complet d'un co-fondateur potentiel.

**Sections :**
- Header : Photo + Nom + École + Filière
- Bio courte
- **Compétences** : Tags colorés (techniques + soft skills)
- **Ce que je cherche** : Description libre
- **Disponibilité** : Badge (ex: "Soirs & weekends")
- Projets passés / en cours (si renseignés)
- CTA : `Contacter` + `Inviter sur mon projet`

---

### Page 7 — Messagerie `/messages`

**Objectif :** Prise de contact sécurisée entre étudiants.

**Layout :** Split view — liste des conversations à gauche, chat à droite (standard)

**Fonctionnalités (mock pour démo) :**
- Liste de conversations avec avatar + prénom + aperçu dernier message
- Zone de chat avec bulles de messages
- Champ de saisie + bouton envoyer
- Indicateur "Message de présentation" avec profil résumé de l'interlocuteur en haut

---

### Page 8 — Dashboard Impact & Parité `/impact`

**Objectif :** Rendre la parité visible. Créer une fierté collective. Point fort pour le jury hackathon.

**Sections :**
- Titre : "L'impact de Miaraka en chiffres" 
- **Stats principales (grandes cartes)** :
  - Étudiants inscrits : 847
  - Startups formées : 12
  - % profils féminins : 38%
  - % équipes mixtes : 44%
- **Graphique** : Évolution du % de profils féminins (ligne, sur 6 mois mock) — Recharts
- **Projets à Impact Féminin** : Liste des 3 derniers projets avec badge "Impact Féminin"
- **Top compétences apportées par les femmes** : Bar chart horizontal
- Citation : "Les femmes représentent 50% des talents. Miaraka leur donne une plateforme." — style blockquote élégant

---

### Page 9 — Mon Profil `/profile/me`

**Objectif :** Voir et modifier son profil.

**Sections :**
- Header éditable : Photo + Nom + Bio
- Compétences (édition par tags)
- Mon projet actuel (si fondateur)
- Paramètres de visibilité (toggles)
- Historique des collaborations (mock)

---

## 8. Composants Réutilisables

| Composant | Description |
|-----------|-------------|
| `<ProjectCard />` | Card projet pour le feed et la page Explorer |
| `<ProfileCard />` | Card co-fondateur pour le feed et la page Explorer |
| `<SkillTag />` | Badge tag compétence (coloré selon la catégorie) |
| `<FemaleBadge />` | Badge violet "Impact Féminin" ou "Profil Féminin" |
| `<ParityIndicator />` | Mini widget parité (pourcentage + barre de progression) |
| `<StepProgress />` | Barre de progression pour l'onboarding |
| `<SectorBadge />` | Badge secteur (HealthTech, EdTech, FinTech...) |
| `<Avatar />` | Avatar utilisateur avec fallback initiales |
| `<EmptyState />` | État vide générique (icon + message + CTA) |
| `<Navbar />` | Navigation principale (sidebar desktop, bottom bar mobile) |

---

## 9. Données Mock

Toutes les données sont statiques en JSON pour la démo. Inclure :

### mock/users.json
- 20 profils étudiants variés (10 femmes, 10 hommes)
- Écoles variées : Polytechnique, ISCAM, Faculté de Médecine, IAG, IST
- Compétences variées : Dev, Design, Finance, Marketing, Droit, Santé

### mock/projects.json
- 12 projets publiés
- Mix de secteurs : HealthTech, EdTech, AgriTech, FinTech
- Dont 4 avec badge "Impact Féminin"
- Stades variés : Idée, MVP, Lancement

### mock/messages.json
- 3-4 fils de conversation avec quelques messages chacun

### mock/stats.json
- Chiffres pour le dashboard parité
- Données historiques (6 points mensuels) pour les graphiques

---

## 10. Flows Utilisateur Clés (pour la démo)

### Flow 1 — Visiteur découvre la plateforme
`Landing Page` → scroll des sections → clic "Rejoindre" → `Signup` → `Onboarding` → `Feed`

### Flow 2 — Porteur d'idée trouve un co-fondateur
`Feed` → filtre "Co-fondateurs" → voir une `ProfileCard` → clic "Voir le profil" → clic "Contacter" → `Messagerie`

### Flow 3 — Étudiant cherche un projet
`Feed` → filtre "Projets" → voir une `ProjectCard` → clic "Voir le projet" → `Détail Projet` → clic "Postuler"

### Flow 4 — Jury vérifie l'inclusion féminine
`Feed` → sidebar droite mini-stats → clic "Impact & Parité" → `Dashboard Parité` (data viz complète)

---

## 11. Critères de Succès — Démo Hackathon

| Critère | Objectif |
|---------|----------|
| First impression | Le jury comprend le produit en < 10 secondes sur la landing |
| UX fluide | Navigation entre toutes les pages sans friction |
| Dimension féminine | Visible et structurelle (pas cosmétique) sur au moins 3 pages |
| Données réalistes | Les mock data sont crédibles (noms malgaches, vrais secteurs) |
| Effet waouh | Au moins 1 moment mémorable (dashboard parité, hero landing, onboarding) |
| Responsive | Fonctionne correctement sur laptop (priorité) et tablette |

---

## 12. Ce qui est Hors Scope (MVP Hackathon)

- Algorithme de matching réel (backend)
- Authentification réelle (base de données)
- Notifications push
- Upload de fichiers réel
- Mode hors-ligne
- Application mobile native
- Système de paiement (freemium)
- Réseau de mentores (backend)

---

## 13. Glossaire Produit

| Terme | Définition |
|-------|------------|
| CoFound.mg | Nom du produit |
| Co-fondateur | Étudiant cherchant à rejoindre ou co-créer une startup |
| Matching | Mise en relation basée sur la complémentarité des compétences |
| Impact Féminin | Label pour les projets ciblant des problèmes spécifiquement vécus par les femmes |
| Équipe Paritaire | Option activable pour prioriser les suggestions de profils féminins |
| Dashboard Parité | Page publique montrant les stats d'inclusion en temps réel |

---

*Document généré pour le Hackathon ITOVIA 2025-2026 — École Polytechnique de Madagascar*
*Stack : React + Tailwind CSS + Shadcn/UI — Données mock — Démo live*
