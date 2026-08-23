import type { ComponentType } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface StatusAlertDialogProps {
  open?: boolean
  icon: ComponentType<{ className?: string; 'aria-hidden'?: string | boolean }>
  title: string
  description: string
  statusCode: string | number
  statusLabel?: string
}

export function StatusAlertDialog({
  open = true,
  icon: Icon,
  title,
  description,
  statusCode,
  statusLabel = 'Code statut',
}: StatusAlertDialogProps) {
  return (
    <Dialog open={open} modal onOpenChange={() => undefined}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        className="max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-2xl sm:p-10"
      >
        <DialogHeader className="items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-2xs sm:h-24 sm:w-24">
            <Icon className="h-10 w-10 sm:h-12 sm:w-12" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="mx-auto mt-2 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 font-mono text-xs font-semibold text-muted-foreground">
          <span className="uppercase tracking-wider">{statusLabel}</span>
          <span className="text-foreground">{statusCode}</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
