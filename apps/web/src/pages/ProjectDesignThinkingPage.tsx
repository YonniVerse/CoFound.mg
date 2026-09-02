import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Lightbulb,
  ArrowLeft,
  Users,
  Search,
  Layers,
  CheckCircle,
  Plus,
  Trash2,
  Check,
} from 'lucide-react'
import {
  dtResponseSchema,
  type DtResponse,
  type DtIteration,
  type DtInterview,
  type DtPersona,
  type DtBrainstormIdea,
  IDEO_METHODOLOGY_ATTRIBUTION,
} from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProjectNavTabs } from '@/components/project/ProjectNavTabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/api-client'

type DtPhase = 'understand' | 'define' | 'ideate' | 'prototype' | 'test'

export default function ProjectDesignThinkingPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [dtData, setDtData] = useState<DtResponse | null>(null)
  const [activeTab, setActiveTab] = useState<DtPhase>('understand')
  const [activeIterationIdx, setActiveIterationIdx] = useState(0)
  const [savingPhase, setSavingPhase] = useState<DtPhase | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<DtPhase | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newTagInput, setNewTagInput] = useState<{ [key: string]: string }>({})

  const currentIteration: DtIteration | undefined = dtData?.iterations[activeIterationIdx]

  useEffect(() => {
    let active = true
    apiClient
      .get(`/projects/${id}/design-thinking`, dtResponseSchema)
      .then((data) => {
        if (active) {
          setDtData(data)
          setActiveIterationIdx(data.activeIterationIndex)
        }
      })
      .catch(() => {
        if (active) setError('Impossible de charger l’espace Design Thinking.')
      })
    return () => {
      active = false
    }
  }, [id])

  const savePhaseData = useCallback(
    async (phase: DtPhase, patchData: Record<string, unknown>) => {
      if (!dtData) return
      setSavingPhase(phase)
      setSaveSuccess(null)
      try {
        const updated = await apiClient.patch(
          `/projects/${id}/design-thinking`,
          {
            iterationIndex: activeIterationIdx,
            phase,
            data: patchData,
          },
          dtResponseSchema
        )
        setDtData(updated)
        setSaveSuccess(phase)
        window.setTimeout(() => setSaveSuccess(null), 2500)
      } catch {
        setError('Erreur lors de la sauvegarde.')
      } finally {
        setSavingPhase(null)
      }
    },
    [id, dtData, activeIterationIdx]
  )

  async function handleAddIteration() {
    try {
      const nextNum = (dtData?.iterations.length ?? 0) + 1
      const updated = await apiClient.post(
        `/projects/${id}/design-thinking/iterations`,
        { title: `Itération ${nextNum}` },
        dtResponseSchema
      )
      setDtData(updated)
      setActiveIterationIdx(updated.iterations.length - 1)
    } catch {
      setError('Erreur lors de l’ajout d’une itération.')
    }
  }

  // Helpers for Lists and Dynamic Cards
  function addInterview() {
    if (!currentIteration) return
    const newInterview: DtInterview = {
      id: `int_${Date.now()}`,
      respondent: '',
      roleOrContext: '',
      keyQuotes: '',
      mainInsights: '',
    }
    const interviews = [...currentIteration.understand.interviews, newInterview]
    savePhaseData('understand', { interviews })
  }

  function updateInterview(index: number, field: keyof DtInterview, value: string) {
    if (!currentIteration) return
    const interviews = [...currentIteration.understand.interviews]
    interviews[index] = { ...interviews[index], [field]: value } as DtInterview
    savePhaseData('understand', { interviews })
  }

  function removeInterview(index: number) {
    if (!currentIteration) return
    const interviews = currentIteration.understand.interviews.filter((_, i) => i !== index)
    savePhaseData('understand', { interviews })
  }

  function addPersona() {
    if (!currentIteration) return
    const newPersona: DtPersona = {
      id: `per_${Date.now()}`,
      name: 'Nouveau Persona',
      roleOrOccupation: '',
      bio: '',
      goals: [],
      frustrations: [],
      quote: '',
    }
    const personas = [...currentIteration.define.personas, newPersona]
    savePhaseData('define', { personas })
  }

  function updatePersona(index: number, field: keyof DtPersona, value: unknown) {
    if (!currentIteration) return
    const personas = [...currentIteration.define.personas]
    personas[index] = { ...personas[index], [field]: value } as DtPersona
    savePhaseData('define', { personas })
  }

  function removePersona(index: number) {
    if (!currentIteration) return
    const personas = currentIteration.define.personas.filter((_, i) => i !== index)
    savePhaseData('define', { personas })
  }

  function addBrainstormIdea() {
    if (!currentIteration) return
    const newIdea: DtBrainstormIdea = {
      id: `idea_${Date.now()}`,
      title: 'Nouvelle idée de solution',
      description: '',
      feasibilityScore: 3,
      impactScore: 3,
      desirabilityScore: 3,
      isSelected: false,
    }
    const brainstormIdeas = [...currentIteration.ideate.brainstormIdeas, newIdea]
    savePhaseData('ideate', { brainstormIdeas })
  }

  function updateBrainstormIdea(index: number, field: keyof DtBrainstormIdea, value: unknown) {
    if (!currentIteration) return
    const brainstormIdeas = [...currentIteration.ideate.brainstormIdeas]
    brainstormIdeas[index] = { ...brainstormIdeas[index], [field]: value } as DtBrainstormIdea
    let selectedIdeaId = currentIteration.ideate.selectedIdeaId
    if (field === 'isSelected' && value === true && brainstormIdeas[index]) {
      selectedIdeaId = brainstormIdeas[index].id
      brainstormIdeas.forEach((it, i) => {
        if (i !== index) it.isSelected = false
      })
    }
    savePhaseData('ideate', { brainstormIdeas, selectedIdeaId })
  }

  function removeBrainstormIdea(index: number) {
    if (!currentIteration) return
    const brainstormIdeas = currentIteration.ideate.brainstormIdeas.filter((_, i) => i !== index)
    savePhaseData('ideate', { brainstormIdeas })
  }

  function addArrayItem(phase: DtPhase, fieldName: string, currentArray: string[], tagKey: string) {
    const text = newTagInput[tagKey]?.trim()
    if (!text) return
    const updated = [...currentArray, text]
    savePhaseData(phase, { [fieldName]: updated })
    setNewTagInput({ ...newTagInput, [tagKey]: '' })
  }

  function removeArrayItem(phase: DtPhase, fieldName: string, currentArray: string[], index: number) {
    const updated = currentArray.filter((_, i) => i !== index)
    savePhaseData(phase, { [fieldName]: updated })
  }

  const phases = [
    { id: 'understand' as const, label: '1. Comprendre', icon: Search, sub: 'Immersion & Besoins' },
    { id: 'define' as const, label: '2. Synthétiser', icon: Users, sub: 'Personas & Défi' },
    { id: 'ideate' as const, label: '3. Idéer', icon: Lightbulb, sub: 'Brainstorming & Choix' },
    { id: 'prototype' as const, label: '4. Prototyper', icon: Layers, sub: 'MVP & Hypothèses' },
    { id: 'test' as const, label: '5. Tester', icon: CheckCircle, sub: 'Retours & Décision' },
  ]

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
                  <Lightbulb className="h-3.5 w-3.5" />
                  Design Thinking Itératif
                </span>
                <span className="text-xs text-muted-foreground">Méthodologie IDEO / Stanford d.school</span>
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Concevoir et valider la solution
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Démarche centrée sur l’humain : comprenez vos utilisateurs, définissez leurs frustrations réelles, générez des idées audacieuses et testez vos prototypes sur le terrain.
              </p>
            </div>
            <div className="flex items-center gap-2">
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

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Iteration Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Itérations :</span>
              {(dtData?.iterations || []).map((it, idx) => (
                <button
                  key={it.id}
                  onClick={() => setActiveIterationIdx(idx)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeIterationIdx === idx
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {it.title} ({it.completion}%)
                </button>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddIteration}
                className="h-7 gap-1 rounded-lg px-2.5 text-xs font-semibold"
              >
                <Plus className="h-3 w-3" />
                Nouvelle itération
              </Button>
            </div>

            {/* Save indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {savingPhase && (
                <span className="flex items-center gap-1 text-primary">
                  <span className="h-2 w-2 animate-ping rounded-full bg-primary" />
                  Sauvegarde automatique…
                </span>
              )}
              {saveSuccess && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                  Modifications enregistrées
                </span>
              )}
            </div>
          </div>

          {/* Phase Stepper Navigation */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {phases.map((phase) => {
              const Icon = phase.icon
              const isActive = activeTab === phase.id
              const comp = currentIteration?.phaseCompletion[phase.id] ?? 0

              return (
                <button
                  key={phase.id}
                  onClick={() => setActiveTab(phase.id)}
                  className={`flex flex-col rounded-xl border p-3.5 text-left transition-all ${
                    isActive
                      ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-[11px] font-bold text-muted-foreground">{comp}%</span>
                  </div>
                  <p className={`mt-2 text-xs font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {phase.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{phase.sub}</p>
                </button>
              )
            })}
          </div>

          {currentIteration && (
            <div className="space-y-6">
              {/* PHASE 1: COMPRENDRE */}
              {activeTab === 'understand' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <Card className="rounded-2xl border-border bg-card shadow-2xs">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-bold">1. Le problème & Contexte terrain</CardTitle>
                          <CardDescription className="text-xs">
                            Identifiez précisément la douleur vécue sans chercher à proposer immédiatement votre solution.
                          </CardDescription>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                          {currentIteration.phaseCompletion.understand}% complété
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Énoncé du problème ou défi constaté
                        </label>
                        <Textarea
                          rows={4}
                          placeholder="Quel problème concret observez-vous ? Pourquoi est-ce douloureux ?"
                          value={currentIteration.understand.problem}
                          onChange={(e) => savePhaseData('understand', { problem: e.target.value })}
                          className="rounded-xl bg-background"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Utilisateurs ou population ciblée
                          </label>
                          <Textarea
                            rows={3}
                            placeholder="Qui subit ce problème au quotidien ? (ex: petits planteurs, étudiants sans transport...)"
                            value={currentIteration.understand.targetUsers}
                            onChange={(e) => savePhaseData('understand', { targetUsers: e.target.value })}
                            className="rounded-xl bg-background"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Contexte & Environnement local
                          </label>
                          <Textarea
                            rows={3}
                            placeholder="Quelles contraintes locales existent ? (connectivité, moyens de paiement, transport...)"
                            value={currentIteration.understand.context}
                            onChange={(e) => savePhaseData('understand', { context: e.target.value })}
                            className="rounded-xl bg-background"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Observations terrain & Pratiques actuelles
                        </label>
                        <Textarea
                          rows={3}
                          placeholder="Comment les utilisateurs se débrouillent-ils aujourd'hui ? Quelles alternatives artisanales utilisent-ils ?"
                          value={currentIteration.understand.fieldObservations}
                          onChange={(e) => savePhaseData('understand', { fieldObservations: e.target.value })}
                          className="rounded-xl bg-background"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Interviews Logger */}
                  <Card className="rounded-2xl border-border bg-card shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold">Entretiens utilisateurs & Verbatims</CardTitle>
                        <CardDescription className="text-xs">
                          Consignez les témoignages réels issus de vos échanges avec la cible.
                        </CardDescription>
                      </div>
                      <Button size="sm" onClick={addInterview} className="gap-1.5 text-xs font-semibold">
                        <Plus className="h-3.5 w-3.5" />
                        Ajouter un entretien
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentIteration.understand.interviews.length === 0 && (
                        <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                          Aucun entretien consigné pour le moment. Cliquez sur « Ajouter un entretien » pour enregistrer vos premiers verbatims.
                        </div>
                      )}
                      {currentIteration.understand.interviews.map((interview, idx) => (
                        <div key={interview.id} className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold text-primary">Entretien #{idx + 1}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeInterview(idx)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                              placeholder="Nom ou profil du répondant (ex: Rivo, grossiste à Mahajanga)"
                              value={interview.respondent}
                              onChange={(e) => updateInterview(idx, 'respondent', e.target.value)}
                              className="rounded-lg bg-background text-xs"
                            />
                            <Input
                              placeholder="Contexte / Lieu de l'échange"
                              value={interview.roleOrContext}
                              onChange={(e) => updateInterview(idx, 'roleOrContext', e.target.value)}
                              className="rounded-lg bg-background text-xs"
                            />
                          </div>
                          <Textarea
                            rows={2}
                            placeholder="Citations marquantes (verbatims exacts)"
                            value={interview.keyQuotes}
                            onChange={(e) => updateInterview(idx, 'keyQuotes', e.target.value)}
                            className="rounded-lg bg-background text-xs"
                          />
                          <Input
                            placeholder="Enseignement clé tiré de cet échange"
                            value={interview.mainInsights}
                            onChange={(e) => updateInterview(idx, 'mainInsights', e.target.value)}
                            className="rounded-lg bg-background text-xs"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* PHASE 2: SYNTHÉTISER */}
              {activeTab === 'define' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Personas */}
                  <Card className="rounded-2xl border-border bg-card shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold">Personas cibles</CardTitle>
                        <CardDescription className="text-xs">
                          Représentez vos utilisateurs types avec leurs objectifs et frustrations.
                        </CardDescription>
                      </div>
                      <Button size="sm" onClick={addPersona} className="gap-1.5 text-xs font-semibold">
                        <Plus className="h-3.5 w-3.5" />
                        Créer un persona
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentIteration.define.personas.length === 0 && (
                        <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                          Aucun persona créé. Cliquez sur « Créer un persona » pour formaliser votre cible type.
                        </div>
                      )}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {currentIteration.define.personas.map((persona, idx) => (
                          <div key={persona.id} className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                  {persona.name.charAt(0).toUpperCase() || 'P'}
                                </div>
                                <Input
                                  value={persona.name}
                                  onChange={(e) => updatePersona(idx, 'name', e.target.value)}
                                  className="h-8 font-bold text-sm bg-transparent"
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePersona(idx)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Rôle / Situation (ex: Étudiant en L3 à Antsiranana)"
                              value={persona.roleOrOccupation}
                              onChange={(e) => updatePersona(idx, 'roleOrOccupation', e.target.value)}
                              className="text-xs bg-background"
                            />
                            <Textarea
                              rows={2}
                              placeholder="Citation type du persona..."
                              value={persona.quote}
                              onChange={(e) => updatePersona(idx, 'quote', e.target.value)}
                              className="text-xs italic bg-background"
                            />
                            <Textarea
                              rows={2}
                              placeholder="Bio / Habitudes de vie..."
                              value={persona.bio}
                              onChange={(e) => updatePersona(idx, 'bio', e.target.value)}
                              className="text-xs bg-background"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Problem Statement & HMW */}
                  <Card className="rounded-2xl border-border bg-card shadow-2xs">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">Formulation du Défi & How Might We</CardTitle>
                      <CardDescription className="text-xs">
                        Cadrez la question centrale de conception pour orienter la séance de brainstorming.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Formulation du problème (Point of View - POV)
                        </label>
                        <Textarea
                          rows={3}
                          placeholder="[Notre utilisateur cible] a besoin de [besoin profond] parce que [insight clé découvert sur le terrain]."
                          value={currentIteration.define.problemStatement}
                          onChange={(e) => savePhaseData('define', { problemStatement: e.target.value })}
                          className="rounded-xl bg-background text-sm"
                        />
                      </div>

                      {/* HMW List */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Questions de conception : "How Might We...?" (Comment pourrions-nous...?)
                        </label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex : Comment pourrions-nous permettre aux paysans de négocier sans smartphone 4G ?"
                            value={newTagInput.hmw || ''}
                            onChange={(e) => setNewTagInput({ ...newTagInput, hmw: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addArrayItem('define', 'howMightWe', currentIteration.define.howMightWe, 'hmw')
                              }
                            }}
                            className="text-xs bg-background"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => addArrayItem('define', 'howMightWe', currentIteration.define.howMightWe, 'hmw')}
                            className="text-xs shrink-0"
                          >
                            Ajouter
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {currentIteration.define.howMightWe.map((q, idx) => (
                            <div key={idx} className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-xs">
                              <span className="font-medium text-foreground">💡 {q}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeArrayItem('define', 'howMightWe', currentIteration.define.howMightWe, idx)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* PHASE 3: IDÉER */}
              {activeTab === 'ideate' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <Card className="rounded-2xl border-border bg-card shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold">Brainstorming & Sélection de Solutions</CardTitle>
                        <CardDescription className="text-xs">
                          Générez plusieurs alternatives puis notez leur faisabilité, impact et désirabilité.
                        </CardDescription>
                      </div>
                      <Button size="sm" onClick={addBrainstormIdea} className="gap-1.5 text-xs font-semibold">
                        <Plus className="h-3.5 w-3.5" />
                        Ajouter une idée
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentIteration.ideate.brainstormIdeas.length === 0 && (
                        <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                          Aucune idée générée. Cliquez sur « Ajouter une idée » pour brainstormer.
                        </div>
                      )}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {currentIteration.ideate.brainstormIdeas.map((idea, idx) => (
                          <div
                            key={idea.id}
                            className={`rounded-xl border p-4 shadow-2xs space-y-3 transition-all ${
                              idea.isSelected
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                : 'border-border bg-card'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <Input
                                value={idea.title}
                                onChange={(e) => updateBrainstormIdea(idx, 'title', e.target.value)}
                                className="h-8 font-bold text-sm bg-transparent"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeBrainstormIdea(idx)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <Textarea
                              rows={2}
                              placeholder="Description de la solution proposée..."
                              value={idea.description}
                              onChange={(e) => updateBrainstormIdea(idx, 'description', e.target.value)}
                              className="text-xs bg-background"
                            />
                            {/* Scoring Matrix */}
                            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
                              <div className="rounded-lg bg-muted/40 p-1.5">
                                <span className="text-muted-foreground">Désirabilité :</span>
                                <select
                                  value={idea.desirabilityScore}
                                  onChange={(e) => updateBrainstormIdea(idx, 'desirabilityScore', Number(e.target.value))}
                                  className="mt-1 w-full rounded bg-background p-1 text-center font-bold"
                                >
                                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}/5</option>)}
                                </select>
                              </div>
                              <div className="rounded-lg bg-muted/40 p-1.5">
                                <span className="text-muted-foreground">Faisabilité :</span>
                                <select
                                  value={idea.feasibilityScore}
                                  onChange={(e) => updateBrainstormIdea(idx, 'feasibilityScore', Number(e.target.value))}
                                  className="mt-1 w-full rounded bg-background p-1 text-center font-bold"
                                >
                                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}/5</option>)}
                                </select>
                              </div>
                              <div className="rounded-lg bg-muted/40 p-1.5">
                                <span className="text-muted-foreground">Impact :</span>
                                <select
                                  value={idea.impactScore}
                                  onChange={(e) => updateBrainstormIdea(idx, 'impactScore', Number(e.target.value))}
                                  className="mt-1 w-full rounded bg-background p-1 text-center font-bold"
                                >
                                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}/5</option>)}
                                </select>
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant={idea.isSelected ? 'default' : 'outline'}
                              onClick={() => updateBrainstormIdea(idx, 'isSelected', !idea.isSelected)}
                              className="w-full text-xs font-semibold"
                            >
                              {idea.isSelected ? '✓ Solution retenue pour prototype' : 'Choisir cette solution'}
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Justification du choix retenu
                        </label>
                        <Textarea
                          rows={3}
                          placeholder="Pourquoi avez-vous retenu cette idée plutôt que les autres alternatives explorées ?"
                          value={currentIteration.ideate.selectionRationale}
                          onChange={(e) => savePhaseData('ideate', { selectionRationale: e.target.value })}
                          className="rounded-xl bg-background text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* PHASE 4: PROTOTYPER */}
              {activeTab === 'prototype' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <Card className="rounded-2xl border-border bg-card shadow-2xs">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">4. Définition du Prototype / MVP</CardTitle>
                      <CardDescription className="text-xs">
                        Concevez un artefact rapide et économique pour confronter vos hypothèses à la réalité.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Format du prototype
                          </label>
                          <select
                            value={currentIteration.prototype.prototypeType}
                            onChange={(e) => savePhaseData('prototype', { prototypeType: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground"
                          >
                            <option value="wireframe">Maquettes / Wireframes interactifs</option>
                            <option value="storyboard">Storyboard / Bande dessinée utilisateur</option>
                            <option value="paper_mockup">Prototype papier / Démo physique</option>
                            <option value="landing_page">Landing page de pré-inscription</option>
                            <option value="service_blueprint">Parcours de service manuel (Concierge MVP)</option>
                            <option value="functional_mvp">MVP fonctionnel léger (No-Code/Code)</option>
                            <option value="other">Autre format spécifique</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Description détaillée du prototype
                        </label>
                        <Textarea
                          rows={3}
                          placeholder="Que contient ce prototype ? Comment l'utilisateur interagit-il avec ?"
                          value={currentIteration.prototype.solutionDescription}
                          onChange={(e) => savePhaseData('prototype', { solutionDescription: e.target.value })}
                          className="rounded-xl bg-background text-sm"
                        />
                      </div>

                      {/* Critical Hypotheses List */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Hypothèses critiques à tester (Risques majeurs à valider)
                        </label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex : Les utilisateurs acceptent de payer par Mobile Money dès la réservation."
                            value={newTagInput.hypo || ''}
                            onChange={(e) => setNewTagInput({ ...newTagInput, hypo: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addArrayItem('prototype', 'testedHypotheses', currentIteration.prototype.testedHypotheses, 'hypo')
                              }
                            }}
                            className="text-xs bg-background"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => addArrayItem('prototype', 'testedHypotheses', currentIteration.prototype.testedHypotheses, 'hypo')}
                            className="text-xs shrink-0"
                          >
                            Ajouter
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {currentIteration.prototype.testedHypotheses.map((h, idx) => (
                            <div key={idx} className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-xs">
                              <span className="font-medium text-foreground">🎯 Hypothèse {idx + 1} : {h}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeArrayItem('prototype', 'testedHypotheses', currentIteration.prototype.testedHypotheses, idx)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Éléments techniques & matériels nécessaires
                        </label>
                        <Textarea
                          rows={2}
                          placeholder="Quels outils ou matériel utilisez-vous pour ce prototype ?"
                          value={currentIteration.prototype.prototypeElements}
                          onChange={(e) => savePhaseData('prototype', { prototypeElements: e.target.value })}
                          className="rounded-xl bg-background text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* PHASE 5: TESTER */}
              {activeTab === 'test' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <Card className="rounded-2xl border-border bg-card shadow-2xs">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">5. Résultats des Tests & Décision d'Itération</CardTitle>
                      <CardDescription className="text-xs">
                        Confrontez vos hypothèses aux retours d’expérience réels et décidez de la suite.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Utilisateurs et contexte des tests réalisés
                        </label>
                        <Textarea
                          rows={2}
                          placeholder="Combien de personnes ont testé le prototype ? Dans quel cadre ?"
                          value={currentIteration.test.testedUsersSummary}
                          onChange={(e) => savePhaseData('test', { testedUsersSummary: e.target.value })}
                          className="rounded-xl bg-background text-sm"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Résultats observés sur le terrain
                          </label>
                          <Textarea
                            rows={3}
                            placeholder="Qu'est-ce qui s'est réellement passé lors des tests ?"
                            value={currentIteration.test.observedResults}
                            onChange={(e) => savePhaseData('test', { observedResults: e.target.value })}
                            className="rounded-xl bg-background text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Retours et critiques des utilisateurs
                          </label>
                          <Textarea
                            rows={3}
                            placeholder="Quels points ont plu ? Quels blocages et incompréhensions ont surgi ?"
                            value={currentIteration.test.userFeedback}
                            onChange={(e) => savePhaseData('test', { userFeedback: e.target.value })}
                            className="rounded-xl bg-background text-sm"
                          />
                        </div>
                      </div>

                      {/* Key Learnings */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Apprentissages majeurs (Key Insights)
                        </label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex : Les utilisateurs demandent une confirmation SMS plutôt qu'un email."
                            value={newTagInput.learning || ''}
                            onChange={(e) => setNewTagInput({ ...newTagInput, learning: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addArrayItem('test', 'keyLearnings', currentIteration.test.keyLearnings, 'learning')
                              }
                            }}
                            className="text-xs bg-background"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => addArrayItem('test', 'keyLearnings', currentIteration.test.keyLearnings, 'learning')}
                            className="text-xs shrink-0"
                          >
                            Ajouter
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {currentIteration.test.keyLearnings.map((l, idx) => (
                            <div key={idx} className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-xs">
                              <span className="font-medium text-foreground">💡 {l}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeArrayItem('test', 'keyLearnings', currentIteration.test.keyLearnings, idx)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strategic Decision */}
                      <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <label className="text-xs font-bold uppercase tracking-wider text-primary">
                          Décision stratégique suite aux tests
                        </label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {[
                            { value: 'PERSEVERE', label: 'Persévérer', desc: 'Hypothèses validées, passer à l’échelle' },
                            { value: 'ITERATE', label: 'Itérer', desc: 'Améliorer le prototype et re-tester' },
                            { value: 'PIVOT', label: 'Pivoter', desc: 'Changer de cible ou de proposition de valeur' },
                            { value: 'ABANDON', label: 'Abandonner', desc: 'Le problème n’est pas solvable ainsi' },
                          ].map((dec) => (
                            <button
                              key={dec.value}
                              type="button"
                              onClick={() => savePhaseData('test', { decision: dec.value })}
                              className={`rounded-xl border p-3 text-left transition-all ${
                                currentIteration.test.decision === dec.value
                                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                  : 'border-border bg-card text-foreground hover:bg-muted/50'
                              }`}
                            >
                              <p className="text-xs font-bold">{dec.label}</p>
                              <p className={`mt-1 text-[10px] ${currentIteration.test.decision === dec.value ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                {dec.desc}
                              </p>
                            </button>
                          ))}
                        </div>

                        <div className="space-y-2 pt-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Plan d’action / Prochaines étapes
                          </label>
                          <Textarea
                            rows={3}
                            placeholder="Quelles sont les prochaines étapes concrètes suite à cette décision ?"
                            value={currentIteration.test.nextActionPlan}
                            onChange={(e) => savePhaseData('test', { nextActionPlan: e.target.value })}
                            className="rounded-xl bg-background text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Methodology attribution footer */}
          <footer className="mt-4 rounded-xl border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground text-center">
            {IDEO_METHODOLOGY_ATTRIBUTION}
          </footer>
        </div>
      </main>
    </DashboardLayout>
  )
}
