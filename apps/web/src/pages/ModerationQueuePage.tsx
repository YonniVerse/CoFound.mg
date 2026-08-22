import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Report = {
  id: string
  targetType: string
  targetId: string
  reason: string
  description: string | null
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED'
  priority: number
  createdAt: string
  assignedToId: string | null
}
type QueueResponse = { items: Report[]; nextCursor: string | null; hasMore: boolean }

export default function ModerationQueuePage() {
  const [status, setStatus] = useState<'OPEN' | 'IN_REVIEW'>('OPEN')
  const [items, setItems] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [identity, setIdentity] = useState<{ userId: string; email: string; firstName: string; lastName: string } | null>(null)
  const [sanctionReportId, setSanctionReportId] = useState<string | null>(null)
  const [sanctionAction, setSanctionAction] = useState<'WARNING' | 'FREEZE' | 'DISABLE' | 'CONTENT_REMOVED'>('WARNING')
  const [sanctionTargetUserId, setSanctionTargetUserId] = useState('')
  const [sanctionReason, setSanctionReason] = useState('')
  const [sanctionDurationDays, setSanctionDurationDays] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await apiClient.get<QueueResponse>(`/reports/moderation-queue?status=${status}&limit=50`)
      setItems(response.items)
      setMessage('')
    } catch {
      setMessage('Impossible de charger la file de modération. Vérifiez vos permissions.')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { void Promise.resolve().then(load) }, [load])

  const revealIdentity = async (reportId: string) => {
    if (!window.confirm('Révéler cette identité civile ? Cet accès sera journalisé.')) return
    try {
      const result = await apiClient.get<{ userId: string; email: string; firstName: string; lastName: string }>(`/reports/${reportId}/identity`)
      setIdentity(result)
      setMessage('Accès à l’identité journalisé.')
    } catch {
      setMessage('Impossible de révéler cette identité.')
    }
  }

  const submitSanction = async () => {
    if (!sanctionReportId || sanctionReason.trim().length < 3 || sanctionTargetUserId.trim().length < 1) {
      setMessage('La cible et le motif de sanction sont obligatoires.')
      return
    }
    setBusyId(sanctionReportId)
    try {
      await apiClient.patch(`/reports/${sanctionReportId}/decision`, { status: 'RESOLVED', action: sanctionAction, targetUserId: sanctionTargetUserId.trim(), reason: sanctionReason.trim(), ...(sanctionDurationDays ? { durationDays: Number(sanctionDurationDays) } : {}) })
      setMessage('Sanction enregistrée et auditée.')
      setSanctionReportId(null)
      setSanctionTargetUserId('')
      setSanctionReason('')
      setSanctionDurationDays('')
      await load()
    } catch {
      setMessage('La sanction n’a pas pu être enregistrée.')
    } finally {
      setBusyId(null)
    }
  }

  const decide = async (reportId: string, nextStatus: 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED') => {
    setBusyId(reportId)
    try {
      await apiClient.patch(`/reports/${reportId}/decision`, { status: nextStatus })
      setMessage('Décision enregistrée et action auditée.')
      await load()
    } catch {
      setMessage('La décision n’a pas pu être enregistrée.')
    } finally {
      setBusyId(null)
    }
  }

  return <DashboardLayout><main className="min-h-screen bg-muted/20 p-6 lg:p-10"><div className="mx-auto max-w-6xl space-y-6"><Link to="/feed" className="inline-flex items-center text-sm text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" />Retour à l’espace principal</Link><header><p className="text-sm font-semibold uppercase tracking-wider text-primary">Console sécurité</p><h1 className="mt-2 flex items-center gap-2 text-3xl font-bold"><ShieldAlert className="h-7 w-7" />File de modération</h1><p className="mt-2 text-muted-foreground">Les signalements sont traités par priorité. Les identités civiles restent masquées dans cette file.</p></header><div className="flex flex-wrap items-center gap-3"><label className="text-sm font-semibold" htmlFor="report-status">État</label><select id="report-status" className="h-10 rounded-md border bg-background px-3" value={status} onChange={(event) => setStatus(event.target.value as 'OPEN' | 'IN_REVIEW')}><option value="OPEN">À traiter</option><option value="IN_REVIEW">En revue</option></select></div>{message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}      {identity && <Card><CardHeader><CardTitle>Identité consultée</CardTitle></CardHeader><CardContent><p className="text-sm">{identity.firstName} {identity.lastName} · {identity.email}</p><Button className="mt-3" size="sm" variant="outline" onClick={() => setIdentity(null)}>Masquer</Button></CardContent></Card>}<Card><CardHeader><CardTitle>Signalements</CardTitle></CardHeader><CardContent>{loading ? <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div> : items.length === 0 ? <p className="py-10 text-center text-muted-foreground">Aucun signalement dans cet état.</p> : <div className="divide-y">{items.map((item) => <article key={item.id} className="space-y-3 py-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{item.reason} · {item.targetType}</p><p className="text-sm text-muted-foreground">Référence pseudonymisée : {item.targetId} · priorité {item.priority}</p>{item.description && <p className="mt-2 text-sm">{item.description}</p>}</div><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{item.status}</span></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={busyId === item.id} onClick={() => void decide(item.id, 'IN_REVIEW')}>Prendre en revue</Button><Button size="sm" variant="outline" disabled={busyId === item.id} onClick={() => void revealIdentity(item.id)}>Révéler l’identité</Button><Button size="sm" disabled={busyId === item.id} onClick={() => void decide(item.id, 'RESOLVED')}>Résoudre</Button><Button size="sm" variant="outline" disabled={busyId === item.id} onClick={() => setSanctionReportId(item.id)}>Sanctionner</Button><Button size="sm" variant="ghost" disabled={busyId === item.id} onClick={() => void decide(item.id, 'DISMISSED')}>Classer sans suite</Button>{sanctionReportId === item.id && <div className="mt-3 grid gap-3 rounded-md border bg-muted/30 p-4 sm:grid-cols-2"><label className="text-sm">Action<select className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={sanctionAction} onChange={(event) => setSanctionAction(event.target.value as typeof sanctionAction)}><option value="WARNING">Avertissement</option><option value="FREEZE">Gel du compte</option><option value="DISABLE">Désactivation</option><option value="CONTENT_REMOVED">Retrait du contenu</option></select></label><label className="text-sm">Identifiant utilisateur cible<input className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={sanctionTargetUserId} onChange={(event) => setSanctionTargetUserId(event.target.value)} placeholder="Identifiant interne" /></label><label className="text-sm sm:col-span-2">Motif<textarea className="mt-1 min-h-20 w-full rounded-md border bg-background p-3" value={sanctionReason} onChange={(event) => setSanctionReason(event.target.value)} /></label><label className="text-sm">Durée en jours<input type="number" min="1" className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={sanctionDurationDays} onChange={(event) => setSanctionDurationDays(event.target.value)} /></label><div className="flex items-end gap-2"><Button size="sm" onClick={() => void submitSanction()} disabled={busyId === item.id}>Confirmer la sanction</Button><Button size="sm" variant="ghost" onClick={() => setSanctionReportId(null)}>Annuler</Button></div></div>}</div></article>)}</div>}</CardContent></Card></div></main></DashboardLayout>
}
