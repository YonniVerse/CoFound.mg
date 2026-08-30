import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileSpreadsheet, GraduationCap, Plus, ShieldCheck } from 'lucide-react'
import { institutionOverviewSchema, type InstitutionOverview } from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api-client'
import { InstitutionErrorState } from '@/components/institution/InstitutionErrorState'

const labels: Record<string, string> = { affiliates: 'Affiliés', activated: 'Comptes activés', completedProfiles: 'Profils complétés', projects: 'Projets créés' }

function InstitutionSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Chargement de la console établissement">
      <div className="flex items-center gap-3"><Skeleton className="h-11 w-11 rounded-xl" /><div className="space-y-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-32" /></div></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Card key={index} className="rounded-xl border-border bg-card shadow-2xs"><CardContent className="mt-3 space-y-3 p-5"><Skeleton className="h-3 w-28" /><Skeleton className="h-8 w-16" /></CardContent></Card>)}</div>
      <Card className="rounded-xl border-border bg-card shadow-2xs"><CardHeader className="border-b border-border/60 px-5 py-4"><Skeleton className="h-5 w-48" /></CardHeader><CardContent className="mt-3 space-y-3 p-5"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-11 w-40 rounded-lg" /></CardContent></Card>
    </div>
  )
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

  useEffect(() => { queueMicrotask(() => { void load() }) }, [load])

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5"><p className="text-xs font-bold uppercase tracking-wider text-primary">Console établissement</p><h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Vue d’ensemble</h1><p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Pilotez vos affiliations et accompagnez votre prochaine promotion.</p></div>
            <Button asChild className="h-10 w-fit gap-2 rounded-lg"><Link to="/institution/imports/new"><Plus className="h-4 w-4" aria-hidden="true" />Importer une promotion</Link></Button>
          </header>

          {loading && <InstitutionSkeleton />}
          {!loading && error !== null && <InstitutionErrorState error={error} onRetry={() => void load()} />}
          {!loading && error === null && data?.organizations.map((org) => {
            const firstUse = Object.values(org.metrics).every((value) => value === null) && org.recentImports.length === 0
            return <section key={org.id} className="space-y-5">
              <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"><GraduationCap className="h-5 w-5" aria-hidden="true" /></div><div><h2 className="text-lg font-bold tracking-tight text-foreground">{org.name}</h2><p className="mt-0.5 text-sm text-muted-foreground">Rôle : {org.role}</p></div></div>
              {firstUse ? <Card className="rounded-xl border-primary/20 bg-primary/[0.03] shadow-2xs"><CardHeader className="px-5 py-5 sm:px-6"><CardTitle className="text-base font-bold tracking-tight">Votre espace est prêt</CardTitle></CardHeader><CardContent className="mt-3 space-y-5 px-5 pb-5 sm:px-6"><p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Commencez par importer une promotion. Nous vous guiderons pour vérifier les colonnes, prévisualiser les lignes et créer les affiliations en toute sécurité.</p><div className="grid gap-2 sm:grid-cols-3">{['Importer le fichier', 'Vérifier les données', 'Inviter les étudiants'].map((step, index) => <div key={step} className="rounded-lg border border-border/70 bg-card p-3"><span className="text-xs font-bold text-primary">0{index + 1}</span><p className="mt-1.5 text-sm font-semibold text-foreground">{step}</p></div>)}</div><Button asChild className="w-fit gap-2"><Link to="/institution/imports/new">Commencer l’import<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></Button></CardContent></Card> : <><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Object.entries(org.metrics).map(([key, value]) => <Card key={key} className="rounded-xl border-border bg-card shadow-2xs"><CardHeader className="px-5 pb-2 pt-5"><CardTitle className="text-xs font-semibold text-muted-foreground">{labels[key]}</CardTitle></CardHeader><CardContent className="mt-3 px-5 pb-5"><p className="text-3xl font-bold tracking-tight text-foreground">{value ?? '—'}</p>{value === null && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Donnée masquée pour protéger la vie privée</p>}</CardContent></Card>)}</div><Card className="rounded-xl border-border bg-card shadow-2xs"><CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6"><CardTitle className="flex items-center gap-2 text-base font-bold tracking-tight"><FileSpreadsheet className="h-4 w-4 text-primary" aria-hidden="true" />Derniers lots d’import</CardTitle><Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 rounded-lg px-2.5 text-xs"><Link to="/institution/imports">Voir tout<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></Button></CardHeader><CardContent className="mt-3 p-5 sm:p-6">{org.recentImports.length === 0 ? <p className="text-sm text-muted-foreground">Aucun import récent.</p> : <div className="space-y-2">{org.recentImports.map((batch) => <Link key={batch.id} to={`/institution/imports/${batch.id}`} className="flex flex-col gap-1 rounded-lg border border-border/70 p-3 transition-colors hover:border-primary/30 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"><span className="truncate text-sm font-semibold text-foreground">{batch.fileName}</span><span className="text-xs text-muted-foreground">{batch.status} · {batch.totalRows} lignes{batch.errorRows > 0 ? ` · ${batch.errorRows} erreurs` : ''}</span></Link>)}</div>}</CardContent></Card></>}
              <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />Les statistiques individuelles et les données de genre ne sont jamais exposées dans cette console.</div>
            </section>
          })}
          {!loading && error === null && data?.organizations.length === 0 && <Card className="rounded-xl border-border bg-card shadow-2xs"><CardContent className="mt-3 p-8 text-center"><p className="font-semibold text-foreground">Aucun établissement rattaché</p><p className="mt-1 text-sm text-muted-foreground">Votre compte doit être associé à un établissement pour accéder à cette console.</p></CardContent></Card>}
        </div>
      </main>
    </DashboardLayout>
  )
}
