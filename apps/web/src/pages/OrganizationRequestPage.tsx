import { useState, type ChangeEvent, type FormEvent } from 'react'
import { AlertCircle, ArrowLeft, ArrowRight, Check, FileText, Info, Upload, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { organizationRequestResponseSchema, type OrganizationRequestInput } from '@cofound/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LogoSVG } from '@/components/ui/LogoSVG'
import { ApiClientError, apiClient } from '@/lib/api-client'
import { LanguageSwitcher, useI18n } from '@/i18n'

const ORGANIZATION_TYPES: OrganizationRequestInput['organizationType'][] = [
  'INSTITUTION',
  'INCUBATOR',
  'COMPANY',
  'NGO',
  'PUBLIC',
  'ASSOCIATION',
]
const ACCEPTED_DOCUMENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])
const MAX_DOCUMENT_SIZE = 10_000_000
const MAX_DOCUMENTS = 5

type RequestForm = Omit<OrganizationRequestInput, 'organizationType' | 'sectorsOfInterest' | 'supportingDocuments'> & {
  organizationType: OrganizationRequestInput['organizationType'] | ''
  sectorsOfInterest: string
}
type SelectedDocument = { file: File; fileName: string; contentType: string; sizeBytes: number }

const initialForm: RequestForm = {
  organizationType: '',
  organizationName: '',
  countryCode: 'MG',
  region: '',
  website: '',
  description: '',
  sectorsOfInterest: '',
  contactName: '',
  contactRole: '',
  contactEmail: '',
  contactPhone: '',
}

export default function OrganizationRequestPage() {
  const { t } = useI18n()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<RequestForm>(initialForm)
  const [documents, setDocuments] = useState<SelectedDocument[]>([])
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ requestId: string } | null>(null)

  const update = <K extends keyof RequestForm>(field: K, value: RequestForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError(null)
  }

  const stepLabel = t('organizationRequest.stepCounter').replace('{step}', String(step))
  const documentsLabel = t('organizationRequest.documents.filesSelected').replace('{count}', String(documents.length))

  const validateStep = (targetStep: number): boolean => {
    setError(null)
    if (targetStep === 1) {
      if (!form.organizationType || form.organizationName.trim().length < 2 || form.region.trim().length < 2 || form.description.trim().length < 20) {
        setError(t('organizationRequest.errors.invalidInput'))
        return false
      }
    }
    if (targetStep === 2) {
      if (form.contactName.trim().length < 2 || form.contactRole.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(form.contactEmail.trim())) {
        setError(t('organizationRequest.errors.invalidInput'))
        return false
      }
    }
    return true
  }

  const goNext = () => {
    if (validateStep(step)) setStep((current) => Math.min(current + 1, 3))
  }

  const handleDocuments = (event: ChangeEvent<HTMLInputElement>) => {
    setDocumentError(null)
    const files = Array.from(event.target.files ?? [])
    if (files.length > MAX_DOCUMENTS) {
      setDocumentError(t('organizationRequest.errors.documents'))
      return
    }
    const invalidFile = files.find((file) => !ACCEPTED_DOCUMENT_TYPES.has(file.type) || file.size > MAX_DOCUMENT_SIZE)
    if (invalidFile) {
      setDocumentError(t('organizationRequest.errors.documents'))
      return
    }
    setDocuments(files.map((file) => ({ file, fileName: file.name, contentType: file.type, sizeBytes: file.size })))
  }

  const removeDocument = (fileName: string) => setDocuments((current) => current.filter((document) => document.fileName !== fileName))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validateStep(1) || !validateStep(2)) {
      setStep(!form.organizationType || !form.organizationName || !form.region ? 1 : 2)
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const payload = new FormData()
      payload.set('organizationType', form.organizationType)
      payload.set('organizationName', form.organizationName)
      payload.set('countryCode', form.countryCode)
      payload.set('region', form.region)
      payload.set('website', form.website ?? '')
      payload.set('description', form.description)
      payload.set('sectorsOfInterest', JSON.stringify(form.sectorsOfInterest.split(',').map((sector) => sector.trim()).filter(Boolean)))
      payload.set('contactName', form.contactName)
      payload.set('contactRole', form.contactRole)
      payload.set('contactEmail', form.contactEmail)
      payload.set('contactPhone', form.contactPhone ?? '')
      documents.forEach((document) => payload.append('documents', document.file, document.fileName))
      const response = await apiClient.request('/organization-requests', { method: 'POST', body: payload }, organizationRequestResponseSchema)
      setSuccess({ requestId: response.requestId })
    } catch (caughtError) {
      if (caughtError instanceof ApiClientError && caughtError.status === 409) {
        setError(t('organizationRequest.errors.duplicate'))
      } else if (caughtError instanceof ApiClientError && caughtError.status === 400) {
        setError(t('organizationRequest.errors.invalidInput'))
      } else {
        setError(t('organizationRequest.errors.generic'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <section className="w-full rounded-3xl border border-border bg-background p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="h-8 w-8" aria-hidden="true" />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t('organizationRequest.success.title')}</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{t('organizationRequest.success.description')}</p>
            <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{t('organizationRequest.success.requestId')}</p>
              <p className="mt-2 font-mono text-lg font-semibold text-foreground">{success.requestId}</p>
            </div>
            <Button asChild className="mt-8 rounded-xl">
              <Link to="/">{t('organizationRequest.success.backHome')}</Link>
            </Button>
          </section>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 font-sans">
      <header className="border-b border-border/70 bg-background/90 px-4 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link to="/" aria-label="CoFound.mg"><LogoSVG className="h-9 w-auto" /></Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="hidden items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t('organizationRequest.backHome')}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-14">
        <aside className="space-y-6 lg:pt-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t('organizationRequest.eyebrow')}</p>
            <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t('organizationRequest.title')}</h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">{t('organizationRequest.subtitle')}</p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-foreground">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p>{t('organizationRequest.processingNote')}</p>
          </div>
                    <div className="hidden rounded-3xl bg-primary p-6 text-primary-foreground lg:block">
            <p className="font-heading text-lg font-semibold">CoFound.mg</p>
            <p className="mt-2 text-sm leading-6 text-primary-foreground/80">{t('organizationRequest.processingNote')}</p>
          </div>

        </aside>

        <section className="rounded-3xl border border-border bg-background p-5 shadow-sm sm:p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
              <span>{stepLabel}</span>
              <span>{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2" aria-label={stepLabel}>
              {[1, 2, 3].map((item) => (
                <div key={item} className={`h-1.5 rounded-full ${item <= step ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-medium text-muted-foreground">
              <span>{t('organizationRequest.step.organization')}</span>
              <span className="text-center">{t('organizationRequest.step.contact')}</span>
              <span className="text-right">{t('organizationRequest.step.documents')}</span>
            </div>
          </div>

          {error && (
            <div role="alert" className="mb-6 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {step === 1 && (
              <div className="space-y-6">
                <div><h2 className="font-heading text-xl font-semibold text-foreground">{t('organizationRequest.organization.title')}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t('organizationRequest.organization.description')}</p></div>
                <div className="space-y-2">
                  <Label htmlFor="organization-type">{t('organizationRequest.organization.type')}</Label>
                  <select id="organization-type" value={form.organizationType} onChange={(event) => update('organizationType', event.target.value as RequestForm['organizationType'])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50" required>
                    <option value="">{t('organizationRequest.organization.typePlaceholder')}</option>
                    {ORGANIZATION_TYPES.map((type) => <option key={type} value={type}>{t(`organizationRequest.organization.type.${type.toLowerCase()}` as never)}</option>)}
                  </select>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="organization-name">{t('organizationRequest.organization.name')}</Label><Input id="organization-name" value={form.organizationName} onChange={(event) => update('organizationName', event.target.value)} placeholder={t('organizationRequest.organization.namePlaceholder')} required /></div>
                  <div className="space-y-2"><Label htmlFor="organization-country">{t('organizationRequest.organization.country')}</Label><Input id="organization-country" value={form.countryCode} onChange={(event) => update('countryCode', event.target.value.toUpperCase().slice(0, 2))} maxLength={2} required /></div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="organization-region">{t('organizationRequest.organization.region')}</Label><Input id="organization-region" value={form.region} onChange={(event) => update('region', event.target.value)} placeholder={t('organizationRequest.organization.regionPlaceholder')} required /></div>
                  <div className="space-y-2"><Label htmlFor="organization-website">{t('organizationRequest.organization.website')}</Label><Input id="organization-website" type="url" value={form.website} onChange={(event) => update('website', event.target.value)} placeholder={t('organizationRequest.organization.websitePlaceholder')} /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="organization-description">{t('organizationRequest.organization.descriptionLabel')}</Label><Textarea id="organization-description" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder={t('organizationRequest.organization.descriptionPlaceholder')} rows={5} required /></div>
                <div className="space-y-2"><Label htmlFor="organization-sectors">{t('organizationRequest.organization.sectors')}</Label><Input id="organization-sectors" value={form.sectorsOfInterest} onChange={(event) => update('sectorsOfInterest', event.target.value)} placeholder={t('organizationRequest.organization.sectorsPlaceholder')} /></div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div><h2 className="font-heading text-xl font-semibold text-foreground">{t('organizationRequest.contact.title')}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t('organizationRequest.contact.description')}</p></div>
                <div className="space-y-2"><Label htmlFor="contact-name">{t('organizationRequest.contact.name')}</Label><Input id="contact-name" autoComplete="name" value={form.contactName} onChange={(event) => update('contactName', event.target.value)} placeholder={t('organizationRequest.contact.namePlaceholder')} required /></div>
                <div className="space-y-2"><Label htmlFor="contact-role">{t('organizationRequest.contact.role')}</Label><Input id="contact-role" value={form.contactRole} onChange={(event) => update('contactRole', event.target.value)} placeholder={t('organizationRequest.contact.rolePlaceholder')} required /></div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="contact-email">{t('organizationRequest.contact.email')}</Label><Input id="contact-email" type="email" autoComplete="email" value={form.contactEmail} onChange={(event) => update('contactEmail', event.target.value)} placeholder={t('organizationRequest.contact.emailPlaceholder')} required /></div>
                  <div className="space-y-2"><Label htmlFor="contact-phone">{t('organizationRequest.contact.phone')}</Label><Input id="contact-phone" type="tel" autoComplete="tel" value={form.contactPhone} onChange={(event) => update('contactPhone', event.target.value)} placeholder={t('organizationRequest.contact.phonePlaceholder')} /></div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div><h2 className="font-heading text-xl font-semibold text-foreground">{t('organizationRequest.documents.title')}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t('organizationRequest.documents.description')}</p></div>
                <div className="space-y-3">
                  <Label htmlFor="supporting-documents">{t('organizationRequest.documents.label')}</Label>
                  <label htmlFor="supporting-documents" className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5">
                    <Upload className="h-6 w-6 text-primary" aria-hidden="true" />
                    <span className="mt-3 text-sm font-semibold text-foreground">{t('organizationRequest.documents.label')}</span>
                    <span className="mt-1 text-xs text-muted-foreground">{t('organizationRequest.documents.hint')}</span>
                    <input id="supporting-documents" type="file" multiple accept=".pdf,.doc,.docx,image/*" onChange={handleDocuments} className="sr-only" />
                  </label>
                  {documentError && <p role="alert" className="text-sm text-destructive">{documentError}</p>}
                  {documents.length > 0 && <div className="space-y-2"><p className="text-xs font-semibold text-muted-foreground">{documentsLabel}</p>{documents.map((document) => <div key={document.fileName} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5"><FileText className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span className="min-w-0 flex-1 truncate text-sm text-foreground">{document.fileName}</span><button type="button" onClick={() => removeDocument(document.fileName)} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={document.fileName}><X className="h-4 w-4" aria-hidden="true" /></button></div>)}</div>}
                </div>
                <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-foreground"><p>{t('organizationRequest.documents.disclaimer')}</p></div>
                <div className="rounded-2xl border border-border p-4 text-sm"><h3 className="font-semibold text-foreground">{t('organizationRequest.summary.title')}</h3><dl className="mt-3 space-y-2 text-muted-foreground"><div className="flex justify-between gap-4"><dt>{t('organizationRequest.summary.organization')}</dt><dd className="text-right font-medium text-foreground">{form.organizationName}</dd></div><div className="flex justify-between gap-4"><dt>{t('organizationRequest.summary.contact')}</dt><dd className="text-right font-medium text-foreground">{form.contactEmail}</dd></div><div className="flex justify-between gap-4"><dt>{t('organizationRequest.summary.documents')}</dt><dd className="text-right font-medium text-foreground">{documents.length > 0 ? documentsLabel : t('organizationRequest.summary.none')}</dd></div></dl></div>
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-border/70 pt-6 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setStep((current) => Math.max(current - 1, 1))} disabled={step === 1 || isSubmitting} className="rounded-xl"><ArrowLeft className="h-4 w-4" aria-hidden="true" />{t('organizationRequest.previous')}</Button>
              {step < 3 ? <Button type="button" onClick={goNext} className="rounded-xl">{t('organizationRequest.next')}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button> : <Button type="submit" disabled={isSubmitting} className="rounded-xl">{isSubmitting ? t('organizationRequest.submitting') : t('organizationRequest.submit')}</Button>}
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
