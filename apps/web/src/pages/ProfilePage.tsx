import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Calendar,
  Clock3,
  Mail,
  Pencil,
  Plus,
  Rocket,
  Shield,
  Tag,
  UserRound,
  Users,
} from 'lucide-react'
import {
  ownedProjectsResponseSchema,
  privateTalentProfileSchema,
  type OwnedProject,
  ProjectStatus,
} from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api-client'

type PrivateProfileResponse = ReturnType<typeof privateTalentProfileSchema.parse>

function formatLabel(value: string | null | undefined) {
  if (!value) return '—'
  return value
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatStatus(status: ProjectStatus | string) {
  switch (status) {
    case ProjectStatus.DRAFT:
    case 'DRAFT':
      return { label: 'Brouillon', className: 'bg-muted text-muted-foreground border-border' }
    case ProjectStatus.RECRUITING:
    case 'RECRUITING':
      return { label: 'En recrutement', className: 'bg-primary/10 text-primary border-primary/20' }
    case ProjectStatus.ACTIVE:
    case 'ACTIVE':
      return { label: 'Actif', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' }
    case ProjectStatus.PAUSED:
    case 'PAUSED':
      return { label: 'En pause', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' }
    case ProjectStatus.ARCHIVED:
    case 'ARCHIVED':
      return { label: 'Archivé', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' }
    default:
      return { label: status, className: 'bg-muted text-muted-foreground border-border' }
  }
}

function formatRole(role: string | undefined, functionalRole: string | null | undefined) {
  if (role === 'OWNER') return 'Propriétaire'
  if (functionalRole) return functionalRole
  if (role === 'MEMBER') return 'Membre'
  return role || 'Membre'
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6" role="status" aria-label="Chargement du profil">
      <Card className="overflow-hidden rounded-xl border-border bg-card shadow-2xs">
        <CardHeader className="border-b border-border/60 px-5 py-5 sm:px-6">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full" />
        </CardHeader>
        <CardContent className="space-y-6 px-5 py-6 sm:px-6">
          <div className="mt-2 flex items-start gap-4">
            <Skeleton className="mt-3 h-16 w-16 shrink-0 rounded-2xl" />
            <div className="min-w-0 space-y-2">
              <Skeleton className="mt-3 h-6 w-48 max-w-full" />
              <Skeleton className="h-4 w-60 max-w-full" />
              <Skeleton className="h-3 w-52 max-w-full" />
            </div>
          </div>
          <div className="space-y-3 border-t border-border/50 pt-3">
            <Skeleton className="h-5 w-2/3 max-w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfilePage() {
  const [data, setData] = useState<PrivateProfileResponse | null>(null)
  const [myProjects, setMyProjects] = useState<OwnedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    void apiClient
      .get('/me/profile', privateTalentProfileSchema)
      .then((payload) => {
        if (active) setData(payload)
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    void apiClient
      .get('/projects/mine', ownedProjectsResponseSchema)
      .then((res) => {
        if (active) setMyProjects(res.projects)
      })
      .catch(() => {
        // Non-blocking error for projects
      })
      .finally(() => {
        if (active) setProjectsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const profile = data?.profile
  const identityName = [data?.identity?.firstName, data?.identity?.lastName].filter(Boolean).join(' ').trim()
  const displayName = identityName || profile?.pseudonym || data?.user.email || 'Mon profil'

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/feed"
              className="group inline-flex h-9 w-fit shrink-0 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              Retour au Feed
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" asChild className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium sm:text-sm">
                <Link to="/projects/new">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Créer un projet
                </Link>
              </Button>
              <Button size="sm" asChild className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium sm:text-sm">
                <Link to="/onboarding">
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Modifier mon profil
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          {loading && <ProfileSkeleton />}

          {!loading && error && (
            <Card className="rounded-xl border-border bg-card shadow-2xs">
              <CardContent className="p-10 text-center">
                <p className="font-semibold text-foreground">Impossible de charger ton profil.</p>
                <p className="mt-2 text-sm text-muted-foreground">Réessaie dans quelques instants.</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && (
            <div className="mx-auto w-full max-w-4xl space-y-8">
              {/* 1. INFORMATIONS DU PROFIL */}
              <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-2xs">
                <CardHeader className="border-b border-border/60 px-5 py-5 sm:px-6">
                  <CardTitle className="text-lg font-bold tracking-tight">Informations du profil</CardTitle>
                  <CardDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Ces informations sont visibles uniquement par toi dans cet espace privé.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-5 py-6 sm:px-6">
                  <div className="mt-2 flex items-start gap-4">
                    <div className="mt-3 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted text-muted-foreground">
                      <UserRound className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="mt-3 truncate text-xl font-bold text-foreground">{displayName}</h2>
                      {data?.user.email && (
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                          {data.user.email}
                        </p>
                      )}
                      {profile?.pseudonym && (
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          Pseudonyme public : {profile.pseudonym}
                        </p>
                      )}
                    </div>
                  </div>

                  {profile ? (
                    <>
                      {profile.headline && (
                        <p className="border-t border-border/50 pt-3 text-base font-semibold leading-relaxed text-foreground">
                          {profile.headline}
                        </p>
                      )}
                      {profile.bio && <p className="text-sm leading-6 text-muted-foreground">{profile.bio}</p>}
                      <dl className="divide-y divide-border/50 border-t border-border/50 pt-1">
                        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                          <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                            Domaine d’études
                          </dt>
                          <dd className="text-sm font-semibold text-foreground sm:text-right">
                            {formatLabel(profile.field?.slug)}
                          </dd>
                        </div>
                        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                          <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                            Disponibilité
                          </dt>
                          <dd className="text-sm font-semibold text-foreground sm:text-right">
                            {profile.availabilityHours === null ? '—' : `${profile.availabilityHours} h / semaine`}
                          </dd>
                        </div>
                        {profile.goals.length > 0 && (
                          <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                            <dt className="text-xs font-semibold text-muted-foreground">Objectifs</dt>
                            <dd className="flex flex-wrap gap-2 sm:justify-end">
                              {profile.goals.map((goal) => (
                                <span
                                  key={goal}
                                  className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                                >
                                  {goal}
                                </span>
                              ))}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
                      <p className="font-semibold text-foreground">Ton profil n’est pas encore renseigné.</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Commence l’onboarding pour ajouter tes informations.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 2. MES PROJETS */}
              <section className="space-y-4" aria-label="Mes projets">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Rocket className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="font-heading text-lg font-bold text-foreground">Mes projets</h2>
                      <p className="text-xs text-muted-foreground">
                        Projets dont vous êtes propriétaire ou membre actif.
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    asChild
                    className="h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold"
                  >
                    <Link to="/projects/new">
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      Créer un projet
                    </Link>
                  </Button>
                </div>

                {projectsLoading && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[1, 2].map((i) => (
                      <Card key={i} className="rounded-2xl border-border bg-card p-5 space-y-3">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </Card>
                    ))}
                  </div>
                )}

                {!projectsLoading && myProjects.length === 0 && (
                  <Card className="rounded-2xl border-dashed border-border bg-card/60 p-8 text-center shadow-2xs">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <BriefcaseBusiness className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 font-heading text-base font-bold text-foreground">
                      Vous n'avez encore aucun projet.
                    </h3>
                    <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">
                      Lancez une nouvelle idée entrepreneuriale, assemblez votre équipe et construisez votre entreprise pas à pas sur CoFound.
                    </p>
                    <div className="mt-5">
                      <Button asChild size="sm" className="gap-2 text-xs font-semibold shadow-xs">
                        <Link to="/projects/new">
                          <Plus className="h-4 w-4" aria-hidden="true" />
                          Créer mon premier projet
                        </Link>
                      </Button>
                    </div>
                  </Card>
                )}

                {!projectsLoading && myProjects.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {myProjects.map((project) => {
                      const statusInfo = formatStatus(project.status)
                      const userRoleLabel = formatRole(project.userRole, project.functionalRole)
                      const isOwner = project.userRole === 'OWNER'
                      const createdDate = project.createdAt
                        ? new Date(project.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : null

                      return (
                        <Link
                          key={project.id}
                          to={`/projects/${project.id}`}
                          className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all hover:border-primary/40 hover:bg-card hover:shadow-xs"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <h3 className="font-heading text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                                  {project.title}
                                </h3>
                                {project.sector && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                    <Tag className="h-3 w-3" />
                                    {formatLabel(project.sector.slug || project.sector.labelKey)}
                                  </span>
                                )}
                              </div>

                              <span
                                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusInfo.className}`}
                              >
                                {statusInfo.label}
                              </span>
                            </div>

                            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                              {project.pitch || 'Aucun pitch renseigné.'}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              {isOwner ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                  <Shield className="h-3 w-3" />
                                  {userRoleLabel}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground">
                                  <Users className="h-3 w-3" />
                                  {userRoleLabel}
                                </span>
                              )}
                            </div>

                            {createdDate && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{createdDate}</span>
                              </div>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}
