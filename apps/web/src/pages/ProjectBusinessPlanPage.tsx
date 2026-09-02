import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FileText,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Plus,
  Trash2,
  ShieldAlert,
  Users,
  Target,
  BarChart,
  Settings,
  Layers,
  Award,
} from 'lucide-react'
import {
  bpResponseSchema,
  type BpResponse,
  type BpSections,
  type BpCompetitor,
  type BpRisk,
  type BpFounderMember,
} from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProjectNavTabs } from '@/components/project/ProjectNavTabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/api-client'

type BpSectionKey = keyof BpSections

export default function ProjectBusinessPlanPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [bpData, setBpData] = useState<BpResponse | null>(null)
  const [activeSection, setActiveSection] = useState<BpSectionKey>('executiveSummary')
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sectionsList: Array<{ key: BpSectionKey; number: number; label: string; icon: typeof FileText }> = [
    { key: 'executiveSummary', number: 1, label: 'Executive Summary', icon: Sparkles },
    { key: 'projectPresentation', number: 2, label: 'Présentation du projet', icon: Target },
    { key: 'marketStudy', number: 3, label: 'Étude de marché', icon: BarChart },
    { key: 'productService', number: 4, label: 'Produit / Service', icon: Layers },
    { key: 'businessModel', number: 5, label: 'Business Model', icon: Award },
    { key: 'commercialStrategy', number: 6, label: 'Stratégie commerciale', icon: Target },
    { key: 'organization', number: 7, label: 'Organisation & Équipe', icon: Users },
    { key: 'operations', number: 8, label: 'Opérations & Tech', icon: Settings },
    { key: 'impactRisks', number: 9, label: 'Impact & Risques', icon: ShieldAlert },
    { key: 'financialPlan', number: 10, label: 'Prévisions financières', icon: BarChart },
  ]

  useEffect(() => {
    let active = true
    apiClient
      .get(`/projects/${id}/business-plan`, bpResponseSchema)
      .then((data) => {
        if (active) setBpData(data)
      })
      .catch(() => {
        if (active) setError('Impossible de charger le Business Plan.')
      })
    return () => {
      active = false
    }
  }, [id])

  const saveSection = useCallback(
    async (sectionKey: BpSectionKey, data: Record<string, unknown>) => {
      if (!bpData) return
      try {
        const updated = await apiClient.patch(
          `/projects/${id}/business-plan`,
          { sectionKey, data },
          bpResponseSchema
        )
        setBpData(updated)
      } catch {
        setError('Erreur lors de la sauvegarde.')
      }
    },
    [id, bpData]
  )

  async function handleSyncUpstream() {
    try {
      setSyncing(true)
      setSyncMessage(null)
      const updated = await apiClient.post(
        `/projects/${id}/business-plan/sync`,
        { overwrite: false },
        bpResponseSchema
      )
      setBpData(updated)
      setSyncMessage('Données synchronisées avec succès depuis le Design Thinking, le BMC et les Finances.')
    } catch {
      setSyncMessage('Erreur lors de la synchronisation.')
    } finally {
      setSyncing(false)
    }
  }

  // Helpers for Lists
  function addCompetitor() {
    if (!bpData) return
    const newComp: BpCompetitor = {
      name: 'Nouveau concurrent',
      type: 'DIRECT',
      strengths: '',
      weaknesses: '',
    }
    const competitors = [...bpData.sections.marketStudy.competitors, newComp]
    saveSection('marketStudy', { competitors })
  }

  function updateCompetitor(index: number, field: keyof BpCompetitor, value: string) {
    if (!bpData) return
    const competitors = [...bpData.sections.marketStudy.competitors]
    competitors[index] = { ...competitors[index], [field]: value } as BpCompetitor
    saveSection('marketStudy', { competitors })
  }

  function removeCompetitor(index: number) {
    if (!bpData) return
    const competitors = bpData.sections.marketStudy.competitors.filter((_, i) => i !== index)
    saveSection('marketStudy', { competitors })
  }

  function addRisk() {
    if (!bpData) return
    const newRisk: BpRisk = {
      category: 'COMMERCIAL',
      description: 'Nouveau risque identifié',
      severity: 'MEDIUM',
      mitigationMeasure: '',
    }
    const risks = [...bpData.sections.impactRisks.risks, newRisk]
    saveSection('impactRisks', { risks })
  }

  function updateRisk(index: number, field: keyof BpRisk, value: string) {
    if (!bpData) return
    const risks = [...bpData.sections.impactRisks.risks]
    risks[index] = { ...risks[index], [field]: value } as BpRisk
    saveSection('impactRisks', { risks })
  }

  function removeRisk(index: number) {
    if (!bpData) return
    const risks = bpData.sections.impactRisks.risks.filter((_, i) => i !== index)
    saveSection('impactRisks', { risks })
  }

  function addFounder() {
    if (!bpData) return
    const newFounder: BpFounderMember = {
      name: 'Nouveau membre',
      role: 'Co-fondateur',
      skills: [],
      experienceSummary: '',
    }
    const founders = [...bpData.sections.organization.founders, newFounder]
    saveSection('organization', { founders })
  }

  function updateFounder(index: number, field: keyof BpFounderMember, value: unknown) {
    if (!bpData) return
    const founders = [...bpData.sections.organization.founders]
    founders[index] = { ...founders[index], [field]: value } as BpFounderMember
    saveSection('organization', { founders })
  }

  function removeFounder(index: number) {
    if (!bpData) return
    const founders = bpData.sections.organization.founders.filter((_, i) => i !== index)
    saveSection('organization', { founders })
  }

  const s = bpData?.sections

  return (
    <DashboardLayout>
      <ProjectNavTabs projectId={id} />

      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          {/* Header */}
          <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                  <FileText className="h-3.5 w-3.5" />
                  Business Plan Guidé
                </span>
                <span className="text-xs text-muted-foreground">10 Sections Clés</span>
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Dossier de Business Plan
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Rédigez un business plan complet pré-alimenté par votre Design Thinking, votre Business Model Canvas et vos prévisions financières.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSyncUpstream}
                disabled={syncing}
                className="gap-2 text-xs font-semibold shadow-2xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Synchronisation…' : 'Synchroniser depuis les outils'}
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

          {/* Main Layout: Sidebar Section Navigation + Active Section Form */}
          {bpData && s && (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-4 space-y-4">
                <Card className="rounded-2xl border-border bg-card p-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Avancement global
                    </p>
                    <span className="text-sm font-bold text-primary">{bpData.completion}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-300"
                      style={{ width: `${bpData.completion}%` }}
                    />
                  </div>

                  {/* Section List */}
                  <div className="mt-4 space-y-1">
                    {sectionsList.map((sec) => {
                      const Icon = sec.icon
                      const isActive = activeSection === sec.key
                      const comp = bpData.sectionCompletion[sec.key] ?? 0

                      return (
                        <button
                          key={sec.key}
                          type="button"
                          onClick={() => setActiveSection(sec.key)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[11px] opacity-70">#{sec.number}</span>
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{sec.label}</span>
                          </div>
                          <span
                            className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
                              isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {comp}%
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </Card>
              </div>

              {/* Active Section Content */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Executive Summary */}
                {activeSection === 'executiveSummary' && (
                  <Card className="rounded-2xl border-border bg-card shadow-2xs animate-in fade-in duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">1. Executive Summary</CardTitle>
                      <CardDescription className="text-xs">
                        Le résumé exécutif est la première chose lue par un investisseur ou un jury. Rédigez une synthèse claire de 3 à 4 paragraphes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        rows={10}
                        placeholder="Présentez le problème, la solution, le marché cible, le modèle économique et l'équipe..."
                        value={s.executiveSummary.content}
                        onChange={(e) => saveSection('executiveSummary', { content: e.target.value })}
                        className="rounded-xl bg-background text-sm leading-relaxed"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* 2. Présentation du projet */}
                {activeSection === 'projectPresentation' && (
                  <Card className="rounded-2xl border-border bg-card shadow-2xs animate-in fade-in duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">2. Présentation du projet</CardTitle>
                      <CardDescription className="text-xs">
                        Nom, mission, vision et objectifs stratégiques à court et long terme.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nom du projet</label>
                        <Input
                          value={s.projectPresentation.projectName}
                          onChange={(e) => saveSection('projectPresentation', { projectName: e.target.value })}
                          className="rounded-xl bg-background font-bold text-sm"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Problème traité</label>
                          <Textarea
                            rows={3}
                            value={s.projectPresentation.problemSummary}
                            onChange={(e) => saveSection('projectPresentation', { problemSummary: e.target.value })}
                            className="rounded-xl bg-background text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Solution proposée</label>
                          <Textarea
                            rows={3}
                            value={s.projectPresentation.solutionSummary}
                            onChange={(e) => saveSection('projectPresentation', { solutionSummary: e.target.value })}
                            className="rounded-xl bg-background text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vision à 5 ans</label>
                          <Input
                            value={s.projectPresentation.vision}
                            onChange={(e) => saveSection('projectPresentation', { vision: e.target.value })}
                            className="rounded-xl bg-background text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mission au quotidien</label>
                          <Input
                            value={s.projectPresentation.mission}
                            onChange={(e) => saveSection('projectPresentation', { mission: e.target.value })}
                            className="rounded-xl bg-background text-xs"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 3. Étude de marché */}
                {activeSection === 'marketStudy' && (
                  <Card className="rounded-2xl border-border bg-card shadow-2xs animate-in fade-in duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">3. Étude de marché & Concurrence</CardTitle>
                      <CardDescription className="text-xs">
                        Marché cible, tendances, segments et analyse des alternatives directes et indirectes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Marché cible & Taille</label>
                        <Textarea
                          rows={3}
                          value={s.marketStudy.targetMarket}
                          onChange={(e) => saveSection('marketStudy', { targetMarket: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Besoins clients & Tendances</label>
                        <Textarea
                          rows={3}
                          value={s.marketStudy.customerNeeds}
                          onChange={(e) => saveSection('marketStudy', { customerNeeds: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>

                      {/* Competitors Table */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Analyse de la concurrence & Alternatives
                          </label>
                          <Button size="sm" variant="outline" onClick={addCompetitor} className="h-7 gap-1 text-xs">
                            <Plus className="h-3 w-3" /> Ajouter un concurrent
                          </Button>
                        </div>
                        {s.marketStudy.competitors.map((comp, idx) => (
                          <div key={idx} className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <Input
                                value={comp.name}
                                onChange={(e) => updateCompetitor(idx, 'name', e.target.value)}
                                className="h-7 text-xs font-bold bg-background"
                              />
                              <select
                                value={comp.type}
                                onChange={(e) => updateCompetitor(idx, 'type', e.target.value)}
                                className="h-7 rounded-lg border border-border bg-background px-2 text-xs"
                              >
                                <option value="DIRECT">Direct</option>
                                <option value="INDIRECT">Indirect</option>
                                <option value="ALTERNATIVE">Alternative informelle</option>
                              </select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCompetitor(idx)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <Input
                                placeholder="Forces du concurrent"
                                value={comp.strengths}
                                onChange={(e) => updateCompetitor(idx, 'strengths', e.target.value)}
                                className="text-xs bg-background"
                              />
                              <Input
                                placeholder="Faiblesses / Opportunités pour nous"
                                value={comp.weaknesses}
                                onChange={(e) => updateCompetitor(idx, 'weaknesses', e.target.value)}
                                className="text-xs bg-background"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avantage concurrentiel (Unfair Advantage)</label>
                        <Textarea
                          rows={2}
                          value={s.marketStudy.competitiveAdvantage}
                          onChange={(e) => saveSection('marketStudy', { competitiveAdvantage: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 4. Produit / Service */}
                {activeSection === 'productService' && (
                  <Card className="rounded-2xl border-border bg-card shadow-2xs animate-in fade-in duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">4. Produit / Service & Différenciation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description de l'offre</label>
                        <Textarea
                          rows={3}
                          value={s.productService.description}
                          onChange={(e) => saveSection('productService', { description: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proposition de valeur</label>
                        <Textarea
                          rows={3}
                          value={s.productService.valueProposition}
                          onChange={(e) => saveSection('productService', { valueProposition: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Feuille de route produit (Roadmap)</label>
                        <Textarea
                          rows={3}
                          value={s.productService.futureRoadmap}
                          onChange={(e) => saveSection('productService', { futureRoadmap: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 5. Business Model */}
                {activeSection === 'businessModel' && (
                  <Card className="rounded-2xl border-border bg-card shadow-2xs animate-in fade-in duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">5. Modèle Économique & Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Synthèse du modèle</label>
                        <Textarea
                          rows={3}
                          value={s.businessModel.summary}
                          onChange={(e) => saveSection('businessModel', { summary: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Flux de revenus & Modèle tarifaire</label>
                        <Textarea
                          rows={3}
                          value={s.businessModel.revenueStreamsDescription}
                          onChange={(e) => saveSection('businessModel', { revenueStreamsDescription: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Structure des coûts & Inducteurs de dépenses</label>
                        <Textarea
                          rows={3}
                          value={s.businessModel.costDrivers}
                          onChange={(e) => saveSection('businessModel', { costDrivers: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 6. Stratégie commerciale */}
                {activeSection === 'commercialStrategy' && (
                  <Card className="rounded-2xl border-border bg-card shadow-2xs animate-in fade-in duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">6. Stratégie Commerciale & Go-to-Market</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Distribution & Canaux de vente</label>
                        <Textarea
                          rows={3}
                          value={s.commercialStrategy.distributionStrategy}
                          onChange={(e) => saveSection('commercialStrategy', { distributionStrategy: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plan de communication & Acquisition</label>
                        <Textarea
                          rows={3}
                          value={s.commercialStrategy.communicationPlan}
                          onChange={(e) => saveSection('commercialStrategy', { communicationPlan: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Conversion & Fidélisation client</label>
                        <Textarea
                          rows={3}
                          value={s.commercialStrategy.retentionAndLoyalty}
                          onChange={(e) => saveSection('commercialStrategy', { retentionAndLoyalty: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 7. Organisation */}
                {activeSection === 'organization' && (
                  <Card className="rounded-2xl border-border bg-card shadow-2xs animate-in fade-in duration-300">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg font-bold">7. Organisation & Équipe fondatrice</CardTitle>
                      <Button size="sm" variant="outline" onClick={addFounder} className="h-7 text-xs gap-1">
                        <Plus className="h-3 w-3" /> Ajouter un profil
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {s.organization.founders.map((founder, idx) => (
                        <div key={idx} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <Input
                              value={founder.name}
                              onChange={(e) => updateFounder(idx, 'name', e.target.value)}
                              className="h-8 font-bold text-sm bg-background"
                            />
                            <Input
                              value={founder.role}
                              onChange={(e) => updateFounder(idx, 'role', e.target.value)}
                              className="h-8 text-xs bg-background"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFounder(idx)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <Textarea
                            rows={2}
                            placeholder="Expérience / Rôle dans le projet..."
                            value={founder.experienceSummary}
                            onChange={(e) => updateFounder(idx, 'experienceSummary', e.target.value)}
                            className="text-xs bg-background"
                          />
                        </div>
                      ))}
                      <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gouvernance & Répartition des responsabilités</label>
                        <Textarea
                          rows={3}
                          value={s.organization.governanceAndRoles}
                          onChange={(e) => saveSection('organization', { governanceAndRoles: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 8. Opérations */}
                {activeSection === 'operations' && (
                  <Card className="rounded-2xl border-border bg-card shadow-2xs animate-in fade-in duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">8. Opérations, Processus & Technologie</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Processus de production / prestation</label>
                        <Textarea
                          rows={3}
                          value={s.operations.productionProcess}
                          onChange={(e) => saveSection('operations', { productionProcess: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Choix technologiques & Outils</label>
                        <Textarea
                          rows={3}
                          value={s.operations.technologyStack}
                          onChange={(e) => saveSection('operations', { technologyStack: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fournisseurs & Logistique</label>
                        <Textarea
                          rows={3}
                          value={s.operations.suppliersAndProcurement}
                          onChange={(e) => saveSection('operations', { suppliersAndProcurement: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 9. Impact & Risques */}
                {activeSection === 'impactRisks' && (
                  <Card className="rounded-2xl border-border bg-card shadow-2xs animate-in fade-in duration-300">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg font-bold">9. Matrice des Risques & Impact</CardTitle>
                      <Button size="sm" variant="outline" onClick={addRisk} className="h-7 text-xs gap-1">
                        <Plus className="h-3 w-3" /> Ajouter un risque
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {s.impactRisks.risks.map((risk, idx) => (
                        <div key={idx} className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <select
                              value={risk.category}
                              onChange={(e) => updateRisk(idx, 'category', e.target.value)}
                              className="h-7 rounded-lg border border-border bg-background px-2 text-xs"
                            >
                              <option value="COMMERCIAL">Commercial</option>
                              <option value="TECHNICAL">Technique</option>
                              <option value="FINANCIAL">Financier</option>
                              <option value="REGULATORY">Réglementaire</option>
                              <option value="HUMAN">Humain</option>
                              <option value="ENVIRONMENTAL">Environnemental</option>
                            </select>
                            <select
                              value={risk.severity}
                              onChange={(e) => updateRisk(idx, 'severity', e.target.value)}
                              className="h-7 rounded-lg border border-border bg-background px-2 text-xs"
                            >
                              <option value="LOW">Faible</option>
                              <option value="MEDIUM">Moyen</option>
                              <option value="HIGH">Élevé</option>
                              <option value="CRITICAL">Critique</option>
                            </select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRisk(idx)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <Input
                            placeholder="Description du risque"
                            value={risk.description}
                            onChange={(e) => updateRisk(idx, 'description', e.target.value)}
                            className="text-xs bg-background"
                          />
                          <Input
                            placeholder="Mesure de mitigation / Plan de secours"
                            value={risk.mitigationMeasure}
                            onChange={(e) => updateRisk(idx, 'mitigationMeasure', e.target.value)}
                            className="text-xs bg-background"
                          />
                        </div>
                      ))}

                      <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Impact environnemental & social</label>
                        <Textarea
                          rows={3}
                          value={s.impactRisks.environmentalAndSocialImpact}
                          onChange={(e) => saveSection('impactRisks', { environmentalAndSocialImpact: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 10. Prévisions financières */}
                {activeSection === 'financialPlan' && (
                  <Card className="rounded-2xl border-border bg-card shadow-2xs animate-in fade-in duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">10. Synthèse Financière & Besoins de Financement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Synthèse financière</label>
                        <Textarea
                          rows={3}
                          value={s.financialPlan.financialSummary}
                          onChange={(e) => saveSection('financialPlan', { financialSummary: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Besoin de financement total</label>
                          <Input
                            type="number"
                            value={s.financialPlan.fundingRequired}
                            onChange={(e) => saveSection('financialPlan', { fundingRequired: Number(e.target.value) })}
                            className="rounded-xl bg-background text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Devise</label>
                          <Input
                            value={s.financialPlan.fundingCurrency}
                            onChange={(e) => saveSection('financialPlan', { fundingCurrency: e.target.value.toUpperCase() })}
                            className="rounded-xl bg-background text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Commentaire sur le seuil de rentabilité</label>
                        <Textarea
                          rows={3}
                          value={s.financialPlan.breakEvenCommentary}
                          onChange={(e) => saveSection('financialPlan', { breakEvenCommentary: e.target.value })}
                          className="rounded-xl bg-background text-xs"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}
