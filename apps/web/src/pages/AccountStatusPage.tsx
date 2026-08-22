import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { accountStatusResponseSchema, type AccountStatusResponse } from '@cofound/shared'
import { useI18n } from '@/i18n'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AccountStatusPage() {
  const { t } = useI18n()
  const [data, setData] = useState<AccountStatusResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true
    void apiClient.get('/me/status', accountStatusResponseSchema).then((result) => { if (mounted) setData(result) }).catch(() => { if (mounted) setError(true) })
    return () => { mounted = false }
  }, [])

  if (error) return <main className="flex min-h-screen items-center justify-center p-6"><Card className="w-full max-w-lg"><CardContent className="p-6"><p role="alert" className="text-destructive">{t('account.status.error')}</p></CardContent></Card></main>
  if (!data) return <main className="flex min-h-screen items-center justify-center p-6"><p role="status" className="text-muted-foreground">{t('account.status.loading')}</p></main>

  const title = data.status === 'FROZEN' ? t('account.status.frozen.title') : data.status === 'LEAVING' ? t('account.status.leaving.title') : data.status === 'ALUMNI' ? t('account.status.alumni.title') : t('account.status.active.title')
  const description = data.status === 'FROZEN' ? t('account.status.frozen.description') : data.status === 'LEAVING' ? t('account.status.leaving.description') : data.status === 'ALUMNI' ? t('account.status.alumni.description') : t('account.status.active.description')
  const frozen = data.status === 'FROZEN'
  return <main className="min-h-screen bg-muted/20 p-6"><div className="mx-auto max-w-2xl"><Card><CardHeader><p className="text-sm font-semibold uppercase tracking-wide text-primary">{t('account.status.eyebrow')}</p><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-5"><p className="text-muted-foreground">{description}</p>{data.endsAt && <p className="text-sm">{t('account.status.endsAt')}: {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(data.endsAt)}</p>}{frozen ? <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4"><p className="text-sm">{t('account.status.frozen.appeal')}</p><Button asChild><a href="mailto:support@cofound.mg">{t('account.status.frozen.appealAction')}</a></Button></div> : <Button asChild variant="outline"><Link to="/feed">{t('account.status.continue')}</Link></Button>}</CardContent></Card></div></main>
}
