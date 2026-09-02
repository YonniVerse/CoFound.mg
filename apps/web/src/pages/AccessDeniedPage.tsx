import { Link, useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import type { PlatformRole } from '@/components/auth/PlatformRoleGate'

interface AccessDeniedPageProps {
  currentRole?: PlatformRole | null
  requiredRoles?: PlatformRole[]
}

export function AccessDeniedPage({ currentRole, requiredRoles }: AccessDeniedPageProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const getRoleLabel = (role?: PlatformRole | null) => {
    switch (role) {
      case 'TALENT':
        return 'Étudiant / Talent'
      case 'ORG_MEMBER':
        return 'Établissement / Organisation'
      case 'STAFF':
        return 'Équipe Staff / Modération'
      default:
        return 'Non défini'
    }
  }

  const getHomePath = (role?: PlatformRole | null) => {
    switch (role) {
      case 'ORG_MEMBER':
        return '/institution/dashboard'
      case 'STAFF':
        return '/moderation'
      default:
        return '/feed'
    }
  }

  const getHomeLabel = (role?: PlatformRole | null) => {
    switch (role) {
      case 'ORG_MEMBER':
        return 'Aller au tableau de bord institutionnel'
      case 'STAFF':
        return 'Aller à la console de modération'
      default:
        return 'Retourner au fil d’actualité'
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-lg p-8 shadow-lg border-destructive/20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="inline-block rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive mb-3">
          Erreur 403 • Accès Refusé
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl mb-3">
          Espace restreint
        </h1>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Vous n’avez pas les autorisations nécessaires pour accéder à cette page ou à cette ressource.
          {currentRole && (
            <span className="block mt-2 font-medium text-foreground">
              Votre rôle actuel : <span className="text-primary font-semibold">{getRoleLabel(currentRole)}</span>
            </span>
          )}
          {requiredRoles && requiredRoles.length > 0 && (
            <span className="block text-xs text-muted-foreground mt-1">
              Rôle(s) requis : {requiredRoles.map((r) => getRoleLabel(r)).join(', ')}
            </span>
          )}
        </p>

        <div className="space-y-3">
          <Button asChild className="w-full gap-2 font-semibold">
            <Link to={getHomePath(currentRole)}>
              <ArrowLeft className="h-4 w-4" />
              {getHomeLabel(currentRole)}
            </Link>
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              void logout().then(() => navigate('/login', { replace: true }))
            }}
          >
            <LogOut className="h-4 w-4" />
            Changer de compte
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default AccessDeniedPage
