import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Loader2, Search, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { partnerTalentSearchResponseSchema } from '@cofound/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import { useI18n } from '@/i18n'

export default function PartnerTalentsPage() {
  const { organizationId = '' } = useParams()
  const { t } = useI18n()
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Array<{ pseudonym: string; avatarSeed: string; headline: string | null; bio: string | null; completion: number; revealed: false }>>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = q.trim() ? `?q=${encodeURIComponent(q.trim())}&limit=50` : '?limit=50'
      const result = await apiClient.get(`/organizations/${organizationId}/talents/search${params}`, partnerTalentSearchResponseSchema)
      setItems(result.items)
    } catch { setMessage(t('partner.projects.error')) } finally { setLoading(false) }
  }, [organizationId, q, t])

  useEffect(() => { void Promise.resolve().then(load) }, [load])

  return <DashboardLayout><main className="min-h-screen bg-muted/20 p-6 lg:p-10"><div className="mx-auto max-w-6xl space-y-6">
    <Link to={`/organizations/${organizationId}/projects`} className="inline-flex items-center text-sm text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" />{t('partner.talents.back')}</Link>
    <header><h1 className="text-3xl font-bold tracking-tight">{t('partner.talents.title')}</h1><p className="mt-2 max-w-2xl text-muted-foreground">{t('partner.talents.subtitle')}</p></header>
    {message && <p role="status" className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">{message}</p>}
    <Card><CardContent className="flex gap-3 p-5"><div className="flex flex-1 items-center rounded-md border bg-background px-3"><Search className="mr-2 h-4 w-4 text-muted-foreground" /><input className="h-10 w-full bg-transparent outline-none" value={q} onChange={(event) => setQ(event.target.value)} placeholder={t('partner.talents.searchPlaceholder')} /></div><Button onClick={() => void load()}>{t('partner.talents.search')}</Button></CardContent></Card>
    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : items.length === 0 ? <Card><CardContent className="p-12 text-center text-muted-foreground">{t('partner.talents.empty')}</CardContent></Card> : <div className="grid gap-5 md:grid-cols-2">{items.map((item) => <Card key={item.pseudonym}><CardHeader><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound className="h-6 w-6" /></div><div><CardTitle>{item.pseudonym}</CardTitle><p className="text-xs text-muted-foreground">{item.completion}% complété</p></div></div></CardHeader><CardContent><p className="font-medium">{item.headline}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.bio}</p></CardContent></Card>)}</div>}
  </div></main></DashboardLayout>
}
