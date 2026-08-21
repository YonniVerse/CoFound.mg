import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Check, HeartHandshake, Loader2 } from 'lucide-react'
import { getDreamMatchProfile, saveDreamMatchProfile } from '@/data/dreamMatchApi'
import type { DreamMatchUpsertRequest } from '@cofound/shared'

const emptyForm: Omit<DreamMatchUpsertRequest, 'consent'> = {
  minAvailability: null,
  preferredTeamSize: null,
  institutionPref: null,
  sectors: [],
  skills: [],
}

export default function DreamMatchPage() {
  const [form, setForm] = useState(emptyForm)
  const [consent, setConsent] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDreamMatchProfile()
      .then(({ profile }) => {
        if (profile) {
          setForm({
            minAvailability: profile.minAvailability,
            preferredTeamSize: profile.preferredTeamSize,
            institutionPref: profile.institutionPref,
            sectors: profile.sectors,
            skills: profile.skills,
          })
        }
      })
      .catch(() => setError('Impossible de charger votre profil Dream-Match.'))
      .finally(() => setIsLoading(false))
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!consent) {
      setError('Vous devez consentir à l’utilisation de ces préférences pour le matching.')
      return
    }
    setIsSaving(true)
    setError(null)
    setSaved(false)
    try {
      await saveDreamMatchProfile({ ...form, consent: true })
      setSaved(true)
    } catch {
      setError('Impossible d’enregistrer vos préférences pour le moment.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Chargement…</div>
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-start gap-4">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary"><HeartHandshake className="h-6 w-6" /></div>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Dream-Match</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Décrivez la collaboration que vous recherchez</h1>
          <p className="mt-3 text-muted-foreground">Ces préférences servent à proposer des complémentarités. Votre identité et votre genre ne sont jamais exposés dans les suggestions.</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6 rounded-3xl border bg-card p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">Disponibilité minimale (heures/semaine)
            <input className="w-full rounded-xl border bg-background px-3 py-2" type="number" min="0" max="168" value={form.minAvailability ?? ''} onChange={(event) => setForm({ ...form, minAvailability: event.target.value ? Number(event.target.value) : null })} />
          </label>
          <label className="space-y-2 text-sm font-medium">Taille d’équipe souhaitée
            <input className="w-full rounded-xl border bg-background px-3 py-2" type="number" min="2" max="20" value={form.preferredTeamSize ?? ''} onChange={(event) => setForm({ ...form, preferredTeamSize: event.target.value ? Number(event.target.value) : null })} />
          </label>
        </div>
        <label className="block space-y-2 text-sm font-medium">Établissement ou environnement préféré
          <input className="w-full rounded-xl border bg-background px-3 py-2" maxLength={160} value={form.institutionPref ?? ''} onChange={(event) => setForm({ ...form, institutionPref: event.target.value || null })} placeholder="Ex. école, incubateur, secteur…" />
        </label>
        <label className="flex items-start gap-3 rounded-2xl border bg-muted/30 p-4 text-sm">
          <input className="mt-1 h-4 w-4" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          <span>J’accepte que ces préférences soient utilisées pour calculer des suggestions de collaboration. Je peux retirer ce consentement à tout moment.</span>
        </label>
        {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {saved && <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-700"><Check className="h-4 w-4" />Préférences enregistrées.</p>}
        <button type="submit" disabled={isSaving} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{isSaving ? 'Enregistrement…' : 'Enregistrer mes préférences'}</button>
      </form>
    </main>
  )
}
