import { SkillTag } from "@/components/shared/SkillTag";
import type { ProjectDetail } from "@/data/mockProject";

export function ProjectContent({ project }: { project: ProjectDetail }) {
  return (
    <div className="space-y-8 text-foreground">
      
      <div className="space-y-3">
        <h2 className="font-heading font-bold text-2xl">Le Problème</h2>
        <p className="text-muted-foreground leading-relaxed font-medium">
          {project.problem}
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-heading font-bold text-2xl">La Solution</h2>
        <p className="text-muted-foreground leading-relaxed font-medium">
          {project.solution}
        </p>
      </div>

      <div className="space-y-5">
        <h2 className="font-heading font-bold text-2xl">Ce qu'on cherche</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.skills.map(skill => (
            <SkillTag key={skill} label={skill} variant="indigo" size="md" />
          ))}
        </div>
        <div className="grid gap-4">
          {project.seeking.map((seek, idx) => (
            <div key={idx} className="bg-muted/30 border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
              <h4 className="font-bold text-lg mb-1">{seek.role}</h4>
              <p className="text-sm text-muted-foreground font-medium">{seek.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}