import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  FileSpreadsheet,
  GraduationCap,
  ShieldCheck,
  Users,
  CheckCircle2,
  Rocket,
  Upload,
  RefreshCw,
} from 'lucide-react'
import { institutionOverviewSchema, type InstitutionOverview } from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api-client'
import { InstitutionHeader } from '@/components/institution/InstitutionHeader'
import { InstitutionErrorState } from '@/components/institution/InstitutionErrorState'

const labels: Record<string, { label: string; icon: typeof Users }> = {
  affiliates: { label: 'Total affiliés', icon: Users },
  activated: { label: 'Comptes activés', icon: CheckCircle2 },
  completedProfiles: { label: 'Profils complétés', icon: CheckCircle2 },
  projects: { label: 'Projets créés', icon: Rocket },
}

export default function InstitutionOverviewPage() {
  const [data, setData] = useState<InstitutionOverview | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await apiClient.get('/institution/overview', institutionOverviewSchema))
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
            title="Vue d’ensemble de l’établissement"
            description="Pilotez vos promotions affiliées, suivez l'engagement des étudiants et gérez vos imports."
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

          {error !== null && (
            <InstitutionErrorState
              error={error}
              onRetry={() => void load()}
              fallbackDescription="Les informations de votre établissement n'ont pas pu être chargées."
            />
          )}

          {loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="border-border/80 p-5 shadow-2xs">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </Card>
                ))}
              </div>
              <Skeleton className="h-48 rounded-xl" />
            </div>
          )}

          {!loading && error === null && data?.organizations.map((org) => {
            const firstUse =
              Object.values(org.metrics).every((value) => value === null) &&
              org.recentImports.length === 0

            return (
              <section key={org.id} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
                      {org.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Rôle d'organisation : <strong className="text-foreground">{org.role}</strong>
                    </p>
                  </div>
                </div>

                {firstUse ? (
                  <Card className="border-primary/20 bg-primary/[0.02] shadow-2xs">
                    <CardHeader className="p-6 pb-3">
                      <CardTitle className="font-heading text-lg font-bold text-foreground">
                        Bienvenue dans votre console établissement
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Commencez par importer votre première promotion pour créer les affiliations.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-2 space-y-6">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1">
                          <span className="text-xs font-bold text-primary">Étape 01</span>
                          <p className="font-semibold text-foreground text-sm">Déposez votre fichier</p>
                          <p className="text-xs text-muted-foreground">Format CSV ou Excel avec emails et filières.</p>
                        </div>
                        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1">
                          <span className="text-xs font-bold text-primary">Étape 02</span>
                          <p className="font-semibold text-foreground text-sm">Vérifiez les colonnes</p>
                          <p className="text-xs text-muted-foreground">Associez les données et contrôlez les diagnostics.</p>
                        </div>
                        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1">
                          <span className="text-xs font-bold text-primary">Étape 03</span>
                          <p className="font-semibold text-foreground text-sm">Activez la promotion</p>
                          <p className="text-xs text-muted-foreground">Les invitations sécurisées sont envoyées automatiquement.</p>
                        </div>
                      </div>

                      <Button asChild className="gap-2 text-xs font-semibold">
                        <Link to="/institution/imports/new">
                          Commencer le premier import
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Metric Cards Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {Object.entries(org.metrics).map(([key, value]) => {
                        const meta = labels[key] || { label: key, icon: Users }
                        const Icon = meta.icon

                        return (
                          <Card key={key} className="border-border/80 p-5 shadow-2xs">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-medium text-muted-foreground">{meta.label}</p>
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                            </div>
                            <p className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">
                              {value ?? '—'}
                            </p>
                            {value === null && (
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                Seuil de confidentialité (&lt; 5)
                              </p>
                            )}
                          </Card>
                        )
                      })}
                    </div>

                    {/* Recent Imports Card */}
                    <Card className="border-border/80 shadow-2xs">
                      <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 p-5 sm:p-6">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-primary" />
                          <CardTitle className="font-heading text-base font-bold text-foreground">
                            Derniers lots d’import
                          </CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                          <Link to="/institution/imports">
                            Voir tout l'historique
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </CardHeader>

                      <CardContent className="p-5 sm:p-6">
                        {org.recentImports.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Aucun import récent.</p>
                        ) : (
                          <div className="space-y-2">
                            {org.recentImports.map((batch) => (
                              <Link
                                key={batch.id}
                                to={`/institution/imports/${batch.id}`}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-border/70 p-3.5 transition-colors hover:border-primary/40 hover:bg-muted/30"
                              >
                                <div className="min-w-0">
                                  <p className="font-semibold text-foreground text-sm truncate">
                                    {batch.fileName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {batch.totalRows} ligne(s) • {batch.status}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                  <span>Consulter le lot</span>
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}

                <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="leading-relaxed">
                    <strong>Protection de la vie privée :</strong> Les données sont agrégées et les informations individuelles privées (genre, messageries, projets non publics) ne sont jamais exposées aux institutions.
                  </p>
                </div>
              </section>
            )
          })}
        </div>
      </main>
    </DashboardLayout>
  )
}
