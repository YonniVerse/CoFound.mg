import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, BriefcaseBusiness, FileText, Lightbulb } from 'lucide-react'
import { projectCreateSchema } from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/api-client'

export default function ProjectCreatePage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [pitch, setPitch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const parsed = projectCreateSchema.safeParse({ title, pitch })
    if (!parsed.success) {
      setError('Le titre doit contenir au moins 3 caractères et le pitch au moins 10 caractères.')
      return
    }
    setSaving(true)
    try {
      const project = await apiClient.post<{ id: string }>('/projects', parsed.data)
      navigate(`/projects/${project.id}`)
    } catch {
      setError('La création du projet a échoué. Veuillez réessayer.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-8 sm:px-10">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Nouveau projet</p>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Donnez forme à votre idée</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Commencez par un titre et un pitch. Vous pourrez compléter le BMC ensuite.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            aria-label="Retour à la page précédente"
            className="group h-9 w-fit shrink-0 gap-2 px-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            Retour
          </Button>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="w-full max-w-3xl rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6">
            <div className="mb-6 flex items-start gap-3 border-b border-border pb-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">Informations essentielles</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Présentez clairement le point de départ de votre projet.</p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="project-title" className="text-xs font-semibold text-foreground">
                  Titre du projet
                </Label>
                <Input
                  id="project-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={120}
                  required
                  placeholder="Ex. Agriculture durable à Madagascar"
                  className="h-11 rounded-xl border border-border/80 bg-background px-4 text-sm font-medium shadow-2xs transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
                <div className="flex justify-end text-xs text-muted-foreground">
                  <span>{title.length}/120</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="project-pitch" className="text-xs font-semibold text-foreground">
                  Pitch
                </Label>
                <Textarea
                  id="project-pitch"
                  value={pitch}
                  onChange={(event) => setPitch(event.target.value)}
                  maxLength={2000}
                  required
                  rows={6}
                  placeholder="Décrivez le problème et la proposition de valeur…"
                  className="min-h-40 resize-y rounded-xl border border-border/80 bg-background px-4 py-3 text-sm font-medium leading-relaxed shadow-2xs transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
                <div className="flex justify-end text-xs text-muted-foreground">
                  <span>{pitch.length}/2000</span>
                </div>
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive sm:text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="font-medium leading-snug">{error}</span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs leading-relaxed text-muted-foreground sm:max-w-xs sm:text-sm">
                  Le projet sera créé en brouillon. Vous pourrez le compléter à votre rythme.
                </span>
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-9 w-full gap-1.5 rounded-lg px-3.5 text-xs font-medium shadow-none transition-colors sm:w-auto sm:text-sm"
                >
                  {saving ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Création…
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      Créer le projet
                    </>
                  )}
                </Button>
              </div>
            </form>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-[90px]">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-primary">
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-wider">Pour bien commencer</p>
              </div>
              <h2 className="mt-3 font-heading text-lg font-bold text-foreground">Un pitch simple et concret</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Expliquez le problème rencontré, la personne concernée et la première solution que vous souhaitez explorer.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-2xs">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Prochaine étape</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Après la création, vous pourrez structurer votre modèle économique et inviter des cofondateurs.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  )
}
