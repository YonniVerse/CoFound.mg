import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Bookmark, Check, Loader2, Search, Send, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { partnerProjectSearchResponseSchema, projectWatchListSchema } from '@cofound/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import { useI18n } from '@/i18n'

export default function PartnerProjectsPage() {
  const { organizationId = '' } = useParams()
  const { t } = useI18n()
  const [q, setQ] = useState('')
  const [minMaturity, setMinMaturity] = useState('0')
  const [maxMaturity, setMaxMaturity] = useState('100')
  const [items, setItems] = useState<Awaited<ReturnType<typeof apiClient.get>> extends never ? never[] : Array<{ id: string; title: string; pitch: string; maturity: number; sectorId: string | null; regionId: string | null; createdAt: Date }>>([])
  const [watched, setWatched] = useState<string[]>([])
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [contact, setContact] = useState<{ projectId: string; message: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ minMaturity, maxMaturity, limit: '50' })
      if (q.trim()) params.set('q', q.trim())
      const [projects, watchList] = await Promise.all([
        apiClient.get(`/organizations/${organizationId}/projects/search?${params.toString()}`, partnerProjectSearchResponseSchema),
        apiClient.get(`/organizations/${organizationId}/project-watches`, projectWatchListSchema),
      ])
      setItems(projects.items)
      setWatched(watchList.items.map((item) => item.projectId))
    } catch {
      setMessage(t('partner.projects.error'))
    } finally {
      setLoading(false)
    }
  }, [organizationId, q, minMaturity, maxMaturity, t])

  useEffect(() => { void Promise.resolve().then(load) }, [load])

  const toggleWatch = async (projectId: string) => {
    setBusyId(projectId)
    try {
      if (watched.includes(projectId)) {
        await apiClient.delete(`/organizations/${organizationId}/project-watches/${projectId}`)
        setWatched((current) => current.filter((id) => id !== projectId))
      } else {
        await apiClient.post(`/organizations/${organizationId}/project-watches/${projectId}`, { note: notes[projectId] || undefined })
        setWatched((current) => [...current, projectId])
      }
    } catch { setMessage(t('partner.projects.error')) } finally { setBusyId(null) }
  }

  const sendContact = async () => {
    if (!contact || contact.message.trim().length < 10) return
    setBusyId(contact.projectId)
    try {
      await apiClient.post(`/organizations/${organizationId}/projects/${contact.projectId}/contact`, { message: contact.message })
      setContact(null)
      setMessage(t('partner.projects.contactSent'))
    } catch { setMessage(t('partner.projects.error')) } finally { setBusyId(null) }
  }

  return <DashboardLayout><main className="min-h-screen bg-muted/20 p-6 lg:p-10"><div className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/feed" className="inline-flex items-center text-sm text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" />{t('partner.projects.back')}</Link><nav className="flex gap-2"><Link to={`/organizations/${organizationId}/opportunities`}><Button size="sm" variant="outline">{t('partner.opportunities.title')}</Button></Link><Link to={`/organizations/${organizationId}/talents`}><Button size="sm" variant="outline"><Users className="mr-2 h-4 w-4" />{t('partner.talents.title')}</Button></Link></nav></div>
    <header><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('partner.projects.eyebrow')}</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{t('partner.projects.title')}</h1><p className="mt-2 max-w-2xl text-muted-foreground">{t('partner.projects.subtitle')}</p></header>
    {message && <p role="status" className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">{message}</p>}
    <Card><CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_140px_140px_auto]"><label className="text-sm font-medium"><span className="mb-1 block">{t('partner.projects.search')}</span><div className="flex items-center rounded-md border bg-background px-3"><Search className="mr-2 h-4 w-4 text-muted-foreground" /><input className="h-10 w-full bg-transparent outline-none" value={q} onChange={(event) => setQ(event.target.value)} placeholder={t('partner.projects.searchPlaceholder')} /></div></label><label className="text-sm font-medium"><span className="mb-1 block">{t('partner.projects.minMaturity')}</span><input type="number" min="0" max="100" className="h-10 w-full rounded-md border bg-background px-3" value={minMaturity} onChange={(event) => setMinMaturity(event.target.value)} /></label><label className="text-sm font-medium"><span className="mb-1 block">{t('partner.projects.maxMaturity')}</span><input type="number" min="0" max="100" className="h-10 w-full rounded-md border bg-background px-3" value={maxMaturity} onChange={(event) => setMaxMaturity(event.target.value)} /></label><Button className="self-end" onClick={() => void load()}>{t('partner.projects.submit')}</Button></CardContent></Card>
    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : items.length === 0 ? <Card><CardContent className="p-12 text-center text-muted-foreground">{t('partner.projects.empty')}</CardContent></Card> : <div className="grid gap-5 xl:grid-cols-2">{items.map((item) => <Card key={item.id}><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>{item.title}</CardTitle><p className="mt-2 text-sm text-muted-foreground">{item.pitch}</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{item.maturity}%</span></div></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between text-xs text-muted-foreground"><span>{t('partner.projects.maturity')}</span><span>{new Date(item.createdAt).toLocaleDateString()}</span></div><div className="flex gap-2"><input className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm" value={notes[item.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))} placeholder={t('partner.projects.notePlaceholder')} /><Button size="sm" variant={watched.includes(item.id) ? 'outline' : 'default'} disabled={busyId === item.id} onClick={() => void toggleWatch(item.id)}><Bookmark className="mr-2 h-4 w-4" />{watched.includes(item.id) ? t('partner.projects.unwatch') : t('partner.projects.watch')}</Button></div>{contact?.projectId === item.id ? <div className="space-y-2 rounded-xl border bg-muted/20 p-3"><Textarea value={contact.message} onChange={(event) => setContact({ projectId: item.id, message: event.target.value })} placeholder={t('partner.projects.contactPlaceholder')} /><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => setContact(null)}>Annuler</Button><Button size="sm" disabled={busyId === item.id || contact.message.trim().length < 10} onClick={() => void sendContact()}><Send className="mr-2 h-4 w-4" />{t('partner.projects.sendContact')}</Button></div></div> : <Button size="sm" variant="outline" onClick={() => setContact({ projectId: item.id, message: '' })}><Send className="mr-2 h-4 w-4" />{t('partner.projects.contact')}</Button>}{watched.includes(item.id) && <p className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="h-3 w-3 text-primary" />{t('partner.projects.unwatch')}</p>}</CardContent></Card>)}</div>}
  </div></main></DashboardLayout>
}
