export interface ProjectTeamMember {
  name: string;
  role: string;
  school: string;
  avatar: string | null;
}

export interface ProjectSeeking {
  role: string;
  desc: string;
}

export interface ProjectDetail {
  id: string;
  title: string;
  sector: "HealthTech" | "EdTech" | "FinTech" | "AgriTech" | "E-commerce" | "Autre";
  isFemaleImpact: boolean;
  date: string;
  status: string;
  availability: string;
  problem: string;
  solution: string;
  team: ProjectTeamMember[];
  seeking: ProjectSeeking[];
  skills: string[];
}

export const MOCK_PROJECT_DETAIL: ProjectDetail = {
  id: "p1",
  title: "EcoDrive - Mobilité verte universitaire",
  sector: "EdTech",
  isFemaleImpact: false,
  date: "Publié il y a 2 heures",
  status: "Idéation & MVP en cours",
  availability: "Flexible / Soirs & Weekends",
  problem: "Les étudiants malgaches perdent énormément de temps et d'argent dans les transports en commun saturés ou les taxis-be pour rejoindre les campus éloignés (ex: Vontovorona). L'empreinte carbone est élevée et le confort d'étude est impacté par la fatigue du trajet.",
  solution: "EcoDrive est une application mobile de covoiturage exclusivement réservée aux étudiants et professeurs avec vérification d'identité (carte étudiante). Elle permet de partager les frais de carburant et de créer un réseau d'entraide sécurisé sur les trajets universitaires.",
  team: [
    { name: "Rina Andria", role: "CEO & Fondatrice", school: "Polytechnique", avatar: null },
    { name: "Marc T.", role: "Lead Développeur", school: "MISA", avatar: null }
  ],
  seeking: [
    { role: "Développeur React Native", desc: "Pour créer la V1 de l'application mobile (iOS/Android)." },
    { role: "Responsable Marketing", desc: "Pour la stratégie de lancement sur les campus et l'acquisition d'utilisateurs." }
  ],
  skills: ["Dev React Native", "Marketing", "UI Design"]
};