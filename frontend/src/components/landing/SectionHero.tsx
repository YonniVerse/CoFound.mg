import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { SkillTag } from "@/components/shared/SkillTag";

interface HeroProfile {
  id: string;
  name: string;
  role: string;
  school: string;
  skills: string[];
  avatar: string | null;
}

interface SocialStat {
  id: string;
  value: string;
  label: string;
}

interface SectionHeroProps {
  profiles: HeroProfile[];
  stats: SocialStat[];
}

export function SectionHero({ profiles, stats }: SectionHeroProps) {
  // Configuration des cartes pour imposer graphiquement la complémentarité
  const cardStyles = [
    {
      position: "top-4 left-6 -rotate-3 hover:rotate-0",
      tagVariant: "indigo" as const,
      borderHover: "hover:border-indigo-500/50",
    },
    {
      position: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 scale-105 shadow-xl shadow-slate-950/5 border-slate-300",
      tagVariant: "slate" as const,
      borderHover: "hover:border-slate-950",
    },
    {
      position: "bottom-4 right-6 rotate-2 hover:rotate-0",
      tagVariant: "orange" as const,
      borderHover: "hover:border-orange-500/50",
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center bg-white pt-24 pb-16 overflow-hidden">
      {/* Grille géométrique subtile en arrière-plan */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f4f8_1px,transparent_1px),linear-gradient(to_bottom,#f0f4f8_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* COLONNE GAUCHE (Contenu textuel inchangé et ultra premium) */}
        <div className="lg:col-span-7 flex flex-col items-start">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 text-white px-3.5 py-1.5 mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-orange-400 fill-orange-400" />
            <span className="text-xs font-semibold tracking-wider uppercase">L'élite entrepreneuriale étudiante</span>
          </div>

          <h1 className="font-sans font-black text-5xl sm:text-6xl xl:text-[68px] text-slate-950 leading-[0.95] tracking-tight">
            Ne cherche pas une idée.<br />
            Trouve ton <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-orange-500">Co-fondateur</span>.
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-slate-600 max-w-xl leading-relaxed font-normal">
            L'algorithme de CoFound.mg n'associe pas les profils similaires. Il connecte la rigueur technique du codeur avec la vision stratégique du marketeur.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto">
            <Button
              size="lg"
              className="bg-slate-950 hover:bg-slate-900 text-white rounded-xl h-14 px-8 font-semibold text-base shadow-xl shadow-slate-950/10 transition-all"
              asChild
            >
              <Link to="/signup" className="flex items-center gap-2">
                Créer son profil fondateur <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl h-14 px-8 border-slate-200 text-slate-800 hover:bg-slate-50 font-medium text-base transition-all"
              asChild
            >
              <Link to="/projects">Parcourir le vivier</Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-12 mt-12 border-t border-slate-100 w-full max-w-lg">
            {stats.map((stat) => (
              <div key={stat.id} className="flex flex-col">
                <span className="font-sans font-black text-3xl text-slate-950 tracking-tight">{stat.value}</span>
                <span className="text-slate-500 text-xs font-medium mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* COLONNE DROITE RETRAVAILLÉE (Le Stack de Profils Connectés) */}
        <div className="lg:col-span-5 relative flex items-center justify-center h-[520px] w-full top-[-10%]">
          
          {/* Lignes de flux vectorielles d'interconnexion */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 400 520"
            fill="none"
          >
            {/* Ligne Tech (Indigo) partant du haut gauche vers le centre */}
            <path
              d="M100 120 Q200 180 200 260"
              stroke="#4f46e5"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="opacity-60"
            />
            {/* Ligne Business (Orange) partant du bas droit vers le centre */}
            <path
              d="M300 400 Q200 340 200 260"
              stroke="#f97316"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="opacity-60"
            />
            
            {/* Node central d'intersection ultra-propre */}
            <circle cx="200" cy="260" r="5" fill="#090d16" />
            <circle cx="200" cy="260" r="12" stroke="#090d16" strokeWidth="1" className="animate-ping opacity-20" />
          </svg>

          {/* Rendu dynamique des cartes de profils */}
          {profiles?.slice(0, 3).map((profile, index) => {
            const currentStyle = cardStyles[index] || cardStyles[1];
            const isCenterCard = index === 1;

            return (
              <div
                key={profile.id}
                className={`absolute ${currentStyle.position} bg-white border border-slate-200 rounded-2xl p-4 w-64 transition-all duration-350 ${currentStyle.borderHover} group/card`}
              >
                {/* En-tête de la carte */}
                <div className="flex items-center gap-3">
                  <Avatar name={profile.name} src={profile.avatar} size="sm" />
                  <div className="overflow-hidden">
                    <h4 className="font-sans font-bold text-sm text-slate-950 truncate group-hover/card:text-primary transition-colors">
                      {profile.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                      {profile.role} · <span className="text-slate-500 font-semibold">{profile.school}</span>
                    </p>
                  </div>
                </div>

                {/* Liste des compétences du profil */}
                <div className="flex flex-wrap gap-1 mt-3.5">
                  {profile.skills?.slice(0, 3).map((skill) => (
                    <SkillTag 
                      key={skill} 
                      label={skill} 
                      variant={isCenterCard ? (index % 2 === 0 ? "indigo" : "orange") : currentStyle.tagVariant} 
                      size="sm" 
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}