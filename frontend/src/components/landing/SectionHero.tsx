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
      <div className="absolute top-20 right-0 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-green-50/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 lg:gap-16 items-center py-12 lg:py-0">
        {/* Left column */}
        <div className="relative z-10">
          {/* Hackathon badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-1.5 mb-6">
            <span className="text-primary text-sm">✦</span>
            <span className="text-green-700 text-sm font-medium">
              Hackathon ITOVIA 2025 · École Polytechnique Madagascar
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-[64px] text-slate-900 leading-[1.1] tracking-tight">
            Trouve ton{" "}
            <br className="hidden sm:block" />
            <span className="text-primary">co-fondateur.</span>
            <br />
            Lance ta startup.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg text-slate-500 max-w-md leading-relaxed">
            CoFound.mg connecte les étudiants de formations différentes pour créer des équipes qui changent Madagascar.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap gap-3 mt-8">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary-dark text-white rounded-lg h-12 px-6 font-heading font-semibold"
              asChild
            >
              <Link to="/signup">
                Rejoindre la plateforme <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-lg h-12 px-6 border-slate-300 text-slate-700 hover:bg-slate-50"
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
              stroke="#16a34a"
              strokeWidth="2"
              strokeDasharray="6 4"
              className="animate-draw-line"
            />
            <path
              d="M140 140 L260 240"
              stroke="#16a34a"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.5"
            />
            <path
              d="M260 340 L140 240"
              stroke="#16a34a"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.5"
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
                className={`absolute ${positions[index]} bg-white border border-slate-200 rounded-xl p-4 w-64 transition-transform duration-300 hover:scale-105 ${
                  isCenter ? "shadow-lg" : "shadow-sm"
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
