import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, BriefcaseBusiness, FileCheck, FileText, Lightbulb } from 'lucide-react'
import { projectCreateSchema } from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
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

  const inputClassName = 'rounded-lg border border-border/80 bg-background shadow-2xs focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary text-xs sm:text-sm'

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-border/60 pb-5">
            <div className="space-y-1">
              <Link
                to="/projects"
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Retour aux projets
              </Link>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Créer un nouveau projet
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Lancez une initiative entrepreneuriale en structurant votre vision pas à pas.
              </p>
            </div>
          </div>

          {/* Stepper Roadmap Card */}
          <Card className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Parcours de création du projet
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 p-2.5 font-semibold text-primary">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">1</span>
                <span className="truncate">Présentation</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-muted-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-[10px] font-bold">2</span>
                <span className="truncate">BMC Strategyzer</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-muted-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-[10px] font-bold">3</span>
                <span className="truncate">Postes ouverts</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-muted-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-[10px] font-bold">4</span>
                <span className="truncate">Publication</span>
              </div>
            </div>
          </Card>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            {/* Form Section */}
            <Card className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6">
              <div className="mb-5 flex items-start gap-3 border-b border-border/50 pb-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-heading text-base font-bold text-foreground">Étape 1 : Informations initiales</h2>
                  <p className="text-xs text-muted-foreground">Donnez un titre percutant et décrivez l'opportunité.</p>
                </div>
              </div>

              <form onSubmit={submit} noValidate className="space-y-4" aria-describedby={error ? 'project-form-error' : undefined}>
                <div className="space-y-1.5">
                  <Label htmlFor="project-title" className="text-xs font-semibold text-foreground">
                    Titre du projet <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="project-title"
                    value={form.title}
                    onChange={(event) => update('title', event.target.value)}
                    maxLength={120}
                    required
                    aria-invalid={Boolean(fieldErrors.title)}
                    placeholder="Ex. Plateforme de valorisation des vanilles de Madagascar"
                    className={`h-10 ${inputClassName}`}
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>3 à 120 caractères</span>
                    <span>{form.title.length}/120</span>
                  </div>
                  {fieldErrors.title && <p className="text-xs text-destructive">{fieldErrors.title}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="project-pitch" className="text-xs font-semibold text-foreground">
                    Pitch & Proposition de valeur <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="project-pitch"
                    value={form.pitch}
                    onChange={(event) => update('pitch', event.target.value)}
                    maxLength={2000}
                    required
                    rows={5}
                    placeholder="Quel est le problème que vous résolvez ? À qui s'adresse cette solution et en quoi est-elle innovante ?"
                    className={`min-h-32 resize-y p-3 ${inputClassName}`}
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>10 à 2 000 caractères</span>
                    <span>{form.pitch.length}/2000</span>
                  </div>
                  {fieldErrors.pitch && <p className="text-xs text-destructive">{fieldErrors.pitch}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="project-sector" className="text-xs font-semibold text-foreground">
                      Secteur d'activité <span className="font-normal text-muted-foreground">(facultatif)</span>
                    </Label>
                    <select
                      id="project-sector"
                      value={form.sectorId}
                      onChange={(event) => update('sectorId', event.target.value)}
                      disabled={referencesLoading}
                      className={`h-10 w-full px-3 ${inputClassName}`}
                    >
                      <option value="">{referencesLoading ? 'Chargement…' : 'Sélectionner un secteur'}</option>
                      {sectors.map((option) => (
                        <option key={option.id} value={option.id}>
                          {optionLabel(option)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="project-region" className="text-xs font-semibold text-foreground">
                      Région d'ancrage <span className="font-normal text-muted-foreground">(facultatif)</span>
                    </Label>
                    <select
                      id="project-region"
                      value={form.regionId}
                      onChange={(event) => update('regionId', event.target.value)}
                      disabled={referencesLoading}
                      className={`h-10 w-full px-3 ${inputClassName}`}
                    >
                      <option value="">{referencesLoading ? 'Chargement…' : 'Sélectionner une région'}</option>
                      {regions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {optionLabel(option)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {referencesError && <p role="status" className="text-xs text-destructive">{referencesError}</p>}
                {error && (
                  <div id="project-form-error" role="alert" className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-border/50 pt-4">
                  <span className="text-[11px] text-muted-foreground">
                    Le projet restera en brouillon privé jusqu'à sa publication.
                  </span>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="h-9 w-full sm:w-auto gap-1.5 rounded-lg px-4 text-xs font-semibold"
                  >
                    {saving ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Création en cours…
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Continuer vers le BMC
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Sidebar Guide */}
            <aside className="space-y-4">
              <Card className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
                  <Lightbulb className="h-4 w-4" />
                  <span>Conseil méthodologique</span>
                </div>
                <h3 className="font-heading text-sm font-bold text-foreground">
                  Un pitch clair et accessible
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Présentez le problème réel constaté sur le terrain, vos bénéficiaires cibles et votre approche distinctive.
                </p>
              </Card>

              <Card className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <FileCheck className="h-4 w-4 text-primary" />
                  <span>Après la création</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Vous accéderez directement à la matrice interactive des 9 blocs Strategyzer pour modéliser votre modèle économique.
                </p>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
