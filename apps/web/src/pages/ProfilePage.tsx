import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BriefcaseBusiness,
  Clock,
  Eye,
  EyeOff,
  FolderGit2,
  GraduationCap,
  Lock,
  Mail,
  Pencil,
  Plus,
  ShieldCheck,
  Tag,
  UserRound,
  Users,
  AlertCircle,
  ChevronRight,
  Shield,
} from 'lucide-react'
import {
  ownedProjectsResponseSchema,
  privateTalentProfileSchema,
  onboardingStepResponseSchema,
  profileCompletionReminderSchema,
  type OwnedProject,
  ProjectStatus,
} from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/shared/Avatar'
import { apiClient } from '@/lib/api-client'

type PrivateProfile = ReturnType<typeof privateTalentProfileSchema.parse>
type OnboardingData = ReturnType<typeof onboardingStepResponseSchema.parse>
type ReminderData = ReturnType<typeof profileCompletionReminderSchema.parse>
type ReferenceOption = { id: string; slug: string; labelKey: string }

const MISSING_MAP: Record<string, { label: string }> = {
  'profile.fields.pseudonym': { label: 'Ajouter un pseudonyme' },
  'profile.fields.headline': { label: 'Ajouter une phrase d\'accroche' },
  'profile.fields.bio': { label: 'Rédiger une présentation' },
  'profile.fields.field': { label: 'Indiquer votre filière' },
  'profile.fields.cohortYear': { label: 'Indiquer votre promotion' },
  'profile.fields.availability': { label: 'Préciser votre disponibilité' },
  'profile.fields.goals': { label: 'Définir vos objectifs' },
  'profile.fields.sectors': { label: 'Sélectionner des secteurs cibles' },
}

const labelOverrides: Record<string, string> = {
  'demo.field.computing': 'Informatique',
  'demo.field.business': 'Gestion et commerce',
  'demo.field.design': 'Design',
}

function formatReferenceLabel(labelKey: string, slug: string) {
  const knownLabel = labelOverrides[labelKey]
  if (knownLabel) return knownLabel
  if (!labelKey.includes('.')) return labelKey

  const rawLabel = labelKey.split('.').at(-1) || slug
  return rawLabel
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
  if (role === 'OWNER') return 'Porteur'
  if (functionalRole) return functionalRole
  if (role === 'MEMBER') return 'Membre'
  return role || 'Membre'
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6" role="status" aria-label="Chargement du profil">
      <Card className="rounded-xl border border-border bg-card p-6 shadow-2xs">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </div>
      </Card>
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  )
}

function EmptySection({ text, actionLabel, link }: { text: string; actionLabel: string; link: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/70 p-4 text-center">
      <p className="text-xs text-muted-foreground">{text}</p>
      <Button variant="outline" size="sm" asChild className="mt-2.5 h-7 text-xs">
        <Link to={link}>{actionLabel}</Link>
      </Button>
    </div>
  )
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<PrivateProfile | null>(null)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [reminderData, setReminderData] = useState<ReminderData | null>(null)
  const [projects, setProjects] = useState<OwnedProject[]>([])
  const [availableSkills, setAvailableSkills] = useState<ReferenceOption[]>([])
  const [availableSectors, setAvailableSectors] = useState<ReferenceOption[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const [profileRes, onboardingRes, reminderRes, projectsRes, skillsRes, sectorsRes] =
          await Promise.allSettled([
            apiClient.get('/me/profile', privateTalentProfileSchema),
            apiClient.get('/onboarding/status', onboardingStepResponseSchema),
            apiClient.get('/profile/completion-reminder', profileCompletionReminderSchema),
            apiClient.get('/projects/mine', ownedProjectsResponseSchema),
            apiClient.get<{ items: ReferenceOption[] }>('/reference-data/skills'),
            apiClient.get<{ items: ReferenceOption[] }>('/reference-data/sectors'),
          ])

        if (!active) return

        if (profileRes.status === 'fulfilled') {
          setProfileData(profileRes.value)
        } else {
          throw new Error('Impossible de charger votre profil.')
        }

        if (onboardingRes.status === 'fulfilled') {
          setOnboardingData(onboardingRes.value)
        }

        if (reminderRes.status === 'fulfilled') {
          setReminderData(reminderRes.value)
        }

        if (projectsRes.status === 'fulfilled') {
          setProjects(projectsRes.value.projects || [])
        }

        if (skillsRes.status === 'fulfilled') {
          setAvailableSkills(skillsRes.value.items || [])
        }

        if (sectorsRes.status === 'fulfilled') {
          setAvailableSectors(sectorsRes.value.items || [])
        }
      } catch (err: unknown) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la page.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-4 py-8 sm:px-10">
          <ProfileSkeleton />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !profileData) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="font-heading text-xl font-bold text-foreground">Erreur de chargement</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error || 'Le profil demandé est inaccessible.'}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
            <Button size="sm" asChild>
              <Link to="/feed">Retour au Feed</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const { user, identity, profile } = profileData

  const displayName =
    identity?.firstName && identity?.lastName
      ? `${identity.firstName} ${identity.lastName}`
      : profile?.pseudonym || 'Profil Talent'

  const completion = reminderData?.completion ?? profile?.completion ?? 100
  const missingKeys = reminderData?.missingFields ?? []
  const missingItems = missingKeys.map((k) => MISSING_MAP[k] || { label: k })

  const userSkillIds = Array.isArray(onboardingData?.data?.skills) ? (onboardingData.data.skills as string[]) : []
  const userSectorIds = profile?.sectorIds || []

  const userSkills: ReferenceOption[] = availableSkills.filter((s) => userSkillIds.includes(s.id))
  const userSectors: ReferenceOption[] = availableSectors.filter((s) => userSectorIds.includes(s.id))

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {/* Top Bar Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/feed"
              className="group inline-flex h-9 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              Retour au Feed
            </Link>
            <Button
              size="sm"
              asChild
              className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium sm:text-sm"
            >
              <Link to="/onboarding">
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Modifier mon profil
              </Link>
            </Button>
          </div>

          {/* Section 1: Identity Header Card (Sober, Natural, SaaS) */}
          <Card className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <Avatar
                  name={displayName}
                  src={identity?.photoKey}
                  size="lg"
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-border/70 text-xl font-bold shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {displayName}
                    </h1>
                    {profile?.pseudonym && (
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        @{profile.pseudonym}
                      </span>
                    )}
                  </div>

                  {user.email && (
                    <p className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span>{user.email}</span>
                      <span className="text-border">·</span>
                      <span className="text-[11px] text-muted-foreground/80">Privé</span>
                    </p>
                  )}

                  {profile?.headline && (
                    <p className="pt-1 text-sm font-semibold text-foreground leading-snug">
                      {profile.headline}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 pt-1 sm:pt-0">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
                    profile?.visibleInTalentFeed
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'border-muted text-muted-foreground bg-muted/60'
                  }`}
                >
                  {profile?.visibleInTalentFeed ? (
                    <>
                      <Eye className="h-3.5 w-3.5" /> Visible dans l’annuaire
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5" /> Profil masqué
                    </>
                  )}
                </span>
              </div>
            </div>

            {profile?.bio && (
              <div className="mt-5 border-t border-border/50 pt-4">
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            )}
          </Card>

          {/* Section 2: Completion Banner (Subtle & Functional) */}
          {completion < 100 && (
            <section
              className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-2xs sm:p-5"
              aria-label="Progression du profil"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-semibold text-primary">
                    Profil complété à {completion}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ajoutez les informations manquantes pour enrichir votre visibilité auprès des projets et co-fondateurs.
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild className="h-8 shrink-0 text-xs font-semibold shadow-2xs">
                  <Link to="/onboarding">Compléter le profil</Link>
                </Button>
              </div>

              <div className="mt-3">
                <Progress value={completion} className="h-1.5 bg-primary/10 [&>div]:bg-primary" />
              </div>

              {missingItems.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">À renseigner :</span>
                  {missingItems.slice(0, 3).map((item, idx) => (
                    <Link
                      key={idx}
                      to="/onboarding"
                      className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-card px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Section 3: Skills, Sectors & Goals */}
          <Card className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h2 className="font-heading text-base font-bold text-foreground sm:text-lg flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Compétences & Domaines
              </h2>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-muted-foreground hover:text-foreground">
                <Link to="/onboarding">Modifier</Link>
              </Button>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Compétences clés
              </p>
              {userSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userSkills.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary border border-primary/15"
                    >
                      {formatReferenceLabel(skill.labelKey, skill.slug)}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptySection text="Aucune compétence renseignée." actionLabel="Ajouter des compétences" link="/onboarding" />
              )}
            </div>

            {/* Sectors */}
            <div className="space-y-2 border-t border-border/40 pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Secteurs d’intérêt
              </p>
              {userSectors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userSectors.map((sector) => (
                    <span
                      key={sector.id}
                      className="rounded-md bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary border border-secondary/15"
                    >
                      {formatReferenceLabel(sector.labelKey, sector.slug)}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptySection text="Aucun secteur d'intérêt sélectionné." actionLabel="Choisir des secteurs" link="/onboarding" />
              )}
            </div>

            {/* Goals */}
            {profile?.goals && profile.goals.length > 0 && (
              <div className="space-y-2 border-t border-border/40 pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ce que je recherche
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.goals.map((goal) => (
                    <span
                      key={goal}
                      className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground border border-border/60"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Section 4: Parcours & Disponibilité */}
          <Card className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h2 className="font-heading text-base font-bold text-foreground sm:text-lg flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-primary" />
                Parcours académique & Disponibilité
              </h2>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-muted-foreground hover:text-foreground">
                <Link to="/onboarding">Modifier</Link>
              </Button>
            </div>

            <dl className="grid gap-4 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
              <div className="space-y-1">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" /> Filière
                </dt>
                <dd className="text-sm font-semibold text-foreground">
                  {profile?.field ? formatReferenceLabel(profile.field.labelKey, profile.field.slug) : 'Non renseignée'}
                </dd>
              </div>

              <div className="space-y-1 pt-3 sm:pt-0 sm:pl-4">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <UserRound className="h-3.5 w-3.5 text-primary" /> Promotion
                </dt>
                <dd className="text-sm font-semibold text-foreground">
                  {profile?.cohortYear ? `Promotion ${profile.cohortYear}` : 'Non renseignée'}
                </dd>
              </div>

              <div className="space-y-1 pt-3 sm:pt-0 sm:pl-4">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Disponibilité
                </dt>
                <dd className="text-sm font-semibold text-foreground">
                  {profile?.availabilityHours !== null && profile?.availabilityHours !== undefined
                    ? `${profile.availabilityHours} h / semaine`
                    : 'Non renseignée'}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Section 5: Mes Projets */}
          <section className="space-y-4" aria-label="Mes projets">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-primary" />
                <h2 className="font-heading text-base font-bold text-foreground sm:text-lg">
                  Mes projets ({projects.length})
                </h2>
              </div>
              <Button size="sm" asChild variant="outline" className="h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold shadow-2xs">
                <Link to="/projects/new">
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Créer un projet
                </Link>
              </Button>
            </div>

            {projects.length === 0 ? (
              <Card className="rounded-xl border border-dashed border-border/80 bg-card/60 p-8 text-center shadow-2xs">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-3 font-heading text-sm font-bold text-foreground">
                  Aucun projet actif
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
                  Créez votre propre projet ou rejoignez une équipe pour collaborer.
                </p>
                <div className="mt-4">
                  <Button asChild size="sm" className="h-8 text-xs font-semibold shadow-2xs">
                    <Link to="/projects/new">
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Créer un projet
                    </Link>
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {projects.map((project) => {
                  const statusInfo = formatStatus(project.status)
                  const userRoleLabel = formatRole(project.userRole, project.functionalRole)
                  const isOwner = project.userRole === 'OWNER'

                  return (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 shadow-2xs transition-all hover:border-primary/40"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-heading text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-1">
                            {project.title}
                          </h3>
                          <span
                            className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusInfo.className}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {project.pitch || 'Aucun pitch renseigné.'}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
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
                        {project.sector && (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Tag className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">
                              {formatReferenceLabel(project.sector.labelKey, project.sector.slug)}
                            </span>
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>

          {/* Section 6: Confidentialité & Respect de la vie privée */}
          <Card className="rounded-xl border border-border/80 bg-card/60 p-5 shadow-2xs">
            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Protection de l'identité et confidentialité
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Conformément aux principes de confidentialité de CoFound, votre identité civile et votre adresse email restent protégées. Seuls votre pseudonyme, filière et compétences sont partagés dans les espaces publics de mise en relation.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </DashboardLayout>
  )
}
