import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  UserCheck,
  Clock,
  ArrowRight,
  Send,
  AlertCircle,
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { talentFeedResponseSchema, type TalentFeedCard } from '@cofound/shared'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/shared/Avatar'
import type { ProjectDetail } from '@/data/projectTypes'

interface ProjectMatchingSuggestionsProps {
  project: ProjectDetail
}

interface ScoredTalent {
  talent: TalentFeedCard
  matchScore: number
  matchingSkills: string[]
  reason: string
}

export function ProjectMatchingSuggestions({ project }: ProjectMatchingSuggestionsProps) {
  const [talents, setTalents] = useState<ScoredTalent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function fetchAndScoreTalents() {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.get('/talents/feed?limit=20', talentFeedResponseSchema)
        if (!active) return

        const openPositions = project.positions.filter((p) => p.isOpen)
        const requiredSkillNames = openPositions.flatMap((p) => p.skills.map((s) => s.name.toLowerCase()))

        const scored: ScoredTalent[] = response.items.map((talent) => {
          let score = 60 // Base score for active talent
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

        setTalents(scored.slice(0, 4))
      } catch (err) {
        if (!active) return
        setError('Impossible de charger les suggestions de coéquipiers pour ce projet.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void fetchAndScoreTalents()

    return () => {
      active = false
    }
  }, [project])

  return (
    <Card className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <UserCheck className="h-4 w-4" />
            </span>
            <h2 className="font-heading text-base font-bold text-foreground sm:text-lg">
              Suggestions de coéquipiers correspondants
            </h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Talents dont le profil et les compétences répondent aux besoins de votre projet.
          </p>
        </div>

        <Button variant="outline" size="sm" asChild className="h-8 shrink-0 text-xs font-semibold gap-1.5 rounded-lg shadow-2xs">
          <Link to="/feed">
            <span>Explorer l'annuaire des talents</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {loading && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-32 rounded-lg border border-border bg-muted/20 animate-pulse" />
          <div className="h-32 rounded-lg border border-border bg-muted/20 animate-pulse" />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && talents.length === 0 && (
        <div className="rounded-lg border border-dashed border-border/70 p-6 text-center space-y-2">
          <Users className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="text-xs font-semibold text-foreground">Aucune suggestion disponible pour le moment</p>
          <p className="text-xs text-muted-foreground">
            Définissez des postes ouverts avec des compétences précises pour activer le matching automatique.
          </p>
          <div className="pt-2">
            <Button size="sm" asChild className="h-8 text-xs font-semibold">
              <Link to={`/projects/${project.id}/team`}>Gérer les postes ouverts</Link>
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && talents.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {talents.map(({ talent, matchScore, matchingSkills, reason }) => (
            <div
              key={talent.id}
              className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 shadow-2xs transition-all hover:border-primary/40 space-y-3"
            >
              {/* Header: Avatar + Pseudonym + Match Score badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    name={talent.pseudonym}
                    size="md"
                    className="h-10 w-10 shrink-0 rounded-full border border-border/70"
                  />
                  <div className="min-w-0">
                    <h3 className="font-heading text-sm font-bold text-foreground truncate">
                      @{talent.pseudonym}
                    </h3>
                    {talent.headline && (
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {talent.headline}
                      </p>
                    )}
                  </div>
                </div>

                <span className="shrink-0 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {matchScore}% match
                </span>
              </div>

              {/* Match Reason & Skills */}
              <div className="space-y-2 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  {reason}
                </p>

                {matchingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {matchingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-primary/10 border border-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : talent.skills && talent.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {talent.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/60"
                      >
                        {skill.labelKey}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Footer: Availability & Action */}
              <div className="flex items-center justify-between border-t border-border/50 pt-3 text-[11px]">
                {talent.availabilityHours ? (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3 text-primary" />
                    <span>{talent.availabilityHours} h / sem</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">Disponibilité flexible</span>
                )}

                <Button
                  size="sm"
                  asChild
                  className="h-7 text-xs font-semibold gap-1 rounded-md px-2.5"
                >
                  <Link to="/feed">
                    <Send className="h-3 w-3" />
                    <span>Contacter</span>
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
