import { useEffect, type MouseEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatusAlertDialogProps {
  open?: boolean
  icon: LucideIcon
  title: string
  description: string
  statusCode: string | number
  statusLabel?: string
  className?: string
}

export function StatusAlertDialog({
  open = true,
  icon: Icon,
  title,
  description,
  statusCode,
  statusLabel = 'Code statut',
  className,
}: StatusAlertDialogProps) {
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  function stopBackgroundInteraction(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-alert-title"
      aria-describedby="status-alert-description"
      className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm sm:p-6"
      onClick={stopBackgroundInteraction}
      onPointerDown={stopBackgroundInteraction}
      onContextMenu={stopBackgroundInteraction}
    >
      <div
        className={cn(
          'w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-2xl sm:p-10',
          className,
        )}
        onClick={stopBackgroundInteraction}
        onPointerDown={stopBackgroundInteraction}
      >
        <div className="flex flex-col items-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-2xs sm:h-28 sm:w-28">
            <Icon className="h-12 w-12 sm:h-14 sm:w-14" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h2 id="status-alert-title" className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h2>
            <p id="status-alert-description" className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 font-mono text-xs font-semibold text-muted-foreground">
            <span className="uppercase tracking-wider">{statusLabel}</span>
            <span className="text-foreground">{statusCode}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
