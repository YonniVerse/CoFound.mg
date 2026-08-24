import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onboardingStepResponseSchema } from '@cofound/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/api-client'

const STEPS = ['Toi', 'Ton parcours', 'Tes compétences', 'Tes aspirations', 'Ta disponibilité', 'Ta visibilité']

type FormState = { firstName: string; lastName: string; pseudonym: string; bio: string; fieldId: string; cohortYear: string; skillIds: string; goals: string; sectorIds: string; availabilityHours: string; visibleInTalentFeed: boolean; gender: string | null }

const initialForm: FormState = { firstName: '', lastName: '', pseudonym: '', bio: '', fieldId: '', cohortYear: '', skillIds: '', goals: '', sectorIds: '', availabilityHours: '', visibleInTalentFeed: false, gender: null }

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [completion, setCompletion] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void apiClient.get('/me/onboarding').then((payload) => {
      if (!active) return
      const result = onboardingStepResponseSchema.parse(payload)
      setStep(result.progress.currentStep)
      setCompletion(result.progress.completion)
      setCompletedSteps(result.progress.completedSteps)
    }).catch(() => { if (active) setError('Impossible de charger ta progression.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const update = (key: keyof FormState, value: string | boolean | null) => setForm((current) => ({ ...current, [key]: value }))
  const stepData = (): Record<string, unknown> => {
    if (step === 1) return { firstName: form.firstName, lastName: form.lastName }
    if (step === 2) return { fieldId: form.fieldId || undefined, cohortYear: form.cohortYear ? Number(form.cohortYear) : undefined }
    if (step === 3) return { skillIds: form.skillIds.split(',').map((value) => value.trim()).filter(Boolean) }
    if (step === 4) return { goals: form.goals.split(',').map((value) => value.trim()).filter(Boolean), sectorIds: form.sectorIds.split(',').map((value) => value.trim()).filter(Boolean) }
    if (step === 5) return { availabilityHours: form.availabilityHours ? Number(form.availabilityHours) : undefined }
    return { pseudonym: form.pseudonym, bio: form.bio || undefined, visibleInTalentFeed: form.visibleInTalentFeed, gender: form.gender }
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
      {step === 2 && <div className="space-y-4"><h2 className="text-xl font-bold">Ton parcours</h2><p className="text-sm text-muted-foreground">Utilise les identifiants des référentiels fournis par la plateforme.</p><div><Label htmlFor="fieldId">Identifiant de filière</Label><Input id="fieldId" value={form.fieldId} onChange={(event) => update('fieldId', event.target.value)} /></div><div><Label htmlFor="cohortYear">Année</Label><Input id="cohortYear" type="number" value={form.cohortYear} onChange={(event) => update('cohortYear', event.target.value)} /></div></div>}
      {step === 3 && <div className="space-y-4"><h2 className="text-xl font-bold">Ce que tu sais faire</h2><p className="text-sm text-muted-foreground">Saisis 3 à 8 identifiants de compétences, séparés par des virgules.</p><Input value={form.skillIds} onChange={(event) => update('skillIds', event.target.value)} placeholder="skill-1, skill-2, skill-3" /></div>}
      {step === 4 && <div className="space-y-4"><h2 className="text-xl font-bold">Ce que tu veux faire</h2><div><Label htmlFor="goals">Objectifs</Label><Input id="goals" value={form.goals} onChange={(event) => update('goals', event.target.value)} placeholder="Créer, apprendre" /></div><div><Label htmlFor="sectorIds">Secteurs</Label><Input id="sectorIds" value={form.sectorIds} onChange={(event) => update('sectorIds', event.target.value)} placeholder="sector-1, sector-2" /></div></div>}
      {step === 5 && <div className="space-y-4"><h2 className="text-xl font-bold">Ta disponibilité</h2><Label htmlFor="availabilityHours">Heures par semaine</Label><Input id="availabilityHours" type="number" min="0" max="168" value={form.availabilityHours} onChange={(event) => update('availabilityHours', event.target.value)} /></div>}
      {step === 6 && <div className="space-y-4"><h2 className="text-xl font-bold">Ta visibilité</h2><p className="text-sm text-muted-foreground">Ton pseudonyme est visible. Ton nom, ta photo et ton genre ne sont jamais affichés dans les profils publics.</p><Input value={form.pseudonym} onChange={(event) => update('pseudonym', event.target.value)} placeholder="Pseudonyme" /><Textarea value={form.bio} onChange={(event) => update('bio', event.target.value)} placeholder="Une courte présentation" /><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.visibleInTalentFeed} onChange={(event) => update('visibleInTalentFeed', event.target.checked)} />Apparaître dans le Feed Talents si mon profil est assez complet</label><Button type="button" variant="outline" onClick={() => update('gender', form.gender ? null : 'prefer-not-to-say')}>{form.gender ? 'Effacer la donnée de genre' : 'Je préfère ne pas répondre au genre'}</Button></div>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center justify-between border-t pt-6"><Button variant="ghost" disabled={saving || step === 1} onClick={() => setStep((current) => current - 1)}>Précédent</Button><div className="flex gap-2"><Button variant="ghost" disabled={saving} onClick={() => navigate('/feed')}>Plus tard</Button><Button disabled={saving} onClick={() => void save()}>{saving ? 'Enregistrement…' : step === 6 ? 'Terminer' : 'Continuer'}</Button></div></div>
    </div>
  </section></main>
}
