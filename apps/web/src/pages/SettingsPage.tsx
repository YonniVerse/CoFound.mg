import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/i18n'
import { apiClient } from '@/lib/api-client'
import { consentRecordSchema, consentRegistrySchema, type ConsentPurpose, type ConsentRecord } from '@cofound/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { LanguageSwitcher } from '@/i18n'

const PURPOSES: Array<{ purpose: ConsentPurpose; version: string; titleKey: 'settings.consent.profile' | 'settings.consent.matching' | 'settings.consent.contact' | 'settings.consent.analytics' }> = [
  { purpose: 'PROFILE_VISIBILITY', version: 'v1', titleKey: 'settings.consent.profile' },
  { purpose: 'TALENT_MATCHING', version: 'v1', titleKey: 'settings.consent.matching' },
  { purpose: 'PARTNER_CONTACT', version: 'v1', titleKey: 'settings.consent.contact' },
  { purpose: 'AGGREGATED_ANALYTICS', version: 'v1', titleKey: 'settings.consent.analytics' },
]

export default function SettingsPage() {
  const { t } = useI18n()
  const [consents, setConsents] = useState<ConsentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<ConsentPurpose | null>(null)
  const [error, setError] = useState(false)

  const active = useMemo(() => new Set(consents.filter((consent) => consent.active).map((consent) => consent.purpose)), [consents])

  useEffect(() => {
    let mounted = true
    void apiClient.get('/me/consents', consentRegistrySchema)
      .then((payload) => { if (mounted) setConsents(payload.consents) })
      .catch(() => { if (mounted) setError(true) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  async function toggle(purpose: ConsentPurpose, checked: boolean) {
    setPending(purpose)
    setError(false)
    try {
      if (checked) {
        const result = await apiClient.post(`/me/consents/${purpose}`, { policyVersion: 'v1' }, consentRecordSchema)
        setConsents((current) => [result, ...current.filter((consent) => consent.purpose !== purpose || !consent.active)])
      } else {
        if (!window.confirm(t('settings.consent.withdrawConfirm'))) return
        const result = await apiClient.request(`/me/consents/${purpose}`, { method: 'DELETE', body: JSON.stringify({ confirm: true }) }) as ConsentRecord
        setConsents((current) => current.map((consent) => consent.id === result.id ? result : consent))
      }
    } catch {
      setError(true)
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div><p className="text-sm font-semibold text-primary">{t('settings.eyebrow')}</p><h1 className="mt-1 text-3xl font-black">{t('settings.title')}</h1><p className="mt-2 text-muted-foreground">{t('settings.subtitle')}</p></div>
          <LanguageSwitcher />
        </header>
        <Card>
          <CardHeader><CardTitle>{t('settings.privacy.title')}</CardTitle><p className="text-sm text-muted-foreground">{t('settings.privacy.description')}</p></CardHeader>
          <CardContent className="space-y-4">
            {loading && <p className="text-sm text-muted-foreground" role="status">{t('settings.loading')}</p>}
            {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">{t('settings.error')}</p>}
            {!loading && PURPOSES.map(({ purpose, titleKey }) => {
              const record = consents.find((consent) => consent.purpose === purpose && consent.active)
              return <div key={purpose} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div><p className="font-semibold">{t(titleKey)}</p><p className="text-sm text-muted-foreground">{record ? `${t('settings.version')} ${record.policyVersion} · ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(record.grantedAt)}` : t('settings.notGranted')}</p></div>
                <Switch checked={active.has(purpose)} disabled={pending === purpose} onCheckedChange={(checked) => void toggle(purpose, checked)} aria-label={t(titleKey)} />
              </div>
            })}
            <p className="border-t pt-4 text-sm text-muted-foreground">{t('settings.privacy.withdrawExplanation')}</p>
            <Button variant="outline" asChild><a href="/onboarding">{t('settings.backProfile')}</a></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
