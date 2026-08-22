import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Download, Loader2, ShieldCheck } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type AuditItem = { id: string; createdAt: string; actorId: string | null; actorRole: string | null; action: string; targetType: string; targetId: string; ip: string | null; metadata: Record<string, unknown> | null }
type AuditResponse = { items: AuditItem[]; nextCursor: string | null; hasMore: boolean }

export default function AuditLogPage() {
  const [items, setItems] = useState<AuditItem[]>([])
  const [actorId, setActorId] = useState('')
  const [action, setAction] = useState('')
  const [targetType, setTargetType] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [cursor, setCursor] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const query = useCallback(() => {
    const params = new URLSearchParams()
    if (actorId.trim()) params.set('actorId', actorId.trim())
    if (action.trim()) params.set('action', action.trim())
    if (targetType.trim()) params.set('targetType', targetType.trim())
    if (from) params.set('from', new Date(`${from}T00:00:00.000Z`).toISOString())
    if (to) params.set('to', new Date(`${to}T23:59:59.999Z`).toISOString())
    if (cursor) params.set('cursor', cursor)
    params.set('limit', '25')
    return params.toString()
  }, [actorId, action, targetType, from, to, cursor])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await apiClient.get<AuditResponse>(`/staff/audit?${query()}`)
      setItems(response.items)
      setNextCursor(response.nextCursor)
      setMessage('')
    } catch {
      setMessage('Impossible de charger le journal. Cette console est réservée aux SUPER_ADMIN.')
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => { void Promise.resolve().then(load) }, [load])

  const applyFilters = () => { setCursor(null) }
  const exportCsv = async () => {
    try {
      const csv = await apiClient.getText(`/staff/audit/export?${query().replace(/cursor=[^&]+&?/, '')}`)
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'cofound-audit.csv'
      link.click()
      URL.revokeObjectURL(url)
      setMessage('Export CSV généré et accès journalisé.')
    } catch {
      setMessage('Impossible de générer l’export CSV.')
    }
  }

  return <DashboardLayout><main className="min-h-screen bg-muted/20 p-6 lg:p-10"><div className="mx-auto max-w-7xl space-y-6"><Link to="/feed" className="inline-flex items-center text-sm text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" />Retour à l’espace principal</Link><header><p className="text-sm font-semibold uppercase tracking-wider text-primary">Console staff</p><h1 className="mt-2 flex items-center gap-2 text-3xl font-bold"><ShieldCheck className="h-7 w-7" />Journal d’audit</h1><p className="mt-2 text-muted-foreground">Lecture seule. Les métadonnées affichées sont filtrées pour ne jamais révéler de contenu privé.</p></header><Card><CardHeader><CardTitle>Filtres</CardTitle></CardHeader><CardContent><div className="grid gap-3 md:grid-cols-5"><label className="text-sm">Acteur<input className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={actorId} onChange={(event) => setActorId(event.target.value)} placeholder="Identifiant" /></label><label className="text-sm">Action<input className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={action} onChange={(event) => setAction(event.target.value)} placeholder="Ex. REPORT_RESOLVE" /></label><label className="text-sm">Type d’objet<input className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={targetType} onChange={(event) => setTargetType(event.target.value)} placeholder="Ex. Report" /></label><label className="text-sm">Du<input type="date" className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label className="text-sm">Au<input type="date" className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={to} onChange={(event) => setTo(event.target.value)} /></label></div><div className="mt-4 flex flex-wrap gap-2"><Button onClick={applyFilters}>Appliquer</Button><Button variant="outline" onClick={() => void exportCsv()}><Download className="mr-2 h-4 w-4" />Exporter CSV</Button></div></CardContent></Card>{message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}<Card><CardHeader><CardTitle>Événements tracés</CardTitle></CardHeader><CardContent>{loading ? <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div> : items.length === 0 ? <p className="py-10 text-center text-muted-foreground">Aucun événement pour ces filtres.</p> : <div className="divide-y">{items.map((item) => <article key={item.id} className="py-4"><div className="grid gap-2 text-sm md:grid-cols-[1.3fr_1fr_1fr_1fr_auto]"><span>{new Date(item.createdAt).toLocaleString('fr-FR')}</span><span>{item.actorId ?? 'Système'} · {item.actorRole ?? '—'}</span><span className="font-semibold">{item.action}</span><span>{item.targetType} · {item.targetId}</span><Button size="sm" variant="ghost" onClick={() => setExpanded(expanded === item.id ? null : item.id)}>{expanded === item.id ? 'Masquer' : 'Détails'}<ChevronDown className="ml-1 h-4 w-4" /></Button></div>{expanded === item.id && <dl className="mt-3 grid gap-2 rounded-md bg-muted/40 p-3 text-xs sm:grid-cols-2"><div><dt className="font-semibold">Adresse IP</dt><dd>{item.ip ?? 'Non disponible'}</dd></div><div><dt className="font-semibold">Métadonnées filtrées</dt><dd><pre className="mt-1 overflow-auto whitespace-pre-wrap">{JSON.stringify(item.metadata ?? {}, null, 2)}</pre></dd></div></dl>}</article>)}</div>}{!loading && (cursor || nextCursor) && <div className="mt-4 flex justify-between"><Button variant="outline" disabled={!cursor} onClick={() => setCursor(null)}>Première page</Button><Button variant="outline" disabled={!nextCursor} onClick={() => setCursor(nextCursor)}>Page suivante</Button></div>}</CardContent></Card></div></main></DashboardLayout>
}
