import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Check, ChevronDown, Loader2, Plus, Send, WalletCards, X } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { cohortSchema, opportunityApplicationSchema, opportunitySchema, programSchema, type Cohort, type Program } from '@cofound/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import { useI18n } from '@/i18n'

type Opportunity = { id: string; title: string; description: string; status: string; type: string; organizationId: string; eligibility: string | null; deadline: Date | null; seats: number | null; createdAt: Date; updatedAt: Date; programId?: string | null; cohortId?: string | null; program?: { id: string; name: string } | null; cohort?: { id: string; name: string; region: string | null } | null }
type ApplicationStatus = 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEW' | 'WAITLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
type Application = { id: string; opportunityId: string; applicantType: string; applicantId: string; message: string; status: ApplicationStatus; rejectionReason: string | null; createdAt: Date }
const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = { PENDING: 'En attente', REVIEWING: 'En cours d’examen', SHORTLISTED: 'Présélectionnée', INTERVIEW: 'Entretien', WAITLISTED: 'Liste d’attente', ACCEPTED: 'Acceptée', REJECTED: 'Refusée', WITHDRAWN: 'Retirée' }
const NEXT_APPLICATION_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = { PENDING: ['REVIEWING', 'REJECTED'], REVIEWING: ['SHORTLISTED', 'REJECTED'], SHORTLISTED: ['INTERVIEW', 'REJECTED'], INTERVIEW: ['WAITLISTED', 'ACCEPTED', 'REJECTED'], WAITLISTED: ['INTERVIEW', 'ACCEPTED', 'REJECTED'], ACCEPTED: [], REJECTED: [], WITHDRAWN: [] }

export default function PartnerOpportunitiesPage() {
  const { organizationId = '' } = useParams()
  const { t } = useI18n()
  const [items, setItems] = useState<Opportunity[]>([])
  const [applications, setApplications] = useState<Record<string, Application[]>>({})
  const [formOpen, setFormOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [financeProjectId, setFinanceProjectId] = useState('')
  const [financeAmount, setFinanceAmount] = useState('')
  const [financeCurrency, setFinanceCurrency] = useState('MGA')
  const [programs, setPrograms] = useState<Program[]>([])
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [programId, setProgramId] = useState('')
  const [cohortId, setCohortId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await apiClient.get(`/organizations/${organizationId}/opportunities`)
      setItems((result as Opportunity[]).map((item) => opportunitySchema.parse(item)))
    } catch { setMessage(t('partner.projects.error')) } finally { setLoading(false) }
  }, [organizationId, t])
  useEffect(() => { void Promise.resolve().then(load) }, [load])
  useEffect(() => { void apiClient.get(`/organizations/${organizationId}/incubator/programs`).then((result) => setPrograms((result as unknown[]).map((item) => programSchema.parse(item)))).catch(() => setPrograms([])) }, [organizationId])
  useEffect(() => { if (!programId) return; void apiClient.get(`/organizations/${organizationId}/incubator/programs/${programId}/cohorts`).then((result) => setCohorts((result as unknown[]).map((item) => cohortSchema.parse(item)))).catch(() => setCohorts([])) }, [organizationId, programId])

  const create = async () => {
    setBusyId('create')
    try { await apiClient.post(`/organizations/${organizationId}/opportunities`, { title, description, type: 'CALL_FOR_APPLICATIONS', ...(programId ? { programId } : {}), ...(cohortId ? { cohortId } : {}) }); setTitle(''); setDescription(''); setProgramId(''); setCohortId(''); setFormOpen(false); await load() } catch { setMessage(t('partner.projects.error')) } finally { setBusyId(null) }
  }
  const publish = async (id: string) => {
    setBusyId(id)
    try { await apiClient.post(`/organizations/${organizationId}/opportunities/${id}/publish`, {}); await load() } catch { setMessage(t('partner.projects.error')) } finally { setBusyId(null) }
  }
  const loadApplications = async (id: string) => {
    setBusyId(id)
    try { const result = await apiClient.get(`/organizations/${organizationId}/opportunities/${id}/applications`);             setApplications((current) => ({ ...current, [id]: (result as unknown[]).map((item) => opportunityApplicationSchema.parse(item) as Application) })) } catch { setMessage(t('partner.projects.error')) } finally { setBusyId(null) }
  }
  const createFinance = async () => {
    setBusyId('finance')
    try {
      await apiClient.post(`/organizations/${organizationId}/financial-engagements`, { projectId: financeProjectId, type: 'GRANT', amount: financeAmount, currency: financeCurrency, provider: 'OFF_PLATFORM' })
      setFinanceProjectId('')
      setFinanceAmount('')
      setMessage(t('partner.finance.status'))
    } catch { setMessage(t('partner.projects.error')) } finally { setBusyId(null) }
  }

  const decide = async (opportunityId: string, applicationId: string, status: ApplicationStatus) => {
    setBusyId(applicationId)
    try { await apiClient.post(`/organizations/${organizationId}/opportunities/${opportunityId}/applications/${applicationId}/decision`, { status, ...(status === 'REJECTED' ? { rejectionReason: 'La candidature ne correspond pas aux critères actuels.' } : {}) }); await loadApplications(opportunityId) } catch { setMessage(t('partner.projects.error')) } finally { setBusyId(null) }
  }

  return <DashboardLayout><main className="min-h-screen bg-muted/20 p-6 lg:p-10"><div className="mx-auto max-w-6xl space-y-6">
    <Link to={`/organizations/${organizationId}/projects`} className="inline-flex items-center text-sm text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" />{t('partner.opportunities.back')}</Link>
    <header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight">{t('partner.opportunities.title')}</h1><p className="mt-2 text-muted-foreground">{t('partner.opportunities.subtitle')}</p></div><div className="flex flex-wrap gap-2"><Link to={`/organizations/${organizationId}/wallet`} className="inline-flex h-10 items-center rounded-md border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"><WalletCards className="mr-2 h-4 w-4" /> Wallet</Link><Button onClick={() => setFormOpen((value) => !value)}><Plus className="mr-2 h-4 w-4" />{t('partner.opportunities.create')}</Button></div></header>
    {message && <p role="status" className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">{message}</p>}
    {formOpen && <Card><CardHeader><CardTitle>{t('partner.opportunities.create')}</CardTitle></CardHeader><CardContent className="space-y-3"><input className="h-10 w-full rounded-md border bg-background px-3" value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t('partner.opportunities.titlePlaceholder')} /><Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder={t('partner.opportunities.descriptionPlaceholder')} /><div className="grid gap-3 md:grid-cols-2"><select className="h-10 rounded-md border bg-background px-3 text-sm" value={programId} onChange={(event) => { setProgramId(event.target.value); setCohortId('') }}><option value="">Sans programme</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select><select className="h-10 rounded-md border bg-background px-3 text-sm" value={cohortId} onChange={(event) => setCohortId(event.target.value)} disabled={!programId}><option value="">Sans cohorte</option>{cohorts.map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}</select></div><div className="flex justify-end"><Button disabled={busyId === 'create' || title.trim().length < 3 || description.trim().length < 20} onClick={() => void create()}>{t('partner.opportunities.create')}</Button></div></CardContent></Card>}
    <Card><CardHeader><CardTitle>{t('partner.finance.title')}</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-[1fr_180px_120px_auto]"><input className="h-10 rounded-md border bg-background px-3 text-sm" value={financeProjectId} onChange={(event) => setFinanceProjectId(event.target.value)} placeholder="ID du projet" /><input className="h-10 rounded-md border bg-background px-3 text-sm" value={financeAmount} onChange={(event) => setFinanceAmount(event.target.value)} placeholder={t('partner.finance.amount')} inputMode="decimal" /><input className="h-10 rounded-md border bg-background px-3 text-sm uppercase" value={financeCurrency} onChange={(event) => setFinanceCurrency(event.target.value.toUpperCase())} placeholder={t('partner.finance.currency')} maxLength={3} /><Button disabled={busyId === 'finance' || !financeProjectId || !financeAmount || financeCurrency.length !== 3} onClick={() => void createFinance()}>{t('partner.finance.create')}</Button></CardContent></Card>
    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : items.length === 0 ? <Card><CardContent className="p-12 text-center text-muted-foreground">{t('partner.projects.empty')}</CardContent></Card> : <div className="space-y-5">{items.map((item) => <Card key={item.id}><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle>{item.title}</CardTitle><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>{(item.program || item.cohort) && <p className="mt-2 text-xs font-medium text-primary">{item.program?.name || 'Programme'}{item.cohort ? ` · ${item.cohort.name}` : ''}</p>}</div><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{item.status === 'DRAFT' ? t('partner.opportunities.draft') : t('partner.opportunities.published')}</span></div></CardHeader><CardContent className="space-y-4"><div className="flex flex-wrap gap-2">{item.status === 'DRAFT' && <Button size="sm" disabled={busyId === item.id} onClick={() => void publish(item.id)}><Send className="mr-2 h-4 w-4" />{t('partner.opportunities.publish')}</Button>}{item.status === 'PUBLISHED' && <Button size="sm" variant="outline" disabled={busyId === item.id} onClick={() => void loadApplications(item.id)}><ChevronDown className="mr-2 h-4 w-4" />{t('partner.opportunities.application')}</Button>}</div>{applications[item.id] && <div className="divide-y rounded-xl border">{applications[item.id]!.length === 0 ? <p className="p-4 text-sm text-muted-foreground">{t('partner.projects.empty')}</p> : applications[item.id]!.map((application) => <div key={application.id} className="space-y-2 p-4"><div className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold">{application.applicantType} · {application.applicantId}</span><span className="text-xs text-muted-foreground">{APPLICATION_STATUS_LABELS[application.status]}</span></div><p className="text-sm text-muted-foreground">{application.message}</p>{NEXT_APPLICATION_STATUSES[application.status].length > 0 && <div className="flex flex-wrap gap-2">{NEXT_APPLICATION_STATUSES[application.status].map((nextStatus) => <Button key={nextStatus} size="sm" variant={nextStatus === 'REJECTED' ? 'outline' : 'default'} onClick={() => void decide(item.id, application.id, nextStatus)} disabled={busyId === application.id}>{nextStatus === 'REJECTED' ? <X className="mr-1 h-3 w-3" /> : <Check className="mr-1 h-3 w-3" />}{APPLICATION_STATUS_LABELS[nextStatus]}</Button>)}</div>}</div>)}</div>}</CardContent></Card>)}</div>}
  </div></main></DashboardLayout>
}
