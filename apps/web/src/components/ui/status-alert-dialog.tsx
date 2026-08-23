import { useEffect, type MouseEvent } from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StatusAlertDialogProps {
  open?: boolean
  icon: LucideIcon
  title: string
  description: string
  statusCode: string | number
  statusLabel?: string
  className?: string
  tone?: 'primary' | 'destructive'
  statusMessage?: string
  onBack?: () => void
  onRetry?: () => void
  backLabel?: string
  retryLabel?: string
}

export function StatusAlertDialog({
  open = true,
  icon: Icon,
  title,
  description,
  statusCode,
  statusLabel = 'Code statut',
  className,
  tone = 'primary',
  statusMessage,
  onBack,
  onRetry,
  backLabel = 'Retour',
  retryLabel = 'Réessayer',
}: StatusAlertDialogProps) {
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  const numericStatusCode = Number(statusCode)
  if (!open || !Number.isFinite(numericStatusCode) || numericStatusCode <= 500) return null

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
          'w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-2xl sm:p-10',
          tone === 'destructive' ? 'border-destructive/25' : 'border-border',
          className,
        )}
        onClick={stopBackgroundInteraction}
        onPointerDown={stopBackgroundInteraction}
      >
        <div className="flex flex-col items-center gap-5">
          <div
            className={cn(
              'flex h-24 w-24 items-center justify-center rounded-2xl border shadow-2xs sm:h-28 sm:w-28',
              tone === 'destructive'
                ? 'border-destructive/25 bg-destructive/10 text-destructive'
                : 'border-primary/20 bg-primary/10 text-primary',
            )}
          >
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

          {statusMessage && <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{statusMessage}</p>}

          {(onBack || onRetry) && (
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-center">
              {onBack && (
                <Button type="button" variant="outline" onClick={onBack} className="h-9 w-full gap-1.5 rounded-lg px-3.5 text-xs font-medium sm:w-auto sm:text-sm">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  {backLabel}
                </Button>
              )}
              {onRetry && (
                <Button type="button" onClick={onRetry} className="h-9 w-full gap-1.5 rounded-lg px-3.5 text-xs font-medium shadow-none sm:w-auto sm:text-sm">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  {retryLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
