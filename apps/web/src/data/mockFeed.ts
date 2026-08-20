import type { ProjectData } from "@/components/feed/ProjectCard";
import type { ProfileData } from "@/components/feed/ProfileCard";

export const MOCK_PROJECTS: ProjectData[] = [
  {
    id: "p1",
    title: "EcoDrive - Mobilité verte universitaire",
    description: "Application de covoiturage exclusive aux étudiants pour réduire les coûts et l'empreinte carbone des trajets domicile-campus.",
    sector: "EdTech",
    author: { name: "Rina Andria", school: "Polytechnique", avatar: null },
    seekingSkills: ["Dev React Native", "Marketing", "UI Design"],
    isFemaleImpact: false,
    timeAgo: "Il y a 2 heures",
    applicantsCount: 3
  },
  {
    id: "p2",
    title: "SafeWalk - L'app de sécurité étudiante",
    description: "Une plateforme d'accompagnement sécurisé et de signalement pour les étudiantes rentrant tard des campus.",
    sector: "HealthTech",
    author: { name: "Sarah Rakoto", school: "Faculté de Médecine", avatar: null },
    seekingSkills: ["Développeur Backend", "Droit"],
    isFemaleImpact: true,
    timeAgo: "Hier",
    applicantsCount: 5
  },
  {
    id: "p3",
    title: "AgriPredict Mada",
    description: "Modèles de machine learning pour prédire les rendements agricoles selon les micro-climats.",
    sector: "AgriTech",
    author: { name: "Hery Tiana", school: "MISA", avatar: null },
    seekingSkills: ["Agronome", "Vente", "Finance"],
    isFemaleImpact: false,
    timeAgo: "Il y a 3 jours",
    applicantsCount: 1
  }
];

export const MOCK_PROFILES: ProfileData[] = [
  {
    id: "u1",
    name: "Jessica R.",
    school: "ISCAM",
    field: "Marketing Digital",
    avatar: null,
    bio: "Passionnée par la tech for good. Je cherche un projet innovant pour gérer toute la stratégie d'acquisition.",
    skills: ["Marketing", "Growth Hacking", "Communication"],
    seeking: "Projet HealthTech ou EdTech (MVP existant)",
    isFemale: true
  },
  {
    id: "u2",
    name: "Michael F.",
    school: "Polytechnique",
    field: "Génie Logiciel",
    avatar: null,
    bio: "Dev fullstack (React / Node). J'ai quelques idées mais je préfère rejoindre une équipe avec un profil business fort.",
    skills: ["React", "Node.js", "Architecture"],
    seeking: "Équipe solide avec CEO/Sales",
    isFemale: false
  }
];

export const SUGGESTED_PROFILES = [
  { name: "Aina M.", role: "UI/UX Designer", school: "IAG" },
  { name: "Tahina N.", role: "Finance", school: "INSCAE" },
  { name: "Kanto R.", role: "Droit des Affaires", school: "Univ. Ankatso" },
];
