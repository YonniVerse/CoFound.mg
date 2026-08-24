import { SkillTag } from "@/components/shared/SkillTag";
import type { ProjectDetail } from "@/data/mockProject";

export function ProjectContent({ project }: { project: ProjectDetail }) {
  return (
    <div className="space-y-6 text-foreground">
      
      <div className="space-y-3">
        <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">Le Problème</h2>
        <p className="text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
          {project.problem}
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">La Solution</h2>
        <p className="text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
          {project.solution}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">Ce qu'on cherche</h2>
        <div className="flex flex-wrap gap-2">
          {project.skills.map(skill => (
            <SkillTag key={skill} label={skill} variant="indigo" size="md" />
          ))}
        </div>
        <div className="grid gap-4">
          {project.seeking.map((seek, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-muted/30 p-5 shadow-2xs transition-colors hover:border-primary/30">
              <h4 className="mb-1 text-base font-bold text-foreground sm:text-lg">{seek.role}</h4>
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">{seek.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}