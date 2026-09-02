import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  ChevronRight,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  UserCheck,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  adminCreateOrganizationSchema,
  organizationRequestDocumentUrlSchema,
  type AdminCreateOrganizationInput,
  type AdminOrganizationItem,
  type OrganizationRequestQueueItem,
  organizationRequestQueueSchema,
} from '@cofound/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { apiClient, ApiClientError } from '@/lib/api-client'
import { useI18n } from '@/i18n'

const statuses = ['PENDING', 'APPROVED', 'REJECTED'] as const
type RequestStatus = (typeof statuses)[number]
type MainTab = 'directory' | 'requests'

const ALL_CAPABILITIES = [
  { name: 'CERTIFY_AFFILIATION', label: 'Certifier les affiliations (Établissements)' },
  { name: 'PUBLISH_OPPORTUNITY', label: 'Publier des opportunités & concours' },
  { name: 'RECRUIT', label: 'Recruter des talents' },
  { name: 'MENTOR', label: 'Accompagner / Mentorat (v2)' },
  { name: 'FUND', label: 'Financer des projets (v2)' },
  { name: 'SURVEY', label: 'Sonder les porteurs (v2)' },
  { name: 'ANALYTICS', label: 'Statistiques avancées (v2)' },
] as const

const mvpCapabilities = [
  { name: 'CERTIFY_AFFILIATION', label: 'staff.organizations.certify' },
  { name: 'PUBLISH_OPPORTUNITY', label: 'staff.organizations.publish' },
  { name: 'RECRUIT', label: 'staff.organizations.recruit' },
] as const
const v2Capabilities = ['MENTOR', 'FUND', 'SURVEY', 'ANALYTICS'] as const

export default function StaffOrganizationsPage() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<MainTab>('directory')

  // Requests Queue State
  const [status, setStatus] = useState<RequestStatus>('PENDING')
  const [items, setItems] = useState<OrganizationRequestQueueItem[]>([])
  const [selected, setSelected] = useState<OrganizationRequestQueueItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [granted, setGranted] = useState<string[]>([])
  const [openingDocument, setOpeningDocument] = useState<number | null>(null)

  // Direct Organizations Directory State
  const [orgs, setOrgs] = useState<AdminOrganizationItem[]>([])
  const [orgsLoading, setOrgsLoading] = useState(true)
  const [orgSearch, setOrgSearch] = useState('')
  const [orgTypeFilter, setOrgTypeFilter] = useState('ALL')
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [orgDetail, setOrgDetail] = useState<any | null>(null)
  const [orgDetailLoading, setOrgDetailLoading] = useState(false)

  // Provisioning Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState('INSTITUTION')
  const [formCountry, setFormCountry] = useState('MG')
  const [formRegion, setFormRegion] = useState('Analamanga')
  const [formDescription, setFormDescription] = useState('')
  const [formAdminEmail, setFormAdminEmail] = useState('')
  const [formAdminFirstName, setFormAdminFirstName] = useState('')
  const [formAdminLastName, setFormAdminLastName] = useState('')
  const [formCaps, setFormCaps] = useState<string[]>(['CERTIFY_AFFILIATION', 'PUBLISH_OPPORTUNITY', 'RECRUIT'])

  const selectRequest = (item: OrganizationRequestQueueItem | null) => {
    setSelected(item)
    setGranted(item?.capabilities ?? [])
  }

  const loadRequests = useCallback(async () => {
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

  const loadOrganizations = useCallback(async () => {
    setOrgsLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (orgTypeFilter !== 'ALL') queryParams.set('type', orgTypeFilter)
      if (orgSearch.trim()) queryParams.set('search', orgSearch.trim())
      const res = await apiClient.get<{ items: AdminOrganizationItem[]; total: number }>(
        `/staff/organizations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      )
      setOrgs(res.items)
      if (res.items.length > 0 && !selectedOrgId) {
        setSelectedOrgId(res.items[0]!.id)
      }
    } catch {
      // fallback
    } finally {
      setOrgsLoading(false)
    }
  }, [orgTypeFilter, orgSearch, selectedOrgId])

  const loadOrgDetail = useCallback(async (orgId: string) => {
    setOrgDetailLoading(true)
    try {
      const detail = await apiClient.get(`/staff/organizations/${orgId}`)
      setOrgDetail(detail)
    } catch {
      setOrgDetail(null)
    } finally {
      setOrgDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'requests') void loadRequests()
    if (activeTab === 'directory') void loadOrganizations()
  }, [activeTab, loadRequests, loadOrganizations])

  useEffect(() => {
    if (selectedOrgId && activeTab === 'directory') {
      void loadOrgDetail(selectedOrgId)
    }
  }, [selectedOrgId, activeTab, loadOrgDetail])

  // Direct Provisioning Handler
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    const input: AdminCreateOrganizationInput = {
      name: formName.trim(),
      type: formType as any,
      countryCode: formCountry.trim().toUpperCase(),
      region: formRegion.trim(),
      description: formDescription.trim() || null,
      adminEmail: formAdminEmail.trim().toLowerCase(),
      adminFirstName: formAdminFirstName.trim(),
      adminLastName: formAdminLastName.trim(),
      capabilities: formCaps as any,
    }

    const parsed = adminCreateOrganizationSchema.safeParse(input)
    if (!parsed.success) {
      setMessage('Veuillez vérifier les informations saisies.')
      return
    }

    setBusy(true)
    setMessage(null)
    try {
      await apiClient.post('/staff/organizations', parsed.data)
      setMessage('Organisation provisionnée et email d’activation envoyé avec succès.')
      setIsCreateOpen(false)
      resetProvisioningForm()
      await loadOrganizations()
    } catch (err: any) {
      setMessage(err?.message || 'Erreur lors du provisionnement.')
    } finally {
      setBusy(false)
    }
  }

  const resetProvisioningForm = () => {
    setFormName('')
    setFormType('INSTITUTION')
    setFormCountry('MG')
    setFormRegion('Analamanga')
    setFormDescription('')
    setFormAdminEmail('')
    setFormAdminFirstName('')
    setFormAdminLastName('')
    setFormCaps(['CERTIFY_AFFILIATION', 'PUBLISH_OPPORTUNITY', 'RECRUIT'])
  }

  const toggleFormCap = (cap: string) => {
    setFormCaps((prev) => (prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]))
  }

  const handleToggleSuspend = async (orgId: string) => {
    if (!window.confirm('Confirmer le changement de statut de cette organisation ?')) return
    setBusy(true)
    try {
      await apiClient.post(`/staff/organizations/${orgId}/suspend`, { reason: 'Action administrative Staff' })
      setMessage('Statut de l’organisation mis à jour.')
      await loadOrganizations()
      if (selectedOrgId) await loadOrgDetail(selectedOrgId)
    } catch {
      setMessage('Erreur lors de la mise à jour du statut.')
    } finally {
      setBusy(false)
    }
  }

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
      await loadRequests()
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

  const typeLabel = (type: string) => t(`organizationRequest.organization.type.${type?.toLowerCase()}` as never)
  const statusLabel = (value: RequestStatus) => t(`staff.organizations.${value?.toLowerCase()}` as never)

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 p-6 lg:p-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <Link to="/feed" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('staff.organizations.back')}
          </Link>

          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Administration Staff</p>
              <h1 className="mt-1 flex items-center gap-3 font-heading text-3xl font-bold tracking-tight text-foreground">
                <Building2 className="h-8 w-8 text-primary" />
                Établissements & Organisations
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Provisionnez, configurez les droits et supervisez les établissements et partenaires de l'écosystème.
              </p>
            </div>

            <Button
              onClick={() => {
                resetProvisioningForm()
                setIsCreateOpen(true)
              }}
              className="h-10 gap-2 rounded-lg px-4 text-xs font-semibold shadow-2xs"
            >
              <Plus className="h-4 w-4" />
              Créer une organisation
            </Button>
          </header>

          {message && (
            <div role="status" className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-sm text-foreground">
              <AlertCircle className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1">{message}</div>
              <button type="button" onClick={() => setMessage(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Nav Tabs */}
          <div className="flex border-b border-border/80">
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'directory'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Annuaire des organisations ({orgs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'requests'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Demandes d'adhésion en attente ({items.length})
            </button>
          </div>

          {activeTab === 'directory' ? (
            /* DIRECTORY VIEW */
            <div className="space-y-6">
              {/* Search & Filters */}
              <Card className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      value={orgSearch}
                      onChange={(e) => setOrgSearch(e.target.value)}
                      placeholder="Rechercher une organisation..."
                      className="h-9 max-w-sm rounded-lg border border-border/80 bg-background text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">Type :</span>
                    <select
                      value={orgTypeFilter}
                      onChange={(e) => setOrgTypeFilter(e.target.value)}
                      className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-semibold"
                    >
                      <option value="ALL">Tous types</option>
                      <option value="INSTITUTION">Établissement académique</option>
                      <option value="INCUBATOR">Incubateur / Accélérateur</option>
                      <option value="COMPANY">Entreprise partenaire</option>
                      <option value="NGO">ONG / Programme bailleur</option>
                      <option value="PUBLIC">Secteur Public</option>
                      <option value="ASSOCIATION">Association</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Master / Detail Grid */}
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                {/* Org List */}
                <Card className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
                  <CardHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
                    <CardTitle className="text-base font-bold text-foreground">
                      Organisations répertoriées
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {orgsLoading ? (
                      <div className="flex justify-center p-10 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : orgs.length === 0 ? (
                      <p className="p-10 text-center text-sm text-muted-foreground">
                        Aucune organisation trouvée.
                      </p>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {orgs.map((org) => {
                          const isSelected = selectedOrgId === org.id
                          const isSuspended = org.verificationStatus === 'SUSPENDED'

                          return (
                            <button
                              key={org.id}
                              type="button"
                              onClick={() => setSelectedOrgId(org.id)}
                              className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/40 ${
                                isSelected ? 'bg-primary/5' : ''
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="truncate font-semibold text-foreground text-sm">
                                    {org.name}
                                  </p>
                                  {isSuspended && (
                                    <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive border border-destructive/20">
                                      Suspendue
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {typeLabel(org.type)} · {org.countryCode}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                                  <span>{org.affiliationsCount} affiliés</span>
                                  <span>·</span>
                                  <span>{org.membersCount} cadres</span>
                                  <span>·</span>
                                  <span>{org.importBatchesCount} imports</span>
                                </div>
                              </div>
                              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Org Detail Drawer / Card */}
                {orgDetailLoading ? (
                  <Card className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                    Chargement de la fiche organisation…
                  </Card>
                ) : orgDetail ? (
                  <Card className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-6">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-foreground font-heading">
                            {orgDetail.name}
                          </h2>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                              orgDetail.verificationStatus === 'VERIFIED'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-destructive/10 text-destructive border-destructive/20'
                            }`}
                          >
                            {orgDetail.verificationStatus === 'VERIFIED' ? 'Active' : 'Suspendue'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {typeLabel(orgDetail.type)} · {orgDetail.countryCode} · Créée le {new Date(orgDetail.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant={orgDetail.verificationStatus === 'SUSPENDED' ? 'default' : 'destructive'}
                        onClick={() => void handleToggleSuspend(orgDetail.id)}
                        disabled={busy}
                        className="h-8 text-xs font-semibold"
                      >
                        {orgDetail.verificationStatus === 'SUSPENDED' ? 'Réactiver l’organisation' : 'Suspendre l’organisation'}
                      </Button>
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-lg bg-muted/30 p-3 border border-border/50">
                        <span className="text-[11px] text-muted-foreground">Affiliés totaux</span>
                        <p className="text-base font-bold text-foreground mt-0.5">{orgDetail.stats.affiliationsCount}</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-3 border border-border/50">
                        <span className="text-[11px] text-muted-foreground">Comptes activés</span>
                        <p className="text-base font-bold text-emerald-600 mt-0.5">{orgDetail.stats.activatedStudentsCount} ({orgDetail.stats.activationRatePercent}%)</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-3 border border-border/50">
                        <span className="text-[11px] text-muted-foreground">Lots d'import</span>
                        <p className="text-base font-bold text-foreground mt-0.5">{orgDetail.stats.importBatchesCount}</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-3 border border-border/50">
                        <span className="text-[11px] text-muted-foreground">Membres cadres</span>
                        <p className="text-base font-bold text-foreground mt-0.5">{orgDetail.members.length}</p>
                      </div>
                    </div>

                    {/* Description */}
                    {orgDetail.description && (
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-muted-foreground">Présentation :</span>
                        <p className="text-xs text-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50">
                          {orgDetail.description}
                        </p>
                      </div>
                    )}

                    {/* Team Members */}
                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Cadres & Administrateurs ({orgDetail.members.length})
                      </h3>
                      <div className="divide-y divide-border/50 rounded-lg border border-border bg-card">
                        {orgDetail.members.map((m: any) => (
                          <div key={m.id} className="flex items-center justify-between p-3 text-xs">
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">
                                {[m.firstName, m.lastName].filter(Boolean).join(' ') || m.email}
                              </p>
                              <p className="text-muted-foreground text-[11px]">{m.email}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold border border-border">
                                {m.role}
                              </span>
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                  m.status === 'ACTIVE'
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : 'bg-amber-500/10 text-amber-600'
                                }`}
                              >
                                {m.status === 'ACTIVE' ? 'Activé' : 'Invité'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Active Capabilities */}
                    <div className="space-y-2 pt-2">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Capacités accordées ({orgDetail.capabilities.length})
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {orgDetail.capabilities.map((cap: string) => (
                          <span
                            key={cap}
                            className="rounded-md bg-primary/10 border border-primary/20 px-2 py-1 text-xs font-bold text-primary"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                    Sélectionnez une organisation pour afficher ses détails.
                  </Card>
                )}
              </div>
            </div>
          ) : (
            /* REQUESTS QUEUE VIEW */
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {statuses.map((value) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={status === value ? 'default' : 'outline'}
                    onClick={() => setStatus(value)}
                  >
                    {statusLabel(value)}
                  </Button>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-bold">
                      {t('staff.organizations.status')} · {statusLabel(status)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {loading ? (
                      <div className="flex justify-center p-10 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : items.length === 0 ? (
                      <p className="p-10 text-center text-sm text-muted-foreground">
                        {t('staff.organizations.empty')}
                      </p>
                    ) : (
                      <div className="divide-y">
                        {items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => selectRequest(item)}
                            className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/40 ${
                              selected?.id === item.id ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-foreground">{item.organizationName}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {typeLabel(item.organizationType)} · {item.countryCode} · {item.region}
                              </p>
                              <p className="mt-2 text-xs text-muted-foreground">
                                {item.contactEmail} · {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selected ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-bold">{t('staff.organizations.details')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h2 className="text-xl font-semibold text-foreground">{selected.organizationName}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {typeLabel(selected.organizationType)} · {selected.region}, {selected.countryCode}
                            </p>
                          </div>
                          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
                            {statusLabel(selected.status)}
                          </span>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-foreground">{selected.description}</p>
                      </div>

                      <dl className="grid gap-3 rounded-2xl border border-border bg-muted/20 p-4 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-muted-foreground">{t('staff.organizations.contact')}</dt>
                          <dd className="mt-1 font-medium text-foreground">
                            {selected.contactName} · {selected.contactRole}
                            <br />
                            {selected.contactEmail}
                            {selected.contactPhone ? ` · ${selected.contactPhone}` : ''}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">{t('staff.organizations.documents')}</dt>
                          <dd className="mt-1 font-medium text-foreground">{selected.supportingDocuments.length}</dd>
                        </div>
                      </dl>

                      {selected.supportingDocuments.length > 0 && (
                        <div className="space-y-2">
                          {selected.supportingDocuments.map((document: { fileName: string; sizeBytes: number }, index: number) => (
                            <div key={document.fileName} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="truncate">{document.fileName}</span>
                              <span className="ml-auto text-xs text-muted-foreground">
                                {Math.round(document.sizeBytes / 1024)} Ko
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => void openDocument(index)}
                                disabled={openingDocument !== null}
                              >
                                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                                {openingDocument === index ? '…' : t('staff.organizations.openDocument')}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {selected.status === 'PENDING' && (
                        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row">
                          <Button onClick={() => void decide('approve')} disabled={busy}>
                            <Check className="mr-2 h-4 w-4" />
                            {t('staff.organizations.approve')}
                          </Button>
                          <div className="flex flex-1 gap-2">
                            <Textarea
                              value={rejectReason}
                              onChange={(event) => setRejectReason(event.target.value)}
                              placeholder={t('staff.organizations.rejectReasonPlaceholder')}
                              rows={2}
                            />
                            <Button
                              variant="destructive"
                              onClick={() => void decide('reject')}
                              disabled={busy || rejectReason.trim().length < 5}
                            >
                              <X className="mr-2 h-4 w-4" />
                              {t('staff.organizations.confirmReject')}
                            </Button>
                          </div>
                        </div>
                      )}

                      {selected.status === 'APPROVED' && selected.approvedOrganizationId && (
                        <div className="space-y-4 border-t border-border pt-5">
                          <div>
                            <h3 className="font-semibold text-foreground">{t('staff.organizations.capabilities')}</h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              {t('staff.organizations.capabilitiesHint')}
                            </p>
                          </div>
                          <div className="space-y-2">
                            {mvpCapabilities.map((capability) => (
                              <div
                                key={capability.name}
                                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                              >
                                <span className="text-sm font-medium text-foreground">
                                  {t(capability.label as never)}
                                </span>
                                <Button
                                  size="sm"
                                  variant={granted.includes(capability.name) ? 'outline' : 'default'}
                                  onClick={() => void toggleCapability(capability.name)}
                                  disabled={
                                    busy ||
                                    (capability.name === 'CERTIFY_AFFILIATION' &&
                                      selected.organizationType !== 'INSTITUTION')
                                  }
                                >
                                  {granted.includes(capability.name)
                                    ? t('staff.organizations.revoke')
                                    : t('staff.organizations.grant')}
                                </Button>
                              </div>
                            ))}
                            {v2Capabilities.map((capability) => (
                              <div
                                key={capability}
                                className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border p-3 opacity-60"
                              >
                                <span className="text-sm font-medium text-foreground">{capability}</span>
                                <span className="text-xs text-muted-foreground">{t('staff.organizations.mvpOnly')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-10 text-center text-sm text-muted-foreground">
                      {t('staff.organizations.empty')}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* PROVISIONING MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <Card className="w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Créer et provisionner un établissement
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                  Nom officiel de l'organisation *
                </Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex. Université d'Antsiranana, Incubateur NextA..."
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="type" className="text-xs font-semibold text-foreground">
                    Type d'entité
                  </Label>
                  <select
                    id="type"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-2 text-xs font-semibold"
                  >
                    <option value="INSTITUTION">Établissement académique</option>
                    <option value="INCUBATOR">Incubateur</option>
                    <option value="COMPANY">Entreprise</option>
                    <option value="NGO">ONG</option>
                    <option value="PUBLIC">Secteur Public</option>
                    <option value="ASSOCIATION">Association</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="country" className="text-xs font-semibold text-foreground">
                    Pays (ISO)
                  </Label>
                  <Input
                    id="country"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value.toUpperCase())}
                    maxLength={2}
                    className="h-9 text-xs uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="region" className="text-xs font-semibold text-foreground">
                    Région / Ville
                  </Label>
                  <Input
                    id="region"
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    placeholder="Ex. Diana, Analamanga..."
                    className="h-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="desc" className="text-xs font-semibold text-foreground">
                  Description / Présentation
                </Label>
                <Textarea
                  id="desc"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Courte présentation de l'entité et de sa mission..."
                  className="min-h-[60px] text-xs"
                />
              </div>

              {/* First Administrator Account */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                  <UserCheck className="h-4 w-4" />
                  Premier compte Administrateur
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="first-name" className="text-xs font-semibold text-foreground">
                      Prénom de l'administrateur *
                    </Label>
                    <Input
                      id="first-name"
                      value={formAdminFirstName}
                      onChange={(e) => setFormAdminFirstName(e.target.value)}
                      placeholder="Ex. Miora"
                      className="h-8 text-xs bg-background"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="last-name" className="text-xs font-semibold text-foreground">
                      Nom de l'administrateur *
                    </Label>
                    <Input
                      id="last-name"
                      value={formAdminLastName}
                      onChange={(e) => setFormAdminLastName(e.target.value)}
                      placeholder="Ex. Randria"
                      className="h-8 text-xs bg-background"
                      required
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="admin-email" className="text-xs font-semibold text-foreground">
                      Email professionnel de l'administrateur *
                    </Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={formAdminEmail}
                      onChange={(e) => setFormAdminEmail(e.target.value)}
                      placeholder="admin@etablissement.mg"
                      className="h-8 text-xs bg-background"
                      required
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Un email d'invitation avec mot de passe temporaire sera généré et envoyé automatiquement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Capacités accordées
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {ALL_CAPABILITIES.map((cap) => (
                    <label
                      key={cap.name}
                      className={`flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer transition-colors ${
                        formCaps.includes(cap.name)
                          ? 'border-primary/40 bg-primary/5 text-foreground'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formCaps.includes(cap.name)}
                        onChange={() => toggleFormCap(cap.name)}
                        className="rounded border-border text-primary"
                      />
                      <span className="text-xs font-medium">{cap.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-8 text-xs font-semibold"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={busy || !formName.trim() || !formAdminEmail.trim()}
                  className="h-8 text-xs font-semibold"
                >
                  {busy ? 'Création…' : 'Provisionner l’organisation'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}

