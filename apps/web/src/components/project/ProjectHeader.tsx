import type { ProjectDetail } from '@/data/projectTypes'

export function ProjectHeader({ project }: { project: ProjectDetail }) {
  const createdAt = project.createdAt.toLocaleDateString('fr-FR')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {project.status}
        </span>
      </div>
      <h1 className="font-heading font-black text-4xl leading-tight text-foreground sm:text-5xl">
        {project.title}
      </h1>
      <p className="text-sm font-medium text-muted-foreground">
        {createdAt} · #{project.id}
      </p>
    </div>
  )
}
