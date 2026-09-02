import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  UserCheck,
  EyeOff,
  ShieldCheck,
  BriefcaseBusiness,
  Clock,
  MessageSquare,
  AlertCircle,
  Users,
  Search,
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { talentFeedResponseSchema, type TalentFeedCard } from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProjectNavTabs } from '@/components/project/ProjectNavTabs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ReportButton } from '@/components/shared/ReportButton'
import { BlockButton } from '@/components/shared/BlockButton'
import { useProjectDetail } from '@/hooks/useProjectDetail'
import { useI18n } from '@/i18n'

interface ScoredTalent {
  talent: TalentFeedCard
  matchScore: number
  matchingSkills: string[]
  reason: string
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

export default function ProjectSuggestionsPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { t } = useI18n()
  const { project, isLoading: isProjectLoading } = useProjectDetail(id)

  const [talents, setTalents] = useState<ScoredTalent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true

    async function fetchAndScoreTalents() {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.get('/talents/feed?limit=30', talentFeedResponseSchema)
        if (!active) return

        const openPositions = project?.positions.filter((p) => p.isOpen) || []
        const requiredSkillNames = openPositions.flatMap((p) => p.skills.map((s) => s.name.toLowerCase()))

        const scored: ScoredTalent[] = response.items.map((talent) => {
          let score = 65 // Base score for active talent
          const matchingSkills: string[] = []

          // Skill overlap
          if (talent.skills && talent.skills.length > 0) {
            talent.skills.forEach((skill) => {
              const skillName = skill.labelKey.toLowerCase()
              const isMatch = requiredSkillNames.some((req) => req.includes(skillName) || skillName.includes(req))
              if (isMatch) {
                matchingSkills.push(skill.labelKey)
                score += 15
              }
            })
          }

          // Availability bonus
          if (talent.availabilityHours && talent.availabilityHours >= 10) {
            score += 10
          }

          // Cap score at 98%
          const finalScore = Math.min(score, 98)

          let reason = 'Compétences et disponibilité adaptées'
          if (matchingSkills.length > 0) {
            reason = `Correspond à ${matchingSkills.length} compétence${matchingSkills.length > 1 ? 's' : ''} recherchée${matchingSkills.length > 1 ? 's' : ''}`
          }

          return {
            talent,
            matchScore: finalScore,
            matchingSkills,
            reason,
          }
        })

        // Sort descending by match score
        scored.sort((a, b) => b.matchScore - a.matchScore)

        setTalents(scored)
      } catch {
        if (!active) return
        setError('Impossible de charger les suggestions de coéquipiers pour ce projet.')
      } finally {
        if (active) setLoading(false)
      }
    }

    if (project) {
      void fetchAndScoreTalents()
    }

    return () => {
      active = false
    }
  }, [project])

  const filteredTalents = useMemo(() => {
    if (!search.trim()) return talents
    const q = search.toLowerCase()
    return talents.filter(({ talent }) => {
      const headline = talent.headline?.toLowerCase() || ''
      const field = talent.field?.labelKey.toLowerCase() || ''
      const skills = talent.skills.map((s) => s.labelKey.toLowerCase()).join(' ')
      return headline.includes(q) || field.includes(q) || skills.includes(q)
    })
  }, [talents, search])

  return (
    <DashboardLayout>
      <ProjectNavTabs projectId={id} />

      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <Link
                to={`/projects/${id}`}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Retour au projet
              </Link>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  <UserCheck className="h-4 w-4" />
                </span>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Suggestions de coéquipiers
                </h1>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Découvrez des talents pseudonymisés dont les compétences et disponibilités correspondent aux besoins de votre projet.
              </p>
            </div>
          </div>

          {/* Search bar */}
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer par compétence, domaine ou mots-clés…"
              className="pl-9 text-xs sm:text-sm"
              aria-label="Filtrer les suggestions de talents"
            />
          </label>

          {/* Anonymity Banner */}
          <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-2xs text-xs sm:text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>
              La plateforme garantit la protection de l'identité des talents. Les profils sont anonymisés jusqu'à l'acceptation mutuelle d'une mise en relation ou d'une candidature.
            </span>
          </div>

          {(loading || isProjectLoading) && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-6 h-56 animate-pulse bg-muted/20 border-border/80" />
              <Card className="p-6 h-56 animate-pulse bg-muted/20 border-border/80" />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && filteredTalents.length === 0 && (
            <Card className="rounded-xl border border-dashed border-border/80 bg-card p-12 text-center text-muted-foreground">
              <Users className="mx-auto mb-3 h-8 w-8 text-primary/60" />
              <p className="font-semibold text-foreground">Aucun profil correspondant pour le moment</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Définissez des postes ouverts avec des compétences requises dans l'onglet Équipe pour affiner les suggestions automatiques.
              </p>
              <div className="pt-4">
                <Button size="sm" asChild className="h-8 text-xs font-semibold">
                  <Link to={`/projects/${id}/team`}>Gérer les postes de l'équipe</Link>
                </Button>
              </div>
            </Card>
          )}

          {!loading && !error && filteredTalents.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              {filteredTalents.map(({ talent, matchScore, matchingSkills, reason }) => {
                const categoryLabel = talent.field
                  ? formatReferenceLabel(talent.field.labelKey, talent.field.slug)
                  : '—'
                const availabilityLabel = talent.availabilityHours
                  ? `${talent.availabilityHours}h/sem`
                  : null

                return (
                  <article
                    key={talent.id}
                    className="group flex min-w-0 flex-col justify-between gap-4 overflow-hidden rounded-xl border border-border bg-card p-5 shadow-2xs transition-all duration-150 hover:border-primary/40 sm:p-6"
                  >
                    <div className="space-y-3.5">
                      {/* Header: Anonymous avatar + Pseudonym label + Match Badge */}
                      <header className="flex min-w-0 items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted text-muted-foreground"
                            aria-hidden="true"
                          >
                            <EyeOff className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col">
                            <h3 className="truncate text-base font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                              {t('common.anonymous')}
                            </h3>
                            <span className="mt-1 flex min-w-0 items-center gap-1 text-[11px] font-medium text-muted-foreground">
                              <ShieldCheck className="h-3 w-3 text-primary shrink-0" />
                              <span>{t('common.identityProtected')}</span>
                            </span>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {matchScore}% match
                        </span>
                      </header>

                      {/* Headline */}
                      {talent.headline && (
                        <p className="text-sm font-semibold leading-relaxed text-foreground">
                          {talent.headline}
                        </p>
                      )}

                      {/* Reason */}
                      <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-2 border border-border/40">
                        {reason}
                      </p>

                      {/* Category & Skills */}
                      <div className="space-y-2 border-t border-border/50 pt-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                            <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />
                            {t('common.category')}:
                          </span>
                          <span className="rounded-md bg-muted px-2.5 py-0.5 font-medium text-foreground">
                            {categoryLabel}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-xs font-semibold text-muted-foreground mr-1">
                            {t('common.skills')}:
                          </span>
                          {matchingSkills.length > 0 ? (
                            matchingSkills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-medium text-primary"
                              >
                                {skill}
                              </span>
                            ))
                          ) : talent.skills.length > 0 ? (
                            talent.skills.slice(0, 4).map((skill) => (
                              <span
                                key={skill.id}
                                className="rounded-md bg-muted border border-border/60 px-2 py-0.5 text-xs font-medium text-muted-foreground"
                              >
                                {formatReferenceLabel(skill.labelKey, skill.slug)}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </div>

                      {/* Goals / Objectives */}
                      {talent.goals.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {talent.goals.slice(0, 2).map((goal) => (
                            <span
                              key={goal}
                              className="rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                            >
                              {goal}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3 text-xs">
                      {availabilityLabel ? (
                        <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 opacity-70" />
                          {t('common.availability')}: {availabilityLabel}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Disponibilité flexible</span>
                      )}

                      <div className="flex flex-wrap items-center gap-1.5">
                        <ReportButton targetType="PROFILE" targetId={talent.id} />
                        <BlockButton userId={talent.id} />
                        <Button
                          size="sm"
                          asChild
                          className="h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold"
                        >
                          <Link to="/feed">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>{t('common.proposeExchange')}</span>
                          </Link>
                        </Button>
                      </div>
                    </footer>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}
