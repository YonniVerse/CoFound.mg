import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  Mail,
  RefreshCw,
  XCircle,
  Upload,
  Send,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ApiClientError, apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { InstitutionHeader } from '@/components/institution/InstitutionHeader'
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
  PREVIEW: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  APPLIED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  ERROR: 'bg-destructive/10 text-destructive border-destructive/20',
  BOUNCED: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  CREATED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  UPDATED: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  SKIPPED_DUPLICATE: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
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

export default function ImportBatchesPage() {
  const { id } = useParams()
  return id ? <BatchDetail id={id} /> : <BatchList />
}

function BatchList() {
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
    void load()
  }, [load])

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          <InstitutionHeader
            title="Historique des imports d’étudiants"
            description="Consultez l'historique de tous les fichiers importés pour votre établissement, leurs diagnostics et le statut des invitations."
            backHref="/institution/dashboard"
            backLabel="Tableau de bord"
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void load()}
                  disabled={loading}
                  className="h-9 gap-1.5 text-xs font-semibold"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
                <Button asChild size="sm" className="h-9 gap-1.5 text-xs font-semibold">
                  <Link to="/institution/imports/new">
                    <Upload className="h-3.5 w-3.5" />
                    Importer une promotion
                  </Link>
                </Button>
              </div>
            }
          />

          {!loading && error !== null && (
            <InstitutionErrorState
              error={error}
              onRetry={() => void load()}
              fallbackDescription="Les lots d’import n’ont pas pu être chargés. Vérifiez votre connexion puis réessayez."
            />
          )}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-border/80 p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : batches.length === 0 && !error ? (
            <Card className="border-border/80 shadow-2xs">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FileSpreadsheet className="h-7 w-7" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Aucun lot d’import
                </h3>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
                  Importez votre premier fichier d’étudiants au format CSV ou Excel pour créer leurs affiliations et leur envoyer un lien d’activation.
                </p>
                <Button asChild className="mt-5 gap-2 text-xs font-semibold">
                  <Link to="/institution/imports/new">
                    <Upload className="h-3.5 w-3.5" />
                    Importer des étudiants
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {batches.map((batch) => {
                const fileName = batch.fileKey.split('/').pop() || batch.fileKey
                const statusBadge = statusStyles[batch.status] || 'bg-muted text-muted-foreground border-border'

                return (
                  <Link
                    key={batch.id}
                    to={`/institution/imports/${batch.id}`}
                    className="block group"
                  >
                    <Card className="border-border/80 p-5 shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <FileSpreadsheet className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-foreground truncate">
                                {fileName}
                              </h3>
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge}`}
                              >
                                {labels[batch.status] ?? batch.status}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Déposé le {formatDate(batch.createdAt)} • {batch.totalRows} ligne(s)
                              {batch.uploadedBy?.email ? ` par ${batch.uploadedBy.email}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
                          <div className="flex items-center gap-4 text-xs">
                            <div>
                              <span className="text-muted-foreground">Créés : </span>
                              <strong className="text-emerald-600 font-semibold">{batch.createdRows}</strong>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Erreurs : </span>
                              <strong className={batch.errorRows > 0 ? 'text-destructive font-semibold' : 'text-foreground'}>
                                {batch.errorRows}
                              </strong>
                            </div>
                            {batch.bouncedRows > 0 && (
                              <div>
                                <span className="text-muted-foreground">Rebonds : </span>
                                <strong className="text-orange-600 font-semibold">{batch.bouncedRows}</strong>
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}

function BatchDetail({ id }: { id: string }) {
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  const [filter, setFilter] = useState('ALL')
  const [confirmation, setConfirmation] = useState('')
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
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
    void load()
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
      setActionMessage({ type: 'success', text: 'Le lot d’import a été annulé avec succès.' })
      setConfirmation('')
      void load()
    } catch (caught) {
      setActionMessage({ type: 'error', text: apiMessage(caught) })
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
      setActionMessage({
        type: 'success',
        text: `${result.queued ?? 0} invitation(s) relancée(s) avec succès.`,
      })
    } catch (caught) {
      setActionMessage({ type: 'error', text: apiMessage(caught) })
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
      setActionMessage({
        type: 'success',
        text: `${result.links?.length ?? 0} lien(s) de secours généré(s) et copié(s) dans le presse-papier.`,
      })
    } catch (caught) {
      setActionMessage({ type: 'error', text: apiMessage(caught) })
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
          <div className="mx-auto max-w-[1400px] space-y-6">
            <Skeleton className="h-8 w-60" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-xl" />
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
  const fileName = detail.fileKey.split('/').pop() || detail.fileKey
  const statusBadge = statusStyles[detail.status] || 'bg-muted text-muted-foreground border-border'

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          <InstitutionHeader
            title={fileName}
            description={`Déposé le ${formatDate(detail.createdAt)}${
              detail.uploadedBy?.email ? ` par ${detail.uploadedBy.email}` : ''
            }`}
            backHref="/institution/imports"
            backLabel="Historique des imports"
            actions={
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge}`}>
                  {labels[detail.status] ?? detail.status}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void load()}
                  disabled={busy}
                  className="h-9 gap-1.5 text-xs font-semibold"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>
            }
          />

          {actionMessage && (
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-sm ${
                actionMessage.type === 'success'
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                  : 'border-destructive/20 bg-destructive/10 text-destructive'
              }`}
            >
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <p className="flex-1 font-medium">{actionMessage.text}</p>
            </div>
          )}

          {/* Pending Preview Warning Banner */}
          {detail.status === 'PREVIEW' && (
            <Card className="border-amber-500/30 bg-amber-500/[0.03] shadow-sm">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-bold text-foreground">Ce lot est en attente de confirmation</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Les affiliations ne sont pas encore créées. Vous pouvez vérifier les correspondances ou appliquer directement le lot.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link to={`/institution/imports/${id}/mapping?importId=${id}`}>
                      Modifier correspondance
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="text-xs font-semibold">
                    <Link to={`/institution/imports/${id}/preview`}>
                      Continuer l’import
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* KPI Counters Bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Card className="border-border/80 p-4 shadow-2xs">
              <p className="text-xs font-medium text-muted-foreground">Total lignes</p>
              <p className="font-heading text-xl font-bold tracking-tight text-foreground">
                {c.totalRows}
              </p>
            </Card>
            <Card className="border-border/80 p-4 shadow-2xs">
              <p className="text-xs font-medium text-muted-foreground">Créés</p>
              <p className="font-heading text-xl font-bold tracking-tight text-emerald-600">
                {c.createdRows}
              </p>
            </Card>
            <Card className="border-border/80 p-4 shadow-2xs">
              <p className="text-xs font-medium text-muted-foreground">Mis à jour</p>
              <p className="font-heading text-xl font-bold tracking-tight text-blue-600">
                {c.updatedRows}
              </p>
            </Card>
            <Card className="border-border/80 p-4 shadow-2xs">
              <p className="text-xs font-medium text-muted-foreground">Ignorés</p>
              <p className="font-heading text-xl font-bold tracking-tight text-amber-600">
                {c.skippedRows}
              </p>
            </Card>
            <Card className="border-border/80 p-4 shadow-2xs">
              <p className="text-xs font-medium text-muted-foreground">Erreurs</p>
              <p className="font-heading text-xl font-bold tracking-tight text-destructive">
                {c.errorRows}
              </p>
            </Card>
            <Card className="border-border/80 p-4 shadow-2xs">
              <p className="text-xs font-medium text-muted-foreground">Rebonds</p>
              <p className="font-heading text-xl font-bold tracking-tight text-orange-600">
                {c.bouncedRows}
              </p>
            </Card>
          </div>

          {/* Row Details Table */}
          <Card className="overflow-hidden border-border/80 shadow-2xs">
            <CardHeader className="flex flex-col gap-4 border-b border-border/60 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="font-heading text-base font-bold text-foreground">
                  Lignes du lot ({c.totalRows})
                </CardTitle>
                <CardDescription className="text-xs">
                  Résultats détaillés du traitement ligne par ligne.
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'CREATED', 'UPDATED', 'SKIPPED_DUPLICATE', 'ERROR', 'BOUNCED'].map((val) => (
                  <Button
                    key={val}
                    size="sm"
                    variant={filter === val ? 'default' : 'outline'}
                    onClick={() => setFilter(val)}
                    className="h-8 rounded-lg px-2.5 text-xs font-semibold"
                  >
                    {val === 'ALL' ? 'Toutes' : labels[val] ?? val}
                  </Button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {rows.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Aucune ligne pour ce filtre.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="w-16 px-4 py-3.5 text-center">Ligne</th>
                        <th className="px-4 py-3.5">Adresse email</th>
                        <th className="px-4 py-3.5">Résultat du traitement</th>
                        <th className="px-4 py-3.5 text-right">Statut compte</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-sm">
                      {rows.map((row) => {
                        const rowStyle = statusStyles[row.result ?? ''] || 'bg-muted text-muted-foreground border-border'
                        return (
                          <tr key={row.id} className="transition-colors hover:bg-muted/30">
                            <td className="px-4 py-3.5 text-center text-xs font-mono text-muted-foreground">
                              #{row.lineNumber}
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="font-semibold text-foreground">
                                {row.user?.email ?? row.normalizedEmail ?? '—'}
                              </p>
                              {row.errorCode && (
                                <p className="text-xs text-destructive">{row.errorCode}</p>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${rowStyle}`}
                              >
                                {labels[row.result ?? ''] ?? row.result ?? '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right text-xs text-muted-foreground">
                              {row.user?.status ? (
                                <span className="font-medium text-foreground">{row.user.status}</span>
                              ) : (
                                '—'
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Operations & Management */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Resend invitations card */}
            <Card className="border-border/80 shadow-2xs">
              <CardHeader className="border-b border-border/60 p-5">
                <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Relancer les invitations
                </CardTitle>
                <CardDescription className="text-xs">
                  Renvoyez un email d'activation aux étudiants qui n'ont pas encore activé leur compte.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={busy || detail.status !== 'APPLIED'}
                    onClick={() => void resend()}
                    size="sm"
                    className="gap-2 text-xs font-semibold"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Relancer les invitations
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy || detail.status !== 'APPLIED'}
                    onClick={() => void activationLinks()}
                    className="text-xs font-semibold"
                  >
                    Copier les liens de secours
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cancel batch card */}
            <Card className="border-border/80 shadow-2xs">
              <CardHeader className="border-b border-border/60 p-5">
                <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive" />
                  Annuler ce lot
                </CardTitle>
                <CardDescription className="text-xs">
                  Disponible uniquement pour un lot au statut "Prévisualisation".
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder={`ANNULER ${id}`}
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    className="h-9 w-48 text-xs font-mono"
                    disabled={detail.status !== 'PREVIEW'}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={busy || confirmation !== `ANNULER ${id}` || detail.status !== 'PREVIEW'}
                    onClick={() => void cancel()}
                    className="text-xs font-semibold"
                  >
                    Confirmer l'annulation
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
