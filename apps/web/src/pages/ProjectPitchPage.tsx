import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Mic,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Edit3,
  Trash2,
} from 'lucide-react'
import {
  pitchResponseSchema,
  type PitchResponse,
  type PitchFormat,
  type PitchSlideKey,
  type PitchSlide,
  PITCH_SLIDE_KEYS,
} from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProjectNavTabs } from '@/components/project/ProjectNavTabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/api-client'

export default function ProjectPitchPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [pitchData, setPitchData] = useState<PitchResponse | null>(null)
  const [activeSlideKey, setActiveSlideKey] = useState<PitchSlideKey>('hook')
  const [mode, setMode] = useState<'editor' | 'presentation'>('editor')
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newBulletInput, setNewBulletInput] = useState('')

  // Presentation Timer State
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    let active = true
    apiClient
      .get(`/projects/${id}/pitch`, pitchResponseSchema)
      .then((data) => {
        if (active) setPitchData(data)
      })
      .catch(() => {
        if (active) setError('Impossible de charger le Pitch.')
      })
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        setTimerSeconds((prev) => prev + 1)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTimerRunning])

  const saveSlidePatch = useCallback(
    async (slideKey: PitchSlideKey, slideData: Partial<PitchSlide>) => {
      if (!pitchData) return
      try {
        const updated = await apiClient.patch(
          `/projects/${id}/pitch`,
          {
            selectedFormat: pitchData.selectedFormat,
            slideKey,
            slideData,
          },
          pitchResponseSchema
        )
        setPitchData(updated)
      } catch {
        setError('Erreur lors de la sauvegarde du slide.')
      }
    },
    [id, pitchData]
  )

  async function handleFormatChange(newFormat: PitchFormat) {
    if (!pitchData) return
    try {
      const updated = await apiClient.patch(
        `/projects/${id}/pitch`,
        { selectedFormat: newFormat },
        pitchResponseSchema
      )
      setPitchData(updated)
    } catch {
      setError('Erreur lors du changement de format.')
    }
  }

  async function handleGenerate(overrideExisting = false) {
    if (!pitchData) return
    try {
      setGenerating(true)
      setMessage(null)
      const updated = await apiClient.post(
        `/projects/${id}/pitch/generate`,
        {
          format: pitchData.selectedFormat,
          overrideExisting,
        },
        pitchResponseSchema
      )
      setPitchData(updated)
      setMessage('Pitch régénéré avec succès à partir des données récentes du projet.')
    } catch {
      setMessage('Erreur lors de la génération du Pitch.')
    } finally {
      setGenerating(false)
    }
  }

  function addBulletPoint() {
    if (!pitchData || !newBulletInput.trim()) return
    const currentSlide = pitchData.slides[activeSlideKey]
    const updatedBullets = [...currentSlide.visualBulletPoints, newBulletInput.trim()]
    saveSlidePatch(activeSlideKey, { visualBulletPoints: updatedBullets })
    setNewBulletInput('')
  }

  function removeBulletPoint(index: number) {
    if (!pitchData) return
    const currentSlide = pitchData.slides[activeSlideKey]
    const updatedBullets = currentSlide.visualBulletPoints.filter((_, i) => i !== index)
    saveSlidePatch(activeSlideKey, { visualBulletPoints: updatedBullets })
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const slides = pitchData?.slides
  const currentSlide = slides ? slides[activeSlideKey] : null
  const includedKeys = pitchData
    ? PITCH_SLIDE_KEYS.filter((k) => pitchData.slides[k]?.isIncludedInFormat)
    : []
  const activeSlideIndexInIncluded = includedKeys.indexOf(activeSlideKey)

  function navigateSlide(direction: 'prev' | 'next') {
    if (includedKeys.length === 0) return
    let nextIdx = direction === 'next' ? activeSlideIndexInIncluded + 1 : activeSlideIndexInIncluded - 1
    if (nextIdx < 0) nextIdx = includedKeys.length - 1
    if (nextIdx >= includedKeys.length) nextIdx = 0
    const targetKey = includedKeys[nextIdx]
    if (targetKey) {
      setActiveSlideKey(targetKey)
    }
  }

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
                  <Mic className="h-3.5 w-3.5" />
                  Pitch Builder
                </span>
                <span className="text-xs text-muted-foreground">Formats 1 min, 3 min, 5 min, Investisseurs</span>
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Préparez votre pitch oral
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Structurez votre discours, vos slides visuelles et entraînez-vous avec le chronomètre interactif.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Mode switch */}
              <div className="flex rounded-lg border border-border bg-card p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setMode('editor')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    mode === 'editor' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Éditeur
                </button>
                <button
                  type="button"
                  onClick={() => setMode('presentation')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    mode === 'presentation' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Mode Présentation & Répétition
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleGenerate(false)}
                disabled={generating}
                className="gap-2 text-xs font-semibold shadow-2xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${generating ? 'animate-spin' : ''}`} />
                {generating ? 'Génération…' : 'Régénérer depuis le projet'}
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

          {message && (
            <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setMessage(null)} className="h-7 text-xs">
                Fermer
              </Button>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-destructive">
              {error}
            </div>
          )}

          {pitchData && (
            <>
              {/* FORMAT SELECTOR BAR */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-2xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                    Format :
                  </span>
                  {[
                    { id: 'elevator' as const, label: 'Éclair (1 min / 60s)' },
                    { id: 'three_minutes' as const, label: 'Concours (3 min / 180s)' },
                    { id: 'five_minutes' as const, label: 'Incubateur (5 min / 300s)' },
                    { id: 'investor' as const, label: 'Investisseur (10-15 min)' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => handleFormatChange(fmt.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        pitchData.selectedFormat === fmt.id
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Durée totale estimée : {formatTime(pitchData.totalEstimatedSeconds)} / {formatTime(pitchData.formatTargetSeconds)}</span>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {pitchData.completion}% rédigé
                  </span>
                </div>
              </div>

              {/* MODE 1: PRESENTATION & PRACTICE MODE */}
              {mode === 'presentation' && currentSlide && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Timer & Controls Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        size="sm"
                        variant={isTimerRunning ? 'destructive' : 'default'}
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="gap-2 font-bold"
                      >
                        {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {isTimerRunning ? 'Pause' : 'Démarrer le pitch'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsTimerRunning(false)
                          setTimerSeconds(0)
                        }}
                        className="gap-1.5 text-xs"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Réinitialiser
                      </Button>
                    </div>

                    {/* Big Digital Timer Display */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Chronomètre :</span>
                      <span
                        className={`font-mono text-3xl font-black ${
                          timerSeconds > pitchData.formatTargetSeconds
                            ? 'text-destructive animate-pulse'
                            : 'text-primary'
                        }`}
                      >
                        {formatTime(timerSeconds)}
                      </span>
                      <span className="text-xs text-muted-foreground">/ {formatTime(pitchData.formatTargetSeconds)}</span>
                    </div>

                    {/* Slide Navigation Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigateSlide('prev')}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs font-bold text-foreground">
                        Slide {activeSlideIndexInIncluded + 1} / {includedKeys.length}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigateSlide('next')}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Main Slide Deck Presentation Card */}
                  <div className="grid gap-6 lg:grid-cols-12">
                    {/* Left 7 cols: Visual Slide Display (what the audience sees) */}
                    <Card className="rounded-3xl border-2 border-primary/30 bg-card p-8 shadow-md lg:col-span-7 flex flex-col justify-between min-h-[420px]">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                          <span className="text-xs font-bold uppercase tracking-widest text-primary">
                            Support visuel (Écran)
                          </span>
                          <span className="text-xs font-semibold text-muted-foreground">
                            Durée cible : {currentSlide.estimatedDurationSeconds}s
                          </span>
                        </div>

                        <h2 className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                          {currentSlide.title}
                        </h2>

                        <ul className="space-y-3 pt-2 text-base sm:text-lg font-medium text-foreground">
                          {currentSlide.visualBulletPoints.map((bp, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-primary" />
                              <span>{bp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-6 text-xs text-muted-foreground border-t border-border">
                        <span>CoFound.mg</span>
                        <span>Slide {activeSlideIndexInIncluded + 1} sur {includedKeys.length}</span>
                      </div>
                    </Card>

                    {/* Right 5 cols: Speaker Script & Coaching Notes */}
                    <Card className="rounded-3xl border border-border bg-card p-6 shadow-sm lg:col-span-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Discours oral (Ce que vous dites)
                        </span>
                      </div>

                      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-foreground font-medium">
                        « {currentSlide.speechScript || 'Aucun script saisi pour ce slide.'} »
                      </div>

                      <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-1.5 text-xs text-muted-foreground">
                        <p className="font-bold text-foreground">🎙️ Conseil de coaching orateur :</p>
                        <p>{currentSlide.speakerNotes || 'Parlez clairement, respirez et regardez le public dans les yeux.'}</p>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* MODE 2: EDITOR MODE */}
              {mode === 'editor' && currentSlide && (
                <div className="grid gap-6 lg:grid-cols-12 animate-in fade-in duration-300">
                  {/* Left Column: Slide List Navigator */}
                  <div className="lg:col-span-4 space-y-3">
                    <Card className="rounded-2xl border-border bg-card p-3 shadow-2xs">
                      <p className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Plan des slides ({includedKeys.length} incluses)
                      </p>
                      <div className="mt-1 space-y-1">
                        {PITCH_SLIDE_KEYS.map((key, idx) => {
                          const s = pitchData.slides[key]
                          const isIncluded = s.isIncludedInFormat
                          const isActive = activeSlideKey === key

                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setActiveSlideKey(key)}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all ${
                                isActive
                                  ? 'bg-primary text-primary-foreground shadow-xs'
                                  : isIncluded
                                  ? 'text-foreground hover:bg-muted/60'
                                  : 'text-muted-foreground/60 opacity-60 hover:opacity-100 hover:bg-muted/40'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-[10px] opacity-70">#{idx + 1}</span>
                                <span className="truncate">{s.title}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] opacity-80">{s.estimatedDurationSeconds}s</span>
                                {!isIncluded && (
                                  <span className="text-[9px] rounded bg-muted/60 px-1 py-0.2">Masqué</span>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </Card>
                  </div>

                  {/* Right Column: Slide Editor Form */}
                  <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-2xl border-border bg-card shadow-2xs">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <CardTitle className="text-lg font-bold">
                              Édition : {currentSlide.title}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              Slide {activeSlideKey} — Durée estimée : {currentSlide.estimatedDurationSeconds} secondes
                            </CardDescription>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-muted-foreground">Durée (sec) :</label>
                            <Input
                              type="number"
                              value={currentSlide.estimatedDurationSeconds}
                              onChange={(e) =>
                                saveSlidePatch(activeSlideKey, {
                                  estimatedDurationSeconds: Number(e.target.value),
                                })
                              }
                              className="h-7 w-16 text-center text-xs bg-background"
                            />
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Titre de la slide
                          </label>
                          <Input
                            value={currentSlide.title}
                            onChange={(e) => saveSlidePatch(activeSlideKey, { title: e.target.value })}
                            className="rounded-xl bg-background font-bold text-sm"
                          />
                        </div>

                        {/* Speech Script */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Script oral (Ce que vous dites à voix haute)
                          </label>
                          <Textarea
                            rows={4}
                            placeholder="Rédigez le texte exact de votre prise de parole pour cette slide..."
                            value={currentSlide.speechScript}
                            onChange={(e) => saveSlidePatch(activeSlideKey, { speechScript: e.target.value })}
                            className="rounded-xl bg-background text-sm leading-relaxed"
                          />
                        </div>

                        {/* Visual Bullet Points */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Points clés visuels (Ce qui s'affiche sur l'écran)
                          </label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Ajouter une puce visuelle percutante..."
                              value={newBulletInput}
                              onChange={(e) => setNewBulletInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  addBulletPoint()
                                }
                              }}
                              className="text-xs bg-background"
                            />
                            <Button type="button" size="sm" onClick={addBulletPoint} className="text-xs shrink-0">
                              Ajouter
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {currentSlide.visualBulletPoints.map((bp, idx) => (
                              <div key={idx} className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-xs">
                                <span className="font-medium text-foreground">• {bp}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeBulletPoint(idx)}
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Speaker Coaching Notes */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Notes & Conseils de posture orateur
                          </label>
                          <Textarea
                            rows={2}
                            placeholder="Conseils d'élocution, intonation, éléments à appuyer..."
                            value={currentSlide.speakerNotes}
                            onChange={(e) => saveSlidePatch(activeSlideKey, { speakerNotes: e.target.value })}
                            className="rounded-xl bg-background text-xs"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}
