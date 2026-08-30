import { AlertCircle, RefreshCw } from 'lucide-react'
import { ApiClientError } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type InstitutionErrorStateProps = {
  error: unknown
  onRetry?: () => void
  fallbackDescription?: string
}

function getErrorCopy(error: unknown, fallbackDescription: string) {
  if (error instanceof ApiClientError && (error.status === 403 || error.messageKey.includes('notMember'))) {
    return {
      title: 'Accès établissement indisponible',
      description: 'Votre compte n’est pas encore rattaché à un établissement. Demandez à un administrateur de vous inviter avant de réessayer.',
    }
  }

  if (error instanceof ApiClientError && error.status >= 500) {
    return {
      title: 'Service temporairement indisponible',
      description: 'Les données de votre établissement ne sont pas accessibles pour le moment. Réessayez dans quelques instants.',
    }
  }

  return {
    title: 'Données indisponibles',
    description: fallbackDescription,
  }
}

export function InstitutionErrorState({ error, onRetry, fallbackDescription = 'Les données de votre établissement n’ont pas pu être chargées. Vérifiez votre connexion puis réessayez.' }: InstitutionErrorStateProps) {
  const copy = getErrorCopy(error, fallbackDescription)

  return (
    <Card className="border-destructive/20 bg-destructive/[0.03] shadow-2xs">
      <CardContent className="mt-3 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{copy.title}</p>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{copy.description}</p>
          </div>
        </div>
        {onRetry && <Button type="button" variant="outline" size="sm" onClick={onRetry} className="w-full shrink-0 gap-2 sm:w-auto"><RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />Réessayer</Button>}
      </CardContent>
    </Card>
  )
}
