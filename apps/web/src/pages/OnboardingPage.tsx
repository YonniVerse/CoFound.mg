import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, ShieldCheck, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { onboardingStepResponseSchema } from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/i18n'
import { apiClient } from '@/lib/api-client'

const FIELD_LABEL_KEYS = {
  'computer-science': 'onboarding.field.computerScience',
  law: 'onboarding.field.law',
  economics: 'onboarding.field.economics',
  management: 'onboarding.field.management',
  communication: 'onboarding.field.communication',
  engineering: 'onboarding.field.engineering',
  design: 'onboarding.field.design',
  agriculture: 'onboarding.field.agriculture',
} as const

type FieldOption = { id: string; slug: string; labelKey: string; sortOrder: number }
type ReferenceOption = { id: string; slug: string; labelKey: string }

const STEPS = ['Toi', 'Ton parcours', 'Tes compétences', 'Tes aspirations', 'Ta disponibilité', 'Ta visibilité']

type FormState = { firstName: string; lastName: string; bio: string; fieldId: string; cohortYear: number | ''; skillIds: string[]; goals: string; sectorIds: string[]; availabilityHours: number | ''; visibleInTalentFeed: boolean; gender: string | null }

const initialForm: FormState = { firstName: '', lastName: '', bio: '', fieldId: '', cohortYear: '', skillIds: [], goals: '', sectorIds: [], availabilityHours: '', visibleInTalentFeed: false, gender: null }

const selectClassName = 'mt-2 flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60'

function OnboardingSkeleton() {
  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 pb-10 pt-8 sm:px-8 sm:pt-10 lg:px-10 lg:pb-12 lg:pt-12">
        <div className="mx-auto max-w-5xl space-y-8" role="status" aria-label="Chargement de ton profil">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-9 w-40 rounded-xl" />
          </div>
          <header className="flex items-start gap-4 border-b border-border/60 pb-7">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-9 w-72" />
              <Skeleton className="h-4 w-96 max-w-full" />
            </div>
          </header>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <Card className="rounded-2xl border-border/70 shadow-2xs">
              <CardHeader className="border-b border-border/60 px-5 py-5 sm:px-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-2 h-4 w-56" />
              </CardHeader>
              <CardContent className="space-y-5 px-5 py-6 sm:px-6">
                <div className="grid gap-5 sm:grid-cols-2"><Skeleton className="h-16 rounded-xl" /><Skeleton className="h-16 rounded-xl" /></div>
                <Skeleton className="h-28 rounded-xl" />
                <div className="flex justify-between border-t border-border/60 pt-5"><Skeleton className="h-9 w-24 rounded-xl" /><Skeleton className="h-9 w-32 rounded-xl" /></div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/70 shadow-2xs">
              <CardHeader className="px-5 py-5"><Skeleton className="h-5 w-36" /></CardHeader>
              <CardContent className="space-y-3 px-5 pb-5"><Skeleton className="h-2 w-full rounded-full" />{STEPS.slice(0, 5).map((item) => <Skeleton key={item} className="h-9 w-full rounded-lg" />)}</CardContent>
            </Card>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}

function ChoiceButton({ selected, children, onClick }: { selected: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 ${selected ? 'border-primary bg-primary text-primary-foreground shadow-xs' : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted'}`}
      aria-pressed={selected}
    >
      {children}
    </button>
  )
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [completion, setCompletion] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [fields, setFields] = useState<FieldOption[]>([])
  const [fieldsLoading, setFieldsLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skills, setSkills] = useState<ReferenceOption[]>([])
  const [sectors, setSectors] = useState<ReferenceOption[]>([])
  const [skillsLoading, setSkillsLoading] = useState(true)
  const [sectorsLoading, setSectorsLoading] = useState(true)

  useEffect(() => {
    let active = true
    void apiClient.get<{ items: FieldOption[] }>('/reference-data/fields').then((payload) => {
      if (active) setFields(payload.items)
    }).catch(() => {
      if (active) setError(t('onboarding.fieldsLoadError'))
    }).finally(() => {
      if (active) setFieldsLoading(false)
    })

    void apiClient.get<{ items: ReferenceOption[] }>('/reference-data/skills').then((payload) => {
      if (active) setSkills(payload.items)
    }).finally(() => {
      if (active) setSkillsLoading(false)
    })

    void apiClient.get<{ items: ReferenceOption[] }>('/reference-data/sectors').then((payload) => {
      if (active) setSectors(payload.items)
    }).finally(() => {
      if (active) setSectorsLoading(false)
    })

    return () => { active = false }
  }, [t])

  useEffect(() => {
    let active = true
    void apiClient.get('/me/onboarding').then((payload) => {
      if (!active) return
      const result = onboardingStepResponseSchema.parse(payload)
      setStep(result.progress.currentStep)
      setCompletion(result.progress.completion)
      setCompletedSteps(result.progress.completedSteps)
      if (result.data) {
        setForm((prev) => ({
          ...prev,
          firstName: typeof result.data?.firstName === 'string' ? result.data.firstName : prev.firstName,
          lastName: typeof result.data?.lastName === 'string' ? result.data.lastName : prev.lastName,
          bio: typeof result.data?.bio === 'string' ? result.data.bio : prev.bio,
          fieldId: typeof result.data?.fieldId === 'string' ? result.data.fieldId : prev.fieldId,
          cohortYear: typeof result.data?.cohortYear === 'number' ? result.data.cohortYear : prev.cohortYear,
          skillIds: Array.isArray(result.data?.skillIds) ? result.data.skillIds : prev.skillIds,
          goals: Array.isArray(result.data?.goals) ? result.data.goals.join(', ') : prev.goals,
          sectorIds: Array.isArray(result.data?.sectorIds) ? result.data.sectorIds : prev.sectorIds,
          availabilityHours: typeof result.data?.availabilityHours === 'number' ? result.data.availabilityHours : prev.availabilityHours,
          visibleInTalentFeed: typeof result.data?.visibleInTalentFeed === 'boolean' ? result.data.visibleInTalentFeed : prev.visibleInTalentFeed,
          gender: typeof result.data?.gender === 'string' ? result.data.gender : prev.gender,
        }))
      }
    }).catch(() => { if (active) setError('Impossible de charger ta progression.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const update = (key: keyof FormState, value: string | number | boolean | null | string[]) => setForm((current) => ({ ...current, [key]: value }))
  const stepData = (): Record<string, unknown> => {
    if (step === 1) return { firstName: form.firstName, lastName: form.lastName }
    if (step === 2) return { fieldId: form.fieldId || undefined, cohortYear: form.cohortYear || undefined }
    if (step === 3) return { skillIds: form.skillIds }
    if (step === 4) return { goals: form.goals.split(',').map((value) => value.trim()).filter(Boolean), sectorIds: form.sectorIds }
    if (step === 5) return { availabilityHours: form.availabilityHours !== '' ? form.availabilityHours : undefined }
    return { bio: form.bio || undefined, visibleInTalentFeed: form.visibleInTalentFeed, gender: form.gender }
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload = await apiClient.patch(`/me/onboarding/steps/${step}`, { data: stepData() })
      const result = onboardingStepResponseSchema.parse(payload)
      setCompletion(result.progress.completion)
      setCompletedSteps(result.progress.completedSteps)
      if (step < 6) setStep(result.progress.currentStep)
      else navigate('/profile/me')
    } catch {
      setError('Vérifie les informations de cette étape puis réessaie.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <OnboardingSkeleton />

  const progressValue = Math.max(completion, Math.round((completedSteps.length / 6) * 100))
  const currentStepName = STEPS[step - 1]

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 pb-10 pt-8 sm:px-8 sm:pt-10 lg:px-10 lg:pb-12 lg:pt-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
              <Link to="/feed"><ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />{t('common.back')} au Feed</Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/profile/me"><UserRound className="h-4 w-4" aria-hidden="true" />Voir mon profil</Link>
            </Button>
          </div>

          <header className="flex flex-col gap-5 border-b border-border/60 pb-7 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <UserRound className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Espace personnel</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">Construisons ton profil</h1>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">Avance étape par étape. Tu peux enregistrer ta progression et revenir plus tard.</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 shadow-2xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">{progressValue}%</div>
              <div className="min-w-32"><p className="text-xs font-semibold text-foreground">Profil complété</p><Progress value={progressValue} className="mt-2 h-1.5" /></div>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
            <Card className="overflow-hidden rounded-2xl border-border/70 shadow-2xs">
              <CardHeader className="border-b border-border/60 px-5 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Étape {step} sur 6</p>
                    <CardTitle className="mt-2 text-xl font-bold tracking-tight">{currentStepName}</CardTitle>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{progressValue}% complété</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 px-5 py-6 sm:px-6">
                {step === 1 && <div className="space-y-5"><div><h2 className="text-base font-bold text-foreground">Parle-nous de toi</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Ces informations restent privées et servent à sécuriser ton compte.</p></div><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="firstName" className="text-sm font-semibold text-foreground">Prénom</Label><Input id="firstName" value={form.firstName} onChange={(event) => update('firstName', event.target.value)} placeholder="Ton prénom" className="h-11 rounded-xl" /></div><div className="space-y-2"><Label htmlFor="lastName" className="text-sm font-semibold text-foreground">Nom</Label><Input id="lastName" value={form.lastName} onChange={(event) => update('lastName', event.target.value)} placeholder="Ton nom" className="h-11 rounded-xl" /></div></div></div>}

                {step === 2 && <div className="space-y-5"><div><h2 className="text-base font-bold text-foreground">Ton parcours</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Sélectionne les informations qui décrivent ton parcours.</p></div><div className="space-y-2"><Label htmlFor="fieldId" className="text-sm font-semibold text-foreground">Filière</Label><select id="fieldId" value={form.fieldId} disabled={fieldsLoading} onChange={(event) => update('fieldId', event.target.value)} className={selectClassName}><option value="">{fieldsLoading ? 'Chargement des filières…' : 'Sélectionne ta filière'}</option>{fields.map((field) => <option key={field.id} value={field.id}>{field.slug in FIELD_LABEL_KEYS ? t(FIELD_LABEL_KEYS[field.slug as keyof typeof FIELD_LABEL_KEYS]) : field.slug}</option>)}</select></div><div className="space-y-2"><Label htmlFor="cohortYear" className="text-sm font-semibold text-foreground">Année de promotion</Label><select id="cohortYear" value={form.cohortYear === '' ? '' : form.cohortYear} onChange={(event) => update('cohortYear', event.target.value === '' ? '' : parseInt(event.target.value, 10))} className={selectClassName}><option value="">Sélectionne ton année de promotion</option>{Array.from({ length: new Date().getFullYear() + 5 - 1950 + 1 }, (_, i) => new Date().getFullYear() + 5 - i).map((year) => <option key={year} value={year}>{year}</option>)}</select></div></div>}

                {step === 3 && <div className="space-y-5"><div><h2 className="text-base font-bold text-foreground">Tes compétences</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Sélectionne jusqu’à 8 compétences qui te correspondent.</p></div>{skillsLoading ? <div className="flex flex-wrap gap-2"><Skeleton className="h-10 w-28 rounded-xl" /><Skeleton className="h-10 w-36 rounded-xl" /><Skeleton className="h-10 w-24 rounded-xl" /><Skeleton className="h-10 w-32 rounded-xl" /></div> : <div className="flex flex-wrap gap-2">{skills.map((skill) => <ChoiceButton key={skill.id} selected={form.skillIds.includes(skill.id)} onClick={() => update('skillIds', form.skillIds.includes(skill.id) ? form.skillIds.filter((id) => id !== skill.id) : form.skillIds.length < 8 ? [...form.skillIds, skill.id] : form.skillIds)}>{skill.slug}</ChoiceButton>)}</div>}<p className="text-xs font-medium text-muted-foreground">{form.skillIds.length} / 8 sélectionnées</p></div>}

                {step === 4 && <div className="space-y-5"><div><h2 className="text-base font-bold text-foreground">Tes aspirations</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Décris ce que tu aimerais construire et les secteurs qui t’intéressent.</p></div><div className="space-y-2"><Label htmlFor="goals" className="text-sm font-semibold text-foreground">Objectifs</Label><Input id="goals" value={form.goals} onChange={(event) => update('goals', event.target.value)} placeholder="Créer, apprendre, lancer…" className="h-11 rounded-xl" /><p className="text-xs text-muted-foreground">Sépare plusieurs objectifs par des virgules.</p></div><div className="space-y-3"><div><Label className="text-sm font-semibold text-foreground">Secteurs</Label><p className="mt-1 text-xs text-muted-foreground">Sélectionne jusqu’à 10 secteurs.</p></div>{sectorsLoading ? <div className="flex flex-wrap gap-2"><Skeleton className="h-10 w-24 rounded-xl" /><Skeleton className="h-10 w-32 rounded-xl" /><Skeleton className="h-10 w-28 rounded-xl" /></div> : <div className="flex flex-wrap gap-2">{sectors.map((sector) => <ChoiceButton key={sector.id} selected={form.sectorIds.includes(sector.id)} onClick={() => update('sectorIds', form.sectorIds.includes(sector.id) ? form.sectorIds.filter((id) => id !== sector.id) : form.sectorIds.length < 10 ? [...form.sectorIds, sector.id] : form.sectorIds)}>{sector.slug}</ChoiceButton>)}</div>}</div></div>}

                {step === 5 && <div className="space-y-5"><div><h2 className="text-base font-bold text-foreground">Ta disponibilité</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Indique le temps que tu peux consacrer à un projet ou une collaboration.</p></div><div className="max-w-sm space-y-2"><Label htmlFor="availabilityHours" className="text-sm font-semibold text-foreground">Heures par semaine</Label><Input id="availabilityHours" type="number" min="0" max="168" value={form.availabilityHours} onChange={(event) => update('availabilityHours', Number.isNaN(event.target.valueAsNumber) ? '' : event.target.valueAsNumber)} placeholder="Ex. 6" className="h-11 rounded-xl" /><p className="text-xs text-muted-foreground">Entre 0 et 168 heures.</p></div></div>}

                {step === 6 && <div className="space-y-5"><div><h2 className="text-base font-bold text-foreground">Ta visibilité</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Choisis ce que tu souhaites partager. Ton profil public utilise un pseudonyme et ne montre jamais ton nom réel ni ta photo.</p></div><div className="space-y-2"><Label htmlFor="bio" className="text-sm font-semibold text-foreground">Présentation</Label><Textarea id="bio" value={form.bio} onChange={(event) => update('bio', event.target.value)} placeholder="Une courte présentation de toi et de ce que tu recherches" rows={5} className="resize-y rounded-xl" /></div><label className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 text-sm leading-relaxed text-foreground"><input type="checkbox" checked={form.visibleInTalentFeed} onChange={(event) => update('visibleInTalentFeed', event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-input text-primary accent-primary focus:ring-primary" /><span><span className="font-semibold">Apparaître dans le Feed Talents</span><span className="mt-1 block text-xs text-muted-foreground">Ton profil sera visible lorsque le niveau minimum de complétion sera atteint.</span></span></label><Button type="button" variant="outline" className="h-10 rounded-xl" onClick={() => update('gender', form.gender ? null : 'prefer-not-to-say')}>{form.gender ? 'Effacer la donnée de genre' : 'Je préfère ne pas répondre au genre'}</Button></div>}

                {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm leading-relaxed text-destructive">{error}</p>}

                <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between"><Button variant="ghost" disabled={saving || step === 1} onClick={() => setStep((current) => current - 1)} className="justify-center text-muted-foreground sm:justify-start"><ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />Précédent</Button><div className="flex flex-col gap-2 sm:flex-row"><Button variant="outline" disabled={saving} onClick={() => navigate('/feed')} className="justify-center">Plus tard</Button><Button disabled={saving} onClick={() => void save()} className="justify-center">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : step === 6 ? <Check className="mr-2 h-4 w-4" aria-hidden="true" /> : <ArrowRight className="mr-2 h-4 w-4" aria-hidden="true" />}{saving ? 'Enregistrement…' : step === 6 ? 'Terminer' : 'Continuer'}</Button></div></div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-2xl border-border/70 shadow-2xs">
                <CardHeader className="px-5 py-5"><CardTitle className="text-base font-bold tracking-tight">Ta progression</CardTitle><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Étape par étape, sans pression.</p></CardHeader>
                <CardContent className="space-y-4 px-5 pb-5"><div className="flex items-center justify-between text-sm"><span className="font-medium text-muted-foreground">Complétion</span><span className="font-bold text-primary">{progressValue}%</span></div><Progress value={progressValue} className="h-2" /><div className="space-y-2 pt-2">{STEPS.map((stepName, index) => { const stepNumber = index + 1; const isCurrent = stepNumber === step; const isCompleted = completedSteps.includes(stepNumber); return <div key={stepName} className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm ${isCurrent ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isCompleted ? 'bg-primary text-primary-foreground' : isCurrent ? 'border border-primary text-primary' : 'bg-muted text-muted-foreground'}`}>{isCompleted ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : stepNumber}</span><span className={isCurrent ? 'font-semibold' : 'font-medium'}>{stepName}</span></div> })}</div></CardContent>
              </Card>
              <Card className="rounded-2xl border-border/70 bg-primary/[0.03] shadow-2xs"><CardContent className="p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" /><div><p className="text-sm font-semibold leading-snug text-foreground">Tes informations restent protégées</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Ton identité réelle reste privée. Dans les espaces publics, seul ton pseudonyme est utilisé.</p></div></div></CardContent></Card>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
