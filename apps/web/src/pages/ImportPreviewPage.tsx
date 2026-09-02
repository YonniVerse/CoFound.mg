import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Copy, FileSpreadsheet, Loader2, RotateCcw, ShieldCheck, UserCheck, XCircle } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { importPreviewSchema, type ImportApplyResult, type ImportPreview, type ImportPreviewResult, type ImportPreviewRow } from '@cofound/shared'
import { apiClient, ApiClientError } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useI18n } from '@/i18n'

const RESULT_STYLES: Record<ImportPreviewResult, string> = {
  CREATED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  UPDATED: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  SKIPPED_DUPLICATE: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  ERROR: 'bg-destructive/10 text-destructive border-destructive/20',
}

function resultIcon(result: ImportPreviewResult) {
  if (result === 'ERROR') return <XCircle className="h-4 w-4" />
  if (result === 'SKIPPED_DUPLICATE') return <AlertTriangle className="h-4 w-4" />
  if (result === 'UPDATED') return <CheckCircle2 className="h-4 w-4" />
  return <CheckCircle2 className="h-4 w-4" />
}

export default function ImportPreviewPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const importId = params.id || searchParams.get('importId')

  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | ImportPreviewResult>('ALL')
  const [isLoading, setIsLoading] = useState(Boolean(importId))
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [applyResult, setApplyResult] = useState<ImportApplyResult | null>(null)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!importId) return
    let cancelled = false

    apiClient
      .get(`/institution/imports/${importId}/preview`, importPreviewSchema)
      .then((data) => {
        if (!cancelled) setPreview(data)
      })
      .catch((err) => {
        if (!cancelled) {
          if (err instanceof ApiClientError) {
            setLoadError(err.message || t('import.previewLoadError'))
          } else {
            setLoadError(t('import.previewLoadError'))
          }
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [importId, t])

  const counts = useMemo(() => {
    const rows = preview?.rows ?? []
    return {
      total: rows.length,
      created: rows.filter((row) => row.result === 'CREATED').length,
      updated: rows.filter((row) => row.result === 'UPDATED').length,
      duplicates: rows.filter((row) => row.result === 'SKIPPED_DUPLICATE').length,
      errors: rows.filter((row) => row.result === 'ERROR').length,
    }
  }, [preview])

  const visibleRows = useMemo(() => {
    if (!preview) return []
    if (selectedFilter === 'ALL') return preview.rows
    return preview.rows.filter((row) => row.result === selectedFilter)
  }, [preview, selectedFilter])

  const canApply = counts.created > 0 || counts.updated > 0

  async function handleApply() {
    if (!importId || !canApply || isApplying) return
    setIsApplying(true)
    setApplyError(null)

    try {
      const result = await apiClient.post<ImportApplyResult>(`/institution/imports/${importId}/apply`, {
        batchId: importId,
      })
      setApplyResult(result)
    } catch (err) {
      if (err instanceof ApiClientError) {
        setApplyError(err.message || 'Une erreur est survenue lors de l’application de l’import.')
      } else {
        setApplyError('Une erreur inattendue est survenue. Vérifiez votre connexion et réessayez.')
      }
    } finally {
      setIsApplying(false)
    }
  }

  async function handleCopyActivationLinks() {
    if (!importId) return
    try {
      const result = await apiClient.post<{ links?: Array<{ email: string; url: string }> }>(
        `/institution/imports/${importId}/activation-links`,
        {},
      )
      const lines = (result.links ?? []).map((link) => `${link.email}: ${link.url}`).join('\n')
      if (lines) {
        await navigator.clipboard?.writeText(lines)
        setCopyFeedback(`${result.links?.length ?? 0} lien(s) copié(s) dans le presse-papier !`)
        setTimeout(() => setCopyFeedback(null), 4000)
      }
    } catch {
      setCopyFeedback('Impossible de générer les liens de secours.')
      setTimeout(() => setCopyFeedback(null), 4000)
    }
  }

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(importId ? `/institution/imports/${importId}/mapping` : '/institution/imports/new')}
              className="-ml-3 gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> {t('import.backMapping')}
            </Button>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Étape 3 sur 4
            </span>
          </div>

          <header className="max-w-3xl space-y-3">
            <div className="flex items-center gap-3 text-primary">
              <FileSpreadsheet className="h-7 w-7" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">{t('import.previewEyebrow')}</p>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t('import.previewTitle')}
            </h1>
            <p className="text-base leading-7 text-muted-foreground">{t('import.previewDescription')}</p>
          </header>

          {/* Banner Mode Simulation / Pas d'écriture */}
          {!applyResult && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-sm text-foreground">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <p>
                <strong>{t('import.noAccounts')}</strong> {t('import.previewNoMutation')}
              </p>
            </div>
          )}

          {/* Success Card After Apply */}
          {applyResult && (
            <Card className="border-emerald-500/40 bg-emerald-500/[0.04] shadow-sm">
              <CardContent className="mt-3 space-y-6 p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-foreground sm:text-2xl">Import terminé avec succès !</h2>
                    <p className="text-sm text-muted-foreground">
                      Les comptes étudiants ont été créés et associés à votre établissement. Les emails d’invitation ont été mis en file d'envoi.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Summary label="Comptes créés (invités)" value={applyResult.createdRows} tone="text-emerald-700" />
                  <Summary label="Affiliations mises à jour" value={applyResult.updatedRows} tone="text-blue-700" />
                  <Summary label="Doublons ignorés" value={applyResult.skippedRows} tone="text-amber-700" />
                  <Summary label="Lignes en erreur" value={applyResult.errorRows} tone="text-destructive" />
                </div>

                {copyFeedback && (
                  <div className="rounded-lg bg-primary/10 p-3 text-xs font-semibold text-primary">
                    {copyFeedback}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild className="gap-2">
                    <Link to={`/institution/imports/${applyResult.batchId}`}>
                      <UserCheck className="h-4 w-4" /> Voir le détail du lot
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => void handleCopyActivationLinks()} className="gap-2">
                    <Copy className="h-4 w-4" /> Copier les liens de secours
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/institution">Retour à la console</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <Card>
              <CardContent className="flex items-center justify-center gap-3 p-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" /> {t('import.previewLoading')}
              </CardContent>
            </Card>
          )}

          {loadError && (
            <Card className="border-destructive/30">
              <CardContent className="flex items-center gap-3 p-6 text-destructive">
                <XCircle className="h-5 w-5" /> {loadError}
              </CardContent>
            </Card>
          )}

          {preview && !isLoading && !applyResult && (
            <>
              {/* Summary KPIs */}
              <Card className="rounded-xl border-border bg-card shadow-2xs">
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center justify-between gap-3">
                    <span className="truncate">{preview.fileName}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {counts.total} {t('import.rowsAnalyzed')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Summary label={t('import.toCreate')} value={counts.created} tone="text-emerald-700" />
                  <Summary label={t('import.toUpdate')} value={counts.updated} tone="text-blue-700" />
                  <Summary label={t('import.duplicatesSkipped')} value={counts.duplicates} tone="text-amber-700" />
                  <Summary label={t('import.errors')} value={counts.errors} tone="text-destructive" />
                </CardContent>
              </Card>

              {/* Warning on errors */}
              {counts.errors > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-foreground">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-semibold text-foreground">
                      {counts.errors} ligne(s) comportent des anomalies
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ces lignes ne seront pas importées. Vous pouvez appliquer le lot pour importer les {counts.created + counts.updated} étudiant(s) valides, ou modifier le mapping/fichier.
                    </p>
                  </div>
                </div>
              )}

              {/* Row Details with Filter Tabs */}
              <Card className="rounded-xl border-border bg-card shadow-2xs">
                <CardHeader className="flex flex-col gap-4 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-base font-bold">{t('import.rowsDetail')}</CardTitle>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant={selectedFilter === 'ALL' ? 'default' : 'outline'}
                      onClick={() => setSelectedFilter('ALL')}
                      className="h-8 rounded-lg px-2.5 text-xs"
                    >
                      Toutes ({counts.total})
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedFilter === 'CREATED' ? 'default' : 'outline'}
                      onClick={() => setSelectedFilter('CREATED')}
                      className="h-8 rounded-lg px-2.5 text-xs"
                    >
                      À créer ({counts.created})
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedFilter === 'UPDATED' ? 'default' : 'outline'}
                      onClick={() => setSelectedFilter('UPDATED')}
                      className="h-8 rounded-lg px-2.5 text-xs"
                    >
                      À mettre à jour ({counts.updated})
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedFilter === 'SKIPPED_DUPLICATE' ? 'default' : 'outline'}
                      onClick={() => setSelectedFilter('SKIPPED_DUPLICATE')}
                      className="h-8 rounded-lg px-2.5 text-xs"
                    >
                      Doublons ({counts.duplicates})
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedFilter === 'ERROR' ? 'default' : 'outline'}
                      onClick={() => setSelectedFilter('ERROR')}
                      className="h-8 rounded-lg px-2.5 text-xs text-destructive hover:text-destructive"
                    >
                      Erreurs ({counts.errors})
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="mt-3 space-y-3">
                  {visibleRows.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">{t('import.noMatchingRows')}</p>
                  ) : (
                    visibleRows.map((row) => <PreviewRow key={row.lineNumber} row={row} />)
                  )}
                </CardContent>
              </Card>

              {applyError && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  <XCircle className="h-5 w-5 shrink-0" />
                  <span>{applyError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(importId ? `/institution/imports/${importId}/mapping` : '/institution/imports/new')
                  }
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> {t('import.editMapping')}
                </Button>
                <Button
                  disabled={!canApply || isApplying}
                  onClick={() => void handleApply()}
                  className="gap-2 shadow-sm"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Application de l’import…
                    </>
                  ) : (
                    <>
                      Confirmer et appliquer l’import <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}

function Summary({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 shadow-2xs">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold tracking-tight ${tone}`}>{value}</p>
    </div>
  )
}

function PreviewRow({ row }: { row: ImportPreviewRow }) {
  const { t } = useI18n()
  const resultLabels: Record<ImportPreviewResult, string> = {
    CREATED: t('import.resultCreated'),
    UPDATED: t('import.resultUpdated'),
    SKIPPED_DUPLICATE: t('import.resultDuplicate'),
    ERROR: t('import.resultError'),
  }

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-background p-4 md:grid-cols-[64px_minmax(180px,1.2fr)_minmax(200px,1.5fr)_auto] md:items-center">
      <span className="text-sm font-semibold text-muted-foreground">
        {t('import.row')} {row.lineNumber}
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground">{row.displayName}</p>
        <p className="truncate text-xs text-muted-foreground">{row.email}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${RESULT_STYLES[row.result]}`}
        >
          {resultIcon(row.result)} {resultLabels[row.result]}
        </span>
        {row.errorMessage && <span className="text-xs font-medium text-destructive">{row.errorMessage}</span>}
      </div>
      <div className="text-right text-xs text-muted-foreground">
        {row.fieldOfStudy && <span>{row.fieldOfStudy}</span>}
        {row.level && <span> · {row.level}</span>}
        {row.entryYear && <span> ({row.entryYear})</span>}
      </div>
    </div>
  )
}
