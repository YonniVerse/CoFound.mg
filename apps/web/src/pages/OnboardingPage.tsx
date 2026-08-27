import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onboardingStepResponseSchema } from '@cofound/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
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

const STEPS = ['Toi', 'Ton parcours', 'Tes compétences', 'Tes aspirations', 'Ta disponibilité', 'Ta visibilité']

type FormState = { firstName: string; lastName: string; bio: string; fieldId: string; cohortYear: number | ''; skillIds: string[]; goals: string; sectorIds: string[]; availabilityHours: number | ''; visibleInTalentFeed: boolean; gender: string | null }

const initialForm: FormState = { firstName: '', lastName: '', bio: '', fieldId: '', cohortYear: '', skillIds: [], goals: '', sectorIds: [], availabilityHours: '', visibleInTalentFeed: false, gender: null }

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

  const [skills, setSkills] = useState<{ id: string; slug: string; labelKey: string }[]>([])
  const [sectors, setSectors] = useState<{ id: string; slug: string; labelKey: string }[]>([])
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

    void apiClient.get<{ items: { id: string; slug: string; labelKey: string }[] }>('/reference-data/skills').then((payload) => {
      if (active) setSkills(payload.items)
    }).finally(() => {
      if (active) setSkillsLoading(false)
    })

    void apiClient.get<{ items: { id: string; slug: string; labelKey: string }[] }>('/reference-data/sectors').then((payload) => {
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
    setSaving(true); setError(null)
    try {
      const payload = await apiClient.patch(`/me/onboarding/steps/${step}`, { data: stepData() })
      const result = onboardingStepResponseSchema.parse(payload)
      setCompletion(result.progress.completion); setCompletedSteps(result.progress.completedSteps)
      if (step < 6) setStep(result.progress.currentStep); else navigate('/feed')
    } catch { setError('Vérifie les informations de cette étape puis réessaie.') } finally { setSaving(false) }
  }

  if (loading) return <main className="min-h-screen grid place-items-center"><p>Chargement de ta progression…</p></main>
  const progressValue = Math.max(completion, Math.round((completedSteps.length / 6) * 100))
  return <main className="min-h-screen bg-muted/20 px-4 py-10 sm:px-6"><section className="mx-auto max-w-2xl space-y-8">
    <header className="space-y-3"><p className="text-sm font-medium text-muted-foreground">Étape {step} sur 6 · {STEPS[step - 1]}</p><h1 className="font-heading text-3xl font-black">Construisons ton profil, à ton rythme.</h1><Progress value={progressValue} className="h-2" /><p className="text-sm text-muted-foreground">{progressValue}% complété · Tu peux continuer plus tard.</p></header>
    <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8 space-y-6">
      {step === 1 && <div className="space-y-4"><h2 className="text-xl font-bold">Toi</h2><p className="text-sm text-muted-foreground">Ces informations restent privées.</p><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="firstName">Prénom</Label><Input id="firstName" value={form.firstName} onChange={(event) => update('firstName', event.target.value)} /></div><div><Label htmlFor="lastName">Nom</Label><Input id="lastName" value={form.lastName} onChange={(event) => update('lastName', event.target.value)} /></div></div></div>}
      {step === 2 && <div className="space-y-4"><h2 className="text-xl font-bold">Ton parcours</h2><p className="text-sm text-muted-foreground">Sélectionne ta filière dans la liste proposée par la plateforme.</p><div><Label htmlFor="fieldId">Filière</Label><select id="fieldId" value={form.fieldId} disabled={fieldsLoading} onChange={(event) => update('fieldId', event.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"><option value="">{fieldsLoading ? 'Chargement des filières…' : 'Sélectionne ta filière'}</option>{fields.map((field) => <option key={field.id} value={field.id}>{field.slug in FIELD_LABEL_KEYS ? t(FIELD_LABEL_KEYS[field.slug as keyof typeof FIELD_LABEL_KEYS]) : field.slug}</option>)}</select></div><div><Label htmlFor="cohortYear">Année</Label><select id="cohortYear" value={form.cohortYear === '' ? '' : form.cohortYear} onChange={(event) => update('cohortYear', event.target.value === '' ? '' : parseInt(event.target.value, 10))} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"><option value="">Sélectionne ton année de promotion</option>{Array.from({ length: new Date().getFullYear() + 5 - 1950 + 1 }, (_, i) => new Date().getFullYear() + 5 - i).map((year) => (<option key={year} value={year}>{year}</option>))}</select></div></div>}
      {step === 3 && <div className="space-y-4"><h2 className="text-xl font-bold">Ce que tu sais faire</h2><p className="text-sm text-muted-foreground">Sélectionne 1 à 8 compétences qui te correspondent.</p>
        {skillsLoading ? <p className="text-sm text-muted-foreground">Chargement des compétences...</p> : <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <button key={skill.id} type="button" onClick={() => update('skillIds', form.skillIds.includes(skill.id) ? form.skillIds.filter(id => id !== skill.id) : form.skillIds.length < 8 ? [...form.skillIds, skill.id] : form.skillIds)} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${form.skillIds.includes(skill.id) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}>
              {skill.slug}
            </button>
          ))}
        </div>}
        <p className="text-xs text-muted-foreground">{form.skillIds.length} / 8 sélectionnées</p>
      </div>}
      {step === 4 && <div className="space-y-4"><h2 className="text-xl font-bold">Ce que tu veux faire</h2>
        <div><Label htmlFor="goals">Objectifs</Label><Input id="goals" value={form.goals} onChange={(event) => update('goals', event.target.value)} placeholder="Créer, apprendre (séparés par des virgules)" /></div>
        <div><Label>Secteurs</Label><p className="text-sm text-muted-foreground mb-2">Quels secteurs t'intéressent ?</p>
          {sectorsLoading ? <p className="text-sm text-muted-foreground">Chargement des secteurs...</p> : <div className="flex flex-wrap gap-2">
            {sectors.map((sector) => (
              <button key={sector.id} type="button" onClick={() => update('sectorIds', form.sectorIds.includes(sector.id) ? form.sectorIds.filter(id => id !== sector.id) : form.sectorIds.length < 10 ? [...form.sectorIds, sector.id] : form.sectorIds)} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${form.sectorIds.includes(sector.id) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}>
                {sector.slug}
              </button>
            ))}
          </div>}
        </div>
      </div>}
      {step === 5 && <div className="space-y-4"><h2 className="text-xl font-bold">Ta disponibilité</h2><Label htmlFor="availabilityHours">Heures par semaine</Label><Input id="availabilityHours" type="number" min="0" max="168" value={form.availabilityHours} onChange={(event) => update('availabilityHours', isNaN(event.target.valueAsNumber) ? '' : event.target.valueAsNumber)} /></div>}
      {step === 6 && <div className="space-y-4"><h2 className="text-xl font-bold">Ta visibilité</h2><p className="text-sm text-muted-foreground">Ton profil utilise un pseudonyme généré automatiquement. Ton nom, ta photo et ton genre ne sont jamais affichés dans les profils publics.</p><Textarea value={form.bio} onChange={(event) => update('bio', event.target.value)} placeholder="Une courte présentation" /><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.visibleInTalentFeed} onChange={(event) => update('visibleInTalentFeed', event.target.checked)} />Apparaître dans le Feed Talents si mon profil est assez complet</label><Button type="button" variant="outline" onClick={() => update('gender', form.gender ? null : 'prefer-not-to-say')}>{form.gender ? 'Effacer la donnée de genre' : 'Je préfère ne pas répondre au genre'}</Button></div>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center justify-between border-t pt-6"><Button variant="ghost" disabled={saving || step === 1} onClick={() => setStep((current) => current - 1)}>Précédent</Button><div className="flex gap-2"><Button variant="ghost" disabled={saving} onClick={() => navigate('/feed')}>Plus tard</Button><Button disabled={saving} onClick={() => void save()}>{saving ? 'Enregistrement…' : step === 6 ? 'Terminer' : 'Continuer'}</Button></div></div>
    </div>
  </section></main>
}
