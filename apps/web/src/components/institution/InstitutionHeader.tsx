import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, GraduationCap } from 'lucide-react'

interface InstitutionHeaderProps {
  title: string
  description?: string
  backHref?: string
  backLabel?: string
  badgeLabel?: string
  actions?: ReactNode
}

export function InstitutionHeader({
  title,
  description,
  backHref,
  backLabel = 'Retour',
  badgeLabel = 'Espace Établissement',
  actions,
}: InstitutionHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border/80 pb-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-2">
        {backHref && (
          <Link
            to={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            {backLabel}
          </Link>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <GraduationCap className="h-3.5 w-3.5" />
            {badgeLabel}
          </span>
        </div>

        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5 pt-1 lg:pt-0">
          {actions}
        </div>
      )}
    </header>
  )
}
