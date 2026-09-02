import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronRight, FileSpreadsheet, Mail, RefreshCw, XCircle } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiClientError, apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { InstitutionErrorState } from '@/components/institution/InstitutionErrorState'

type BatchStatus = 'PREVIEW' | 'APPLIED' | 'CANCELLED' | string
type RowResult = 'CREATED' | 'UPDATED' | 'SKIPPED_DUPLICATE' | 'ERROR' | 'BOUNCED' | null | string
type Batch = {
  id: string
  fileKey: string
  status: BatchStatus
  createdAt: string
  uploadedBy?: { email?: string }
  totalRows: number
  createdRows: number
  updatedRows: number
  skippedRows: number
  errorRows: number
  bouncedRows: number
}
type BatchRow = {
  id: string
  lineNumber: number
  result: RowResult
  errorCode?: string | null
  normalizedEmail?: string | null
  user?: { email?: string; status?: string } | null
}
type Detail = Omit<Batch, 'totalRows' | 'createdRows' | 'updatedRows' | 'skippedRows' | 'errorRows' | 'bouncedRows'> & {
  counters: {
    totalRows: number
    createdRows: number
    updatedRows: number
    skippedRows: number
    errorRows: number
    bouncedRows: number
  }
  rows: BatchRow[]
  bouncedEmails: string[]
}

const labels: Record<string, string> = {
  PREVIEW: 'Prévisualisation',
  APPLIED: 'Appliqué',
  CANCELLED: 'Annulé',
  CREATED: 'Créé',
  UPDATED: 'Mis à jour',
  SKIPPED_DUPLICATE: 'Doublon ignoré',
  ERROR: 'Erreur',
  BOUNCED: 'Rebond',
}

const statusStyles: Record<string, string> = {
  PREVIEW: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  APPLIED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  CANCELLED: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  ERROR: 'bg-destructive/10 text-destructive',
  BOUNCED: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  CREATED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  UPDATED: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  SKIPPED_DUPLICATE: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function parseBatch(value: unknown): Batch {
  const item = isRecord(value) ? value : {}
  return {
    id: asString(item.id),
    fileKey: asString(item.fileKey, 'Import sans nom'),
    status: asString(item.status),
    createdAt: asString(item.createdAt),
    uploadedBy: isRecord(item.uploadedBy) ? { email: asString(item.uploadedBy.email) } : undefined,
    totalRows: Number(item.totalRows ?? 0),
    createdRows: Number(item.createdRows ?? 0),
    updatedRows: Number(item.updatedRows ?? 0),
    skippedRows: Number(item.skippedRows ?? 0),
    errorRows: Number(item.errorRows ?? 0),
    bouncedRows: Number(item.bouncedRows ?? 0),
  }
}

function parseDetail(value: unknown): Detail {
  const item = parseBatch(value)
  const raw = isRecord(value) ? value : {}
  const counters = isRecord(raw.counters) ? raw.counters : {}
  const rows = Array.isArray(raw.rows)
    ? raw.rows.filter(isRecord).map((row) => ({
        id: asString(row.id),
        lineNumber: Number(row.lineNumber ?? 0),
        result: row.result == null ? null : asString(row.result),
        errorCode: row.errorCode == null ? null : asString(row.errorCode),
        normalizedEmail: row.normalizedEmail == null ? null : asString(row.normalizedEmail),
        user: isRecord(row.user) ? { email: asString(row.user.email), status: asString(row.user.status) } : null,
      }))
    : []
  return {
    ...item,
    counters: {
      totalRows: Number(counters.totalRows ?? 0),
      createdRows: Number(counters.createdRows ?? 0),
      updatedRows: Number(counters.updatedRows ?? 0),
      skippedRows: Number(counters.skippedRows ?? 0),
      errorRows: Number(counters.errorRows ?? 0),
      bouncedRows: Number(counters.bouncedRows ?? 0),
    },
    rows,
    bouncedEmails: Array.isArray(raw.bouncedEmails)
      ? raw.bouncedEmails.filter((email): email is string => typeof email === 'string')
      : [],
  }
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date inconnue'
    : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function apiMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    const key = error.messageKey
    if (key && !key.startsWith('errors.') && !key.startsWith('HTTP_')) return key
    return error.message || 'Cette action n’est pas autorisée ou ne peut pas être exécutée dans l’état actuel du lot.'
  }
  return 'Une erreur réseau est survenue. Réessayez.'
}

function ImportListSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Chargement des lots d’import">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="rounded-xl border-border bg-card shadow-2xs">
            <CardContent className="mt-3 space-y-3 p-5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Chargement du lot">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-7 w-72 max-w-full" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-xl" />
        ))}
      </div>
      <Card className="rounded-xl border-border bg-card shadow-2xs">
        <CardHeader className="border-b border-border/60">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="mt-3 space-y-2 p-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ImportBatchesPage() {
  const { id } = useParams()
  return id ? <BatchDetail id={id} /> : <BatchList />
}

function BatchList() {
  const navigate = useNavigate()
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.get('/institution/imports')
      setBatches(Array.isArray(data) ? data.map(parseBatch) : [])
    } catch (caught) {
      setError(caught)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/institution')}
                className="-ml-2 mb-2 h-8 gap-2 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Console établissement
              </Button>
              <div className="flex items-center gap-2 text-primary">
                <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-wider">Import établissement</p>
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Historique des imports
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Suivez les lots d'étudiants importés, leurs statuts, leurs affiliations et les invitations envoyées.
              </p>
            </div>
            <Button onClick={() => navigate('/institution/imports/new')} className="h-10 w-fit gap-2 rounded-lg">
              <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
              Nouvel import
            </Button>
          </header>

          {!loading && error !== null && (
            <InstitutionErrorState
              error={error}
              onRetry={() => void load()}
              fallbackDescription="Les lots d’import n’ont pas pu être chargés. Vérifiez votre connexion puis réessayez."
            />
          )}

          {loading && <ImportListSkeleton />}

          {!loading && !error && batches.length === 0 && (
            <Card className="rounded-xl border-border bg-card shadow-2xs">
              <CardContent className="mt-3 p-10 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
                  <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-4 font-semibold text-foreground">Aucun lot d’import</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Importez votre première promotion au format CSV ou Excel pour commencer à inviter les étudiants.
                </p>
                <Button onClick={() => navigate('/institution/imports/new')} className="mt-5 gap-2">
                  <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                  Créer un import
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && !error && batches.length > 0 && (
            <div className="grid gap-3">
              {batches.map((batch) => (
                <button
                  key={batch.id}
                  type="button"
                  onClick={() => navigate(`/institution/imports/${batch.id}`)}
                  className="w-full text-left"
                >
                  <Card className="rounded-xl border-border bg-card shadow-2xs transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
                    <CardContent className="mt-3 flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-sm font-bold text-foreground">
                            {batch.fileKey.split('/').pop()}
                          </h2>
                          <Status value={batch.status} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(batch.createdAt)} · {batch.totalRows} ligne
                          {batch.totalRows > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-5 text-center md:min-w-[320px]">
                        <Metric label="Créés" value={batch.createdRows} tone="text-emerald-700" />
                        <Metric label="Erreurs" value={batch.errorRows} tone="text-destructive" />
                        <Metric label="Rebonds" value={batch.bouncedRows} tone="text-orange-700" />
                      </div>
                      <ChevronRight className="hidden h-4 w-4 text-muted-foreground md:block" aria-hidden="true" />
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}

function BatchDetail({ id }: { id: string }) {
  const navigate = useNavigate()
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  const [filter, setFilter] = useState('ALL')
  const [confirmation, setConfirmation] = useState('')
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.get(`/institution/imports/${id}`)
      setDetail(parseDetail(data))
    } catch (caught) {
      setError(caught)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  const rows = useMemo(
    () => detail?.rows.filter((row) => filter === 'ALL' || row.result === filter) ?? [],
    [detail, filter],
  )

  const cancel = async () => {
    setBusy(true)
    setActionMessage(null)
    try {
      await apiClient.post(`/institution/imports/${id}/cancel`, { confirmation })
      setActionMessage('Le lot a été annulé.')
      setConfirmation('')
      void load()
    } catch (caught) {
      setActionMessage(apiMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  const resend = async () => {
    setBusy(true)
    setActionMessage(null)
    try {
      const result = await apiClient.post<{ queued?: number }>(
        `/institution/imports/${id}/resend-invitations`,
        {},
      )
      setActionMessage(`${result.queued ?? 0} invitation(s) relancée(s) avec succès.`)
    } catch (caught) {
      setActionMessage(apiMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  const activationLinks = async () => {
    setBusy(true)
    setActionMessage(null)
    try {
      const result = await apiClient.post<{ links?: Array<{ email: string; url: string }> }>(
        `/institution/imports/${id}/activation-links`,
        {},
      )
      const lines = (result.links ?? []).map((link) => `${link.email}: ${link.url}`).join('\n')
      if (lines) await navigator.clipboard?.writeText(lines)
      setActionMessage(`${result.links?.length ?? 0} lien(s) généré(s) et copié(s) dans le presse-papier.`)
    } catch (caught) {
      setActionMessage(apiMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
          <div className="mx-auto max-w-[1400px]">
            <DetailSkeleton />
          </div>
        </main>
      </DashboardLayout>
    )
  }

  if (error || !detail) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <InstitutionErrorState
              error={error ?? new Error('Lot introuvable.')}
              onRetry={() => void load()}
              fallbackDescription="Le détail de ce lot n’a pas pu être chargé. Réessayez dans quelques instants."
            />
          </div>
        </main>
      </DashboardLayout>
    )
  }

  const c = detail.counters
  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/institution/imports')}
            className="-ml-2 h-8 w-fit gap-2 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Retour à l'historique
          </Button>

          <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                </div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {detail.fileKey.split('/').pop()}
                </h1>
                <Status value={detail.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                Déposé le {formatDate(detail.createdAt)}
                {detail.uploadedBy?.email ? ` par ${detail.uploadedBy.email}` : ''}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => void load()}
              disabled={busy}
              className="h-9 w-fit gap-2 rounded-lg"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Actualiser
            </Button>
          </header>

          {/* Preview Resume Banner if in PREVIEW */}
          {detail.status === 'PREVIEW' && (
            <Card className="rounded-xl border-amber-500/30 bg-amber-500/[0.03] shadow-2xs">
              <CardContent className="mt-3 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-semibold text-foreground">Ce lot est en attente de confirmation (prévisualisation)</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Aucun compte n’a encore été créé. Vous pouvez vérifier le mapping ou appliquer le lot.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/institution/imports/${id}/mapping`}>Modifier le mapping</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to={`/institution/imports/${id}/preview`}>Continuer l’import</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* KPI Counters */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <MetricCard label="Total" value={c.totalRows} />
            <MetricCard label="Créés" value={c.createdRows} tone="text-emerald-700" />
            <MetricCard label="Mis à jour" value={c.updatedRows} tone="text-blue-700" />
            <MetricCard label="Ignorés" value={c.skippedRows} tone="text-amber-700" />
            <MetricCard label="Erreurs" value={c.errorRows} tone="text-destructive" />
            <MetricCard label="Rebonds" value={c.bouncedRows} tone="text-orange-700" />
          </div>

          {actionMessage && (
            <Card className="rounded-xl border-primary/20 bg-primary/[0.03] shadow-2xs">
              <CardContent className="mt-3 flex items-center gap-2 p-4 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {actionMessage}
              </CardContent>
            </Card>
          )}

          {/* Row list */}
          <Card className="rounded-xl border-border bg-card shadow-2xs">
            <CardHeader className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <CardTitle className="text-base font-bold tracking-tight">Lignes du lot</CardTitle>
              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'CREATED', 'UPDATED', 'SKIPPED_DUPLICATE', 'ERROR', 'BOUNCED'].map((value) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={filter === value ? 'default' : 'outline'}
                    onClick={() => setFilter(value)}
                    className="h-8 rounded-lg px-2.5 text-xs"
                  >
                    {value === 'ALL' ? 'Toutes' : labels[value]}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="mt-3 space-y-2 p-5 sm:p-6">
              {rows.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Aucune ligne pour ce filtre.</p>
              ) : (
                rows.map((row) => (
                  <div
                    key={row.id}
                    className="grid gap-2 rounded-lg border border-border/70 p-3 md:grid-cols-[70px_minmax(180px,1fr)_170px_180px] md:items-center"
                  >
                    <span className="text-xs font-semibold text-muted-foreground">Ligne {row.lineNumber}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {row.user?.email ?? row.normalizedEmail ?? 'Adresse non renseignée'}
                      </p>
                      {row.errorCode && <p className="text-xs text-destructive">{row.errorCode}</p>}
                    </div>
                    <Status value={row.result ?? 'UNKNOWN'} />
                    <span className="text-xs text-muted-foreground">Statut compte : {row.user?.status ?? '—'}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {detail.bouncedEmails.length > 0 && (
            <Card className="rounded-xl border-border bg-card shadow-2xs">
              <CardHeader className="border-b border-border/60 px-5 py-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold tracking-tight">
                  <Mail className="h-4 w-4 text-orange-700" aria-hidden="true" />
                  Adresses en rebond
                </CardTitle>
              </CardHeader>
              <CardContent className="mt-3 flex flex-wrap gap-2 p-5 sm:p-6">
                {detail.bouncedEmails.map((email) => (
                  <span
                    key={email}
                    className="rounded-md bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-800"
                  >
                    {email}
                  </span>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-xl border-border bg-card shadow-2xs">
              <CardHeader className="border-b border-border/60 px-5 py-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold tracking-tight">
                  <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                  Annuler le lot
                </CardTitle>
              </CardHeader>
              <CardContent className="mt-3 space-y-4 p-5 sm:p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Disponible uniquement pour un lot en prévisualisation. Saisissez{' '}
                  <strong className="text-foreground">ANNULER {id}</strong> pour confirmer.
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="batch-confirmation" className="text-xs font-semibold text-foreground">
                    Confirmation
                  </Label>
                  <Input
                    id="batch-confirmation"
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    placeholder={`ANNULER ${id}`}
                    className="h-11 rounded-xl border-border/80 bg-background px-4 text-sm shadow-2xs focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
                <Button
                  variant="destructive"
                  disabled={busy || confirmation !== `ANNULER ${id}` || detail.status !== 'PREVIEW'}
                  onClick={() => void cancel()}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  {busy ? 'Annulation…' : 'Annuler le lot'}
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border bg-card shadow-2xs">
              <CardHeader className="border-b border-border/60 px-5 py-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold tracking-tight">
                  <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                  Relancer les invitations & Liens de secours
                </CardTitle>
              </CardHeader>
              <CardContent className="mt-3 space-y-4 p-5 sm:p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Relance uniquement les comptes encore au statut invité sans modifier les comptes déjà activés.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={busy || detail.status !== 'APPLIED'}
                    onClick={() => void resend()}
                    className="gap-2"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Relancer les invitations
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy || detail.status !== 'APPLIED'}
                    onClick={() => void activationLinks()}
                  >
                    Copier les liens de secours
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}

function Status({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        statusStyles[value] ?? 'bg-muted text-muted-foreground'
      }`}
    >
      {value === 'ERROR' || value === 'BOUNCED' ? (
        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {labels[value] ?? value}
    </span>
  )
}

function Metric({ label, value, tone = 'text-foreground' }: { label: string; value: number; tone?: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-bold ${tone}`}>{value}</p>
    </div>
  )
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <Card className="rounded-xl border-border bg-card shadow-2xs">
      <CardContent className="mt-3 p-4">
        <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-bold tracking-tight ${tone ?? 'text-foreground'}`}>{value}</p>
      </CardContent>
    </Card>
  )
}
