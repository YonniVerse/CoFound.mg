import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Check,
  LayoutGrid,
  List,
  ArrowUpRight,
} from 'lucide-react'
import {
  BMC_BLOCK_KEYS,
  BMC_BLOCK_METADATA,
  bmcResponseSchema,
  type BmcBlocks,
  type BmcBlockKey,
  STRATEGYZER_ATTRIBUTION,
} from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProjectNavTabs } from '@/components/project/ProjectNavTabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/api-client'

export default function ProjectBmcPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [blocks, setBlocks] = useState<BmcBlocks | null>(null)
  const [saving, setSaving] = useState<BmcBlockKey | null>(null)
  const [savedKey, setSavedKey] = useState<BmcBlockKey | null>(null)
  const [activeHelpKey, setActiveHelpKey] = useState<BmcBlockKey | null>(null)
  const [viewMode, setViewMode] = useState<'canvas' | 'list'>('canvas')
  const [error, setError] = useState<string | null>(null)

  const completion = useMemo(
    () =>
      blocks
        ? Math.round(
            (BMC_BLOCK_KEYS.filter((key) => blocks[key].content.trim()).length / BMC_BLOCK_KEYS.length) * 100
          )
        : 0,
    [blocks]
  )

  const filledBlocks = blocks ? BMC_BLOCK_KEYS.filter((key) => blocks[key].content.trim()).length : 0

  useEffect(() => {
    let active = true
    apiClient
      .get(`/projects/${id}/bmc`, bmcResponseSchema)
      .then((response) => {
        if (active) setBlocks(response.blocks)
      })
      .catch(() => {
        if (active) setError('Impossible de charger le Business Model Canvas.')
      })
    return () => {
      active = false
    }
  }, [id])

  function update(key: BmcBlockKey, content: string) {
    if (!blocks) return
    const next = { ...blocks, [key]: { ...blocks[key], content } }
    setBlocks(next)
    setSaving(key)
    setSavedKey(null)

    window.setTimeout(() => {
      apiClient
        .patch(`/projects/${id}/bmc`, { block: key, value: next[key] }, bmcResponseSchema)
        .then(() => {
          setSaving(null)
          setSavedKey(key)
          window.setTimeout(() => setSavedKey(null), 2000)
        })
        .catch(() => {
          setSaving(null)
          setError('Brouillon conservé localement ; échec de la synchronisation.')
        })
    }, 600)
  }

  if (error && !blocks) {
    return (
      <DashboardLayout>
        <ProjectNavTabs projectId={id} />
        <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
          <div className="mx-auto max-w-3xl rounded-xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-destructive" role="alert">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          </div>
        </main>
      </DashboardLayout>
    )
  }

  if (!blocks) {
    return (
      <DashboardLayout>
        <ProjectNavTabs projectId={id} />
        <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
          <div className="mx-auto w-full max-w-[1400px] space-y-6" role="status" aria-label="Chargement du BMC">
            <div className="rounded-xl border border-border bg-card p-6 shadow-2xs">
              <div className="h-6 w-48 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-96 animate-pulse rounded bg-muted" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl border border-border bg-card p-5" />
              ))}
            </div>
          </div>
        </main>
      </DashboardLayout>
    )
  }

  const renderBlockCard = (key: BmcBlockKey, minHeight = 'min-h-36') => {
    const meta = BMC_BLOCK_METADATA[key]
    const content = blocks[key]?.content || ''
    const isFilled = content.trim().length > 0

    return (
      <Card
        key={key}
        className={`flex flex-col justify-between overflow-hidden rounded-xl border transition-all duration-200 ${
          isFilled ? 'border-border bg-card' : 'border-border/70 bg-card/80'
        }`}
      >
        <CardHeader className="border-b border-border/60 bg-muted/10 px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-primary">#{meta.officialOrder}</span>
                <CardTitle className="text-sm font-bold text-foreground">{meta.titleFr}</CardTitle>
              </div>
              <p className="text-[11px] text-muted-foreground">{meta.subtitle}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveHelpKey(activeHelpKey === key ? null : key)}
              title="Aide et conseils méthodologiques"
              className="h-6 w-6 shrink-0 p-0 text-muted-foreground hover:bg-muted hover:text-primary"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-4">
          <Textarea
            aria-label={meta.titleFr}
            value={content}
            onChange={(e) => update(key, e.target.value)}
            rows={minHeight === 'min-h-36' ? 5 : 8}
            placeholder={meta.mainQuestion}
            className={`${minHeight} resize-y rounded-lg border border-border/70 bg-background p-3 text-xs leading-relaxed shadow-2xs placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary`}
          />

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex flex-wrap gap-1">
              {meta.feedsTools.slice(0, 1).map((feed, fIdx) => (
                <span key={fIdx} className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                  <ArrowUpRight className="h-2.5 w-2.5" /> {feed}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1">
              {saving === key ? (
                <span className="text-primary animate-pulse">Sauvegarde…</span>
              ) : savedKey === key ? (
                <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3 w-3" /> Enregistré
                </span>
              ) : (
                <span>{content.length}/4000</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
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
                  <BookOpen className="h-3.5 w-3.5" />
                  Strategyzer Official Framework
                </span>
                <span className="text-xs text-muted-foreground">9 Blocs Méthodologiques</span>
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Business Model Canvas
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Structurez votre modèle économique selon le cadre officiel de Strategyzer. Chaque bloc alimente directement votre Business Plan, vos finances et votre Pitch.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-lg border border-border bg-card p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('canvas')}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    viewMode === 'canvas' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Canvas
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  Liste
                </button>
              </div>

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

          {/* Progress Bar */}
          <section className="rounded-xl border border-border bg-card p-4 shadow-2xs sm:p-5" aria-label="Progression du BMC">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Progression du modèle économique</p>
                  <p className="text-xs text-muted-foreground">
                    {filledBlocks} sur {BMC_BLOCK_KEYS.length} blocs renseignés
                    {completion === 100 && ' — Modèle complet ! (Prêt pour sortie du statut Brouillon)'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-primary">{completion}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-[width] duration-300 ${
                  completion === 100 ? 'bg-emerald-500' : 'bg-primary'
                }`}
                style={{ width: `${completion}%` }}
              />
            </div>
          </section>

          {/* Contextual Help Drawer if a block is clicked */}
          {activeHelpKey && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 shadow-xs space-y-3 animate-in fade-in duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Aide contextuelle & Méthode</span>
                  <h3 className="font-heading text-base font-bold text-foreground">
                    {BMC_BLOCK_METADATA[activeHelpKey].titleFr} ({BMC_BLOCK_METADATA[activeHelpKey].title})
                  </h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveHelpKey(null)} className="h-7 text-xs">
                  Fermer
                </Button>
              </div>

              <p className="text-xs text-foreground font-semibold leading-relaxed">
                👉 Question directrice : {BMC_BLOCK_METADATA[activeHelpKey].mainQuestion}
              </p>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {BMC_BLOCK_METADATA[activeHelpKey].explanation}
              </p>

              <div className="rounded-xl border border-border/80 bg-background p-3.5 space-y-2 text-xs">
                <p className="font-bold text-foreground">
                  🇲🇬 Exemple concret à Madagascar :
                </p>
                <p className="text-muted-foreground italic">
                  « {BMC_BLOCK_METADATA[activeHelpKey].madagascarExample} »
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="space-y-1 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                  <p className="font-bold text-destructive">⚠️ Pièges fréquents à éviter :</p>
                  <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
                    {BMC_BLOCK_METADATA[activeHelpKey].frequentPitfalls.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1 rounded-lg border border-primary/20 bg-background p-3">
                  <p className="font-bold text-primary">💡 Conseils stratégiques :</p>
                  <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
                    {BMC_BLOCK_METADATA[activeHelpKey].tips.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: CANVAS 2-ROW / 5-COL GRID vs LIST */}
          {viewMode === 'canvas' ? (
            <div className="space-y-4">
              {/* TOP ROW: Partners (1 col), Activities & Resources (1 col stacked), Value Prop (1 col), Relationships & Channels (1 col stacked), Customer Segments (1 col) */}
              <div className="grid gap-4 lg:grid-cols-5">
                {/* Col 1: Key Partners */}
                <div className="lg:col-span-1">{renderBlockCard('keyPartners', 'min-h-80')}</div>

                {/* Col 2: Key Activities & Key Resources */}
                <div className="flex flex-col gap-4 lg:col-span-1">
                  {renderBlockCard('keyActivities', 'min-h-36')}
                  {renderBlockCard('keyResources', 'min-h-36')}
                </div>

                {/* Col 3: Value Propositions */}
                <div className="lg:col-span-1">{renderBlockCard('valuePropositions', 'min-h-80')}</div>

                {/* Col 4: Customer Relationships & Channels */}
                <div className="flex flex-col gap-4 lg:col-span-1">
                  {renderBlockCard('customerRelationships', 'min-h-36')}
                  {renderBlockCard('channels', 'min-h-36')}
                </div>

                {/* Col 5: Customer Segments */}
                <div className="lg:col-span-1">{renderBlockCard('customerSegments', 'min-h-80')}</div>
              </div>

              {/* BOTTOM ROW: Cost Structure (2.5 cols) & Revenue Streams (2.5 cols) */}
              <div className="grid gap-4 sm:grid-cols-2">
                {renderBlockCard('costStructure', 'min-h-36')}
                {renderBlockCard('revenueStreams', 'min-h-36')}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {BMC_BLOCK_KEYS.map((key) => renderBlockCard(key))}
            </div>
          )}

          {/* Footer Attribution */}
          <footer className="mt-4 rounded-xl border border-border/60 bg-muted/20 p-4 text-center text-xs text-muted-foreground">
            {STRATEGYZER_ATTRIBUTION}
          </footer>
        </div>
      </main>
    </DashboardLayout>
  )
}
