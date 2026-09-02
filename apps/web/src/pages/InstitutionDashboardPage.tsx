import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Plus,
  RefreshCw,
  Rocket,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import {
  institutionDashboardSchema,
  type InstitutionDashboard,
} from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api-client'
import { InstitutionHeader } from '@/components/institution/InstitutionHeader'
import { InstitutionErrorState } from '@/components/institution/InstitutionErrorState'

function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Chargement du tableau de bord institutionnel">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/80 p-5 shadow-2xs space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-40" />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 p-6 shadow-2xs space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
        </Card>
        <Card className="border-border/80 p-6 shadow-2xs space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
    </div>
  )
}

export default function InstitutionDashboardPage() {
  const [data, setData] = useState<InstitutionDashboard | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/institution/dashboard', institutionDashboardSchema)
      setData(res)
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
            title={data?.organization?.name ? `Tableau de bord — ${data.organization.name}` : 'Tableau de bord institutionnel'}
            description="Suivez l’activation, la complétion des profils et la dynamique entrepreneuriale de vos étudiants affiliés."
            badgeLabel={data?.organization?.role ? `Rôle : ${data.organization.role}` : 'Espace Établissement'}
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
                <Button asChild size="sm" className="h-9 gap-1.5 text-xs font-semibold shadow-xs">
                  <Link to="/institution/imports/new">
                    <Plus className="h-3.5 w-3.5" />
                    Importer des étudiants
                  </Link>
                </Button>
              </div>
            }
          />

          {loading && <DashboardSkeleton />}

          {!loading && error !== null && (
            <InstitutionErrorState error={error} onRetry={() => void load()} />
          )}

          {!loading && error === null && data && (
            <>
              {/* 1. TOP KPI CARDS */}
              <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Indicateurs clés">
                {/* KPI 1 : Étudiants */}
                <Card className="border-border/80 p-5 shadow-2xs transition-all hover:border-primary/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Étudiants Affiliés
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-heading text-3xl font-bold text-foreground">
                      {data.students.total}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {data.students.active} actifs
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                    <span>{data.students.unactivated} non activés</span>
                    <span>{data.funnel.activationRatePercent}% activation</span>
                  </div>
                </Card>

                {/* KPI 2 : Profils */}
                <Card className="border-border/80 p-5 shadow-2xs transition-all hover:border-primary/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Profils Complétés
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <UserCheck className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-heading text-3xl font-bold text-foreground">
                      {data.profiles.completed}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / {data.students.active} actifs
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                    <span>Moyenne : {data.profiles.averageCompletionPercent}%</span>
                    <span>{data.funnel.completionRatePercent}% complétion</span>
                  </div>
                </Card>

                {/* KPI 3 : Projets */}
                <Card className="border-border/80 p-5 shadow-2xs transition-all hover:border-primary/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Projets Étudiants
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Rocket className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-heading text-3xl font-bold text-foreground">
                      {data.projects.total}
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      {data.projects.active} actifs
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                    <span>{data.projects.recruiting} en recrutement</span>
                    <span>{data.multidisciplinarity.multidisciplinaryProjectsCount} pluridisciplinaires</span>
                  </div>
                </Card>

                {/* KPI 4 : Dynamique & Activité */}
                <Card className="border-border/80 p-5 shadow-2xs transition-all hover:border-primary/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Activité Récente
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-heading text-3xl font-bold text-foreground">
                      {data.activity.recentActiveStudents}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      étudiants actifs (30j)
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                    <span>{data.activity.applicationsSent} candidatures</span>
                    <span>{data.activity.activeMentorships} mentorats</span>
                  </div>
                </Card>
              </section>

              {/* 2. ENTONNOIR D'ACTIVATION (FUNNEL) & SUIVI DES ÉTUDIANTS */}
              <section className="grid gap-6 lg:grid-cols-2">
                {/* Entonnoir d'activation */}
                <Card className="border-border/80 p-6 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-border/60 pb-4">
                    <div className="space-y-0.5">
                      <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground">
                        Entonnoir d'Activation des Étudiants
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Parcours de l'import fichier jusqu'à la complétion de profil.
                      </CardDescription>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {data.funnel.activationRatePercent}% activés
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {/* Étape 1 : Importés */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">1</span>
                          Étudiants importés
                        </span>
                        <span className="font-bold text-foreground">{data.funnel.totalImported} (100%)</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-muted-foreground/40 w-full" />
                      </div>
                    </div>

                    {/* Étape 2 : Invitations envoyées */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">2</span>
                          Invitations émises
                        </span>
                        <span className="font-bold text-foreground">
                          {data.funnel.invitationsSent} ({data.funnel.totalImported > 0 ? Math.round((data.funnel.invitationsSent / data.funnel.totalImported) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${data.funnel.totalImported > 0 ? Math.min(100, Math.round((data.funnel.invitationsSent / data.funnel.totalImported) * 100)) : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Étape 3 : Comptes activés */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">3</span>
                          Comptes activés
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {data.funnel.accountsActivated} ({data.funnel.activationRatePercent}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${Math.min(100, data.funnel.activationRatePercent)}%` }}
                        />
                      </div>
                    </div>

                    {/* Étape 4 : Profils complétés */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">4</span>
                          Profils complétés (≥ 60%)
                        </span>
                        <span className="font-bold text-primary">
                          {data.funnel.profilesCompleted} ({data.funnel.completionRatePercent}% des activés)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${data.funnel.totalImported > 0 ? Math.min(100, Math.round((data.funnel.profilesCompleted / data.funnel.totalImported) * 100)) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Suivi des étudiants & Catégorisation */}
                <Card className="border-border/80 p-6 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border/60 pb-4">
                      <div className="space-y-0.5">
                        <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground">
                          Répartition & Suivi des Affiliés
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Positionnement actuel de vos étudiants dans la plateforme.
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" asChild className="h-8 gap-1 text-xs font-semibold">
                        <Link to="/institution/directory">
                          Voir l'annuaire
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground">À activer</span>
                        <p className="font-heading text-xl font-bold text-amber-600 dark:text-amber-400">
                          {data.studentBreakdown.toActivate}
                        </p>
                      </div>

                      <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground">Activés</span>
                        <p className="font-heading text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          {data.studentBreakdown.activated}
                        </p>
                      </div>

                      <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground">Profil incomplet</span>
                        <p className="font-heading text-xl font-bold text-foreground">
                          {data.studentBreakdown.profileIncomplete}
                        </p>
                      </div>

                      <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground">Profil complet</span>
                        <p className="font-heading text-xl font-bold text-primary">
                          {data.studentBreakdown.profileComplete}
                        </p>
                      </div>

                      <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-1 sm:col-span-2">
                        <span className="text-[11px] font-medium text-muted-foreground">Dans un projet entrepreneurial</span>
                        <p className="font-heading text-xl font-bold text-blue-600 dark:text-blue-400">
                          {data.studentBreakdown.inAtLeastOneProject}
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            ({data.students.active > 0 ? Math.round((data.studentBreakdown.inAtLeastOneProject / data.students.active) * 100) : 0}% des actifs)
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-border/60 pt-4">
                    <Button asChild variant="outline" size="sm" className="w-full gap-2 text-xs font-semibold">
                      <Link to="/institution/directory">
                        <Users className="h-3.5 w-3.5" />
                        Consulter la liste complète des étudiants
                      </Link>
                    </Button>
                  </div>
                </Card>
              </section>

              {/* 3. ACTIVITÉ ENTREPRENEURIALE & ÉVOLUTION TEMPORELLE */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Rocket className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="font-heading text-lg font-bold text-foreground">
                    Activité Entrepreneuriale des Étudiants
                  </h2>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  {/* États des projets */}
                  <Card className="border-border/80 p-6 shadow-2xs space-y-4">
                    <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground">
                      État des Projets ({data.projects.total})
                    </CardTitle>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between rounded-xl border border-border/70 p-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          <span className="text-xs font-medium text-foreground">Actifs</span>
                        </div>
                        <span className="text-xs font-bold text-foreground">{data.projects.active}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-border/70 p-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                          <span className="text-xs font-medium text-foreground">En recrutement</span>
                        </div>
                        <span className="text-xs font-bold text-foreground">{data.projects.recruiting}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-border/70 p-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">Brouillon</span>
                        </div>
                        <span className="text-xs font-bold text-foreground">{data.projects.draft}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-border/70 p-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                          <span className="text-xs font-medium text-foreground">En pause / Archivés</span>
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {data.projects.paused + data.projects.archived}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-border/60 pt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Recherche mentor : <strong className="text-foreground">{data.projects.seekingMentorship}</strong></span>
                      <span>Recherche fonds : <strong className="text-foreground">{data.projects.seekingFunding}</strong></span>
                    </div>
                  </Card>

                  {/* Évolution temporelle sur 6 mois */}
                  <Card className="border-border/80 p-6 shadow-2xs lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div>
                        <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground">
                          Évolution des Créations de Projets
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Historique mensuel des projets initiés par vos étudiants.
                        </CardDescription>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        6 derniers mois
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="grid grid-cols-6 gap-2 items-end h-40">
                        {data.projectEvolution.map((item, idx) => {
                          const maxVal = Math.max(...data.projectEvolution.map((x) => x.created), 1)
                          const heightPct = Math.max(12, Math.round((item.created / maxVal) * 100))

                          return (
                            <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                              <span className="text-[11px] font-bold text-foreground">
                                {item.created}
                              </span>
                              <div
                                className="w-full max-w-[42px] rounded-t-lg bg-primary/80 transition-all hover:bg-primary"
                                style={{ height: `${heightPct}%` }}
                              />
                              <span className="text-[10px] font-medium text-muted-foreground truncate max-w-full text-center">
                                {item.period.split(' ')[0]}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              {/* 4. RÉPARTITION SECTORIELLE & PLURIDISCIPLINARITÉ */}
              <section className="grid gap-6 lg:grid-cols-2">
                {/* Secteurs représentés */}
                <Card className="border-border/80 p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="space-y-0.5">
                      <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground">
                        Secteurs d’Activité Représentés
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Répartition thématique des projets entrepreneuriaux.
                      </CardDescription>
                    </div>
                    <span className="text-xs font-bold text-primary">
                      {data.sectorsDistribution.length} secteurs
                    </span>
                  </div>

                  {data.sectorsDistribution.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                      Aucun secteur de projet enregistré pour le moment.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {data.sectorsDistribution.slice(0, 6).map((sec) => (
                        <div key={sec.sectorId} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">{sec.label}</span>
                            <span className="font-bold text-muted-foreground">
                              {sec.count} projet{sec.count > 1 ? 's' : ''} ({sec.percent}%)
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(100, sec.percent)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Pluridisciplinarité */}
                <Card className="border-border/80 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div className="space-y-0.5">
                        <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground">
                          Projets Pluridisciplinaires
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Mixité des filières et expertises d’études au sein des équipes.
                        </CardDescription>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                        {data.multidisciplinarity.multidisciplinaryRatePercent}%
                      </span>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div className="flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-heading text-xl font-bold shadow-xs">
                          {data.multidisciplinarity.multidisciplinaryProjectsCount}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            Projets réunissant des filières d’études complémentaires
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Soit {data.multidisciplinarity.multidisciplinaryRatePercent}% des projets enregistrés.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <HelpCircle className="h-3.5 w-3.5 text-primary" />
                          Règle de calcul appliquée :
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {data.multidisciplinarity.definitionRule}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    Favorise l'association entre profils techniques, commerciaux, juridiques et créatifs.
                  </div>
                </Card>
              </section>

              {/* 5. OPPORTUNITÉS, MENTORAT & ACTIONS RAPIDES */}
              <section className="grid gap-6 lg:grid-cols-3">
                {/* Opportunités & Mentorat */}
                <Card className="border-border/80 p-6 shadow-2xs space-y-4 lg:col-span-2">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="space-y-0.5">
                      <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground">
                        Opportunités, Candidatures & Mentorat
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Mobilisation des étudiants sur les opportunités et programmes externes.
                      </CardDescription>
                    </div>
                    <BriefcaseBusiness className="h-4 w-4 text-primary" />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 pt-2">
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-1 text-center">
                      <span className="text-xs text-muted-foreground">Opportunités publiées</span>
                      <p className="font-heading text-2xl font-bold text-foreground">
                        {data.opportunities.publishedOpportunitiesCount}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-1 text-center">
                      <span className="text-xs text-muted-foreground">Candidatures soumises</span>
                      <p className="font-heading text-2xl font-bold text-primary">
                        {data.opportunities.studentApplicationsCount}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-1 text-center">
                      <span className="text-xs text-muted-foreground">Mentorats & Accords</span>
                      <p className="font-heading text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {data.opportunities.ongoingEngagementsCount}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-border/80 p-3.5 text-xs text-muted-foreground">
                    <p>
                      Les opportunités permettent à votre établissement de diffuser des appels à projets internes, concours ou programmes d'incubation auprès de vos promotions.
                    </p>
                  </div>
                </Card>

                {/* Actions Rapides */}
                <Card className="border-border/80 p-6 shadow-2xs space-y-4">
                  <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground">
                    Actions Rapides
                  </CardTitle>

                  <div className="space-y-2">
                    <Button asChild variant="outline" size="sm" className="w-full justify-between text-xs font-semibold">
                      <Link to="/institution/imports/new">
                        <span className="flex items-center gap-2">
                          <UserPlus className="h-3.5 w-3.5 text-primary" />
                          Importer des étudiants
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>

                    <Button asChild variant="outline" size="sm" className="w-full justify-between text-xs font-semibold">
                      <Link to="/institution/directory">
                        <span className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          Annuaire des étudiants
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>

                    <Button asChild variant="outline" size="sm" className="w-full justify-between text-xs font-semibold">
                      <Link to="/institution/affiliations">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          Gérer les affiliations
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>

                    <Button asChild variant="outline" size="sm" className="w-full justify-between text-xs font-semibold">
                      <Link to="/institution/members">
                        <span className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-primary" />
                          Équipe établissement
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </section>

              {/* 6. RESPECT DE LA CONFIDENTIALITÉ */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex items-start gap-3.5">
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground">
                    Garantie de Confidentialité et Protection des Données Étudiantes
                  </p>
                  <p>
                    {data.confidentiality.notes}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}
