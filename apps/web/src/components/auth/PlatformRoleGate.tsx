import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api-client'
import { useI18n } from '@/i18n'

export type PlatformRole = 'TALENT' | 'ORG_MEMBER' | 'STAFF'

type CurrentUser = { platformRole: PlatformRole }

const currentUserSchema = {
  parse(value: unknown): CurrentUser {
    if (!value || typeof value !== 'object' || !('platformRole' in value)) throw new Error('Rôle plateforme absent.')
    const platformRole = (value as { platformRole?: unknown }).platformRole
    if (platformRole !== 'TALENT' && platformRole !== 'ORG_MEMBER' && platformRole !== 'STAFF') throw new Error('Rôle plateforme invalide.')
    return { platformRole }
  },
}

export function PlatformRoleGate({ allowedRoles, children }: { allowedRoles: PlatformRole[]; children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const { t } = useI18n()
  const [role, setRole] = useState<PlatformRole | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)

  useEffect(() => {
    if (isLoading || !isAuthenticated) return
    let active = true
    queueMicrotask(() => {
      if (!active) return
      setRoleLoading(true)
      void apiClient.get('/me', currentUserSchema)
        .then((currentUser) => { if (active) setRole(currentUser.platformRole) })
        .catch(() => { if (active) setRole(null) })
        .finally(() => { if (active) setRoleLoading(false) })
    })
    return () => { active = false }
  }, [isAuthenticated, isLoading])

  if (isLoading || (isAuthenticated && roleLoading)) {
    return <div role="status" className="flex min-h-[40vh] items-center justify-center text-muted-foreground">{t('common.loading')}</div>
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!role || !allowedRoles.includes(role)) return <Navigate to="/feed" replace />
  return <>{children}</>
}
