import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import { cohortSchema, opportunityApplicationSchema, programSchema, type Cohort, type Program } from '@cofound/shared'

type Application = ReturnType<typeof opportunityApplicationSchema.parse> & { opportunity: NonNullable<ReturnType<typeof opportunityApplicationSchema.parse>['opportunity']> }
const STATUS_LABELS: Record<string, string> = { PENDING: 'En attente', REVIEWING: 'En cours d’examen', SHORTLISTED: 'Présélectionnée', INTERVIEW: 'Entretien', WAITLISTED: 'Liste d’attente', ACCEPTED: 'Acceptée', REJECTED: 'Refusée', WITHDRAWN: 'Retirée' }

export default function IncubatorProgramsPage() {
  const { organizationId = '' } = useParams()
  const [programs, setPrograms] = useState<Program[]>([])
  const [cohorts, setCohorts] = useState<Record<string, Cohort[]>>({})
  const [applications, setApplications] = useState<Application[]>([])
  const [programName, setProgramName] = useState('')
  const [programDescription, setProgramDescription] = useState('')
  const [cohortNames, setCohortNames] = useState<Record<string, string>>({})
  const [selectedProgram, setSelectedProgram] = useState('')
  const [selectedCohort, setSelectedCohort] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const loadPrograms = useCallback(async () => {
    setLoading(true)
    try {
      const result = await apiClient.get(`/organizations/${organizationId}/incubator/programs`)
      setPrograms((result as unknown[]).map((item) => programSchema.parse(item)))
    } catch { setMessage('Impossible de charger les programmes.') } finally { setLoading(false) }
  }, [organizationId])

  useEffect(() => { void Promise.resolve().then(loadPrograms) }, [loadPrograms])

  const loadCohorts = async (programId: string) => {
    try {
      const result = await apiClient.get(`/organizations/${organizationId}/incubator/programs/${programId}/cohorts`)
      setCohorts((current) => ({ ...current, [programId]: (result as unknown[]).map((item) => cohortSchema.parse(item)) }))
    } catch { setMessage('Impossible de charger les cohortes.') }
  }

  const createProgram = async () => {
    setBusy('program')
    try { await apiClient.post(`/organizations/${organizationId}/incubator/programs`, { name: programName, description: programDescription }); setProgramName(''); setProgramDescription(''); setMessage('Programme créé.'); await loadPrograms() } catch { setMessage('La création du programme a échoué.') } finally { setBusy(null) }
  }

  const createCohort = async (programId: string) => {
    const name = cohortNames[programId]?.trim()
    if (!name) return
    setBusy(`cohort-${programId}`)
    try { await apiClient.post(`/organizations/${organizationId}/incubator/programs/${programId}/cohorts`, { name }); setCohortNames((current) => ({ ...current, [programId]: '' })); setMessage('Cohorte créée.'); await loadCohorts(programId) } catch { setMessage('La création de la cohorte a échoué.') } finally { setBusy(null) }
  }

  const loadApplications = async () => {
    setBusy('applications')
    try {
      const query = new URLSearchParams()
      if (selectedProgram) query.set('programId', selectedProgram)
      if (selectedCohort) query.set('cohortId', selectedCohort)
      if (selectedStatus) query.set('status', selectedStatus)
      const result = await apiClient.get(`/organizations/${organizationId}/incubator/applications${query.toString() ? `?${query.toString()}` : ''}`)
      const parsed = (result as unknown[]).map((item) => opportunityApplicationSchema.parse(item)).filter((item): item is Application => Boolean(item.opportunity))
      setApplications(parsed)
    } catch { setMessage('Impossible de charger les candidatures.') } finally { setBusy(null) }
  }

  return <DashboardLayout><main className="min-h-screen bg-muted/20 p-6 lg:p-10"><div className="mx-auto max-w-6xl space-y-6">
    <Link to={`/organizations/${organizationId}/opportunities`} className="inline-flex items-center text-sm text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" />Retour aux opportunités</Link>
    <header><h1 className="text-3xl font-bold tracking-tight">Programmes incubateur</h1><p className="mt-2 text-muted-foreground">Organisez vos programmes, cohortes et candidatures dans un même espace.</p></header>
    {message && <p role="status" className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">{message}</p>}
    <Card><CardHeader><CardTitle>Créer un programme</CardTitle></CardHeader><CardContent className="space-y-3"><input className="h-10 w-full rounded-md border bg-background px-3" value={programName} onChange={(event) => setProgramName(event.target.value)} placeholder="Nom du programme" /><textarea className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" value={programDescription} onChange={(event) => setProgramDescription(event.target.value)} placeholder="Description et objectifs du programme" /><div className="flex justify-end"><Button disabled={busy === 'program' || programName.trim().length < 3} onClick={() => void createProgram()}><Plus className="mr-2 h-4 w-4" />Créer le programme</Button></div></CardContent></Card>
    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : <div className="grid gap-4 lg:grid-cols-2">{programs.map((program) => <Card key={program.id}><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>{program.name}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{program.description || 'Aucune description'}</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{program.status}</span></div></CardHeader><CardContent className="space-y-4"><div className="flex gap-4 text-sm text-muted-foreground"><span>{program.cohortsCount} cohorte(s)</span><span>{program.opportunitiesCount} opportunité(s)</span></div><Button size="sm" variant="outline" onClick={() => void loadCohorts(program.id)}><ChevronDown className="mr-2 h-4 w-4" />Voir les cohortes</Button>{cohorts[program.id] && <div className="space-y-2 rounded-xl border p-3">{cohorts[program.id]!.map((cohort) => <div key={cohort.id} className="flex items-center justify-between text-sm"><span>{cohort.name}{cohort.region ? ` · ${cohort.region}` : ''}</span><span className="text-xs text-muted-foreground">{cohort.status}</span></div>)}<div className="flex gap-2"><input className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm" value={cohortNames[program.id] || ''} onChange={(event) => setCohortNames((current) => ({ ...current, [program.id]: event.target.value }))} placeholder="Nouvelle cohorte" /><Button size="sm" disabled={busy === `cohort-${program.id}`} onClick={() => void createCohort(program.id)}>Ajouter</Button></div></div>}</CardContent></Card>)}</div>}
    <Card><CardHeader><CardTitle>Candidatures par programme et cohorte</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 md:grid-cols-4"><select className="h-10 rounded-md border bg-background px-3 text-sm" value={selectedProgram} onChange={(event) => { setSelectedProgram(event.target.value); setSelectedCohort('') }}><option value="">Tous les programmes</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select><select className="h-10 rounded-md border bg-background px-3 text-sm" value={selectedCohort} onChange={(event) => setSelectedCohort(event.target.value)} disabled={!selectedProgram}><option value="">Toutes les cohortes</option>{(cohorts[selectedProgram] || []).map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}</select><select className="h-10 rounded-md border bg-background px-3 text-sm" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}><option value="">Tous les statuts</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><Button disabled={busy === 'applications'} onClick={() => void loadApplications()}>Filtrer</Button></div>{applications.length === 0 ? <p className="text-sm text-muted-foreground">Aucune candidature chargée pour ces filtres.</p> : <div className="divide-y rounded-xl border">{applications.map((application) => <div key={application.id} className="space-y-1 p-3 text-sm"><div className="flex justify-between gap-3"><span className="font-semibold">{application.opportunity.title}</span><span className="text-xs text-muted-foreground">{STATUS_LABELS[application.status]}</span></div><p className="text-muted-foreground">{application.opportunity.program?.name || 'Sans programme'} · {application.opportunity.cohort?.name || 'Sans cohorte'}</p></div>)}</div>}</CardContent></Card>
  </div></main></DashboardLayout>
}
