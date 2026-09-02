import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Filter,
  Search,
  FolderOpen,
  ShieldCheck,
  CheckSquare,
  Square,
  ArrowRight,
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { InstitutionHeader } from '@/components/institution/InstitutionHeader'

type Affiliation = {
  id: string
  email: string
  status: string
  accountStatus: string
  cohortYear: number | null
  field: { id?: string; labelKey: string } | null
}

function getStatusBadgeClass(status: string) {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
    case 'INVITED':
    case 'PENDING':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
    case 'ALUMNI':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
    case 'LEAVING':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
    case 'SUSPENDED':
      return 'bg-destructive/10 text-destructive border-destructive/20'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

export default function InstitutionAffiliationsPage() {
  const [items, setItems] = useState<Affiliation[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState('LEAVING')
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [cohortFilter, setCohortFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const loadAffiliations = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const overview = await apiClient.get<{ organizations: Array<{ id: string }> }>('/institution/overview')
      const orgId = overview.organizations[0]?.id
      if (!orgId) return
      const data = await apiClient.get<{ affiliations: Affiliation[] }>(
        `/institution/affiliations?organizationId=${orgId}`,
      )
      setItems(data.affiliations || [])
    } catch {
      setMessage({ type: 'error', text: 'Impossible de charger les affiliations de l’établissement.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAffiliations()
  }, [loadAffiliations])

  const cohortYears = useMemo(() => {
    const years = new Set<number>()
    items.forEach((item) => {
      if (item.cohortYear) years.add(item.cohortYear)
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [items])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        search.trim() === '' ||
        `${item.email} ${item.field?.labelKey ?? ''}`.toLowerCase().includes(search.toLowerCase())
      const matchCohort =
        cohortFilter === 'ALL' || (item.cohortYear && String(item.cohortYear) === cohortFilter)
      const matchStatus =
        statusFilter === 'ALL' || item.status.toUpperCase() === statusFilter
      return matchSearch && matchCohort && matchStatus
    })
  }, [items, search, cohortFilter, statusFilter])

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((item) => selected.includes(item.id))

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected([])
    } else {
      setSelected(filtered.map((item) => item.id))
    }
  }

  const handleBulkUpdate = async () => {
    if (selected.length === 0) return
    const expectedConfirmation = `MODIFIER ${selected.length}`
    if (confirmation.trim() !== expectedConfirmation) {
      setMessage({
        type: 'error',
        text: `Veuillez saisir exactement "${expectedConfirmation}" pour valider la modification par lot.`,
      })
      return
    }

    setSubmitting(true)
    setMessage(null)
    try {
      await apiClient.post('/institution/affiliations/bulk-status', {
        affiliationIds: selected,
        status: bulkStatus,
        confirmation: confirmation.trim(),
      })
      setMessage({
        type: 'success',
        text: `${selected.length} affiliation(s) mise(s) à jour avec succès vers le statut ${bulkStatus}.`,
      })
      setSelected([])
      setConfirmation('')
      await loadAffiliations()
    } catch {
      setMessage({
        type: 'error',
        text: 'La mise à jour groupée a échoué. Veuillez vérifier vos autorisations et réessayer.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSingleUpdate = async (id: string, newStatus: string) => {
    try {
      await apiClient.patch(`/affiliations/${id}`, { status: newStatus })
      setMessage({ type: 'success', text: 'Affiliation mise à jour.' })
      await loadAffiliations()
    } catch {
      setMessage({ type: 'error', text: 'Échec de la mise à jour de l’affiliation.' })
    }
  }

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          <InstitutionHeader
            title="Affiliations & Statuts"
            description="Gérez le cycle de vie académique de vos étudiants (Actif, Sortant, Alumni, Suspendu). Chaque modification est automatiquement auditée."
            backHref="/institution/dashboard"
            backLabel="Tableau de bord"
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadAffiliations()}
                disabled={loading}
                className="h-9 gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            }
          />

          {message && (
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-sm ${
                message.type === 'success'
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                  : 'border-destructive/20 bg-destructive/10 text-destructive'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <p className="flex-1 font-medium">{message.text}</p>
            </div>
          )}

          {/* Bulk Modification Panel */}
          {selected.length > 0 && (
            <Card className="border-primary/30 bg-primary/[0.02] shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {selected.length}
                      </span>
                      <h3 className="font-heading text-sm font-bold text-foreground">
                        Affiliation(s) sélectionnée(s)
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pour appliquer ce changement à toute la sélection, choisissez le nouveau statut et confirmez ci-dessous.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <select
                      value={bulkStatus}
                      onChange={(e) => setBulkStatus(e.target.value)}
                      className="h-10 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="ACTIVE">Actif</option>
                      <option value="LEAVING">Sortant (Fin d'études)</option>
                      <option value="ALUMNI">Alumni (Diplômé)</option>
                      <option value="SUSPENDED">Suspendre l'affiliation</option>
                    </select>

                    <Input
                      placeholder={`Tapez : MODIFIER ${selected.length}`}
                      value={confirmation}
                      onChange={(e) => setConfirmation(e.target.value)}
                      className="h-10 w-48 text-xs font-mono"
                    />

                    <Button
                      onClick={() => void handleBulkUpdate()}
                      disabled={submitting || confirmation.trim() !== `MODIFIER ${selected.length}`}
                      size="sm"
                      className="h-10 gap-1.5 text-xs font-semibold"
                    >
                      {submitting ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5" />
                      )}
                      Confirmer
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected([])}
                      className="h-10 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters Bar */}
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Filtrer par email ou filière..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 pl-9 text-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Filter className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Filtres :</span>
                  </div>

                  {cohortYears.length > 0 && (
                    <select
                      value={cohortFilter}
                      onChange={(e) => setCohortFilter(e.target.value)}
                      className="h-10 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="ALL">Toutes promotions</option>
                      {cohortYears.map((year) => (
                        <option key={year} value={String(year)}>
                          Promo {year}
                        </option>
                      ))}
                    </select>
                  )}

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="ALL">Tous les statuts</option>
                    <option value="ACTIVE">Actif</option>
                    <option value="INVITED">Invité</option>
                    <option value="LEAVING">Sortant</option>
                    <option value="ALUMNI">Alumni</option>
                    <option value="SUSPENDED">Suspendu</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Affiliations Table */}
          <Card className="overflow-hidden border-border/80 shadow-2xs">
            {loading ? (
              <div className="space-y-4 p-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 py-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-4 w-52" />
                    </div>
                    <Skeleton className="h-4 w-32 hidden sm:block" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <FolderOpen className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  Aucune affiliation correspondante
                </h3>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  Modifiez vos critères de recherche ou importez un nouveau fichier d’étudiants.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="w-12 px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="flex items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label="Tout sélectionner"
                        >
                          {allFilteredSelected ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3.5">Adresse e-mail étudiante</th>
                      <th className="px-4 py-3.5">Filière & Promotion</th>
                      <th className="px-4 py-3.5">Statut Compte</th>
                      <th className="px-4 py-3.5">Statut Affiliation</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-sm">
                    {filtered.map((item) => {
                      const isSelected = selected.includes(item.id)
                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            isSelected ? 'bg-primary/[0.04]' : 'hover:bg-muted/30'
                          }`}
                        >
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                setSelected((prev) =>
                                  e.target.checked
                                    ? [...prev, item.id]
                                    : prev.filter((id) => id !== item.id),
                                )
                              }}
                              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            />
                          </td>

                          <td className="px-4 py-3.5 font-semibold text-foreground">
                            {item.email}
                          </td>

                          <td className="px-4 py-3.5 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {item.field?.labelKey ?? 'Non renseignée'}
                            </span>
                            <span className="ml-1.5 text-[11px]">
                              {item.cohortYear ? `(Promo ${item.cohortYear})` : ''}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-xs">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                item.accountStatus === 'ACTIVE'
                                  ? 'bg-emerald-500/10 text-emerald-700'
                                  : 'bg-amber-500/10 text-amber-700'
                              }`}
                            >
                              {item.accountStatus === 'ACTIVE' ? 'Compte activé' : 'En attente'}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                                item.status,
                              )}`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <select
                              value={item.status}
                              onChange={(e) => void handleSingleUpdate(item.id, e.target.value)}
                              className="h-8 rounded-md border border-border bg-background px-2 text-xs font-medium text-muted-foreground hover:text-foreground focus:border-primary focus:outline-none"
                            >
                              <option value="ACTIVE">Actif</option>
                              <option value="LEAVING">Sortant</option>
                              <option value="ALUMNI">Alumni</option>
                              <option value="SUSPENDED">Suspendu</option>
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Audit & Compliance Disclaimer */}
          <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="leading-relaxed">
              <strong>Traçabilité institutionnelle :</strong> Toutes les modifications de statuts d’affiliation sont enregistrées de façon immuable dans le journal d’audit avec la date et l’identifiant de l’administrateur ayant effectué l’opération.
            </p>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
