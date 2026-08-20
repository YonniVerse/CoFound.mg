# SPECS — CoFound.mg
## Spécifications des Pages Principales
**Pour agents de développement frontend**
Stack : React + Tailwind CSS + Shadcn/UI · Données mock · React Router v6

---

## Références Design System

```
Couleurs
  --primary        #16a34a   (vert-600)
  --primary-dark   #15803d   (vert-700)
  --primary-light  #dcfce7   (vert-100)
  --foreground     #0f172a   (slate-900)
  --muted          #64748b   (slate-500)
  --border         #e2e8f0   (slate-200)
  --background     #ffffff
  --surface        #f8fafc   (slate-50)
  --female         #a855f7   (purple-500)
  --female-light   #f3e8ff   (purple-100)

Typographie
  Display / H1     Sora 700-800   48–72px
  H2 / H3          Sora 600       24–36px
  Body             Inter 400      14–16px
  Label / Meta     Inter 500      12–13px

Tokens globaux
  Border radius    rounded-xl (12px) pour les cards
                   rounded-lg (8px) pour les inputs et boutons
  Shadow cards     shadow-sm (0 1px 3px rgba(0,0,0,0.06))
  Max width page   max-w-7xl mx-auto px-6
```

---

## Page 1 — Landing Page `/`

### Objectif
Page publique (guest). Expliquer CoFound.mg en moins de 10 secondes, convaincre, convertir en inscription. Zéro ambiguïté sur ce que fait le produit.

### Layout général
```
<Navbar guest />                   ← fixe en haut, hauteur 64px
<main>
  <SectionHero />
  <SectionHowItWorks />
  <SectionForWho />
  <SectionInclusion />
  <SectionTestimonials />
  <SectionCTA />
</main>
<Footer />
```

---

### Navbar (guest)
```
[ Logo CoFound.mg ]          [ Explorer  À propos  Impact ]    [ Se connecter ]  [ Rejoindre →]
```
- Logo : texte "CoFound" en Sora 700 + ".mg" en vert-600
- Liens centre : texte slate-600, hover vert-600, transition
- `Se connecter` : bouton ghost (outline slate)
- `Rejoindre →` : bouton vert plein, rounded-lg, avec flèche →
- Sur scroll > 60px : navbar prend un `backdrop-blur-sm bg-white/90 border-b border-slate-200`

---

### Section Hero

**Hauteur :** min-h-[calc(100vh-64px)]
**Layout :** 2 colonnes (col gauche 55% / col droite 45%) sur desktop, 1 colonne sur mobile

**Colonne gauche :**
```
Badge supérieur
  Pill arrondie, fond vert-100, texte vert-700, icône ✦
  Texte : "Hackathon ITOVIA 2025 · École Polytechnique Madagascar"

H1
  "Trouve ton
  co-fondateur.
  Lance ta startup."
  → Sora 800, 64px, slate-900, line-height 1.1
  → "co-fondateur." en vert-600

Sous-titre
  "CoFound.mg connecte les étudiants de formations différentes
  pour créer des équipes qui changent Madagascar."
  → Inter 400, 18px, slate-500, max-w-md

CTA row (gap-3, mt-8)
  [Rejoindre la plateforme →]   bouton vert plein, h-12, px-6, rounded-lg, Sora 600
  [Voir les projets]            bouton outline slate, h-12, px-6, rounded-lg

Social proof row (mt-10, flex gap-6)
  · 847 étudiants inscrits
  · 5 écoles partenaires
  · 12 startups lancées
  → chaque item : chiffre en Sora 700 slate-900 + label en Inter 400 slate-500
  → séparés par un | en slate-200
```

**Colonne droite :**
```
Stack de 3 ProfileCards superposées (mock visual, pas cliquables)
  Effet : légère rotation CSS (-rotate-2 / rotate-0 / rotate-2) + translate
  Card 1 (haut, légèrement en retrait) : Hery Andriamaro · Dev Full Stack · Polytechnique
  Card 2 (centre, au premier plan, shadow-lg) : Fara Rakoto · Business Strategy · ISCAM
  Card 3 (bas, légèrement en retrait) : Nivo Rasoa · UX Design · IAG
  → Ligne de connexion animée (SVG, trait vert pointillé qui "se dessine" en CSS)
  entre les 3 cards
```

**Arrière-plan hero :**
- Fond blanc
- Cercle décoratif subtil : `absolute top-20 right-0 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-60 pointer-events-none`

---

### Section How It Works

**Titre :** "Comment ça marche ?" — Sora 700, 36px, centré
**Sous-titre :** "Trois étapes. Pas plus." — Inter 400, slate-500, centré

**Layout :** 3 colonnes centrées, max-w-4xl, gap-8, mt-16

**Chaque étape :**
```
Numéro     "01" en Sora 800, 48px, vert-100 (très grand, en arrière-plan décoratif)
Icône      rounded-xl bg-vert-100 p-3, icône Lucide vert-600, 24px
Titre      Sora 600, 20px, slate-900
Texte      Inter 400, slate-500, 15px, max 2 lignes

Étape 1 : UserPlus   "Crée ton profil"
          "Décris tes compétences, ce que tu apportes, et ce que tu cherches."

Étape 2 : Search     "Explore ou publie"
          "Publie ton projet ou parcours les profils complémentaires au tien."

Étape 3 : Handshake  "Lance avec ton équipe"
          "Connecte-toi avec tes co-fondateurs et démarrez votre aventure."
```

**Connecteur entre étapes (desktop) :**
- Ligne pointillée horizontale en slate-200 entre chaque step
- `border-t-2 border-dashed border-slate-200`

---

### Section For Who

**Titre :** "Fait pour tous les profils" — Sora 700, 36px

**Layout :** Grid 5 colonnes sur desktop (scroll horizontal sur mobile)

**Chaque card profil :**
```
Fond : bg-surface (slate-50), border border-slate-200, rounded-xl, p-5
hover : shadow-md, border-vert-200, transition 200ms

Icône     emoji ou icône Lucide dans un cercle vert-100
Titre     "Étudiant en Informatique" — Sora 600, 15px
Apporte   Label "Ce qu'il apporte" (vert-600, 11px uppercase)
          tags compétences (SkillTag component, vert-100/vert-700)
Cherche   Label "Ce qu'il cherche" (slate-400, 11px uppercase)
          tags compétences (SkillTag, slate-100/slate-600)
```

**Les 5 profils :**
```
Informatique  → apporte : Dev, Architecture · cherche : Business, Marketing
Gestion       → apporte : Finance, Stratégie · cherche : Tech, Design
Médecine      → apporte : Expertise santé · cherche : Dev mobile, Data
Design        → apporte : UX/UI, Branding · cherche : Dev, Vision produit
Droit         → apporte : Juridique, Conformité · cherche : Tech, Gestion
```

---

### Section Inclusion Féminine

**Fond :** bg-gradient-to-br from-purple-50 to-green-50 (très subtil)
**Badge supérieur :** Pill "Impact social · Thème ITOVIA" en purple-100/purple-700

**Headline :**
```
"50% des talents.
Pleinement impliquées."
→ Sora 800, 48px
```

**Stat choc :**
```
Bloc centré, max-w-xl
"Moins de 20% des fondateurs de startups en Afrique sont des femmes.
CoFound.mg change ça structurellement."
→ Inter 400, slate-600, 17px
```

**3 mécanismes (layout 3 colonnes) :**
```
Chaque bloc : icône purple + titre Sora 600 + description Inter

🔒 Espace Sécurisé
   "Les étudiantes peuvent rendre leur profil visible uniquement
   aux femmes dans un premier temps, et candidater en mode anonyme."

🤝 Réseau de Mentores
   "Des entrepreneures malgaches établies sont accessibles aux
   équipes comptant au moins une femme fondatrice."

📊 Tableau de Bord Parité
   "La parité rendue visible en temps réel. Rendre visible crée
   une pression positive et une fierté collective."
```

**Argument clé (blockquote) :**
```
Ligne verticale vert-600 à gauche (border-l-4)
"Pas de quotas. On supprime les barrières invisibles."
→ Sora 600 italic, 20px, slate-700
```

---

### Section Testimonials

**Titre :** "Ils l'ont vécu" — Sora 700, 36px

**Layout :** 3 cards côte à côte, max-w-5xl

**Chaque card :**
```
bg-white, border border-slate-200, rounded-xl, p-6, shadow-sm

Quote icon  " (grand, vert-200, Sora 800, 48px, decoratif en haut à gauche)
Texte       Inter 400, slate-700, italic, 15px
            max 2-3 lignes

Avatar row  mt-4, flex items-center gap-3
  Avatar    w-10 h-10, rounded-full, initiales colorées
  Nom       Sora 600, 14px, slate-900
  École     Inter 400, 13px, slate-500
```

**3 témoignages mock :**
```
"J'avais l'idée, il me manquait le dev. Trouvé Hery en 2 jours. On a lancé
notre app agricole 3 mois après."
→ Fara Rakoto · ISCAM · Gestion

"En tant que développeur, je pensais que vendre c'était pas mon truc.
Mon co-fondateur trouvé sur CoFound m'a prouvé que ça marchait autrement."
→ Hery Andriamaro · Polytechnique · Informatique

"L'espace femmes m'a aidée à oser. J'ai rejoint un projet HealthTech
en candidatant anonymement. Maintenant je suis CTO."
→ Nivo Rasoa · IAG · Design
```

---

### Section CTA finale

**Fond :** bg-vert-600
**Layout :** centré, py-20

```
H2 : "Prêt à trouver ton équipe ?" — Sora 700, 40px, text-white
Sous-titre : "Rejoins 847 étudiants qui construisent l'avenir de Madagascar."
             → Inter 400, vert-100, 17px, mt-3
CTA : [Créer mon profil gratuitement →] — bouton blanc, texte vert-700, rounded-lg, h-12 px-8
      [Voir les projets] — bouton transparent, border-2 border-white, texte blanc, rounded-lg, h-12 px-8
```

---

### Footer

```
Layout : 4 colonnes sur desktop

Col 1 : Logo + tagline
  "CoFound.mg"
  "Ensemble, nous construisons l'Afrique de demain."
  Réseaux : icônes LinkedIn, Twitter, Instagram (Lucide)

Col 2 : Produit
  Explorer les projets
  Trouver un co-fondateur
  Publier mon projet
  Impact & Parité

Col 3 : Ressources
  À propos de Miaraka
  Comment ça marche
  Écoles partenaires
  FAQ

Col 4 : Légal
  Politique de confidentialité
  Conditions d'utilisation
  Contact

Barre bas : "© 2025 CoFound.mg — Hackathon ITOVIA · École Polytechnique Madagascar"
```

---

## Page 2 — Authentification `/signup` et `/login`

### Layout commun
```
Pleine page divisée en 2 colonnes 50/50 sur desktop
Colonne gauche : formulaire
Colonne droite : panneau décoratif (fond vert-600)
Sur mobile : colonne gauche uniquement (full width)
```

**Colonne droite (décoratif) :**
```
Fond vert-600
Centré verticalement
Logo grand (blanc)
Tagline "Ensemble." — Sora 800, 72px, text-white
3 stats en blanc empilées : 847 étudiants · 5 écoles · 12 startups
Témoignage court en bas : card blanc/10 arrondie avec quote + avatar
```

---

### Signup `/signup`

**Header formulaire :**
```
Logo CoFound.mg (petit, lien vers /)
H1 : "Rejoins CoFound.mg" — Sora 700, 28px
Sous-titre : "Crée ton compte et trouve ton équipe." — Inter 400, slate-500
Lien : "Déjà un compte ? Se connecter →"
```

**Formulaire :**
```
Row : Prénom [input]   Nom [input]   ← 2 colonnes
Email universitaire [input]
  helper : "Ton email d'école valide ton appartenance. Ex: prenom@polytechnique.mg"
École [Select / Combobox Shadcn]
  Options mock : Polytechnique, ISCAM, IAG, IST, Université d'Antananarivo, Autre
Filière [Select]
  Options : Informatique, Gestion, Design, Médecine, Droit, Agriculture, Autre
Mot de passe [input type=password] + icône œil toggle
Confirmer le mot de passe [input type=password]
Checkbox : "J'accepte les Conditions d'utilisation et la Politique de confidentialité"
           texte lié en vert-600

[Créer mon compte →]   bouton vert plein, w-full, h-11
```

**Post-submit (mock) :** `navigate('/onboarding')`

---

### Login `/login`

**Header formulaire :**
```
Logo CoFound.mg
H1 : "Bon retour !" — Sora 700, 28px
Lien : "Pas encore de compte ? S'inscrire →"
```

**Formulaire :**
```
Email [input]
Mot de passe [input password] + lien "Mot de passe oublié ?"
[Se connecter →]   bouton vert plein, w-full, h-11
```

**Post-submit (mock) :** `navigate('/feed')`

---

## Page 3 — Onboarding `/onboarding`

### Objectif
Compléter le profil en 3 étapes guidées après l'inscription. Doit se sentir rapide et engageant.

### Layout
```
Navbar minimale (logo + "Étape X/3" centré + lien "Passer pour l'instant" à droite)
Corps centré : max-w-2xl mx-auto, py-12, px-6
```

### Composant StepProgress
```
Barre horizontale en haut du corps
3 segments séparés par des points
Segment actif : bg-vert-600
Segment complété : bg-vert-400 avec checkmark
Segment futur : bg-slate-200
Labels sous chaque point : "Profil" / "Projet" / "Visibilité"
```

---

### Étape 1 — "Présente-toi"

```
H2 : "Présente-toi à la communauté" — Sora 700, 28px
Sous-titre : "Ces infos seront visibles sur ton profil public." — slate-500

Section photo :
  Cercle centré w-24 h-24, border-2 border-dashed border-slate-300
  Icône appareil photo au centre
  Clic → (mock) avatar généré avec initiales + fond vert-100
  Texte sous : "Ajouter une photo (optionnel)"

Bio :
  Textarea 3 lignes, placeholder "Décris-toi en quelques mots... ex: Étudiant en dev, passionné d'agritech"
  Compteur de caractères en bas à droite "0/140"

Compétences techniques :
  Label : "Tes compétences techniques" (Sora 600, 15px)
  Grille de tags cliquables (toggle selected/unselected)
  Sélectionné : bg-vert-600 text-white
  Non sélectionné : bg-slate-100 text-slate-600 hover:bg-vert-50
  Tags disponibles :
    React · Vue · Python · Node.js · Flutter · Java · Data Science
    Machine Learning · UX/UI Design · Figma · Finance · Marketing
    Comptabilité · Droit · Communication · Santé · Agriculture · Autre

Soft skills :
  Label : "Tes soft skills"
  Tags : Leadership · Communication · Créativité · Analytique
         Gestion de projet · Négociation · Empathie · Rigueur

[Continuer →]  bouton vert plein, w-full ou float right
```

---

### Étape 2 — "Ce que tu cherches"

```
H2 : "Quel est ton objectif ?" — Sora 700, 28px

Mode principal (3 cards radio-style) :
  Chaque option : border-2, rounded-xl, p-5, cursor-pointer
  Sélectionnée : border-vert-600 bg-vert-50
  Non sélectionnée : border-slate-200 hover:border-slate-300

  Card A : "💡 J'ai une idée de projet"
    "Je cherche des co-fondateurs complémentaires pour développer mon projet."
  Card B : "🎯 Je cherche un projet"
    "Je veux rejoindre un projet existant et apporter mes compétences."
  Card C : "🔄 Les deux"
    "Je suis ouvert à créer ou rejoindre selon les opportunités."

Si Card A ou C sélectionnée → section projet visible (slide-down animé) :
  Nom du projet [input]  placeholder "ex: FarmerConnect"
  Secteur [Select] : AgriTech · HealthTech · EdTech · FinTech · E-commerce · Social · Autre
  Description courte [textarea 2 lignes]
  Compétences recherchées (même grid de tags que étape 1)

Disponibilité :
  Label : "Ta disponibilité"
  3 chips radio : "Temps plein" · "Soirs & weekends" · "Flexible"

[ ← Retour ]   [ Continuer → ]
```

---

### Étape 3 — "Visibilité & Inclusion"

```
H2 : "Dernière étape" — Sora 700, 28px
Sous-titre : "Ces paramètres améliorent ton expérience et contribuent à la parité." — slate-500

Genre (optionnel) :
  Label : "Genre (optionnel)"
  Helper : "Cette information sert uniquement à nos statistiques de parité.
            Elle n'est jamais affichée publiquement."
  Chips radio : Homme · Femme · Non-binaire · Préfère ne pas répondre

Section conditionnelle si Femme sélectionnée :
  Card bg-purple-50 border border-purple-200 rounded-xl p-5
  Titre : "Options spéciales pour les femmes fondatrices" — Sora 600, 14px, purple-700

  Toggle 1 : "Profil visible d'abord aux femmes"
    Description : "Ton profil sera suggéré prioritairement aux femmes
                   avant d'être visible à tout le monde."

  Toggle 2 : "Candidature anonyme par défaut"
    Description : "Lors de ta première candidature à un projet, ton identité
                   n'est révélée qu'après accord mutuel."

Toggle général (tous les profils) :
  "Équipe paritaire" — "Prioriser les suggestions de profils féminins complémentaires"
  Icône : Users2 (Lucide) + description courte

Visibilité du profil :
  Label : "Qui peut voir mon profil ?"
  Radio : 🌍 Public (tout le monde)  /  🔗 Connexions seulement

[ ← Retour ]   [ Accéder à la plateforme ✓ ]  ← bouton vert plein
```

**Post-submit :** `navigate('/feed')` + toast "Bienvenue sur CoFound.mg ! 🎉"

---

## Page 4 — Feed `/feed`

### Objectif
Page principale post-login. Hub central. Découverte de projets et co-fondateurs dans un feed mixte.

### Layout desktop (3 colonnes)

```
+------------------+-------------------------+------------------+
|                  |                         |                  |
|  Sidebar gauche  |    Feed central         |  Sidebar droite  |
|  w-64 (fixe)     |    flex-1               |  w-72 (fixe)     |
|                  |                         |                  |
+------------------+-------------------------+------------------+
```

Sur mobile : sidebar gauche → bottom navigation bar · sidebar droite → masquée

---

### Sidebar gauche

```
Profil résumé en haut :
  Avatar w-10 h-10 + Prénom Nom (Sora 600, 14px) + École (slate-500, 12px)
  Lien "Voir mon profil →" vert-600, 12px

Navigation (liste) :
  Icône Lucide + Label + (badge compteur si applicable)

  🏠  Feed                     → /feed         [actif = bg-vert-50 text-vert-700 rounded-lg]
  🔍  Explorer Projets         → /projects
  👥  Explorer Co-fondateurs   → /profiles
  💬  Messages                 → /messages      [badge rouge "3" si non lus]
  📊  Impact & Parité          → /impact
  ─────────────────────────────
  👤  Mon Profil               → /profile/me
  ⚙️  Paramètres               → /settings

Style navigation :
  Chaque item : flex gap-3 items-center px-3 py-2 rounded-lg cursor-pointer
  Hover : bg-slate-100
  Actif : bg-vert-50 text-vert-700 font-medium
  Icône : 18px, stroke-width 1.5
```

---

### Zone feed centrale

**Header feed :**
```
H2 : "Bonjour, [Prénom] 👋" — Sora 700, 22px
Sous-titre : "[N] nouveaux profils depuis ta dernière visite" — Inter 400, slate-500, 14px
```

**Barre de filtres :**
```
Tabs Shadcn, style pills arrondis
[ Tous ]  [ Projets ]  [ Co-fondateurs ]  [ Pour moi ]
→ Tab actif : bg-vert-600 text-white
→ Tab inactif : bg-slate-100 text-slate-600 hover:bg-slate-200
→ "Pour moi" : small badge vert "IA" (suggère les matchs complémentaires mock)
```

**Feed de cards :**
```
Liste verticale, gap-4, max-w-2xl
Mix de ProjectCard et ProfileCard dans l'ordre du mock
```

---

### ProjectCard (composant)

```
Container : bg-white border border-slate-200 rounded-xl p-5 shadow-sm
             hover:shadow-md hover:border-vert-200 transition-all duration-200
             cursor-pointer → navigate('/projects/:id')

Row 1 (header) :
  Gauche : Avatar fondateur w-9 h-9 rounded-full + initiales bg-vert-100
           Nom fondateur (Sora 600, 13px) + École (slate-500, 12px)
  Droite : SectorBadge (ex: "🌾 AgriTech") bg-vert-100 text-vert-700 rounded-full px-3 py-1 text-12

  Si badge Impact Féminin :
    FemaleBadge : bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-12 "♀ Impact Féminin"
    → affiché à droite du SectorBadge

Row 2 (titre + description) :
  H3 : Nom du projet — Sora 700, 17px, slate-900, mt-3
  Description : Inter 400, slate-600, 14px, line-clamp-2, mt-1

Row 3 (compétences recherchées) :
  Label : "Recherche :" — Inter 500, slate-400, 12px
  Tags SkillTag : bg-slate-100 text-slate-700 rounded-md px-2 py-0.5 text-12 gap-1.5
  Max 4 tags affichés + "+N autres" si plus

Row 4 (footer) :
  Gauche : "Publié il y a 2 jours · 3 candidatures" — Inter 400, slate-400, 12px
  Droite :
    [Voir le projet]           bouton outline slate, h-8, px-3, text-13
    [Exprimer mon intérêt →]   bouton vert plein, h-8, px-3, text-13
```

---

### ProfileCard (composant)

```
Container : même style que ProjectCard

Row 1 (header) :
  Avatar w-10 h-10 + initiales bg coloré selon filière
  Nom (Sora 600, 15px) + École + Filière (slate-500, 13px)
  Droite : si profil féminin opt-in → FemaleBadge discret (juste icône ♀ en purple-400)

Row 2 (ce qu'il apporte) :
  Label : "Apporte :" — Inter 500, vert-600, 12px uppercase
  Tags SkillTag vert : bg-vert-100 text-vert-700, max 3 tags

Row 3 (ce qu'il cherche) :
  Label : "Cherche :" — Inter 500, slate-400, 12px uppercase
  Tags SkillTag slate, max 3 tags

Row 4 (bio courte) :
  1 ligne, Inter 400 italic, slate-500, 13px, line-clamp-1

Row 5 (footer) :
  Gauche : Disponibilité badge : "🟢 Flexible" bg-vert-50 text-vert-600 rounded-full px-2 text-12
  Droite :
    [Voir le profil]   bouton outline
    [Contacter]        bouton vert plein
```

---

### Sidebar droite

```
Section "Profils suggérés pour toi"
  Titre : "Complémentaires à ton profil" — Sora 600, 14px, slate-700
  3 mini-ProfileCards compactes (juste avatar + nom + 2 tags + bouton "Contacter")

Divider

Section ParityIndicator
  Titre : "Impact cette semaine" — Sora 600, 14px
  Stat vert : "38% de profils féminins 📈"
  Barre de progression : bg-vert-100, fill bg-vert-500, h-2 rounded-full
  Sous-stat : "Objectif : 50%"
  Lien : "Voir le tableau de bord →" vert-600, 12px → /impact

Divider

Section "Projets récents"
  3 lignes simples : point vert + nom projet + secteur badge
  → cliquables vers /projects/:id
```

---

## Page 5 — Détail Projet `/projects/:id`

### Layout
```
Navbar authentifiée (logo + nav links + avatar user)
Breadcrumb : "Feed > Explorer Projets > [Nom du projet]" — slate-400, 13px
Corps : max-w-4xl mx-auto, py-8, px-6
  Colonne principale (65%)   |   Sidebar (35%)
```

---

### Colonne principale

**Header projet :**
```
Row : SectorBadge + FemaleBadge (si applicable) + "Publié il y a 3 jours"

H1 : Nom du projet — Sora 800, 36px, slate-900

Description longue : Inter 400, slate-700, 16px, leading-7

Tags thématiques : 3-5 SkillTags vert
```

**Section "Le problème résolu" :**
```
Border-l-4 border-vert-500 pl-4
Texte en italique, slate-600
```

**Section "Équipe actuelle" :**
```
H3 : "L'équipe actuelle" — Sora 600, 18px, mt-8

Row de cards fondateurs :
  Chaque fondateur : flex gap-3 items-center
  Avatar w-12 h-12 rounded-full
  Nom (Sora 600, 14px) + École (slate-500, 12px) + Rôle badge vert

  Puis : "— recherche un [Rôle manquant]" → fléché en pointillé vers une card vide
  Card manquante : border-2 border-dashed border-slate-300, bg-slate-50, rounded-xl
                   Icône UserPlus centré, texte "Rôle recherché" en slate-400
```

**Section "Compétences recherchées" :**
```
H3 : "Ce qu'ils cherchent" — Sora 600, 18px, mt-8

Grid 2 colonnes de RoleCards :
  Chaque RoleCard : bg-surface border border-slate-200 rounded-xl p-4
    Titre du rôle : "Développeur Frontend React" — Sora 600, 15px
    Compétences précises : tags SkillTag
    Disponibilité requise : badge
```

**Section informations pratiques :**
```
Grid 3 colonnes (icône + label + valeur) :
  📍 Localisation : Antananarivo / Remote
  ⏱️ Disponibilité : Soirs & weekends
  🚀 Stade : Idée validée / MVP en cours / Lancement
  📅 Créé le : [date mock]
```

---

### Sidebar projet

```
Card bg-white border rounded-xl p-5 shadow-sm (sticky top-24)

Fondateur principal :
  Avatar large w-16 h-16 + Nom (Sora 600, 17px) + École + Filière

Séparateur

Boutons d'action :
  [Postuler à ce projet →]   bouton vert plein, w-full, h-11, Sora 600
  [Envoyer un message]       bouton outline slate, w-full, h-11, mt-2

Note de confiance :
  Icône Shield vert + "École vérifiée" — slate-500, 12px

Partager :
  Icône Share + "Partager ce projet" — lien slate-500, 12px
```

---

## Page 6 — Détail Profil `/profiles/:id`

### Layout
```
max-w-3xl mx-auto, py-8, px-6
Header profil large en haut (full width)
Puis 2 colonnes : contenu principal 65% / sidebar 35%
```

### Header profil
```
Fond : bg-gradient-to-r from-vert-50 to-slate-50, rounded-2xl, p-8

Row :
  Avatar large w-20 h-20 rounded-full + initiales
  Info bloc :
    Nom — Sora 800, 28px
    École + Filière — Inter 400, slate-500, 16px
    Disponibilité badge + Localisation badge
  FemaleBadge si applicable (discret, top-right)

Bio : Inter 400, slate-600, 16px, mt-4, max-w-xl
```

### Contenu principal

**Compétences techniques :**
```
H3 : "Ce qu'il apporte" — Sora 600, 18px
Tags SkillTag vert, taille normale, flexwrap
```

**Soft skills :**
```
H3 : "Soft skills" — Sora 600, 18px, mt-6
Tags SkillTag slate
```

**Ce qu'il cherche :**
```
H3 : "Ce qu'il cherche" — Sora 600, 18px, mt-6
Border-l-4 border-vert-400 pl-4
Texte Inter 400, slate-600
```

**Projet actuel (si fondateur) :**
```
H3 : "Son projet" — Sora 600, 18px, mt-6
ProjectCard compacte (version mini sans les boutons d'action interne)
```

### Sidebar profil
```
Card sticky top-24, bg-white border rounded-xl p-5

Boutons :
  [Contacter]                bouton vert plein, w-full, h-11
  [Inviter sur mon projet]   bouton outline, w-full, h-11, mt-2

Infos complémentaires :
  École vérifiée ✓ — vert-600, 13px
  Membre depuis : [date mock] — slate-400, 12px

Profils similaires (3 mini links avatar + nom)
```

---

## Page 7 — Messagerie `/messages`

### Layout split view (desktop)
```
+---------------------------+--------------------------------+
|  Liste conversations      |  Zone de chat                  |
|  w-80 (fixe, scrollable)  |  flex-1                        |
+---------------------------+--------------------------------+
```

Sur mobile : liste d'abord → tap sur conversation → vue chat full width avec bouton retour

---

### Panneau gauche — Liste conversations

```
Header :
  H2 "Messages" — Sora 700, 20px
  Icône Edit (nouveau message)

Search bar :
  Input "Rechercher une conversation..." bg-slate-100, rounded-lg, h-9

Liste conversation items :
  Chaque item : flex gap-3 p-3 rounded-xl cursor-pointer
  hover : bg-slate-50
  Actif : bg-vert-50 border-l-2 border-vert-500

  Gauche : Avatar w-11 h-11 + point vert si en ligne
  Droite :
    Row 1 : Nom (Sora 600, 14px) + Heure (slate-400, 12px, ml-auto)
    Row 2 : Aperçu dernier message (Inter 400, slate-500, 13px, truncate)
             Si non lu : texte en slate-800 bold + badge rond vert avec compteur
```

**Conversations mock :**
```
1. Hery Andriamaro  (Polytechnique · Dev)
   "Super idée ! Quand est-ce qu'on peut..."   [non lu · 2]
   Il y a 10 min

2. Fara Rakoto  (ISCAM · Gestion)
   "J'ai regardé ton projet AgriConnect, ça..."   il y a 2h

3. Nivo Rasoa  (IAG · Design)
   "Voici les premiers wireframes que..."   il y a 1j
```

---

### Panneau droit — Zone de chat

```
Header chat :
  Avatar + Nom + École (Sora 600, 15px / slate-500, 13px)
  Badges : SectorBadge de son projet + Disponibilité
  Icône User → lien vers /profiles/:id

Profil résumé interlocuteur (band discret sous le header) :
  bg-slate-50 border-b px-4 py-2
  "Hery · Polytechnique · Dev Full Stack · Cherche : Business, Marketing"
  Tags compétences compacts

Zone messages (scrollable) :
  Messages reçus : bulle gauche, bg-slate-100, rounded-2xl rounded-tl-sm, px-4 py-2
  Messages envoyés : bulle droite, bg-vert-600 text-white, rounded-2xl rounded-tr-sm, px-4 py-2
  Timestamp sous chaque message : Inter 400, slate-400/white-60, 11px
  Séparateur de date : "Aujourd'hui" centré, slate-300, 12px

Messages mock (conversation 1 - Hery) :
  Hery 14:22 : "Salut ! J'ai vu ton projet FarmerConnect sur CoFound.mg.
                Le concept m'intéresse vraiment."
  Moi  14:35 : "Salut Hery ! Merci. T'as un background en quoi exactement ?"
  Hery 14:40 : "Full stack React/Node. Et toi tu cherches quoi comme profil tech ?"
  Moi  14:42 : "Exactement ça ! Tu serais dispo pour un appel cette semaine ?"
  Hery 14:43 : "Super idée ! Quand est-ce qu'on peut..."   ← [non lu]

Input zone (fixed bottom) :
  bg-white border-t border-slate-200 px-4 py-3
  Input texte : bg-slate-100 rounded-full px-4 py-2 flex-1 text-14
  Bouton envoyer : icône Send, bg-vert-600, rounded-full w-9 h-9
                   disabled + grisé si input vide
```

---

## Page 8 — Impact & Parité `/impact`

### Objectif
Page publique (visible sans login). Rend la parité visible. Point fort pour le jury hackathon.

### Layout
```
Navbar (guest ou authentifiée selon état)
Hero section
Stats principales
Graphique évolution
Projets à impact féminin
Top compétences par genre
CTA
```

---

### Hero section

```
Fond bg-gradient-to-br from-vert-900 to-vert-700
py-20, text-white, centré

Badge : "📊 Données en temps réel" — pill blanc/10, texte blanc, 13px

H1 : "L'impact de CoFound.mg" — Sora 800, 52px, white
Sous-titre : "La parité en entrepreneuriat étudiant, rendue visible."
             Inter 400, vert-100, 18px, mt-3
```

---

### Section Stats principales

```
Grid 4 colonnes, max-w-5xl, mx-auto, mt-[-40px] (chevauchement hero)
Chaque StatCard :
  bg-white rounded-2xl shadow-lg p-6 text-center

  Valeur : Sora 800, 44px, slate-900
  Label : Inter 500, slate-500, 14px, mt-1
  Tendance : "↑ +12% ce mois" — vert-600, 12px

Stats mock :
  847     Étudiants inscrits        ↑ +12% ce mois
  38%     Profils féminins          ↑ +5pts ce mois
  44%     Équipes mixtes formées    ↑ +8pts ce mois
  12      Startups effectivement lancées
```

---

### Section Graphique Évolution

```
H2 : "Évolution de la parité" — Sora 700, 28px
Sous-titre : "6 derniers mois"

Graphique LineChart (Recharts) :
  Axe X : Jan · Fév · Mar · Avr · Mai · Juin
  Axe Y : 0% → 60%
  Ligne 1 : % profils féminins — couleur purple-500 — data [18, 22, 27, 31, 35, 38]
  Ligne 2 : % équipes mixtes — couleur vert-500 — data [12, 18, 25, 32, 39, 44]
  Ligne objectif : pointillé slate-300 à 50%
  Tooltip custom : bg-white shadow-lg rounded-lg border px-3 py-2

Légende :
  ● Profils féminins (purple)
  ● Équipes mixtes (vert)
  - - Objectif 50% (slate)
```

---

### Section Projets à Impact Féminin

```
H2 : "Projets à Impact Féminin" — Sora 700, 28px
Sous-titre : "Ces projets s'attaquent à des problèmes spécifiquement vécus par les femmes."

Grid 3 colonnes de ProjectCards variante compacte
  Badge ♀ Impact Féminin en purple visible
  Projets mock :
    - MamaHealth : Suivi grossesse digital pour zones rurales
    - EduFille : Accès à l'éducation numérique pour les filles
    - SafeWay : Sécurité et mobilité urbaine féminine
```

---

### Section Top Compétences

```
H2 : "Compétences apportées par les femmes" — Sora 700, 28px

BarChart horizontal (Recharts) :
  max-w-2xl mx-auto
  Barres purple-400
  Labels à gauche, valeurs à droite

Data mock :
  Design UX/UI          ████████████ 78 profils
  Marketing             ██████████   65 profils
  Gestion / Finance     ████████     52 profils
  Communication         ███████      48 profils
  Droit                 █████        34 profils
  Médecine              ████         29 profils
```

---

### CTA final

```
bg-vert-600 rounded-2xl, max-w-3xl mx-auto, px-8 py-12, text-center, mt-16

H2 : "Tu représentes 50% du potentiel." — Sora 700, 32px, white
Texte : "Rejoins CoFound.mg et fais partie du changement."
CTA : [Créer mon profil →] bouton blanc text-vert-700
```

---

## Page 9 — Mon Profil `/profile/me`

### Layout
```
max-w-3xl mx-auto, py-8, px-6
```

### Header éditable
```
Fond : bg-vert-50 rounded-2xl p-8
  Avatar large (cliquable pour modifier)
  Nom (Sora 700, 28px) + bouton crayon à côté
  École + Filière
  Badges : Disponibilité · Localisation · Membre depuis
  Bouton : [Modifier mon profil] — outline vert, float right
```

### Sections du profil

**Mes compétences** : même display que /profiles/:id + bouton "Modifier"

**Mon projet** (si fondateur) :
```
ProjectCard version "owner" :
  Même card avec en plus :
    Barre de progression "Équipe complète" : 2/4 membres
    Bouton [Gérer mon projet →] vert plein
```

**Mes candidatures envoyées** :
```
Liste de 3 items :
  Nom projet + statut badge : "En attente" (slate) / "Accepté ✓" (vert) / "Refusé" (red)
```

**Paramètres de visibilité** :
```
Liste de toggles Shadcn Switch :
  Profil public (actif)
  Profil visible aux femmes en premier (si applicable)
  Candidature anonyme par défaut
  Recevoir des suggestions de matching

Chaque toggle : label Sora 600 14px + description Inter 400 slate-500 12px
```

---

## Composants Partagés — Référence Rapide

### SkillTag
```jsx
// Props : label, variant = 'green' | 'slate' | 'purple', size = 'sm' | 'md'
// green : bg-vert-100 text-vert-700
// slate : bg-slate-100 text-slate-600
// purple : bg-purple-100 text-purple-700
// rounded-md px-2 py-0.5 text-xs font-medium
```

### FemaleBadge
```jsx
// Props : variant = 'project' | 'profile'
// project : "♀ Impact Féminin" bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-12
// profile : "♀" icône seule, text-purple-400, 14px (discret)
```

### SectorBadge
```jsx
// Props : sector (string)
// bg-vert-100 text-vert-700 rounded-full px-3 py-1 text-12
// Emoji préfixe selon secteur : 🌾 AgriTech · 🏥 HealthTech · 📚 EdTech · 💰 FinTech
```

### Avatar
```jsx
// Props : name, size = 'sm'|'md'|'lg', src (optional)
// Si src : afficher l'image
// Sinon : initiales (2 premières lettres) sur fond coloré
// Couleur de fond : hashée depuis le nom (toujours la même couleur pour la même personne)
// Tailles : sm=w-8 h-8 · md=w-10 h-10 · lg=w-16 h-16
```

### EmptyState
```jsx
// Props : icon, title, description, ctaLabel, ctaHref
// Centré, icône Lucide 40px text-slate-300, titre Sora 600, description slate-400
// Bouton CTA vert si ctaLabel fourni
```

---

*SPECS CoFound.mg v1.0 — Hackathon ITOVIA 2025-2026*
*Document destiné aux agents de développement frontend*
*Stack : React + Tailwind CSS + Shadcn/UI — Mock data — Démo live*
