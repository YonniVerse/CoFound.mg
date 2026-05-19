import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectCard } from "@/components/feed/ProjectCard";
import type { ProjectData } from "@/components/feed/ProjectCard";
import { ProfileCard } from "@/components/feed/ProfileCard";
import type { ProfileData } from "@/components/feed/ProfileCard";
import { Avatar } from "@/components/shared/Avatar";

// --- MOCK DATA ---
const MOCK_PROJECTS: ProjectData[] = [
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

const MOCK_PROFILES: ProfileData[] = [
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

const SUGGESTED_PROFILES = [
  { name: "Aina M.", role: "UI/UX Designer", school: "IAG" },
  { name: "Tahina N.", role: "Finance", school: "INSCAE" },
  { name: "Kanto R.", role: "Droit des Affaires", school: "Univ. Ankatso" },
];

export default function FeedPage() {
  const [filter, setFilter] = useState<"all" | "projects" | "profiles">("all");

  const feedItems = [
    ...MOCK_PROJECTS.map(p => ({ type: "project" as const, data: p, date: p.timeAgo })),
    ...MOCK_PROFILES.map(p => ({ type: "profile" as const, data: p, date: "Nouveau" }))
  ];
  // Simple mélange pour la démo
  const sortedItems = feedItems.sort((a, b) => a.data.id.localeCompare(b.data.id));

  const filteredItems = sortedItems.filter(item => {
    if (filter === "all") return true;
    if (filter === "projects") return item.type === "project";
    if (filter === "profiles") return item.type === "profile";
    return true;
  });

  return (
    <DashboardLayout>
      {/* Barre de filtres (Sticky) */}
      <div className="bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b border-border pt-4 px-6 sm:px-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setFilter("all")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${filter === "all" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Tous
          </button>
          <button 
            onClick={() => setFilter("projects")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${filter === "projects" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Projets
          </button>
          <button 
            onClick={() => setFilter("profiles")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${filter === "profiles" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Co-fondateurs
          </button>
        </div>
      </div>

      <div className="flex px-6 sm:px-10 py-8 gap-10 max-w-[1400px]">
        {/* Colonne Principale : Le Feed */}
        <div className="flex-1 max-w-3xl flex flex-col gap-6">
          {filteredItems.map((item, index) => (
            <div key={`${item.type}-${index}`} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              {item.type === "project" 
                ? <ProjectCard project={item.data as ProjectData} />
                : <ProfileCard profile={item.data as ProfileData} />
              }
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-20 text-muted-foreground font-medium">
              Aucun résultat trouvé.
            </div>
          )}
        </div>

        {/* Sidebar Droite : Suggestions & Stats (Masquée sur mobile et tablette) */}
        <div className="hidden xl:flex w-[320px] flex-col gap-6 sticky top-[100px] h-fit">
          
          {/* Widget Parité */}
          <div className="bg-background border border-female/20 rounded-xl p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-female/5 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="relative z-10">
              <h4 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="text-female">Impact Parité</span> 📈
              </h4>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-black text-foreground tracking-tight">38%</span>
                <span className="text-xs text-muted-foreground font-medium mb-1">profils féminins (cette sem.)</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-female w-[38%] rounded-full" />
              </div>
              <p className="text-xs text-muted-foreground mt-3 font-medium">
                Notre objectif : 50%. Aidez-nous en invitant des étudiantes !
              </p>
            </div>
          </div>

          {/* Widget Suggestions */}
          <div className="bg-background border border-border rounded-xl p-5 shadow-xs">
            <h4 className="font-heading font-bold text-foreground mb-4">Profils suggérés</h4>
            <div className="flex flex-col gap-4">
              {SUGGESTED_PROFILES.map((profile, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Avatar name={profile.name} size="sm" />
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-bold text-foreground leading-tight">{profile.name}</span>
                    <span className="text-xs text-muted-foreground font-medium">{profile.role} · {profile.school}</span>
                  </div>
                  <button className="text-xs font-bold text-primary hover:text-primary-dark transition-colors bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-md">
                    Connecter
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground mt-4 pt-3 border-t border-border transition-colors">
              Voir toutes les suggestions
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
