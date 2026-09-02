import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Upload,
  Users,
  CheckCircle2,
  Rocket,
  ShieldCheck,
  RefreshCw,
  FolderOpen,
  Filter,
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { InstitutionHeader } from '@/components/institution/InstitutionHeader'
import { InstitutionErrorState } from '@/components/institution/InstitutionErrorState'

type DirectoryEntry = {
  id: string
  name: string
  email: string
  cohortYear: number | null
  completion: number
  affiliationStatus: string
  accountStatus: string
  lastLoginAt: string | null
  field: { labelKey: string } | null
  projects: Array<{ id: string; title: string; status: string }>
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
    case 'SUSPENDED':
      return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

export default function InstitutionDirectoryPage() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([])
  const [search, setSearch] = useState('')
  const [cohortFilter, setCohortFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const loadDirectory = async () => {
    setLoading(true)
    setError(null)
    try {
      const overview = await apiClient.get<{ organizations: Array<{ id: string }> }>('/institution/overview')
      const orgId = overview.organizations[0]?.id
      if (!orgId) {
        setEntries([])
        return
      }
      const result = await apiClient.get<{ directory: DirectoryEntry[] }>(`/institution/directory?organizationId=${orgId}`)
      setEntries(result.directory || [])
    } catch (caught) {
      setError(caught)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDirectory()
  }, [])

  // Extract unique cohort years for the filter
  const cohortYears = useMemo(() => {
    const years = new Set<number>()
    entries.forEach((e) => {
      if (e.cohortYear) years.add(e.cohortYear)
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [entries])

  // Filtered list
  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      const matchSearch =
        search.trim() === '' ||
        `${entry.name} ${entry.email} ${entry.field?.labelKey ?? ''}`.toLowerCase().includes(search.toLowerCase())
      const matchCohort =
        cohortFilter === 'ALL' || (entry.cohortYear && String(entry.cohortYear) === cohortFilter)
      const matchStatus =
        statusFilter === 'ALL' || entry.affiliationStatus.toUpperCase() === statusFilter
      return matchSearch && matchCohort && matchStatus
    })
  }, [entries, search, cohortFilter, statusFilter])

  // Summary Metrics
  const stats = useMemo(() => {
    const total = entries.length
    const completed = entries.filter((e) => e.completion >= 60).length
    const withProject = entries.filter((e) => e.projects && e.projects.length > 0).length
    const activeAccounts = entries.filter((e) => e.accountStatus === 'ACTIVE').length
    return { total, completed, withProject, activeAccounts }
  }, [entries])

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          <InstitutionHeader
            title="Annuaire des affiliés"
            description="Consultez et recherchez parmi les étudiants et alumni affiliés à votre établissement."
            backHref="/institution/dashboard"
            backLabel="Tableau de bord"
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void loadDirectory()}
                  disabled={loading}
                  className="h-9 gap-1.5 text-xs font-semibold"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
                <Button asChild size="sm" className="h-9 gap-1.5 text-xs font-semibold">
                  <Link to="/institution/imports/new">
                    <Upload className="h-3.5 w-3.5" />
                    Importer des étudiants
                  </Link>
                </Button>
              </div>
            }
          />

          {error !== null && (
            <InstitutionErrorState error={error} onRetry={() => void loadDirectory()} />
          )}

          {/* Quick Metrics Bar */}
          {!loading && error === null && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card className="border-border/80 p-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total affiliés</p>
                    <p className="font-heading text-xl font-bold tracking-tight text-foreground">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-border/80 p-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Profils complétés</p>
                    <p className="font-heading text-xl font-bold tracking-tight text-foreground">
                      {stats.completed}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-border/80 p-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <Rocket className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Dans un projet</p>
                    <p className="font-heading text-xl font-bold tracking-tight text-foreground">
                      {stats.withProject}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-border/80 p-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Comptes activés</p>
                    <p className="font-heading text-xl font-bold tracking-tight text-foreground">
                      {stats.activeAccounts}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher par nom, email ou filière..."
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
                      <option value="ALL">Toutes les promotions</option>
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
                    <option value="ALUMNI">Alumni</option>
                    <option value="LEAVING">Sortant</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Directory Content Table */}
          <Card className="overflow-hidden border-border/80 shadow-2xs">
            {loading ? (
              <div className="space-y-4 p-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 py-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-56" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-28 hidden sm:block" />
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
                  Aucun affilié trouvé
                </h3>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  {search || cohortFilter !== 'ALL' || statusFilter !== 'ALL'
                    ? 'Aucun résultat ne correspond à vos critères de recherche. Essayez de réinitialiser vos filtres.'
                    : 'Aucun étudiant n’est encore affilié à cet établissement. Commencez par importer un fichier d’étudiants.'}
                </p>
                {(search || cohortFilter !== 'ALL' || statusFilter !== 'ALL') && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 text-xs"
                    onClick={() => {
                      setSearch('')
                      setCohortFilter('ALL')
                      setStatusFilter('ALL')
                    }}
                  >
                    Effacer les filtres
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3.5">Étudiant</th>
                      <th className="px-4 py-3.5">Filière & Promotion</th>
                      <th className="px-4 py-3.5">Complétion Profil</th>
                      <th className="px-4 py-3.5">Projets</th>
                      <th className="px-4 py-3.5 text-right">Statut Affiliation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-sm">
                    {filtered.map((entry) => {
                      const initial = entry.name.charAt(0).toUpperCase() || 'E'
                      return (
                        <tr
                          key={entry.id}
                          className="transition-colors hover:bg-muted/30"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {initial}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-foreground">
                                  {entry.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {entry.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-xs text-muted-foreground">
                            <p className="font-medium text-foreground">
                              {entry.field?.labelKey ?? 'Non renseignée'}
                            </p>
                            <p className="text-[11px]">
                              {entry.cohortYear ? `Promotion ${entry.cohortYear}` : 'Promo —'}
                            </p>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="w-32 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-foreground">{entry.completion}%</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {entry.completion >= 60 ? 'Complet' : 'Incomplet'}
                                </span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    entry.completion >= 60 ? 'bg-emerald-500' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${entry.completion}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            {entry.projects && entry.projects.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {entry.projects.map((p) => (
                                  <Link
                                    key={p.id}
                                    to={`/projects/${p.id}`}
                                    className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                                  >
                                    <Rocket className="h-3 w-3" />
                                    <span className="max-w-[120px] truncate">{p.title}</span>
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">
                                Aucun projet
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                                entry.affiliationStatus,
                              )}`}
                            >
                              {entry.affiliationStatus}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Privacy & Confidentiality Notice */}
          <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="leading-relaxed">
              <strong>Garantie de confidentialité :</strong> Cette console affiche uniquement les étudiants affiliés à votre établissement.
              Les conversations privées, les messageries d’équipe, les projets en brouillon et les données sensibles (comme le genre) demeurent strictement protégés conformément aux règles de la plateforme.
            </p>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
