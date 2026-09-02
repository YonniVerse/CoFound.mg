import type { ProjectDetail } from '@/data/projectTypes'
import { Briefcase, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function ProjectContent({ project }: { project: ProjectDetail }) {
  return (
    <div className="space-y-6">
      {/* Présentation Card */}
      <Card className="rounded-xl border border-border bg-card p-6 sm:p-7 shadow-2xs space-y-3.5">
        <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl flex items-center gap-2.5">
          <FileText className="h-5 w-5 text-primary" />
          Présentation du projet
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {project.pitch}
        </p>
      </Card>

      {/* Open positions Card */}
      <Card className="rounded-xl border border-border bg-card p-6 sm:p-7 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-border/50 pb-3.5">
          <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl flex items-center gap-2.5">
            <Briefcase className="h-5 w-5 text-primary" />
            Postes ouverts ({project.positions.length})
          </h2>
        </div>

        {project.positions.length === 0 ? (
          <p className="text-sm sm:text-base text-muted-foreground">
            Aucun poste ouvert pour le moment.
          </p>
        ) : (
          <div className="space-y-3.5">
            {project.positions.map((position) => (
              <div
                key={position.id}
                className="rounded-lg border border-border/80 bg-muted/20 p-5 space-y-2.5 transition-colors hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-foreground">{position.title}</h3>
                  <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    Recrutement ouvert
                  </span>
                </div>

                {position.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {position.description}
                  </p>
                )}

                {position.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 pt-1">
                    {position.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-md bg-muted px-2.5 py-1 text-xs sm:text-sm font-medium text-foreground border border-border/60"
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
