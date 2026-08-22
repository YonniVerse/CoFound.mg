import { Link } from "react-router-dom";
import { Avatar } from "@/components/shared/Avatar";
import { SectorBadge } from "@/components/shared/SectorBadge";
import { SkillTag } from "@/components/shared/SkillTag";
import { Button } from "@/components/ui/button";
import type { ProjectFeedCard } from "@cofound/shared";
import { Users, Briefcase } from "lucide-react";
import { ReportButton } from "@/components/shared/ReportButton";
import { useI18n } from "@/i18n";

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

interface ProjectCardProps {
  project: ProjectData | ProjectFeedCard;
}

function isApiProject(p: ProjectData | ProjectFeedCard): p is ProjectFeedCard {
  return "pitch" in p;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { t } = useI18n()
  if (isApiProject(project)) {
    const title = project.title;
    const pitch = project.pitch;
    const sectorSlug = project.sector?.slug ?? "Autre";
    const ownerName = project.owner?.pseudonym ?? "Fondateur anonyme";
    const openPositions = project.openPositionsCount;
    const membersCount = project.membersCount;

    return (
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col gap-4 group">
        {/* Header: Title & Badges */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <SectorBadge sector={sectorSlug} />
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {project.status}
              </span>
            </div>
            <Link to={`/projects/${project.id}`}>
              <h3 className="font-heading font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors cursor-pointer">
                {title}
              </h3>
            </Link>
          </div>
        </div>

        {/* Pitch / Description */}
        <p className="text-sm text-muted-foreground font-medium line-clamp-2">
          {pitch}
        </p>

        {/* Author & Stats */}
        <div className="flex flex-col gap-3 py-3 border-y border-border/50 mt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar name={ownerName} src={null} size="sm" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">{ownerName}</span>
                <span className="text-[11px] text-muted-foreground font-medium">Fondateur principal</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                {openPositions} poste{openPositions > 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                {membersCount} membre{membersCount > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="text-xs text-muted-foreground font-medium">
            Projet CoFound.mg
          </div>
          <div className="flex items-center gap-2">
            <ReportButton targetType="PROJECT" targetId={project.id} />
            <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
              <Link to={`/projects/${project.id}`}>{t('common.viewProject')}</Link>
            </Button>
            <Button size="sm" className="h-8 text-xs" asChild>
              <Link to={`/projects/${project.id}`}>{t('common.apply')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Prototype Mock Data Fallback
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col gap-4 group">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <SectorBadge sector={project.sector} />
          </div>
          <Link to={`/projects/${project.id}`}>
            <h3 className="font-heading font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors cursor-pointer">
              {project.title}
            </h3>
          </Link>
        </div>
      </div>

      <p className="text-sm text-muted-foreground font-medium line-clamp-2">
        {project.description}
      </p>

      <div className="flex flex-col gap-3 py-3 border-y border-border/50 mt-1">
        <div className="flex items-center gap-3">
          <Avatar name={project.author.name} src={project.author.avatar} size="sm" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground">{project.author.name}</span>
            <span className="text-xs text-muted-foreground font-medium">{project.author.school}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-foreground uppercase tracking-widest opacity-60">{t('common.seeking')} :</span>
          <div className="flex flex-wrap gap-1.5">
            {project.seekingSkills.map((skill) => (
              <SkillTag key={skill} label={skill} variant="indigo" />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="text-xs text-muted-foreground font-medium">
          {project.timeAgo} · {project.applicantsCount} {project.applicantsCount > 1 ? "candidatures" : "candidature"}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
            <Link to={`/projects/${project.id}`}>{t('common.viewProject')}</Link>
          </Button>
          <Button size="sm" className="h-8 text-xs" asChild>
            <Link to={`/projects/${project.id}`}>{t('common.apply')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
