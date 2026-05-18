import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center pt-16">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 lg:gap-16 items-center py-12 lg:py-0">
        {/* Left column */}
        <div className="relative z-10">
          {/* Launch badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-6 backdrop-blur-sm">
            <span className="text-primary text-sm">✨</span>
            <span className="text-primary-dark text-sm font-semibold tracking-wide">
              CoFound.mg is now live
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading font-extrabold text-5xl sm:text-6xl lg:text-[72px] text-slate-950 leading-[1.05] tracking-tight">
            Trouve ton{" "}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-400">
              co-fondateur.
            </span>
            <br />
            Lance ta startup.
          </h1>

          {/* Subtitle */}
          <p className="mt-8 text-lg sm:text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
            La plateforme qui connecte les meilleurs talents étudiants de Madagascar pour créer les startups de demain.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap gap-4 mt-10">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/20 rounded-xl h-14 px-8 font-heading font-semibold text-lg transition-all hover:scale-105"
              asChild
            >
              <Link to="/signup">
                Rejoindre la plateforme <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl h-14 px-8 border-slate-200 text-slate-700 hover:bg-slate-50 font-heading font-medium text-lg transition-all hover:scale-105"
              asChild
            >
              <Link to="/projects">Voir les projets</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-6 mt-10">
            {stats.map((stat, index) => (
              <div key={stat.id} className="flex items-center gap-6">
                {index > 0 && <div className="w-px h-8 bg-slate-200" />}
                <div>
                  <span className="font-heading font-bold text-slate-900 text-lg">{stat.value}</span>
                  <span className="text-slate-500 text-sm ml-1.5">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — Profile cards stack */}
        <div className="relative hidden lg:flex items-center justify-center h-[480px]">
          {/* SVG connection lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 480"
            fill="none"
          >
            <path
              d="M200 120 L200 240 L200 360"
              stroke="#059669"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              className="animate-draw-line drop-shadow-[0_0_8px_rgba(5,150,105,0.5)]"
            />
            <path
              d="M140 140 L260 240"
              stroke="#059669"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              opacity="0.4"
            />
            <path
              d="M260 340 L140 240"
              stroke="#059669"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              opacity="0.4"
            />
          </svg>

          {/* Cards */}
          {profiles.map((profile, index) => {
            const positions = [
              "top-4 left-8 -rotate-3",
              "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 shadow-lg scale-105",
              "bottom-4 right-8 rotate-2",
            ];
            const isCenter = index === 1;

            return (
              <div
                key={profile.id}
                className={`absolute ${positions[index]} bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-2xl p-5 w-64 transition-all duration-300 hover:scale-[1.08] hover:shadow-2xl hover:shadow-primary/10 ${
                  isCenter ? "shadow-xl shadow-slate-200/50" : "shadow-md shadow-slate-200/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={profile.name} size="md" />
                  <div>
                    <p className="font-heading font-semibold text-sm text-slate-900">{profile.name}</p>
                    <p className="text-xs text-slate-500">{profile.role} · {profile.school}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {profile.skills.map((skill) => (
                    <SkillTag key={skill} label={skill} variant="green" size="sm" />
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
