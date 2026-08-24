import type { ProjectDetail } from '@/data/projectTypes'
import { SkillTag } from '@/components/shared/SkillTag'

export function ProjectContent({ project }: { project: ProjectDetail }) {
  return (
    <div className="space-y-6 text-foreground">
      <div className="space-y-3">
        <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">Présentation</h2>
        <p className="text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
          {project.pitch}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">Postes ouverts</h2>
        {project.positions.length === 0 && (
          <p className="text-sm font-medium text-muted-foreground">Aucun poste ouvert.</p>
        )}
        {project.positions.map((position) => (
          <div key={position.id} className="rounded-xl border border-border bg-muted/30 p-5 shadow-2xs transition-colors hover:border-primary/30">
            <h4 className="mb-1 text-base font-bold text-foreground sm:text-lg">{position.title}</h4>
            {position.description && <p className="text-xs font-medium text-muted-foreground sm:text-sm">{position.description}</p>}
            {position.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {position.skills.map((skill) => <SkillTag key={skill.id} label={skill.name} variant="indigo" size="md" />)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
