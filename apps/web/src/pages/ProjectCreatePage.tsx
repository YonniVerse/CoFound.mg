import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, BriefcaseBusiness, FileText, Lightbulb } from 'lucide-react'
import { projectCreateSchema } from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createProject, getProjectReferenceData } from '@/data/projectApi'

type ReferenceOption = { id: string; slug: string; labelKey: string; sortOrder: number }
type FormState = { title: string; pitch: string; sectorId: string; regionId: string }

const draftStorageKey = 'cofound.project-create-draft'
const initialForm: FormState = { title: '', pitch: '', sectorId: '', regionId: '' }

function readDraft(): FormState {
  try {
    const stored = window.localStorage.getItem(draftStorageKey)
    if (!stored) return initialForm
    const parsed = JSON.parse(stored) as Partial<FormState>
    return {
      title: typeof parsed.title === 'string' ? parsed.title : '',
      pitch: typeof parsed.pitch === 'string' ? parsed.pitch : '',
      sectorId: typeof parsed.sectorId === 'string' ? parsed.sectorId : '',
      regionId: typeof parsed.regionId === 'string' ? parsed.regionId : '',
    }
  } catch {
    return initialForm
  }
}

function optionLabel(option: ReferenceOption) {
  const lastKey = option.labelKey.split('.').at(-1)
  return lastKey ? lastKey.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : option.slug
}

export default function ProjectCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(readDraft)
  const [sectors, setSectors] = useState<ReferenceOption[]>([])
  const [regions, setRegions] = useState<ReferenceOption[]>([])
  const [referencesLoading, setReferencesLoading] = useState(true)
  const [referencesError, setReferencesError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    window.localStorage.setItem(draftStorageKey, JSON.stringify(form))
  }, [form])

  useEffect(() => {
    let active = true
    Promise.all([getProjectReferenceData('sectors'), getProjectReferenceData('regions')])
      .then(([sectorResponse, regionResponse]) => {
        if (!active) return
        setSectors(sectorResponse.items)
        setRegions(regionResponse.items)
        setReferencesError(null)
      })
      .catch(() => {
        if (active) setReferencesError('Les référentiels ne sont pas disponibles. Vous pouvez réessayer.')
      })
      .finally(() => {
        if (active) setReferencesLoading(false)
      })
    return () => { active = false }
  }, [])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => ({ ...current, [key]: undefined }))
    setError(null)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setError(null)
    setFieldErrors({})
    if (!navigator.onLine) {
      setError('Vous êtes hors ligne. Votre saisie est conservée ; reconnectez-vous puis réessayez.')
      return
    }

    const parsed = projectCreateSchema.safeParse({
      title: form.title,
      pitch: form.pitch,
      ...(form.sectorId ? { sectorId: form.sectorId } : {}),
      ...(form.regionId ? { regionId: form.regionId } : {}),
    })
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof FormState, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (key === 'title' || key === 'pitch' || key === 'sectorId' || key === 'regionId') nextErrors[key] = issue.message
      }
      setFieldErrors(nextErrors)
      setError('Vérifiez les champs signalés avant de continuer.')
      return
    }

    setSaving(true)
    try {
      const project = await createProject(parsed.data)
      window.localStorage.removeItem(draftStorageKey)
      navigate(`/projects/${project.id}/bmc`)
    } catch {
      setError('La création du projet a échoué. Votre saisie est conservée ; veuillez réessayer.')
    } finally {
      setSaving(false)
    }
  }

  const inputClassName = 'rounded-xl border border-border/80 bg-background shadow-2xs focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20'

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-8 sm:px-10">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Nouveau projet</p>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Donnez forme à votre idée</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Votre projet sera créé en brouillon. Vous pourrez compléter le BMC ensuite, sans devoir le remplir maintenant.</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate(-1)} aria-label="Retour à la page précédente" className="h-9 w-fit shrink-0 gap-2 px-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground sm:text-sm">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour
          </Button>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="w-full max-w-3xl rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6">
            <div className="mb-6 flex items-start gap-3 border-b border-border pb-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"><BriefcaseBusiness className="h-5 w-5" aria-hidden="true" /></div>
              <div><h2 className="font-heading text-lg font-bold text-foreground">Informations essentielles</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Présentez clairement le point de départ de votre projet.</p></div>
            </div>

            <form onSubmit={submit} noValidate className="space-y-5" aria-describedby={error ? 'project-form-error' : undefined}>
              <div className="space-y-1.5">
                <Label htmlFor="project-title" className="text-xs font-semibold text-foreground">Titre du projet</Label>
                <Input id="project-title" value={form.title} onChange={(event) => update('title', event.target.value)} maxLength={120} required aria-invalid={Boolean(fieldErrors.title)} aria-describedby={fieldErrors.title ? 'project-title-error' : undefined} placeholder="Ex. Agriculture durable à Madagascar" className={`h-11 ${inputClassName}`} />
                <div className="flex justify-between text-xs text-muted-foreground"><span>3 à 120 caractères</span><span>{form.title.length}/120</span></div>
                {fieldErrors.title && <p id="project-title-error" className="text-xs text-destructive">{fieldErrors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="project-pitch" className="text-xs font-semibold text-foreground">Pitch</Label>
                <Textarea id="project-pitch" value={form.pitch} onChange={(event) => update('pitch', event.target.value)} maxLength={2000} required aria-invalid={Boolean(fieldErrors.pitch)} aria-describedby={fieldErrors.pitch ? 'project-pitch-error' : undefined} rows={6} placeholder="Décrivez le problème et la proposition de valeur…" className={`min-h-40 resize-y ${inputClassName}`} />
                <div className="flex justify-between text-xs text-muted-foreground"><span>10 à 2 000 caractères</span><span>{form.pitch.length}/2000</span></div>
                {fieldErrors.pitch && <p id="project-pitch-error" className="text-xs text-destructive">{fieldErrors.pitch}</p>}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5"><Label htmlFor="project-sector" className="text-xs font-semibold text-foreground">Secteur <span className="font-normal text-muted-foreground">(facultatif)</span></Label><select id="project-sector" value={form.sectorId} onChange={(event) => update('sectorId', event.target.value)} disabled={referencesLoading} aria-invalid={Boolean(fieldErrors.sectorId)} className={`h-11 w-full px-3 text-sm ${inputClassName}`}><option value="">{referencesLoading ? 'Chargement…' : 'Choisir un secteur'}</option>{sectors.map((option) => <option key={option.id} value={option.id}>{optionLabel(option)}</option>)}</select><p className="text-xs text-muted-foreground">Améliorez la découvrabilité du projet.</p></div>
                <div className="space-y-1.5"><Label htmlFor="project-region" className="text-xs font-semibold text-foreground">Région <span className="font-normal text-muted-foreground">(facultatif)</span></Label><select id="project-region" value={form.regionId} onChange={(event) => update('regionId', event.target.value)} disabled={referencesLoading} aria-invalid={Boolean(fieldErrors.regionId)} className={`h-11 w-full px-3 text-sm ${inputClassName}`}><option value="">{referencesLoading ? 'Chargement…' : 'Choisir une région'}</option>{regions.map((option) => <option key={option.id} value={option.id}>{optionLabel(option)}</option>)}</select><p className="text-xs text-muted-foreground">Aidez les talents à vous trouver.</p></div>
              </div>

              {referencesError && <p role="status" className="text-xs text-destructive">{referencesError}</p>}
              {error && <div id="project-form-error" role="alert" className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive sm:text-sm"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span className="font-medium leading-snug">{error}</span></div>}

              <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs leading-relaxed text-muted-foreground sm:max-w-xs sm:text-sm">Le projet sera privé tant qu’il restera en brouillon.</span><Button type="submit" disabled={saving} className="h-9 w-full gap-1.5 rounded-lg px-3.5 text-xs font-medium shadow-none sm:w-auto sm:text-sm">{saving ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" aria-hidden="true" />Création…</> : <><FileText className="h-4 w-4" aria-hidden="true" />Créer le projet</>}</Button></div>
            </form>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-[90px]"><div className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-2xs"><div className="flex items-center gap-2 text-primary"><Lightbulb className="h-4 w-4" aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-wider">Pour bien commencer</p></div><h2 className="mt-3 font-heading text-lg font-bold text-foreground">Un pitch simple et concret</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Expliquez le problème rencontré, la personne concernée et la première solution que vous souhaitez explorer.</p></div><div className="rounded-xl border border-border bg-card p-5 shadow-2xs"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-wider text-primary">Prochaine étape</p></div><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Après la création, vous arriverez directement dans le BMC pour structurer votre modèle économique.</p></div></aside>
        </div>
      </div>
    </DashboardLayout>
  )
}
