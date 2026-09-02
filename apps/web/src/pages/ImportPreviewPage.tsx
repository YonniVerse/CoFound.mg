import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, CheckCircle2, FileSpreadsheet, Loader2, RotateCcw, XCircle } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { importPreviewSchema, type ImportPreview, type ImportPreviewResult, type ImportPreviewRow } from '@cofound/shared'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useI18n } from '@/i18n'

const SAMPLE_PREVIEW: ImportPreview = {
  batchId: 'demo-import',
  fileName: 'promotion-2024.xlsx',
  rows: [
    { lineNumber: 2, displayName: 'Mialy Randria', email: 'mialy.randria@example.mg', result: 'CREATED', errorMessage: null },
    { lineNumber: 3, displayName: 'Fara Rakoto', email: 'fara.rakoto@example.mg', result: 'UPDATED', errorMessage: null },
    { lineNumber: 4, displayName: 'Hery Andria', email: 'hery.andria@example.mg', result: 'SKIPPED_DUPLICATE', errorMessage: null },
    { lineNumber: 5, displayName: 'Lova Rabe', email: 'adresse-invalide', result: 'ERROR', errorMessage: 'Adresse email invalide.' },
  ],
}

const RESULT_STYLES: Record<ImportPreviewResult, string> = {
  CREATED: 'bg-emerald-500/10 text-emerald-700',
  UPDATED: 'bg-blue-500/10 text-blue-700',
  SKIPPED_DUPLICATE: 'bg-amber-500/10 text-amber-700',
  ERROR: 'bg-destructive/10 text-destructive',
}

function resultIcon(result: ImportPreviewResult) {
  if (result === 'ERROR') return <XCircle className="h-4 w-4" />
  if (result === 'SKIPPED_DUPLICATE') return <AlertTriangle className="h-4 w-4" />
  return <CheckCircle2 className="h-4 w-4" />
}

export default function ImportPreviewPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const importId = params.id || searchParams.get('importId')
  const [preview, setPreview] = useState<ImportPreview | null>(importId ? null : SAMPLE_PREVIEW)
  const [showErrorsOnly, setShowErrorsOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(Boolean(importId))
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!importId) return
    let cancelled = false
    apiClient.get(`/institution/imports/${importId}/preview`, importPreviewSchema)
      .then((data) => {
        if (!cancelled) setPreview(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError(t('import.previewLoadError'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => { cancelled = true }
  }, [importId, t])

  const visibleRows = useMemo(() => preview?.rows.filter((row) => !showErrorsOnly || row.result === 'ERROR') ?? [], [preview, showErrorsOnly])
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

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => navigate('/institution/imports/new')} className="-ml-3 gap-2">
              <ArrowLeft className="h-4 w-4" /> {t('import.backMapping')}
            </Button>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Étape 3 sur 4</span>
          </div>

          <header className="max-w-3xl space-y-3">
            <div className="flex items-center gap-3 text-primary"><FileSpreadsheet className="h-7 w-7" /><p className="text-sm font-semibold uppercase tracking-[0.18em]">{t('import.previewEyebrow')}</p></div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t('import.previewTitle')}</h1>
            <p className="text-base leading-7 text-muted-foreground">{t('import.previewDescription')}</p>
          </header>

          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p><strong>{t('import.noAccounts')}</strong> {t('import.previewNoMutation')}</p>
          </div>

          {isLoading && <Card><CardContent className="flex items-center justify-center gap-3 p-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> {t('import.previewLoading')}</CardContent></Card>}
          {loadError && <Card className="border-destructive/30"><CardContent className="flex items-center gap-3 p-6 text-destructive"><XCircle className="h-5 w-5" /> {loadError}</CardContent></Card>}

          {preview && !isLoading && (
            <>
              <Card>
                <CardHeader><CardTitle className="flex flex-wrap items-center justify-between gap-3"><span>{preview.fileName}</span><span className="text-sm font-normal text-muted-foreground">{counts.total} {t('import.rowsAnalyzed')}</span></CardTitle></CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Summary label={t('import.toCreate')} value={counts.created} tone="text-emerald-700" />
                  <Summary label={t('import.toUpdate')} value={counts.updated} tone="text-blue-700" />
                  <Summary label={t('import.duplicatesSkipped')} value={counts.duplicates} tone="text-amber-700" />
                  <Summary label={t('import.errors')} value={counts.errors} tone="text-destructive" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>{t('import.rowsDetail')}</CardTitle><Button variant={showErrorsOnly ? 'default' : 'outline'} size="sm" onClick={() => setShowErrorsOnly((current) => !current)}>{showErrorsOnly ? t('import.showAllRows') : t('import.showOnlyErrors')}</Button></CardHeader>
                <CardContent className="space-y-3">
                  {visibleRows.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t('import.noMatchingRows')}</p>}
                  {visibleRows.map((row) => <PreviewRow key={row.lineNumber} row={row} />)}
                </CardContent>
              </Card>

              <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
                <Button variant="outline" onClick={() => navigate('/institution/imports/new')} className="gap-2"><RotateCcw className="h-4 w-4" /> {t('import.editMapping')}</Button>
                <Button disabled={counts.errors > 0} onClick={() => navigate(`/institution/imports/${preview.batchId}/apply`)} className="gap-2">{t('import.applyBatch')} <ArrowLeft className="h-4 w-4 rotate-180" /></Button>
              </div>
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}

function Summary({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className="rounded-xl border border-border bg-background p-4"><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p></div>
}

function PreviewRow({ row }: { row: ImportPreviewRow }) {
  const { t } = useI18n()
  const resultLabels: Record<ImportPreviewResult, string> = {
    CREATED: t('import.resultCreated'),
    UPDATED: t('import.resultUpdated'),
    SKIPPED_DUPLICATE: t('import.resultDuplicate'),
    ERROR: t('import.resultError'),
  }
  return <div className="grid gap-3 rounded-xl border border-border bg-background p-4 md:grid-cols-[64px_minmax(180px,1fr)_minmax(200px,1fr)_auto] md:items-center"><span className="text-sm font-semibold text-muted-foreground">{t('import.row')} {row.lineNumber}</span><div className="min-w-0"><p className="truncate font-semibold text-foreground">{row.displayName}</p><p className="truncate text-sm text-muted-foreground">{row.email}</p></div><div className="flex items-center gap-2"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${RESULT_STYLES[row.result]}`}>{resultIcon(row.result)} {resultLabels[row.result]}</span>{row.errorMessage && <span className="text-sm text-destructive">{row.errorMessage}</span>}</div><span className="text-xs text-muted-foreground">{t('import.noWrite')}</span></div>
}
