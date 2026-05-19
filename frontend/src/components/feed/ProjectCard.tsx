import { Link } from "react-router-dom";
import { Avatar } from "@/components/shared/Avatar";
import { SectorBadge } from "@/components/shared/SectorBadge";
import { FemaleBadge } from "@/components/shared/FemaleBadge";
import { SkillTag } from "@/components/shared/SkillTag";
import { Button } from "@/components/ui/button";

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  sector: "HealthTech" | "EdTech" | "FinTech" | "AgriTech" | "E-commerce" | "Autre";
  author: {
    name: string;
    school: string;
    avatar: string | null;
  };
  seekingSkills: string[];
  isFemaleImpact: boolean;
  timeAgo: string;
  applicantsCount: number;
}

export function ProjectCard({ project }: { project: ProjectData }) {
  return (
    <div className="bg-background border border-border rounded-xl p-5 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col gap-4 group">
      
      {/* Header: Title & Badges */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <SectorBadge sector={project.sector} />
            {project.isFemaleImpact && <FemaleBadge />}
          </div>
          <Link to={`/projects/${project.id}`}>
            <h3 className="font-heading font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors cursor-pointer">
              {project.title}
            </h3>
          </Link>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground font-medium line-clamp-2">
        {project.description}
      </p>

      {/* Author & Seeking */}
      <div className="flex flex-col gap-3 py-3 border-y border-border/50 mt-1">
        <div className="flex items-center gap-3">
          <Avatar name={project.author.name} src={project.author.avatar} size="sm" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground">{project.author.name}</span>
            <span className="text-xs text-muted-foreground font-medium">{project.author.school}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-foreground uppercase tracking-widest opacity-60">Recherche :</span>
          <div className="flex flex-wrap gap-1.5">
            {project.seekingSkills.map(skill => (
              <SkillTag key={skill} label={skill} variant="indigo" />
            ))}
          </div>
        </div>
      </div>

      {/* Footer: Metadata & CTA */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="text-xs text-muted-foreground font-medium">
          {project.timeAgo} · {project.applicantsCount} {project.applicantsCount > 1 ? "candidatures" : "candidature"}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
            <Link to={`/projects/${project.id}`}>Voir le projet</Link>
          </Button>
          <Button size="sm" className="h-8 text-xs" asChild>
            <Link to={`/projects/${project.id}`}>Postuler</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
