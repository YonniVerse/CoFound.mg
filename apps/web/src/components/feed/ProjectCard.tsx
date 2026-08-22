import { Link } from "react-router-dom";
import { Avatar } from "@/components/shared/Avatar";
import { Button } from "@/components/ui/button";
import type { ProjectFeedCard } from "@cofound/shared";
import { Users, Briefcase, Eye, Send } from "lucide-react";
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
  const { t } = useI18n();

  if (isApiProject(project)) {
    const title = project.title;
    const pitch = project.pitch;
    const sectorSlug = project.sector?.slug ?? "Autre";
    const ownerName = project.owner?.pseudonym ?? "Fondateur anonyme";
    const openPositions = project.openPositionsCount;
    const membersCount = project.membersCount;

    return (
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-2xs hover:border-border/80 transition-all duration-150 flex flex-col gap-4 group min-w-0 overflow-hidden">
        {/* Header: Owner Avatar + Project Title & Sector + Status Badge */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <Avatar
              name={ownerName}
              src={null}
              size="md"
              className="h-12 w-12 sm:h-13 sm:w-13 border border-border/60 shadow-2xs shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <Link to={`/projects/${project.id}`}>
                <h3 className="font-bold text-base sm:text-lg text-foreground leading-tight group-hover:text-primary transition-colors truncate cursor-pointer">
                  {title}
                </h3>
              </Link>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground font-medium mt-0.5 truncate">
                <span>{sectorSlug}</span>
                <span>·</span>
                <span>{ownerName}</span>
              </div>
            </div>
          </div>

          {/* Minimalist Status Badge */}
          <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-md shrink-0 bg-primary/10 text-primary">
            {project.status}
          </span>
        </div>

        {/* Pitch / Description */}
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed break-words">
            "{pitch}"
          </p>
        </div>

        {/* Footer Info & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50 mt-1">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-primary opacity-80" />
              <span>
                {openPositions} poste{openPositions > 1 ? "s" : ""} ouvert{openPositions > 1 ? "s" : ""}
              </span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground opacity-70" />
              <span>
                {membersCount} membre{membersCount > 1 ? "s" : ""}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ReportButton targetType="PROJECT" targetId={project.id} />
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3.5 text-xs sm:text-sm font-medium rounded-lg border-border hover:bg-accent cursor-pointer gap-1.5"
              asChild
            >
              <Link to={`/projects/${project.id}`}>
                <Eye className="h-4 w-4" />
                <span>{t("common.viewProject")}</span>
              </Link>
            </Button>
            <Button
              size="sm"
              className="h-9 px-3.5 text-xs sm:text-sm font-medium rounded-lg cursor-pointer gap-1.5"
              asChild
            >
              <Link to={`/projects/${project.id}`}>
                <Send className="h-4 w-4" />
                <span>{t("common.apply")}</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Prototype Mock Data Fallback
  return (
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-2xs hover:border-border/80 transition-all duration-150 flex flex-col gap-4 group min-w-0 overflow-hidden">
      {/* Header: Author Avatar + Title & Sector + Time ago */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <Avatar
            name={project.author.name}
            src={project.author.avatar}
            size="md"
            className="h-12 w-12 sm:h-13 sm:w-13 border border-border/60 shadow-2xs shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <Link to={`/projects/${project.id}`}>
              <h3 className="font-bold text-base sm:text-lg text-foreground leading-tight group-hover:text-primary transition-colors truncate cursor-pointer">
                {project.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground font-medium mt-0.5 truncate">
              <span>{project.sector}</span>
              <span>·</span>
              <span>{project.author.name} ({project.author.school})</span>
            </div>
          </div>
        </div>

        <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-md shrink-0 bg-muted text-muted-foreground">
          {project.timeAgo}
        </span>
      </div>

      {/* Pitch / Description */}
      <div className="space-y-1.5 min-w-0">
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed break-words">
          "{project.description}"
        </p>
      </div>

      {/* Seeking Skills Tags */}
      {project.seekingSkills.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-xs font-semibold text-muted-foreground">
            {t("common.seeking")} :
          </span>
          {project.seekingSkills.map((skill) => (
            <span
              key={skill}
              className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-md"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Footer Info & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50 mt-1">
        <div className="text-xs sm:text-sm text-muted-foreground font-medium">
          {project.applicantsCount}{" "}
          {project.applicantsCount > 1 ? "candidatures" : "candidature"}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3.5 text-xs sm:text-sm font-medium rounded-lg border-border hover:bg-accent cursor-pointer gap-1.5"
            asChild
          >
            <Link to={`/projects/${project.id}`}>
              <Eye className="h-4 w-4" />
              <span>{t("common.viewProject")}</span>
            </Link>
          </Button>
          <Button
            size="sm"
            className="h-9 px-3.5 text-xs sm:text-sm font-medium rounded-lg cursor-pointer gap-1.5"
            asChild
          >
            <Link to={`/projects/${project.id}`}>
              <Send className="h-4 w-4" />
              <span>{t("common.apply")}</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
