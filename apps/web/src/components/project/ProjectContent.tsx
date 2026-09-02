import type { ProjectDetail } from '@/data/projectTypes'
import { Briefcase, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function ProjectContent({ project }: { project: ProjectDetail }) {
  return (
    <div className="space-y-6">
      {/* Présentation Card */}
      <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-3">
        <h2 className="font-heading text-base font-bold text-foreground sm:text-lg flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Présentation du projet
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {project.pitch}
        </p>
      </Card>

      {/* Open positions Card */}
      <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h2 className="font-heading text-base font-bold text-foreground sm:text-lg flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Postes ouverts ({project.positions.length})
          </h2>
        </div>

        {project.positions.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground">
            Aucun poste ouvert pour le moment.
          </p>
        ) : (
          <div className="space-y-3">
            {project.positions.map((position) => (
              <div
                key={position.id}
                className="rounded-lg border border-border/80 bg-muted/20 p-4 space-y-2 transition-colors hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-foreground">{position.title}</h3>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Recrutement ouvert
                  </span>
                </div>

                {position.description && (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {position.description}
                  </p>
                )}

                {position.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 pt-1">
                    {position.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground border border-border/50"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
