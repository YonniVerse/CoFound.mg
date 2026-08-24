import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, Check, ChevronRight, ExternalLink, FileText, Loader2, ShieldCheck, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { organizationRequestDocumentUrlSchema, type OrganizationRequestQueueItem, organizationRequestQueueSchema } from '@cofound/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { apiClient, ApiClientError } from '@/lib/api-client'
import { useI18n } from '@/i18n'

const statuses = ['PENDING', 'APPROVED', 'REJECTED'] as const
type RequestStatus = (typeof statuses)[number]
const mvpCapabilities = [
  { name: 'CERTIFY_AFFILIATION', label: 'staff.organizations.certify' },
  { name: 'PUBLISH_OPPORTUNITY', label: 'staff.organizations.publish' },
  { name: 'RECRUIT', label: 'staff.organizations.recruit' },
] as const
const v2Capabilities = ['MENTOR', 'FUND', 'SURVEY', 'ANALYTICS'] as const

export default function StaffOrganizationsPage() {
  const { t } = useI18n()
  const [status, setStatus] = useState<RequestStatus>('PENDING')
  const [items, setItems] = useState<OrganizationRequestQueueItem[]>([])
  const [selected, setSelected] = useState<OrganizationRequestQueueItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [granted, setGranted] = useState<string[]>([])
  const [openingDocument, setOpeningDocument] = useState<number | null>(null)

  const selectRequest = (item: OrganizationRequestQueueItem | null) => {
    setSelected(item)
    setGranted(item?.capabilities ?? [])
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await apiClient.get(`/staff/organization-requests?status=${status}&limit=50`, organizationRequestQueueSchema)
      setItems(result.items)
      const nextSelected = result.items[0] ?? null
      setSelected(nextSelected)
      setGranted(nextSelected?.capabilities ?? [])
    } catch {
      setMessage(t('staff.organizations.error'))
    } finally {
      setLoading(false)
    }
  }, [status, t])

  useEffect(() => { void Promise.resolve().then(load) }, [load])

  const decide = async (action: 'approve' | 'reject') => {
    if (!selected) return
    if (action === 'reject' && rejectReason.trim().length < 5) {
      setMessage(t('organizationRequest.errors.rejectionReason'))
      return
    }
    setBusy(true)
    setMessage(null)
    try {
      if (action === 'approve') await apiClient.post(`/staff/organization-requests/${selected.id}/approve`, {})
      else await apiClient.post(`/staff/organization-requests/${selected.id}/reject`, { reason: rejectReason })
      setMessage(t('staff.organizations.success'))
      setRejectReason('')
      await load()
    } catch (error) {
      setMessage(error instanceof ApiClientError && error.status === 409 ? t('organizationRequest.errors.alreadyDecided') : t('staff.organizations.error'))
    } finally {
      setBusy(false)
    }
  }

  const toggleCapability = async (capability: string) => {
    if (!selected?.approvedOrganizationId) return
    setBusy(true)
    setMessage(null)
    try {
      if (granted.includes(capability)) {
        await apiClient.delete(`/organizations/${selected.approvedOrganizationId}/capabilities/${capability}`)
        setGranted((current) => current.filter((item) => item !== capability))
      } else {
        await apiClient.post(`/organizations/${selected.approvedOrganizationId}/capabilities`, { capability })
        setGranted((current) => [...current, capability])
      }
      setMessage(t('staff.organizations.success'))
    } catch (error) {
      setMessage(error instanceof ApiClientError && error.status === 400 ? t('organizationRequest.errors.certificationOnlyInstitution') : t('staff.organizations.capabilityError'))
    } finally {
      setBusy(false)
    }
  }

  const openDocument = async (index: number) => {
    if (!selected) return
    setOpeningDocument(index)
    setMessage(null)
    try {
      const result = await apiClient.get(`/staff/organization-requests/${selected.id}/documents/${index}`, organizationRequestDocumentUrlSchema)
      window.open(result.url, '_blank', 'noopener,noreferrer')
    } catch {
      setMessage(t('staff.organizations.documentError'))
    } finally {
      setOpeningDocument(null)
    }
  }

  const typeLabel = (type: string) => t(`organizationRequest.organization.type.${type.toLowerCase()}` as never)
  const statusLabel = (value: RequestStatus) => t(`staff.organizations.${value.toLowerCase()}` as never)

  return <DashboardLayout>
    <main className="min-h-screen bg-muted/20 p-6 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link to="/feed" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 h-4 w-4" />{t('staff.organizations.back')}</Link>
        <header><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{t('staff.organizations.eyebrow')}</p><h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground"><ShieldCheck className="h-7 w-7 text-primary" />{t('staff.organizations.title')}</h1><p className="mt-2 max-w-2xl text-muted-foreground">{t('staff.organizations.subtitle')}</p></header>
        {message && <div role="status" className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-foreground"><AlertCircle className="h-4 w-4 text-primary" />{message}</div>}
        <div className="flex flex-wrap gap-2">
          {statuses.map((value) => <Button key={value} size="sm" variant={status === value ? 'default' : 'outline'} onClick={() => setStatus(value)}>{statusLabel(value)}</Button>)}
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card><CardHeader><CardTitle>{t('staff.organizations.status')} · {statusLabel(status)}</CardTitle></CardHeader><CardContent className="p-0">
            {loading ? <div className="flex justify-center p-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div> : items.length === 0 ? <p className="p-10 text-center text-sm text-muted-foreground">{t('staff.organizations.empty')}</p> : <div className="divide-y">{items.map((item) => <button key={item.id} type="button" onClick={() => selectRequest(item)} className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/40 ${selected?.id === item.id ? 'bg-primary/5' : ''}`}><div className="min-w-0 flex-1"><p className="truncate font-semibold text-foreground">{item.organizationName}</p><p className="mt-1 text-xs text-muted-foreground">{typeLabel(item.organizationType)} · {item.countryCode} · {item.region}</p><p className="mt-2 text-xs text-muted-foreground">{item.contactEmail} · {new Date(item.createdAt).toLocaleDateString()}</p></div><ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" /></button>)}</div>}
          </CardContent></Card>

          {selected ? <Card><CardHeader><CardTitle>{t('staff.organizations.details')}</CardTitle></CardHeader><CardContent className="space-y-6">
            <div><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-semibold text-foreground">{selected.organizationName}</h2><p className="mt-1 text-sm text-muted-foreground">{typeLabel(selected.organizationType)} · {selected.region}, {selected.countryCode}</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{statusLabel(selected.status)}</span></div><p className="mt-4 text-sm leading-6 text-foreground">{selected.description}</p></div>
            <dl className="grid gap-3 rounded-2xl border border-border bg-muted/20 p-4 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">{t('staff.organizations.contact')}</dt><dd className="mt-1 font-medium text-foreground">{selected.contactName} · {selected.contactRole}<br />{selected.contactEmail}{selected.contactPhone ? ` · ${selected.contactPhone}` : ''}</dd></div><div><dt className="text-muted-foreground">{t('staff.organizations.documents')}</dt><dd className="mt-1 font-medium text-foreground">{selected.supportingDocuments.length}</dd></div></dl>
            {selected.supportingDocuments.length > 0 && <div className="space-y-2">{selected.supportingDocuments.map((document, index) => <div key={document.fileName} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm"><FileText className="h-4 w-4 text-primary" /> <span className="truncate">{document.fileName}</span><span className="ml-auto text-xs text-muted-foreground">{Math.round(document.sizeBytes / 1024)} Ko</span><Button type="button" size="sm" variant="outline" onClick={() => void openDocument(index)} disabled={openingDocument !== null}><ExternalLink className="mr-1 h-3.5 w-3.5" />{openingDocument === index ? '…' : t('staff.organizations.openDocument')}</Button></div>)}</div>}
            {selected.status === 'PENDING' && <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row"><Button onClick={() => void decide('approve')} disabled={busy}><Check className="mr-2 h-4 w-4" />{t('staff.organizations.approve')}</Button><div className="flex flex-1 gap-2"><Textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder={t('staff.organizations.rejectReasonPlaceholder')} rows={2} /><Button variant="destructive" onClick={() => void decide('reject')} disabled={busy || rejectReason.trim().length < 5}><X className="mr-2 h-4 w-4" />{t('staff.organizations.confirmReject')}</Button></div></div>}
            {selected.status === 'APPROVED' && selected.approvedOrganizationId && <div className="space-y-4 border-t border-border pt-5"><div><h3 className="font-semibold text-foreground">{t('staff.organizations.capabilities')}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{t('staff.organizations.capabilitiesHint')}</p></div><div className="space-y-2">{mvpCapabilities.map((capability) => <div key={capability.name} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"><span className="text-sm font-medium text-foreground">{t(capability.label as never)}</span><Button size="sm" variant={granted.includes(capability.name) ? 'outline' : 'default'} onClick={() => void toggleCapability(capability.name)} disabled={busy || (capability.name === 'CERTIFY_AFFILIATION' && selected.organizationType !== 'INSTITUTION')}>{granted.includes(capability.name) ? t('staff.organizations.revoke') : t('staff.organizations.grant')}</Button></div>)}{v2Capabilities.map((capability) => <div key={capability} className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border p-3 opacity-60"><span className="text-sm font-medium text-foreground">{capability}</span><span className="text-xs text-muted-foreground">{t('staff.organizations.mvpOnly')}</span></div>)}</div></div>}
          </CardContent></Card> : <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">{t('staff.organizations.empty')}</CardContent></Card>}
        </div>
      </div>
    </main>
  </DashboardLayout>
}
