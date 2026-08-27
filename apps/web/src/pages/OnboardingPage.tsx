import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { onboardingStepResponseSchema } from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

const STEPS = ['Identité', 'Parcours', 'Compétences', 'Aspirations', 'Disponibilité', 'Visibilité']
const STEP_HEADINGS = ['Parle-nous de toi', 'Ton parcours', 'Tes compétences', 'Tes aspirations', 'Ta disponibilité', 'Ta visibilité']
const STEP_DESCRIPTIONS = [
  'Ces informations restent privées et servent à sécuriser ton compte.',
  'Sélectionne les informations qui décrivent ton parcours.',
  'Sélectionne jusqu’à 8 compétences qui te correspondent.',
  'Décris ce que tu aimerais construire et les secteurs qui t’intéressent.',
  'Indique le temps que tu peux consacrer à un projet ou une collaboration.',
  'Choisis ce que tu souhaites partager avec la communauté.',
]

type FormState = { firstName: string; lastName: string; bio: string; fieldId: string; cohortYear: number | ''; skillIds: string[]; goals: string; sectorIds: string[]; availabilityHours: number | ''; visibleInTalentFeed: boolean; gender: string | null }

const initialForm: FormState = { firstName: '', lastName: '', bio: '', fieldId: '', cohortYear: '', skillIds: [], goals: '', sectorIds: [], availabilityHours: '', visibleInTalentFeed: false, gender: null }

const inputClassName = 'h-11 rounded-xl border border-border/80 bg-background px-4 text-sm font-medium shadow-2xs transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20'
const selectClassName = 'mt-1 flex h-11 w-full rounded-xl border border-border/80 bg-background px-4 py-2 text-sm font-medium text-foreground shadow-2xs outline-none transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60'
const textareaClassName = 'min-h-40 resize-y rounded-xl border border-border/80 bg-background px-4 py-3 text-sm font-medium leading-relaxed shadow-2xs transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20'

function OnboardingSkeleton() {
  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6" role="status" aria-label="Chargement de ton profil">
          <div className="flex items-center justify-between gap-3"><Skeleton className="h-9 w-32 rounded-lg" /><Skeleton className="h-9 w-36 rounded-lg" /></div>
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-2xs sm:p-6"><div className="flex items-start justify-between gap-4"><div className="space-y-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-72" /><Skeleton className="h-4 w-96 max-w-full" /></div><Skeleton className="h-16 w-16 rounded-xl" /></div><div className="mt-6 grid grid-cols-6 gap-2"><Skeleton className="h-2 rounded-full" /><Skeleton className="h-2 rounded-full" /><Skeleton className="h-2 rounded-full" /><Skeleton className="h-2 rounded-full" /><Skeleton className="h-2 rounded-full" /><Skeleton className="h-2 rounded-full" /></div></section>
          <Card className="mx-auto w-full max-w-3xl rounded-xl border-border bg-card p-5 shadow-2xs sm:p-6"><div className="mb-6 flex items-start gap-3 border-b border-border pb-5"><Skeleton className="h-10 w-10 rounded-xl" /><div className="space-y-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-72" /></div></div><CardContent className="space-y-5 p-0"><div className="grid gap-5 sm:grid-cols-2"><Skeleton className="h-16 rounded-xl" /><Skeleton className="h-16 rounded-xl" /></div><Skeleton className="h-11 rounded-xl" /><div className="flex justify-between border-t border-border pt-5"><Skeleton className="h-9 w-24 rounded-lg" /><Skeleton className="h-9 w-32 rounded-lg" /></div></CardContent></Card>
        </div>
      </main>
    </DashboardLayout>
  )
}

function ChoiceButton({ selected, children, onClick }: { selected: boolean; children: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 sm:text-sm ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted'}`}>
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
  const currentHeading = STEP_HEADINGS[step - 1]
  const currentDescription = STEP_DESCRIPTIONS[step - 1]

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <Link to="/feed" className="group inline-flex h-9 w-fit shrink-0 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:text-sm"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />Retour au Feed</Link>
          </div>

          <section className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-2xs sm:p-6" aria-label="Progression du profil">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5"><p className="text-xs font-bold uppercase tracking-wider text-primary">Ton profil</p><h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Construis un profil qui te ressemble</h1><p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Avance à ton rythme. Chaque étape enregistrée te rapproche d’un profil complet.</p></div>
              <div className="flex shrink-0 items-center gap-3 rounded-xl border border-primary/20 bg-background px-4 py-3 shadow-2xs"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">{progressValue}%</div><div className="min-w-28"><p className="text-xs font-semibold text-foreground">Progression</p><Progress value={progressValue} className="mt-2 h-1.5" /></div></div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-6 sm:gap-3" role="list" aria-label="Étapes du profil">{STEPS.map((stepName, index) => { const stepNumber = index + 1; const isCurrent = stepNumber === step; const isCompleted = completedSteps.includes(stepNumber); return <div key={stepName} role="listitem" className="min-w-0"><div className={`h-1.5 rounded-full transition-colors ${isCompleted || isCurrent ? 'bg-primary' : 'bg-primary/15'}`} /><div className={`mt-2 flex items-center gap-1.5 text-xs ${isCurrent ? 'font-bold text-primary' : isCompleted ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${isCompleted ? 'bg-primary text-primary-foreground' : isCurrent ? 'border border-primary text-primary' : 'bg-primary/10 text-muted-foreground'}`}>{isCompleted ? <Check className="h-3 w-3" aria-hidden="true" /> : stepNumber}</span><span className="truncate">{stepName}</span></div></div> })}</div>
          </section>

          <Card className="mx-auto w-full max-w-3xl rounded-xl border-border bg-card p-5 shadow-2xs sm:p-6">
            <div className="mb-6 flex items-start gap-3 border-b border-border pb-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"><UserRound className="h-5 w-5" aria-hidden="true" /></div><div><h2 className="font-heading text-lg font-bold text-foreground">{currentHeading}</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{currentDescription}</p></div></div>

            <CardContent className="space-y-5 p-0">
              {step === 1 && <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-1.5"><Label htmlFor="firstName" className="text-xs font-semibold text-foreground">Prénom</Label><Input id="firstName" value={form.firstName} onChange={(event) => update('firstName', event.target.value)} placeholder="Ex. Miora" className={inputClassName} /></div><div className="space-y-1.5"><Label htmlFor="lastName" className="text-xs font-semibold text-foreground">Nom</Label><Input id="lastName" value={form.lastName} onChange={(event) => update('lastName', event.target.value)} placeholder="Ex. Rakoto" className={inputClassName} /></div></div>}

              {step === 2 && <div className="space-y-5"><div className="space-y-1.5"><Label htmlFor="fieldId" className="text-xs font-semibold text-foreground">Filière</Label><select id="fieldId" value={form.fieldId} disabled={fieldsLoading} onChange={(event) => update('fieldId', event.target.value)} className={selectClassName}><option value="">{fieldsLoading ? 'Chargement des filières…' : 'Sélectionne ta filière'}</option>{fields.map((field) => <option key={field.id} value={field.id}>{field.slug in FIELD_LABEL_KEYS ? t(FIELD_LABEL_KEYS[field.slug as keyof typeof FIELD_LABEL_KEYS]) : field.slug}</option>)}</select></div><div className="space-y-1.5"><Label htmlFor="cohortYear" className="text-xs font-semibold text-foreground">Année de promotion</Label><select id="cohortYear" value={form.cohortYear === '' ? '' : form.cohortYear} onChange={(event) => update('cohortYear', event.target.value === '' ? '' : parseInt(event.target.value, 10))} className={selectClassName}><option value="">Sélectionne ton année de promotion</option>{Array.from({ length: new Date().getFullYear() + 5 - 1950 + 1 }, (_, i) => new Date().getFullYear() + 5 - i).map((year) => <option key={year} value={year}>{year}</option>)}</select></div></div>}

              {step === 3 && <div className="space-y-4">{skillsLoading ? <div className="flex flex-wrap gap-2"><Skeleton className="h-9 w-28 rounded-lg" /><Skeleton className="h-9 w-36 rounded-lg" /><Skeleton className="h-9 w-24 rounded-lg" /><Skeleton className="h-9 w-32 rounded-lg" /></div> : <div className="flex flex-wrap gap-2">{skills.map((skill) => <ChoiceButton key={skill.id} selected={form.skillIds.includes(skill.id)} onClick={() => update('skillIds', form.skillIds.includes(skill.id) ? form.skillIds.filter((id) => id !== skill.id) : form.skillIds.length < 8 ? [...form.skillIds, skill.id] : form.skillIds)}>{skill.slug}</ChoiceButton>)}</div>}<p className="text-xs font-medium text-muted-foreground">{form.skillIds.length} / 8 sélectionnées</p></div>}

              {step === 4 && <div className="space-y-5"><div className="space-y-1.5"><Label htmlFor="goals" className="text-xs font-semibold text-foreground">Objectifs</Label><Input id="goals" value={form.goals} onChange={(event) => update('goals', event.target.value)} placeholder="Ex. Créer, apprendre, lancer…" className={inputClassName} /><p className="text-xs text-muted-foreground">Sépare plusieurs objectifs par des virgules.</p></div><div className="space-y-3"><div><Label className="text-xs font-semibold text-foreground">Secteurs</Label><p className="mt-1 text-xs text-muted-foreground">Sélectionne jusqu’à 10 secteurs.</p></div>{sectorsLoading ? <div className="flex flex-wrap gap-2"><Skeleton className="h-9 w-24 rounded-lg" /><Skeleton className="h-9 w-32 rounded-lg" /><Skeleton className="h-9 w-28 rounded-lg" /></div> : <div className="flex flex-wrap gap-2">{sectors.map((sector) => <ChoiceButton key={sector.id} selected={form.sectorIds.includes(sector.id)} onClick={() => update('sectorIds', form.sectorIds.includes(sector.id) ? form.sectorIds.filter((id) => id !== sector.id) : form.sectorIds.length < 10 ? [...form.sectorIds, sector.id] : form.sectorIds)}>{sector.slug}</ChoiceButton>)}</div>}</div></div>}

              {step === 5 && <div className="max-w-sm space-y-1.5"><Label htmlFor="availabilityHours" className="text-xs font-semibold text-foreground">Heures par semaine</Label><Input id="availabilityHours" type="number" min="0" max="168" value={form.availabilityHours} onChange={(event) => update('availabilityHours', Number.isNaN(event.target.valueAsNumber) ? '' : event.target.valueAsNumber)} placeholder="Ex. 6" className={inputClassName} /><p className="text-xs text-muted-foreground">Entre 0 et 168 heures.</p></div>}

              {step === 6 && <div className="space-y-5"><div className="space-y-1.5"><Label htmlFor="bio" className="text-xs font-semibold text-foreground">Présentation</Label><Textarea id="bio" value={form.bio} onChange={(event) => update('bio', event.target.value)} placeholder="Une courte présentation de toi et de ce que tu recherches" rows={6} className={textareaClassName} /><div className="flex justify-end text-xs text-muted-foreground"><span>{form.bio.length}/2000</span></div></div><label className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4 text-sm leading-relaxed text-foreground"><input type="checkbox" checked={form.visibleInTalentFeed} onChange={(event) => update('visibleInTalentFeed', event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary focus:ring-primary" /><span><span className="font-semibold">Apparaître dans le Feed Talents</span><span className="mt-1 block text-xs text-muted-foreground">Ton profil sera visible lorsque le niveau minimum de complétion sera atteint.</span></span></label><Button type="button" variant="outline" className="h-9 rounded-lg text-xs font-medium sm:text-sm" onClick={() => update('gender', form.gender ? null : 'prefer-not-to-say')}>{form.gender ? 'Effacer la donnée de genre' : 'Je préfère ne pas répondre au genre'}</Button></div>}

              {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-medium leading-snug text-destructive sm:text-sm">{error}</div>}

              <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between"><Button variant="ghost" disabled={saving || step === 1} onClick={() => setStep((current) => current - 1)} className="h-9 justify-center px-2 text-xs font-semibold text-muted-foreground sm:justify-start sm:text-sm"><ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />Précédent</Button><div className="flex flex-col gap-2 sm:flex-row"><Button variant="outline" disabled={saving} onClick={() => navigate('/feed')} className="h-9 justify-center rounded-lg px-3.5 text-xs font-medium shadow-none sm:text-sm">Plus tard</Button><Button disabled={saving} onClick={() => void save()} className="h-9 justify-center gap-1.5 rounded-lg px-3.5 text-xs font-medium shadow-none sm:text-sm">{saving ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />Enregistrement…</> : step === 6 ? <><Check className="h-4 w-4" aria-hidden="true" />Terminer</> : <><ArrowRight className="h-4 w-4" aria-hidden="true" />Continuer</>}</Button></div></div>
            </CardContent>
          </Card>
        </div>
      </main>
    </DashboardLayout>
  )
}
