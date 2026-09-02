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
  Target,
  Compass,
  CheckCircle2,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  'profile.fields.headline': { label: 'Ajouter une phrase d’accroche' },
  'profile.fields.bio': { label: 'Rédiger une présentation' },
  'profile.fields.field': { label: 'Indiquer votre filière' },
  'profile.fields.cohortYear': { label: 'Indiquer votre promotion' },
  'profile.fields.availability': { label: 'Préciser votre disponibilité' },
  'profile.fields.goals': { label: 'Définir vos objectifs' },
  'profile.fields.sectors': { label: 'Sélectionner des secteurs cibles' },
}

const labelOverrides: Record<string, string> = {
  'demo.field.computing': 'Informatique & Tech',
  'demo.field.business': 'Gestion & Commerce',
  'demo.field.design': 'Design & UX',
  'field.computer-science': 'Informatique',
  'field.management': 'Gestion & Économie',
  'field.engineering': 'Ingénierie',
  'field.agriculture': 'Agriculture & AgriTech',
}

function formatReferenceLabel(labelKey: string, slug: string) {
  const knownLabel = labelOverrides[labelKey] || labelOverrides[slug]
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
      return { label: 'Actif', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' }
    case ProjectStatus.PAUSED:
    case 'PAUSED':
      return { label: 'En pause', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' }
    case ProjectStatus.ARCHIVED:
    case 'ARCHIVED':
      return { label: 'Archivé', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' }
    default:
      return { label: status, className: 'bg-muted text-muted-foreground border-border' }
  }
}

function formatRole(role: string | undefined, functionalRole: string | null | undefined) {
  if (role === 'OWNER') return 'Fondateur'
  if (functionalRole) return functionalRole
  if (role === 'MEMBER') return 'Co-équipier'
  return role || 'Membre'
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6" role="status" aria-label="Chargement du profil">
      <Card className="rounded-xl border border-border bg-card p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Skeleton className="h-20 w-20 rounded-xl" />
          <div className="flex-1 space-y-3 w-full">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
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

  const fieldLabel = profile?.field
    ? formatReferenceLabel(profile.field.labelKey, profile.field.slug)
    : null

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">

          {/* Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/feed"
              className="group inline-flex h-9 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              Retour au Feed
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-semibold shadow-2xs"
              >
                <Link to="/settings">
                  Paramètres
                </Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="h-9 gap-1.5 rounded-lg px-4 text-xs font-semibold shadow-2xs"
              >
                <Link to="/onboarding">
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Modifier le profil
                </Link>
              </Button>
            </div>
          </div>

          {/* USER INFO HEADER (Minimalist & Clean Card) */}
          <Card className="rounded-xl border border-border bg-card p-6 sm:p-7 shadow-2xs">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                <div className="flex items-start gap-4 sm:gap-5">
                  <Avatar
                    name={displayName}
                    src={identity?.photoKey}
                    size="lg"
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl border border-border text-2xl font-bold shrink-0 bg-muted"
                  />
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        {displayName}
                      </h1>
                      {profile?.pseudonym && (
                        <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                          @{profile.pseudonym}
                        </span>
                      )}
                    </div>

                    {profile?.headline && (
                      <p className="text-base font-semibold text-foreground leading-relaxed">
                        {profile.headline}
                      </p>
                    )}

                    {user.email && (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground pt-0.5">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                        <span className="text-border">·</span>
                        <span className="text-xs font-medium text-muted-foreground/80">Privé</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex shrink-0 items-center">
                  <span
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                      profile?.visibleInTalentFeed
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'border-border bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    {profile?.visibleInTalentFeed ? (
                      <>
                        <Eye className="h-4 w-4" /> Profil visible dans l’annuaire
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4" /> Profil masqué
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Badges / Key Details */}
              <div className="flex flex-wrap items-center gap-2.5 border-t border-border/60 pt-4 text-xs sm:text-sm">
                {fieldLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 font-semibold text-primary">
                    <GraduationCap className="h-4 w-4" />
                    {fieldLabel}
                  </span>
                )}
                {profile?.cohortYear && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-3 py-1.5 font-medium text-foreground">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    Promotion {profile.cohortYear}
                  </span>
                )}
                {profile?.availabilityHours !== null && profile?.availabilityHours !== undefined && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-3 py-1.5 font-medium text-foreground">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {profile.availabilityHours} h / semaine
                  </span>
                )}
              </div>

              {/* Bio description */}
              {profile?.bio && (
                <div className="border-t border-border/50 pt-4">
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground whitespace-pre-wrap max-w-3xl">
                    {profile.bio}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* TWO-COLUMN CONTENT GRID */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] items-start">

            {/* ── LEFT COLUMN: Projects & Collaboration ── */}
            <div className="space-y-6">

              {/* Projects Card */}
              <Card className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 p-5 sm:p-6">
                  <div className="flex items-center gap-2.5">
                    <FolderGit2 className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="font-heading text-base sm:text-lg font-bold text-foreground">
                        Mes Projets ({projects.length})
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Projets créés ou rejoints sur CoFound.
                      </CardDescription>
                    </div>
                  </div>
                  <Button size="sm" asChild variant="outline" className="h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold shadow-2xs">
                    <Link to="/projects/new">
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      Nouveau
                    </Link>
                  </Button>
                </CardHeader>

                <CardContent className="p-5 sm:p-6">
                  {projects.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <BriefcaseBusiness className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h3 className="mt-3 font-heading text-base font-bold text-foreground">
                        Aucun projet actif
                      </h3>
                      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground leading-relaxed">
                        Lancez votre première initiative entrepreneuriale ou candidatez à un projet ouvert.
                      </p>
                      <div className="mt-4 flex justify-center gap-2">
                        <Button asChild size="sm" className="h-9 text-xs font-semibold shadow-2xs">
                          <Link to="/projects/new">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Créer un projet
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="h-9 text-xs font-semibold">
                          <Link to="/projects">
                            Explorer les projets
                          </Link>
                        </Button>
                      </div>
                    </div>
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
                            className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-heading text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-1">
                                  {project.title}
                                </h3>
                                <span
                                  className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-semibold ${statusInfo.className}`}
                                >
                                  {statusInfo.label}
                                </span>
                              </div>
                              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                                {project.pitch || 'Aucun pitch renseigné.'}
                              </p>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
                              {isOwner ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                  <Shield className="h-3.5 w-3.5" />
                                  {userRoleLabel}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                                  <Users className="h-3.5 w-3.5" />
                                  {userRoleLabel}
                                </span>
                              )}
                              {project.sector && (
                                <span className="inline-flex items-center gap-1 text-muted-foreground truncate max-w-[140px]">
                                  <Tag className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">
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
                </CardContent>
              </Card>

              {/* Parcours Entrepreneurial */}
              {projects.length > 0 && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6 shadow-2xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                        <Compass className="h-4 w-4" /> Parcours Création CoFound
                      </div>
                      <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">
                        Pilotez votre entreprise étape par étape
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                        Design Thinking, Business Model Canvas, Modélisation Financière et Pitch Deck.
                      </p>
                    </div>
                    <Button asChild size="sm" className="h-9 shrink-0 gap-1.5 rounded-lg text-xs font-semibold shadow-xs">
                      <Link to={`/projects/${projects[0]?.id}/journey`}>
                        Accéder aux outils
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Confidentiality Notice */}
              <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-heading text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Protection des données & Confidentialité
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                      Conformément aux principes de confidentialité de CoFound, votre identité civile complète et votre email ne sont jamais exposés publiquement. Seuls votre pseudonyme, filière et compétences sont visibles dans les espaces d’échanges.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* ── RIGHT SIDEBAR: Completion, Skills, Sectors, Goals ── */}
            <div className="space-y-6 lg:sticky lg:top-[90px]">

              {/* Profile Completion Card */}
              <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-base font-bold text-foreground">
                    Complétion du profil
                  </h2>
                  <span className="font-heading text-base font-bold text-primary">
                    {completion}%
                  </span>
                </div>

                <Progress value={completion} className="h-2 bg-primary/10 [&>div]:bg-primary" />

                {completion < 100 ? (
                  <div className="space-y-3 pt-1">
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Complétez votre profil pour enrichir vos opportunités de mise en relation.
                    </p>
                    {missingItems.length > 0 && (
                      <div className="space-y-2">
                        {missingItems.slice(0, 3).map((item, idx) => (
                          <Link
                            key={idx}
                            to="/onboarding"
                            className="group flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                          >
                            <span>{item.label}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        ))}
                      </div>
                    )}
                    <Button asChild size="sm" variant="outline" className="w-full text-xs font-semibold h-9 mt-1">
                      <Link to="/onboarding">Compléter mes informations</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 pt-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Profil complet à 100%
                  </div>
                )}
              </Card>

              {/* Skills */}
              <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <h2 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Compétences clés
                  </h2>
                  <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-muted-foreground hover:text-foreground px-2">
                    <Link to="/onboarding">Modifier</Link>
                  </Button>
                </div>

                {userSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userSkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-md bg-primary/10 px-3 py-1 text-xs sm:text-sm font-medium text-primary border border-primary/15"
                      >
                        {formatReferenceLabel(skill.labelKey, skill.slug)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground italic">
                    Aucune compétence renseignée.
                  </p>
                )}
              </Card>

              {/* Sectors */}
              <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <h2 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Secteurs d’intérêt
                  </h2>
                  <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-muted-foreground hover:text-foreground px-2">
                    <Link to="/onboarding">Modifier</Link>
                  </Button>
                </div>

                {userSectors.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userSectors.map((sector) => (
                      <span
                        key={sector.id}
                        className="rounded-md bg-muted px-3 py-1 text-xs sm:text-sm font-medium text-foreground border border-border"
                      >
                        {formatReferenceLabel(sector.labelKey, sector.slug)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground italic">
                    Aucun secteur d’intérêt sélectionné.
                  </p>
                )}
              </Card>

              {/* Goals */}
              {profile?.goals && profile.goals.length > 0 && (
                <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <h2 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                      <Compass className="h-4 w-4 text-primary" />
                      Objectifs & Recherche
                    </h2>
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-muted-foreground hover:text-foreground px-2">
                      <Link to="/onboarding">Modifier</Link>
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {profile.goals.map((goal) => (
                      <span
                        key={goal}
                        className="rounded-md bg-muted px-3 py-1 text-xs sm:text-sm font-medium text-foreground border border-border"
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}

