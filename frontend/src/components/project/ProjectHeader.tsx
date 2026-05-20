import { SectorBadge } from "@/components/shared/SectorBadge";
import { FemaleBadge } from "@/components/shared/FemaleBadge";
import type { ProjectDetail } from "@/data/mockProject";

export function ProjectHeader({ project }: { project: ProjectDetail }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <SectorBadge sector={project.sector} />
        {project.isFemaleImpact && <FemaleBadge />}
      </div>
      <h1 className="font-heading font-black text-4xl sm:text-5xl text-foreground leading-tight">
        {project.title}
      </h1>
      <p className="text-sm font-medium text-muted-foreground">
        {project.date} · #{project.id}
      </p>
    </div>
  );
}