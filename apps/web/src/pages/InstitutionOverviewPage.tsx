import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileSpreadsheet, GraduationCap, Loader2, Plus, ShieldCheck } from 'lucide-react'
import { institutionOverviewSchema, type InstitutionOverview } from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'

const labels: Record<string, string> = { affiliates: 'Affiliés', activated: 'Comptes activés', completedProfiles: 'Profils complétés', projects: 'Projets créés' }

export default function InstitutionOverviewPage() {
  const [data, setData] = useState<InstitutionOverview | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => { apiClient.get('/institution/overview', institutionOverviewSchema).then(setData).catch(() => setError(true)) }, [])
  return <DashboardLayout><main className="min-h-screen bg-muted/20 p-6 lg:p-10"><div className="mx-auto max-w-6xl space-y-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-wider text-primary">Console établissement</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Vue d’ensemble</h1><p className="mt-2 text-muted-foreground">Pilotez vos affiliations et accompagnez votre prochaine promotion.</p></div><Button asChild><Link to="/institution/imports/new"><Plus className="mr-2 h-4 w-4" />Importer une promotion</Link></Button></header>
    {error && <Card className="border-destructive/40"><CardContent className="pt-6 text-destructive">Impossible de charger les données de votre établissement. Veuillez réessayer.</CardContent></Card>}
    {!data && !error && <div className="flex items-center justify-center py-24 text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Chargement de la console…</div>}
    {data?.organizations.map((org) => { const firstUse = Object.values(org.metrics).every((value) => value === null) && org.recentImports.length === 0; return <section key={org.id} className="space-y-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-3 text-primary"><GraduationCap className="h-6 w-6" /></div><div><h2 className="text-xl font-semibold">{org.name}</h2><p className="text-sm text-muted-foreground">Rôle : {org.role}</p></div></div>
      {firstUse ? <Card className="border-primary/20 bg-primary/[0.03]"><CardHeader><CardTitle>Votre espace est prêt</CardTitle></CardHeader><CardContent><p className="max-w-2xl text-muted-foreground">Commencez par importer une promotion. Nous vous guiderons pour vérifier les colonnes, prévisualiser les lignes et créer les affiliations en toute sécurité.</p><div className="mt-6 grid gap-3 md:grid-cols-3">{['Importer le fichier', 'Vérifier les données', 'Inviter les étudiants'].map((step, index) => <div key={step} className="rounded-lg border bg-background p-4"><span className="text-sm font-bold text-primary">0{index + 1}</span><p className="mt-2 font-medium">{step}</p></div>)}</div></CardContent></Card> : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Object.entries(org.metrics).map(([key, value]) => <Card key={key}><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{labels[key]}</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{value ?? '—'}</p>{value === null && <p className="mt-1 text-xs text-muted-foreground">Donnée masquée pour protéger la vie privée</p>}</CardContent></Card>)}</div><Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-primary" />Derniers lots d’import</CardTitle><Button variant="ghost" asChild><Link to="/institution/imports">Voir tout <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></CardHeader><CardContent>{org.recentImports.length === 0 ? <p className="text-sm text-muted-foreground">Aucun import récent.</p> : <div className="space-y-3">{org.recentImports.map((batch) => <Link key={batch.id} to={`/institution/imports/${batch.id}`} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"><span className="font-medium">{batch.fileName}</span><span className="text-sm text-muted-foreground">{batch.status} · {batch.totalRows} lignes{batch.errorRows > 0 ? ` · ${batch.errorRows} erreurs` : ''}</span></Link>)}</div>}</CardContent></Card></>}
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary" />Les statistiques individuelles et les données de genre ne sont jamais exposées dans cette console.</div>
    </section> })}
  </div></main></DashboardLayout>
}
