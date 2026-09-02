import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  XCircle,
  RefreshCw,
  Send,
} from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  importPreviewSchema,
  type ImportApplyResult,
  type ImportPreview,
  type ImportPreviewResult,
} from '@cofound/shared'
import { apiClient, ApiClientError } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { InstitutionHeader } from '@/components/institution/InstitutionHeader'
import { ImportStepProgress } from '@/components/institution/ImportStepProgress'

const RESULT_STYLES: Record<ImportPreviewResult, { label: string; badgeClass: string }> = {
  CREATED: {
    label: 'Nouveau compte & affiliation',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  },
  UPDATED: {
    label: 'Affiliation mise à jour',
    badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  },
  SKIPPED_DUPLICATE: {
    label: 'Doublon ignoré',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  },
  ERROR: {
    label: 'Erreur de validation',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
  },
}

export default function ImportPreviewPage() {
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
            setLoadError(err.message || 'Impossible de charger la prévisualisation.')
          } else {
            setLoadError('Impossible de charger la prévisualisation. Vérifiez votre connexion.')
          }
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [importId])

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
    } catch {
      setApplyError('Une erreur est survenue lors de l’application du lot d’étudiants. Veuillez réessayer.')
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
          <InstitutionHeader
            title="Vérification & Prévisualisation"
            description={`Examinez les lignes analysées du fichier "${preview?.fileName ?? 'import'}" avant confirmation définitive.`}
            backHref={importId ? `/institution/imports/${importId}/mapping?importId=${importId}` : '/institution/imports/new'}
            backLabel="Retour à la correspondance"
          />

          <ImportStepProgress currentStep={applyResult ? 'applied' : 'preview'} />

          {/* Success screen after apply */}
          {applyResult && (
            <Card className="border-emerald-500/30 bg-emerald-500/[0.03] shadow-sm">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                      Import appliqué avec succès !
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Les affiliations ont été créées et les invitations d’activation envoyées aux étudiants.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-border/70 bg-card p-4">
                    <p className="text-xs font-medium text-muted-foreground">Comptes créés</p>
                    <p className="font-heading text-2xl font-bold text-emerald-600">
                      {applyResult.createdRows}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-4">
                    <p className="text-xs font-medium text-muted-foreground">Mis à jour</p>
                    <p className="font-heading text-2xl font-bold text-blue-600">
                      {applyResult.updatedRows}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-4">
                    <p className="text-xs font-medium text-muted-foreground">Doublons ignorés</p>
                    <p className="font-heading text-2xl font-bold text-amber-600">
                      {applyResult.skippedRows}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card p-4">
                    <p className="text-xs font-medium text-muted-foreground">Erreurs</p>
                    <p className="font-heading text-2xl font-bold text-destructive">
                      {applyResult.errorRows}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button asChild className="gap-2 text-xs font-semibold">
                    <Link to={`/institution/imports/${importId}`}>
                      Suivre les envois d’invitations
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="text-xs font-semibold">
                    <Link to="/institution/directory">Annuaire des affiliés</Link>
                  </Button>
                  <Button variant="ghost" asChild className="text-xs font-semibold">
                    <Link to="/institution/dashboard">Tableau de bord</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loadError && (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              <XCircle className="h-4 w-4 shrink-0" />
              <p className="flex-1 font-medium">{loadError}</p>
            </div>
          )}

          {applyError && (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              <XCircle className="h-4 w-4 shrink-0" />
              <p className="flex-1 font-medium">{applyError}</p>
            </div>
          )}

          {isLoading && (
            <Card className="border-border/80 p-8 shadow-2xs">
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  Analyse des lignes en cours…
                </p>
                <p className="text-xs text-muted-foreground">
                  Vérification de la validité des adresses et détection des comptes existants.
                </p>
              </div>
            </Card>
          )}

          {!isLoading && preview && !applyResult && (
            <>
              {/* Metric Breakdown Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card className="border-border/80 p-4 shadow-2xs">
                  <p className="text-xs font-medium text-muted-foreground">Comptes à créer</p>
                  <p className="font-heading text-2xl font-bold tracking-tight text-emerald-600">
                    {counts.created}
                  </p>
                </Card>

                <Card className="border-border/80 p-4 shadow-2xs">
                  <p className="text-xs font-medium text-muted-foreground">À mettre à jour</p>
                  <p className="font-heading text-2xl font-bold tracking-tight text-blue-600">
                    {counts.updated}
                  </p>
                </Card>

                <Card className="border-border/80 p-4 shadow-2xs">
                  <p className="text-xs font-medium text-muted-foreground">Doublons ignorés</p>
                  <p className="font-heading text-2xl font-bold tracking-tight text-amber-600">
                    {counts.duplicates}
                  </p>
                </Card>

                <Card className="border-border/80 p-4 shadow-2xs">
                  <p className="text-xs font-medium text-muted-foreground">Lignes avec erreur</p>
                  <p className="font-heading text-2xl font-bold tracking-tight text-destructive">
                    {counts.errors}
                  </p>
                </Card>
              </div>

              {/* Warning if errors exist */}
              {counts.errors > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-foreground">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-bold text-foreground">
                      {counts.errors} ligne(s) comportent des anomalies
                    </p>
                    <p className="mt-0.5 leading-relaxed text-muted-foreground">
                      Ces lignes en erreur seront automatiquement ignorées lors de l'application. Les {counts.created + counts.updated} étudiant(s) valides seront correctement importés.
                    </p>
                  </div>
                </div>
              )}

              {/* Rows List with Filter Tabs */}
              <Card className="overflow-hidden border-border/80 shadow-2xs">
                <CardHeader className="flex flex-col gap-4 border-b border-border/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="font-heading text-base font-bold text-foreground">
                      Détail des lignes analysées ({counts.total})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Filtrez les lignes par statut pour vérifier les données avant application.
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant={selectedFilter === 'ALL' ? 'default' : 'outline'}
                      onClick={() => setSelectedFilter('ALL')}
                      className="h-8 rounded-lg px-2.5 text-xs font-semibold"
                    >
                      Toutes ({counts.total})
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedFilter === 'CREATED' ? 'default' : 'outline'}
                      onClick={() => setSelectedFilter('CREATED')}
                      className="h-8 rounded-lg px-2.5 text-xs font-semibold"
                    >
                      À créer ({counts.created})
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedFilter === 'UPDATED' ? 'default' : 'outline'}
                      onClick={() => setSelectedFilter('UPDATED')}
                      className="h-8 rounded-lg px-2.5 text-xs font-semibold"
                    >
                      À mettre à jour ({counts.updated})
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedFilter === 'SKIPPED_DUPLICATE' ? 'default' : 'outline'}
                      onClick={() => setSelectedFilter('SKIPPED_DUPLICATE')}
                      className="h-8 rounded-lg px-2.5 text-xs font-semibold"
                    >
                      Doublons ({counts.duplicates})
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedFilter === 'ERROR' ? 'default' : 'outline'}
                      onClick={() => setSelectedFilter('ERROR')}
                      className="h-8 rounded-lg px-2.5 text-xs font-semibold text-destructive hover:text-destructive"
                    >
                      Erreurs ({counts.errors})
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {visibleRows.length === 0 ? (
                    <div className="p-10 text-center text-xs text-muted-foreground">
                      Aucune ligne pour ce filtre.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <th className="w-16 px-4 py-3.5 text-center">Ligne</th>
                            <th className="px-4 py-3.5">Étudiant</th>
                            <th className="px-4 py-3.5">Filière / Niveau / Année</th>
                            <th className="px-4 py-3.5 text-right">Diagnostic</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 text-sm">
                          {visibleRows.map((row) => {
                            const badge = RESULT_STYLES[row.result]

                            return (
                              <tr key={row.lineNumber} className="transition-colors hover:bg-muted/30">
                                <td className="px-4 py-3.5 text-center text-xs font-mono text-muted-foreground">
                                  #{row.lineNumber}
                                </td>

                                <td className="px-4 py-3.5">
                                  <p className="font-semibold text-foreground">
                                    {row.displayName || row.email}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {row.email}
                                  </p>
                                </td>

                                <td className="px-4 py-3.5 text-xs text-muted-foreground">
                                  <p className="font-medium text-foreground">
                                    {row.fieldOfStudy || '—'}
                                  </p>
                                  <p className="text-[11px]">
                                    {row.level ? `Niveau ${row.level}` : ''}
                                    {row.entryYear ? ` · Promo ${row.entryYear}` : ''}
                                  </p>
                                </td>

                                <td className="px-4 py-3.5 text-right">
                                  <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.badgeClass}`}
                                  >
                                    {badge.label}
                                  </span>
                                  {row.errorMessage && (
                                    <p className="mt-1 text-[11px] text-destructive">
                                      {row.errorMessage}
                                    </p>
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

              {/* Action Bar */}
              <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row pt-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(
                      importId
                        ? `/institution/imports/${importId}/mapping?importId=${importId}`
                        : '/institution/imports/new',
                    )
                  }
                  className="gap-2 text-xs"
                >
                  <RotateCcw className="h-4 w-4" /> Modifier les correspondances
                </Button>

                <Button
                  disabled={!canApply || isApplying}
                  onClick={() => void handleApply()}
                  className="gap-2 text-xs font-semibold"
                >
                  {isApplying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Application du lot en cours…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Confirmer et appliquer l’import ({counts.created + counts.updated} étudiants)
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
