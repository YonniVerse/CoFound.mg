import { useEffect, useState } from 'react'
import { ArrowLeft, BadgeCheck, Loader2, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { organizationProfileSchema } from '@cofound/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import { useI18n } from '@/i18n'

export default function OrganizationProfilePage() {
  const { organizationId = '' } = useParams()
  const { t } = useI18n()
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof apiClient.get>> extends never ? never : { id: string; name: string; type: string; countryCode: string; logoKey: string | null; description: string | null; capabilities: string[] } | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { void Promise.resolve().then(async () => { try { setProfile(await apiClient.get(`/organizations/${organizationId}/profile`, organizationProfileSchema)) } finally { setLoading(false) } }) }, [organizationId])

  return <DashboardLayout><main className="min-h-screen bg-muted/20 p-6 lg:p-10"><div className="mx-auto max-w-4xl space-y-6">
    <Link to={`/organizations/${organizationId}/projects`} className="inline-flex items-center text-sm text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" />{t('partner.profile.back')}</Link>
    {loading ? <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : profile ? <Card><CardHeader><div className="flex flex-wrap items-start gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck className="h-8 w-8" /></div><div><div className="flex items-center gap-2"><CardTitle className="text-2xl">{profile.name}</CardTitle><BadgeCheck className="h-5 w-5 text-primary" /></div><p className="mt-1 text-sm text-muted-foreground">{profile.type} · {profile.countryCode}</p></div></div></CardHeader><CardContent className="space-y-5"><p className="leading-7 text-foreground">{profile.description}</p><div className="flex flex-wrap gap-2">{profile.capabilities.map((capability) => <span key={capability} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{capability}</span>)}</div></CardContent></Card> : <Card><CardContent className="p-12 text-center text-muted-foreground">{t('partner.projects.error')}</CardContent></Card>}
  </div></main></DashboardLayout>
}
