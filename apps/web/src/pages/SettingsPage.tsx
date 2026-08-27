import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Download, ShieldCheck } from 'lucide-react'
import { useI18n, LanguageSwitcher } from '@/i18n'
import { apiClient } from '@/lib/api-client'
import { consentRecordSchema, consentRegistrySchema, personalDataExportRequestSchema, personalDataExportResponseSchema, type ConsentPurpose, type ConsentRecord } from '@cofound/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

const PURPOSES: Array<{ purpose: ConsentPurpose; titleKey: 'settings.consent.profile' | 'settings.consent.matching' | 'settings.consent.contact' | 'settings.consent.analytics' }> = [
  { purpose: 'PROFILE_VISIBILITY', titleKey: 'settings.consent.profile' },
  { purpose: 'TALENT_MATCHING', titleKey: 'settings.consent.matching' },
  { purpose: 'PARTNER_CONTACT', titleKey: 'settings.consent.contact' },
  { purpose: 'AGGREGATED_ANALYTICS', titleKey: 'settings.consent.analytics' },
]

export default function SettingsPage() {
  const { t } = useI18n()
  const [consents, setConsents] = useState<ConsentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<ConsentPurpose | null>(null)
  const [error, setError] = useState(false)
  const [personalExport, setPersonalExport] = useState<{ id: string; status: string; requestedAt: Date; completedAt: Date | null; expiresAt: Date | null; downloadAvailable: boolean } | null>(null)
  const [exportPending, setExportPending] = useState(false)

  const active = useMemo(() => new Set(consents.filter((consent) => consent.active).map((consent) => consent.purpose)), [consents])

  useEffect(() => {
    let mounted = true
    void apiClient.get('/me/consents', consentRegistrySchema)
      .then((payload) => { if (mounted) setConsents(payload.consents) })
      .catch(() => { if (mounted) setError(true) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  async function requestPersonalExport() {
    setExportPending(true)
    setError(false)
    try {
      const result = await apiClient.post('/me/privacy/exports', personalDataExportRequestSchema.parse({ confirmation: true }), personalDataExportResponseSchema)
      setPersonalExport(result.export)
    } catch { setError(true) } finally { setExportPending(false) }
  }

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
    } catch { setError(true) } finally { setPending(null) }
  }

  return (
    <main className="min-h-screen bg-muted/20 px-4 pb-10 pt-12 sm:px-8 sm:pt-14 lg:px-10 lg:pb-12 lg:pt-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
            <a href="/feed"><ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />Retour au Feed</a>
          </Button>
          <LanguageSwitcher />
        </div>

        <header className="flex flex-col gap-5 border-b border-border/60 pb-7 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t('settings.eyebrow')}</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">{t('settings.title')}</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">{t('settings.subtitle')}</p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <Card className="overflow-hidden rounded-2xl border-border/70 shadow-2xs">
            <CardHeader className="border-b border-border/60 px-5 py-5 sm:px-6">
              <CardTitle className="text-base font-bold tracking-tight">{t('settings.privacy.title')}</CardTitle>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t('settings.privacy.description')}</p>
            </CardHeader>
            <CardContent className="space-y-3 px-5 py-5 sm:px-6">
              {loading && <p className="text-sm text-muted-foreground" role="status">{t('settings.loading')}</p>}
              {error && <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{t('settings.error')}</p>}
              {!loading && PURPOSES.map(({ purpose, titleKey }) => {
                const record = consents.find((consent) => consent.purpose === purpose && consent.active)
                return (
                  <div key={purpose} className="flex min-h-0 items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 px-3.5 py-3 transition-colors hover:border-primary/25 sm:px-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug text-foreground sm:text-base">{t(titleKey)}</p>
                      <p className="mt-1 text-xs leading-snug text-muted-foreground">{record ? `${t('settings.version')} ${record.policyVersion} · ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(record.grantedAt)}` : t('settings.notGranted')}</p>
                    </div>
                    <Switch className="shrink-0" checked={active.has(purpose)} disabled={pending === purpose} onCheckedChange={(checked) => void toggle(purpose, checked)} aria-label={t(titleKey)} />
                  </div>
                )
              })}
              <p className="border-t border-border/60 pt-4 text-sm leading-relaxed text-muted-foreground">{t('settings.privacy.withdrawExplanation')}</p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-2xl border-border/70 shadow-2xs">
              <CardHeader className="px-5 py-5">
                <CardTitle className="text-base font-bold tracking-tight">{t('settings.export.title')}</CardTitle>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t('settings.export.description')}</p>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <Button className="w-full justify-center" variant="outline" disabled={exportPending} onClick={() => void requestPersonalExport()}>
                  <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                  {exportPending ? t('settings.export.pending') : t('settings.export.request')}
                </Button>
                {personalExport && <p className="mt-3 rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground" role="status">{t('settings.export.status')}: {personalExport.status}</p>}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70 bg-primary/[0.03] shadow-2xs">
              <CardContent className="p-4 sm:p-5">
                <p className="text-sm font-semibold leading-snug text-foreground">{t('settings.backProfile')}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Complète ou mets à jour les informations de ton profil.</p>
                <Button className="mt-3 h-9 w-full justify-center text-sm" asChild>
                  <a href="/onboarding">Accéder au profil <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" /></a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
