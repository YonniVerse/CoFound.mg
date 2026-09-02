import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BriefcaseBusiness,
  Clock,
  EyeOff,
  Mail,
  Pencil,
  Plus,
  Rocket,
  ShieldCheck,
  UserRound,
  Users,
  Target,
  Sparkles,
  Lock,
  Eye,
  ChevronRight,
  Shield,
  Tag,
  AlertCircle
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  'profile.fields.field': { label: 'Indiquer ta filière' },
  'profile.fields.cohortYear': { label: 'Indiquer ton année de promotion' },
  'profile.fields.availability': { label: 'Préciser ta disponibilité' },
  'profile.fields.goals': { label: 'Définir tes objectifs' },
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
  if (role === 'OWNER') return 'Propriétaire'
  if (functionalRole) return functionalRole
  if (role === 'MEMBER') return 'Membre'
  return role || 'Membre'
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full space-y-6" role="status" aria-label="Chargement du profil">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-64 w-full rounded-2xl md:col-span-2" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  )
}

function EmptyState({ text, link }: { text: string; link: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-5 text-center">
      <p className="text-xs text-muted-foreground mb-3">{text}</p>
      <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold shadow-xs">
        <Link to={link}>Ajouter</Link>
      </Button>
    </div>
  )
}

export default function ProfilePage() {
  const [data, setData] = useState<PrivateProfile | null>(null)
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null)
  const [reminder, setReminder] = useState<ReminderData | null>(null)
  const [projects, setProjects] = useState<OwnedProject[]>([])
  const [skillsDict, setSkillsDict] = useState<Record<string, ReferenceOption>>({})
  const [sectorsDict, setSectorsDict] = useState<Record<string, ReferenceOption>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    const fetchData = async () => {
      try {
        const [
          profileRes,
          onboardingRes,
          reminderRes,
          projectsRes,
          skillsRes,
          sectorsRes
        ] = await Promise.allSettled([
          apiClient.get('/me/profile', privateTalentProfileSchema),
          apiClient.get('/me/onboarding', onboardingStepResponseSchema),
          apiClient.get('/me/profile/completion-reminder', profileCompletionReminderSchema),
          apiClient.get('/projects/mine', ownedProjectsResponseSchema),
          apiClient.get<{ items: ReferenceOption[] }>('/reference-data/skills'),
          apiClient.get<{ items: ReferenceOption[] }>('/reference-data/sectors'),
        ])

        if (!active) return

        if (profileRes.status === 'fulfilled') setData(profileRes.value)
        else throw new Error('Failed to load profile')

        if (onboardingRes.status === 'fulfilled') setOnboarding(onboardingRes.value)
        if (reminderRes.status === 'fulfilled') setReminder(reminderRes.value)
        if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value.projects)
        
        if (skillsRes.status === 'fulfilled') {
          const dict: Record<string, ReferenceOption> = {}
          skillsRes.value.items.forEach(s => dict[s.id] = s)
          setSkillsDict(dict)
        }
        
        if (sectorsRes.status === 'fulfilled') {
          const dict: Record<string, ReferenceOption> = {}
          sectorsRes.value.items.forEach(s => dict[s.id] = s)
          setSectorsDict(dict)
        }
      } catch (err) {
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    }
    void fetchData()
    return () => { active = false }
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
          <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
            <ProfileSkeleton />
          </div>
        </main>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
          <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
            <Card className="rounded-xl border-border bg-card shadow-2xs">
              <CardContent className="p-10 text-center flex flex-col items-center">
                <AlertCircle className="h-8 w-8 text-destructive mb-3" />
                <p className="font-semibold text-foreground">Impossible de charger ton profil.</p>
                <p className="mt-2 text-sm text-muted-foreground">Veuillez réessayer dans quelques instants.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </DashboardLayout>
    )
  }

  const { profile, identity, user } = data
  const identityName = [identity?.firstName, identity?.lastName].filter(Boolean).join(' ').trim()
  const displayName = identityName || profile?.pseudonym || user.email || 'Mon profil'

  // Completion logic
  const completion = reminder?.completion ?? profile?.completion ?? 0
  const missingItems = (reminder?.missingFields.map(field => MISSING_MAP[field]).filter(Boolean) || []) as { label: string }[]
  if (onboarding && Array.isArray(onboarding.data?.skillIds) && onboarding.data.skillIds.length === 0) {
    missingItems.unshift({ label: 'Ajouter tes compétences' })
  }

  // Enriched Skills & Sectors
  const skillIds = (onboarding?.data?.skillIds as string[]) || []
  const userSkills = skillIds.map(id => skillsDict[id]).filter(Boolean) as ReferenceOption[]
  const sectorIds = (onboarding?.data?.sectorIds as string[]) || []
  const userSectors = sectorIds.map(id => sectorsDict[id]).filter(Boolean) as ReferenceOption[]

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
          
          {/* TOP BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/feed"
              className="group inline-flex h-9 w-fit shrink-0 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              Retour au Feed
            </Link>
            <Button size="sm" asChild className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium sm:text-sm shadow-xs">
              <Link to="/onboarding">
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Modifier le profil
              </Link>
            </Button>
          </div>

          {/* COMPLETION BANNER */}
          {completion < 100 && (
            <Card className="rounded-2xl border-primary/20 bg-primary/5 shadow-2xs overflow-hidden">
              <CardContent className="p-5 flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-primary text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Complète ton profil pour plus de visibilité
                    </h3>
                    <span className="text-xs font-bold text-primary">{completion}%</span>
                  </div>
                  <Progress value={completion} className="h-2 bg-primary/10 [&>div]:bg-primary" />
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Un profil détaillé a considérablement plus de chances d'attirer l'attention des porteurs de projets et des co-fondateurs.
                  </p>
                </div>
                
                {missingItems.length > 0 && (
                  <div className="shrink-0 w-full lg:w-auto flex flex-col gap-2">
                    {missingItems.slice(0, 3).map((item, i) => (
                      <Link 
                        key={i} 
                        to="/onboarding" 
                        className="group flex items-center gap-2.5 text-xs font-medium text-foreground bg-card border border-border/80 px-3 py-2 rounded-lg hover:border-primary/40 hover:text-primary transition-all shadow-2xs hover:shadow-xs"
                      >
                        <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40 shrink-0 transition-colors group-hover:border-primary/40" />
                        {item.label}
                        <ChevronRight className="h-3.5 w-3.5 ml-auto text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* LEVEL 1: HEADER */}
          <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-2xs">
            <div className="h-28 bg-linear-to-r from-primary/10 via-impact/10 to-secondary/10" />
            <CardContent className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end -mt-10 sm:-mt-14 mb-5">
                <Avatar 
                  name={displayName} 
                  src={identity?.photoKey} 
                  size="lg" 
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-card shadow-sm text-3xl"
                />
                <div className="flex-1 min-w-0 pb-1">
                  <h1 className="text-2xl font-heading font-bold text-foreground truncate">
                    {displayName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {profile?.pseudonym && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <UserRound className="h-4 w-4 shrink-0" />
                        {profile.pseudonym}
                      </span>
                    )}
                    {user.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4 shrink-0" />
                        {user.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {profile?.headline ? (
                <div className="text-base font-semibold text-foreground leading-relaxed">
                  {profile.headline}
                </div>
              ) : (
                <EmptyState text="Aucune phrase d'accroche" link="/onboarding" />
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* LEFT COLUMN: Main Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* ABOUT */}
              <Card className="rounded-2xl border-border bg-card shadow-2xs">
                <CardHeader className="border-b border-border/50 px-6 py-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <UserRound className="h-5 w-5 text-primary" />
                    À propos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {profile?.bio ? (
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {profile.bio}
                    </p>
                  ) : (
                    <EmptyState text="Rédigez une courte présentation pour vous démarquer." link="/onboarding" />
                  )}
                </CardContent>
              </Card>

              {/* SKILLS & GOALS */}
              <Card className="rounded-2xl border-border bg-card shadow-2xs">
                <CardHeader className="border-b border-border/50 px-6 py-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Target className="h-5 w-5 text-impact" />
                    Compétences & Objectifs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compétences clés</h4>
                    {userSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {userSkills.map(skill => (
                          <span key={skill.id} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary border border-primary/20">
                            {formatReferenceLabel(skill.labelKey, skill.slug)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <EmptyState text="Quelles sont vos forces ?" link="/onboarding" />
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Secteurs cibles</h4>
                    {userSectors.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {userSectors.map(sector => (
                          <span key={sector.id} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary/10 text-secondary border border-secondary/20">
                            {formatReferenceLabel(sector.labelKey, sector.slug)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <EmptyState text="Quels domaines vous intéressent ?" link="/onboarding" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ce que je recherche</h4>
                    {profile?.goals && profile.goals.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.goals.map(goal => (
                          <span key={goal} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-muted text-foreground border border-border/60 shadow-2xs">
                            {goal}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <EmptyState text="Quels sont vos objectifs sur CoFound ?" link="/onboarding" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* PROJECTS */}
              <Card className="rounded-2xl border-border bg-card shadow-2xs">
                <CardHeader className="border-b border-border/50 px-6 py-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-secondary" />
                    Mes projets
                  </CardTitle>
                  <Button size="sm" asChild variant="outline" className="h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold">
                    <Link to="/projects/new">
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      Créer
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  {projects.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <BriefcaseBusiness className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h3 className="mt-4 font-heading text-sm font-bold text-foreground">
                        Vous n'avez encore aucun projet
                      </h3>
                      <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
                        Lancez une nouvelle idée entrepreneuriale, assemblez votre équipe et construisez votre entreprise pas à pas.
                      </p>
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
                            className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-heading text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-1">
                                  {project.title}
                                </h3>
                                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusInfo.className}`}>
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
                                <span className="inline-flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  <span className="truncate max-w-[100px]">{formatReferenceLabel(project.sector.labelKey, project.sector.slug)}</span>
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
            </div>

            {/* RIGHT COLUMN: Metadata & Privacy */}
            <div className="space-y-6">
              
              {/* DETAILS */}
              <Card className="rounded-2xl border-border bg-card shadow-2xs">
                <CardHeader className="border-b border-border/50 px-5 py-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <BriefcaseBusiness className="h-5 w-5 text-muted-foreground" />
                    Parcours & Dispo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <dl className="divide-y divide-border/50">
                    <div className="px-5 py-4 space-y-1">
                      <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filière</dt>
                      <dd className="text-sm font-medium text-foreground">
                        {profile?.field ? formatReferenceLabel(profile.field.labelKey, profile.field.slug) : <span className="text-muted-foreground italic">Non renseignée</span>}
                      </dd>
                    </div>
                    <div className="px-5 py-4 space-y-1">
                      <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Promotion</dt>
                      <dd className="text-sm font-medium text-foreground">
                        {profile?.cohortYear ? profile.cohortYear : <span className="text-muted-foreground italic">Non renseignée</span>}
                      </dd>
                    </div>
                    <div className="px-5 py-4 space-y-1">
                      <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Disponibilité</dt>
                      <dd className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" />
                        {profile?.availabilityHours !== null && profile?.availabilityHours !== undefined 
                          ? `${profile.availabilityHours}h / semaine` 
                          : <span className="text-muted-foreground italic">Non renseignée</span>}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* PRIVACY */}
              <Card className="rounded-2xl border-border bg-card shadow-2xs">
                <CardHeader className="border-b border-border/50 px-5 py-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    Confidentialité
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-5 space-y-5">
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Lock className="h-4 w-4 text-muted-foreground" /> Identité protégée
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Ton adresse email, ton vrai nom et tes coordonnées sont strictement privés. Seuls ton pseudonyme et les infos publiques sont visibles.
                    </p>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t border-border/50">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      {profile?.visibleInTalentFeed ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />} 
                      Visibilité du profil
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {profile?.visibleInTalentFeed 
                        ? "Ton profil est publiquement visible et peut être découvert par les autres membres."
                        : "Ton profil est actuellement masqué de l'annuaire public."}
                    </p>
                    <div className="pt-2">
                       <Button variant="outline" size="sm" asChild className="h-8 w-full text-xs shadow-xs">
                         <Link to="/onboarding">Modifier la visibilité</Link>
                       </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
