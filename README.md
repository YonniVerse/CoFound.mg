# CoFound.mg 🚀

> Plateforme SaaS de matching de co-fondateurs étudiants à Madagascar, avec un focus fort sur la parité et la mixité d'équipe. Projet développé dans le cadre du Hackathon CoFound.mg.

---

## Présentation du Projet

**CoFound.mg** est une application web conçue pour dynamiser l'entrepreneuriat étudiant à Madagascar. Le concept repose sur une idée clé : **les contraires s'attirent**. L'algorithme connecte la rigueur technique des développeurs (Tech) avec la vision commerciale des profils business (Marketing, Finance, Gestion).

La force unique de cette version MVP est son **moteur d'inclusion féminine**, conçu pour adresser le fossé des genres dans la tech malgache en offrant un espace sécurisé et une visibilité valorisée pour les étudiantes fondatrices.

---

## Stack Technique

* **Framework Core** : React 18, TypeScript, Vite
* **Styling & UI Components** : Tailwind CSS, Shadcn UI, Lucide React (pour les icônes)
* **Data Visualization** : Recharts (intégré de façon native via le composant `Chart` de Shadcn)
* **Routing** : React Router DOM V6

---

## Structure du Projet

L'architecture suit les meilleures pratiques modernes d'organisation React / Vite :

```bash
frontend/
├── docs/                     # Spécifications fonctionnelles (PRD_CoFound_mg.md)
├── src/
│   ├── assets/               # Ressources statiques (images, polices)
│   ├── components/
│   │   ├── feed/             # Cartes du Feed (ProjectCard, ProfileCard)
│   │   ├── landing/          # Sections modulaires de la Landing Page
│   │   ├── layout/           # Layouts d'application (MainLayout, DashboardLayout, Navbar, Footer)
│   │   ├── shared/           # Éléments partagés (Avatar, Badges, SkillTags)
│   │   └── ui/               # Composants atomiques Shadcn UI (Dialog, Button, Progress, Inputs)
│   ├── lib/                  # Utilitaires globaux (ex: cn pour tailwind merge)
│   ├── pages/                # Écrans principaux (Landing, Signup, Onboarding, Feed, Details, Impact, ComingSoon)
│   ├── App.tsx               # Orchestrateur de routes (React Router)
│   ├── main.tsx              # Point d'entrée de l'application
│   └── index.css             # Définition des variables de thème et styles globaux
```

---

## Système de Design & Tokens CSS

Nous utilisons une palette sémantique stricte définie dans `src/index.css` via des variables CSS. **Ne surchargez pas les couleurs brutes dans vos classes Tailwind.** Utilisez les variables de thème :

* **Primary (`--primary` - Indigo)** : Représente la rigueur technique, le code, l'EdTech et l'ingénierie.
* **Secondary (`--secondary` - Orange)** : Représente l'esprit business, le marketing, la finance et le dynamisme.
* **Female/Parity (`--female` - Violet/Rose)** : Représente notre charte d'inclusion féminine, la parité et les badges d'impact.

---

## Installation et Démarrage local

Pour lancer le projet sur votre machine de développement :

### 1. Prérequis
Assurez-vous d'avoir [Node.js](https://nodejs.org/) (v18 ou supérieur) installé sur votre système.

### 2. Cloner et installer les dépendances
```bash
# Accéder au dossier du frontend
cd frontend

# Installer les dépendances
npm install
```

### 3. Lancer en mode développement
```bash
npm run dev
```
L'application sera accessible par défaut à l'adresse [http://localhost:5173/](http://localhost:5173/).

### 4. Build de Production (Vérification TypeScript)
Avant de pousser vos modifications, assurez-vous que le projet compile sans erreurs :
```bash
npm run build
```

---

## Guide d'Implémentation du MVP (6 Pages clés)

Voici un aperçu des parcours et fonctionnalités déjà déployés pour notre démonstration de Hackathon :

### 1. Landing Page (`/`)
* Design immersif avec un Hero texturé.
* Intégration de la section **Méthode**, **Testimonials** (carousel interactif), **Inclusion** (présentation de l'Espace Sécurisé) et un **Footer premium** avec animation au survol.

### 2. Page d'Inscription (`/signup`)
* Flux moderne *Split Screen*.
* Formulaire d'inscription avec sélection des universités malgaches phares (ISCAM, INSCAE, MISA, Polytechnique...).
* Bouton d'évitement rapide "Retour à l'accueil" pour fluidifier l'UX.

### 3. Parcours d'Onboarding Gamifié (`/onboarding`)
* Formulaire en 3 étapes avec barre de progression interactive.
* **Logique d'impact féminin** : Si l'utilisateur sélectionne le genre "Femme" à l'étape 1, l'option conditionnelle **"Espace Sécurisé"** apparaît immédiatement en violet pour lui permettre de restreindre sa visibilité ou d'activer le bonus de matching paritaire.

### 4. Le Feed Applicatif (`/feed`)
* Barre de filtres (Tous, Projets, Co-fondateurs) avec effet de flou dynamique (`backdrop-blur`).
* Rendu de listes dynamiques via `<ProjectCard />` et `<ProfileCard />`.
* **Sidebar droite contextuelle** : Contient un mini-widget d'impact de parité (jauge dynamique violette) et des suggestions rapides d'amis.

### 5. Page Détail d'un Projet (`/projects/:id`)
* Rendu complet des arguments fondateurs ("Le Problème", "La Solution", "Compétences recherchées").
* **Sidebar Pinned** : Sidebar de droite intelligente (`sticky top-[100px] h-fit`) qui reste visible au défilement.
* **Candidature direct via Dialog** : Le bouton de candidature ouvre une modale superposée (Shadcn UI `Dialog`) permettant de taper son pitch d'intérêt avec état de chargement simulé (simulation réseau).

### 6. Dashboard d'Impact & Parité (`/impact`)
* Véritable outil d'analyse à l'usage du jury.
* **Data-Viz** : Graphique de surface (`AreaChart` de Recharts) montrant la croissance des inscriptions par genre.
* **Leaderboard** : Classement ludique des écoles avec le meilleur taux d'étudiantes impliquées pour créer de l'émulation positive.

### 7. Gestion de l'inachevé (`ComingSoonPage`)
* Toutes les routes non essentielles au pitch du Hackathon (ex: `/messages`, `/settings`, `/profile/me`) sont redirigées vers une page **"Bientôt disponible"** très soignée avec une icône animée, évitant ainsi les erreurs 404 lors des démonstrations.

---

## Déploiement Vercel
Le fichier `frontend/vercel.json` is configuré avec un rewrite universel (`source: /(.*)`) pour permettre aux routes internes du React Router de fonctionner parfaitement après le build sans générer d'erreurs 404 lors des rafraîchissements de page en production.

---

## Guide de Contribution & Git Workflow

Pour maintenir le projet propre, stable et éviter les conflits de code, veuillez respecter le flux de travail Git suivant lorsque vous ajoutez des fonctionnalités ou corrigez des bugs :

### 1. Règle d'or ⚠️
**Ne travaillez JAMAIS directement sur la branche `main` !** La branche `main` doit toujours rester stable, testée et prête à être déployée.

### 2. Flux de travail recommandé

```bash
# 1. Revenez sur main et récupérez le dernier code à jour
git checkout main
git pull origin main

# 2. Créez une nouvelle branche pour votre fonctionnalité
# Utilisez un nom clair : feature/nom-de-la-feature ou bugfix/nom-du-bug
git checkout -b feature/nom-de-votre-feature

# 3. Codez vos modifications...

# 4. Avant de faire un commit, vérifiez que le build passe localement
cd frontend
npm run build

# 5. Ajoutez et validez vos fichiers modifiés (commits propres)
git add .
git commit -m "feat: description claire de ce que fait la fonctionnalité"

# 6. Poussez votre branche sur le dépôt distant
git push origin feature/nom-de-votre-feature
```

### 3. Pull Requests (PR)
Une fois votre branche poussée, ouvrez une Pull Request sur votre plateforme de gestion de code (GitHub, GitLab, etc.) vers la branche `main`. 
* Demandez à au moins un collègue de relire votre code.
* Assurez-vous que les tests et builds automatiques de votre CI/CD passent au vert avant de valider la fusion (Merge).

