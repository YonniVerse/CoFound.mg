import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { SkillTag } from "@/components/shared/SkillTag";
import { FemaleBadge } from "@/components/shared/FemaleBadge";

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
  // Configuration sémantique des cartes (plus aucune couleur brute)
  const cardStyles = [
    {
      position: "top-4 left-6 -rotate-3 hover:rotate-0",
      tagVariant: "indigo" as const,
      borderHover: "hover:border-primary/50",
    },
    {
      position: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 scale-105 shadow-xl shadow-foreground/5 border-border-dark/30",
      tagVariant: "slate" as const,
      borderHover: "hover:border-foreground",
    },
    {
      position: "bottom-4 right-6 rotate-2 hover:rotate-0",
      tagVariant: "orange" as const,
      borderHover: "hover:border-secondary/50",
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center bg-background pt-24 pb-16 overflow-hidden">
      {/* Grille géométrique sémantique basée sur la couleur des bordures globales */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* COLONNE GAUCHE (Contenu textuel & métriques) */}
        <div className="lg:col-span-7 flex flex-col items-start">
          {/* <div className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-3.5 py-1.5 mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-secondary fill-secondary" />
            <span className="text-xs font-semibold tracking-wider uppercase">L'élite entrepreneuriale étudiante</span>
          </div> */}

          <h1 className="font-sans font-black text-5xl sm:text-6xl xl:text-[68px] text-foreground mt-4 leading-[0.95] tracking-tight">
            Ne cherche pas une idée.<br />
            Trouve ton <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">Co-fondateur</span>.
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed font-normal">
            L'algorithme de CoFound.mg n'associe pas les profils similaires. Il connecte la rigueur technique du codeur avec la vision stratégique du marketeur.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto">
            <Button
              size="lg"
              variant="default"
              asChild
            >
              <Link to="/signup" className="flex items-center gap-2">
                Créer son profil fondateur <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
            >
              <Link to="/feed">Parcourir le vivier</Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-12 mt-12 border-t border-border/60 w-full max-w-lg">
            {stats.map((stat) => (
              <div key={stat.id} className="flex flex-col">
                <span className="font-sans font-black text-3xl text-foreground tracking-tight">{stat.value}</span>
                <span className="text-muted-foreground text-xs font-medium mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* COLONNE DROITE (Le Stack de Profils Connectés) */}
        <div className="lg:col-span-5 relative flex items-center justify-center h-[520px] w-full top-[-10%]">
          
          {/* Lignes de flux vectorielles d'interconnexion basées sur le thème CSS */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 400 520"
            fill="none"
          >
            {/* Ligne Tech reliée au Primary (Indigo) */}
            <path
              d="M100 120 Q200 180 200 260"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="opacity-50"
            />
            {/* Ligne Business reliée au Secondary (Orange) */}
            <path
              d="M300 400 Q200 340 200 260"
              stroke="var(--secondary)"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="opacity-50"
            />
            
            {/* Node central d'intersection utilisant le Foreground du thème */}
            <circle cx="200" cy="260" r="5" fill="var(--foreground)" />
            <circle cx="200" cy="260" r="12" stroke="var(--foreground)" strokeWidth="1" className="animate-ping opacity-15" />
          </svg>

          {/* Rendu dynamique des cartes de profils */}
          {profiles?.slice(0, 3).map((profile, index) => {
            const currentStyle = cardStyles[index] || cardStyles[1];
            const isCenterCard = index === 1;

            return (
              <div
                key={profile.id}
                className={`absolute ${currentStyle.position} bg-card border border-border rounded-2xl p-4 w-64 transition-all duration-350 ${currentStyle.borderHover} group/card shadow-2xs`}
              >
                {/* Badge Féminin sur la carte centrale */}
                {isCenterCard && (
                  <div className="absolute -top-3 -right-3 z-30 transform rotate-6 hover:rotate-0 transition-transform">
                    <FemaleBadge variant="profile" />
                  </div>
                )}
                {/* En-tête de la carte */}
                <div className="flex items-center gap-3">
                  <Avatar name={profile.name} src={profile.avatar} size="sm" />
                  <div className="overflow-hidden">
                    <h4 className="font-sans font-bold text-sm text-foreground truncate group-hover/card:text-primary transition-colors">
                      {profile.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground/80 font-medium truncate mt-0.5">
                      {profile.role} · <span className="text-muted-foreground font-semibold">{profile.school}</span>
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