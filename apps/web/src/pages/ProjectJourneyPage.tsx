import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Compass,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Lightbulb,
  LayoutGrid,
  FileText,
  Calculator,
  Mic,
  Info,
} from 'lucide-react'
import {
  projectJourneyResponseSchema,
  type ProjectJourneyResponse,
} from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProjectNavTabs } from '@/components/project/ProjectNavTabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'

export default function ProjectJourneyPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [journey, setJourney] = useState<ProjectJourneyResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    apiClient
      .get(`/projects/${id}/journey`, projectJourneyResponseSchema)
      .then((data) => {
        if (active) {
          setJourney(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setError('Impossible de charger le parcours du projet.')
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [id])

  async function handleSyncAll() {
    try {
      setSyncing(true)
      setSyncMessage(null)
      const res = await apiClient.post<{ success: boolean; message: string }>(`/projects/${id}/journey/sync`, {
        sourceTool: 'ALL',
        targetTool: 'ALL',
        overwriteCustomFields: false,
      })
      setSyncMessage(res.message || 'Données synchronisées entre tous les outils.')
      // Refresh journey
      const updated = await apiClient.get(`/projects/${id}/journey`, projectJourneyResponseSchema)
      setJourney(updated)
    } catch {
      setSyncMessage('Erreur lors de la synchronisation.')
    } finally {
      setSyncing(false)
    }
  }

  const stageIcons: Record<string, typeof Lightbulb> = {
    idea: Compass,
    problem_defined: Lightbulb,
    solution_designed: Sparkles,
    solution_tested: CheckCircle2,
    business_model_structured: LayoutGrid,
    business_plan_written: FileText,
    financial_viability_analyzed: Calculator,
    pitch_ready: Mic,
  }

  return (
    <DashboardLayout>
      <ProjectNavTabs projectId={id} />

      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
          {/* Header */}
          <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                  <Compass className="h-3.5 w-3.5" />
                  Parcours Entrepreneurial
                </span>
                <span className="text-xs text-muted-foreground">Méthodologies IDEO & Strategyzer</span>
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Construire mon entreprise
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Passez pas à pas de l’idée au problème validé, modèle économique, business plan, projections financières et pitch prêt pour les investisseurs.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSyncAll}
                disabled={syncing}
                className="gap-2 text-xs font-semibold shadow-2xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Synchronisation…' : 'Faire circuler les données'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </div>
          </header>

          {syncMessage && (
            <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>{syncMessage}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSyncMessage(null)} className="h-7 text-xs">
                Fermer
              </Button>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading && !journey && (
            <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
              <RefreshCw className="mr-2 h-5 w-5 animate-spin text-primary" />
              Calcul de la maturité du projet…
            </div>
          )}

          {journey && (
            <>
              {/* HERO: MATURITY SCORE & DIAGNOSTIC CARD */}
              <section className="grid gap-6 lg:grid-cols-3" aria-label="Score de maturité">
                {/* Score Card */}
                <Card className="rounded-2xl border-border bg-card shadow-2xs lg:col-span-1">
                  <CardHeader className="pb-4">
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Indicateur interne CoFound
                    </CardDescription>
                    <CardTitle className="text-xl font-bold">Score de maturité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="font-heading text-5xl font-black tracking-tight text-primary">
                          {journey.overallScore}%
                        </span>
                        <span className="mt-1 text-xs font-semibold text-muted-foreground">
                          {journey.completedStagesCount} sur 8 étapes validées
                        </span>
                      </div>
                      <div className="h-20 w-20 shrink-0">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-muted/40"
                            strokeWidth="3.8"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-primary transition-[stroke-dasharray] duration-700 ease-out"
                            strokeDasharray={`${journey.overallScore}, 100`}
                            strokeWidth="3.8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 text-xs text-muted-foreground leading-relaxed">
                      <div className="flex items-start gap-2">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>
                          Ce score mesure l’avancement méthodologique interne sur CoFound. Il valorise la rigueur des tests terrain et la cohérence économique.
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Diagnostics: Strengths & Weaknesses */}
                <Card className="rounded-2xl border-border bg-card shadow-2xs lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold">Diagnostic & Prochaines actions</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Synthèse des points forts et des priorités pour faire avancer le projet
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Points forts */}
                      <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          Points forts validés ({journey.strengths.length})
                        </p>
                        <ul className="space-y-1.5 text-xs text-foreground/90">
                          {journey.strengths.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 leading-snug">
                              <span className="text-emerald-500">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Points de vigilance */}
                      <div className="space-y-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-4 w-4" />
                          Points de vigilance ({journey.weaknesses.length})
                        </p>
                        <ul className="space-y-1.5 text-xs text-foreground/90">
                          {journey.weaknesses.map((w, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 leading-snug">
                              <span className="text-amber-500">•</span>
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Actions prioritaires */}
                    {journey.recommendedNextActions.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Actions prioritaires recommandées
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {journey.recommendedNextActions.slice(0, 4).map((action, idx) => (
                            <Link
                              key={idx}
                              to={action.targetRoute}
                              className="group flex items-center justify-between rounded-xl border border-border bg-background p-3 text-xs transition-all hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs"
                            >
                              <div className="space-y-1 pr-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                      action.priority === 'HIGH'
                                        ? 'bg-destructive/10 text-destructive'
                                        : action.priority === 'MEDIUM'
                                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                        : 'bg-primary/10 text-primary'
                                    }`}
                                  >
                                    {action.priority}
                                  </span>
                                  <p className="font-bold text-foreground">{action.title}</p>
                                </div>
                                <p className="line-clamp-2 text-muted-foreground">{action.description}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              {/* DATA CIRCULATION OVERVIEW */}
              <section className="rounded-2xl border border-border bg-card p-6 shadow-2xs" aria-label="Circulation des données">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-foreground">Circulation des données entre les outils</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Chaque outil nourrit les étapes suivantes : les personas alimentent le BMC, le BMC structure le Business Plan, les coûts calculent le point mort et le pitch synthétise l'ensemble.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSyncAll}
                    disabled={syncing}
                    className="h-8 gap-2 text-xs font-semibold"
                  >
                    <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
                    Synchroniser tout
                  </Button>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <div className={`rounded-xl border p-3.5 text-center ${journey.dataCirculation.designThinkingHasData ? 'border-primary/30 bg-primary/5' : 'border-border/60 bg-muted/20 opacity-70'}`}>
                    <Lightbulb className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-2 text-xs font-bold">1. Design Thinking</p>
                    <p className="text-[11px] text-muted-foreground">Problème & Solution</p>
                  </div>
                  <div className={`rounded-xl border p-3.5 text-center ${journey.dataCirculation.bmcHasData ? 'border-primary/30 bg-primary/5' : 'border-border/60 bg-muted/20 opacity-70'}`}>
                    <LayoutGrid className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-2 text-xs font-bold">2. BMC</p>
                    <p className="text-[11px] text-muted-foreground">Modèle économique</p>
                  </div>
                  <div className={`rounded-xl border p-3.5 text-center ${journey.dataCirculation.businessPlanHasData ? 'border-primary/30 bg-primary/5' : 'border-border/60 bg-muted/20 opacity-70'}`}>
                    <FileText className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-2 text-xs font-bold">3. Business Plan</p>
                    <p className="text-[11px] text-muted-foreground">Dossier stratégique</p>
                  </div>
                  <div className={`rounded-xl border p-3.5 text-center ${journey.dataCirculation.financesHasData ? 'border-primary/30 bg-primary/5' : 'border-border/60 bg-muted/20 opacity-70'}`}>
                    <Calculator className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-2 text-xs font-bold">4. Finances</p>
                    <p className="text-[11px] text-muted-foreground">Seuil de rentabilité</p>
                  </div>
                  <div className={`col-span-2 sm:col-span-1 rounded-xl border p-3.5 text-center ${journey.dataCirculation.pitchHasData ? 'border-primary/30 bg-primary/5' : 'border-border/60 bg-muted/20 opacity-70'}`}>
                    <Mic className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-2 text-xs font-bold">5. Pitch Builder</p>
                    <p className="text-[11px] text-muted-foreground">Présentation orale</p>
                  </div>
                </div>
              </section>

              {/* 8 STAGES DETAILED PIPELINE */}
              <section className="space-y-4" aria-label="Étapes du parcours">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    Les 8 étapes du parcours entrepreneurial
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {journey.stages.map((stage) => {
                    const Icon = stageIcons[stage.id] || Compass
                    const isDone = stage.status === 'COMPLETED'
                    const inProgress = stage.status === 'IN_PROGRESS'

                    return (
                      <Card
                        key={stage.id}
                        className={`flex flex-col justify-between rounded-2xl border transition-all duration-200 hover:shadow-sm ${
                          isDone
                            ? 'border-emerald-500/30 bg-card'
                            : inProgress
                            ? 'border-primary/40 bg-card ring-1 ring-primary/20'
                            : 'border-border bg-card/60 opacity-85'
                        }`}
                      >
                        <CardHeader className="space-y-2 p-5 pb-3">
                          <div className="flex items-center justify-between">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                isDone
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : inProgress
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                isDone
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : inProgress
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {isDone ? 'Complété' : inProgress ? 'En cours' : 'À démarrer'}
                            </span>
                          </div>

                          <div>
                            <CardTitle className="text-base font-bold tracking-tight">
                              {stage.label}
                            </CardTitle>
                            <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                              {stage.description}
                            </p>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4 p-5 pt-0">
                          {/* Progress Bar */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                              <span>Progression</span>
                              <span className="font-bold text-foreground">{stage.completionPercent}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full transition-[width] duration-500 ${
                                  isDone ? 'bg-emerald-500' : 'bg-primary'
                                }`}
                                style={{ width: `${stage.completionPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Missing items */}
                          {stage.missingRequirements.length > 0 && !isDone && (
                            <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground leading-snug">
                              <p className="font-semibold text-foreground">À faire :</p>
                              <ul className="mt-1 space-y-0.5">
                                {stage.missingRequirements.slice(0, 2).map((req, rIdx) => (
                                  <li key={rIdx} className="line-clamp-2">• {req}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Action button */}
                          <Button
                            asChild
                            variant={isDone ? 'outline' : inProgress ? 'default' : 'secondary'}
                            size="sm"
                            className="w-full justify-between text-xs font-semibold"
                          >
                            <Link to={stage.toolRoute}>
                              <span>{isDone ? 'Revoir' : inProgress ? 'Continuer' : 'Commencer'}</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}
