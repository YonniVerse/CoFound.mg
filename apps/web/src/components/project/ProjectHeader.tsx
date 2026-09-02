import type { ProjectDetail } from '@/data/projectTypes'
import { Calendar, FolderGit2 } from 'lucide-react'

function getStatusBadge(status: string) {
  switch (status) {
    case 'DRAFT':
      return { label: 'Brouillon', className: 'bg-muted text-muted-foreground border-border' }
    case 'RECRUITING':
      return { label: 'En recrutement', className: 'bg-primary/10 text-primary border-primary/20' }
    case 'ACTIVE':
      return { label: 'Actif', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' }
    case 'PAUSED':
      return { label: 'En pause', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' }
    case 'ARCHIVED':
      return { label: 'Archivé', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' }
    default:
      return { label: status, className: 'bg-muted text-muted-foreground border-border' }
  }
}

export function ProjectHeader({ project }: { project: ProjectDetail }) {
  const createdAt = project.createdAt.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const statusInfo = getStatusBadge(project.status)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary">
          <FolderGit2 className="h-3.5 w-3.5" />
          Projet
        </span>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>

      <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        {project.title}
      </h1>

      <p className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>Créé le {createdAt}</span>
      </p>
    </div>
  )
}
