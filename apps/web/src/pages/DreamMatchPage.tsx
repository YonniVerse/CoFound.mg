import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Check, HeartHandshake, Loader2, SlidersHorizontal } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getDreamMatchProfile, getDreamMatchSuggestions, markDreamMatchNotInterested, saveDreamMatchProfile } from '@/data/dreamMatchApi'
import type { DreamMatchSuggestionsResponse, DreamMatchUpsertRequest } from '@cofound/shared'
import { useI18n } from '@/i18n'

const emptyForm: Omit<DreamMatchUpsertRequest, 'consent'> = {
  minAvailability: null,
  preferredTeamSize: null,
  institutionPref: null,
  sectors: [],
  skills: [],
}

const factorLabels = [
  { key: 'skillComplementarity', label: 'Compétences complémentaires', maximum: 50 },
  { key: 'sectorOverlap', label: 'Secteur partagé', maximum: 25 },
  { key: 'availability', label: 'Disponibilité compatible', maximum: 25 },
] as const

export default function DreamMatchPage() {
  const { t } = useI18n()
  const [form, setForm] = useState(emptyForm)
  const [consent, setConsent] = useState(false)
  const [suggestions, setSuggestions] = useState<DreamMatchSuggestionsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null)
  const [excludingTalentId, setExcludingTalentId] = useState<string | null>(null)

  useEffect(() => {
    getDreamMatchProfile()
      .then(async ({ profile }) => {
        if (!profile) return
        setForm({
          minAvailability: profile.minAvailability,
          preferredTeamSize: profile.preferredTeamSize,
          institutionPref: profile.institutionPref,
          sectors: profile.sectors,
          skills: profile.skills,
        })
        try {
          setSuggestions(await getDreamMatchSuggestions({ limit: 10 }))
        } catch {
          setSuggestionsError('Les suggestions seront disponibles après validation de vos préférences.')
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
      setSuggestions(await getDreamMatchSuggestions({ limit: 10 }))
      setSaved(true)
      setSuggestionsError(null)
    } catch {
      setError('Impossible d’enregistrer vos préférences pour le moment.')
    } finally {
      setIsSaving(false)
    }
  }

  const markNotInterested = async (talentId: string) => {
    if (!suggestions || excludingTalentId) return
    const previous = suggestions
    setExcludingTalentId(talentId)
    setSuggestions({ ...suggestions, items: suggestions.items.filter((item) => item.talentId !== talentId) })
    try {
      await markDreamMatchNotInterested(talentId)
    } catch {
      setSuggestions(previous)
      setSuggestionsError('Impossible d’enregistrer ce retour. Réessayez dans un instant.')
    } finally {
      setExcludingTalentId(null)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />Chargement…
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-10">
          <div className="mb-8 flex items-start gap-4">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-primary"><HeartHandshake className="h-6 w-6" /></div>
        <div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Dream-Match</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Décrivez la collaboration que vous recherchez</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Ces préférences servent à proposer des complémentarités. Votre identité et votre genre ne sont jamais exposés dans les suggestions.</p>
            </div>
        </div>
          </div>

          <form onSubmit={submit} className="space-y-6 rounded-xl border border-border/70 bg-card p-5 shadow-2xs sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-foreground">Disponibilité minimale (heures/semaine)</span>
              <Input className="h-11 rounded-xl border border-border/80 bg-card px-4 text-sm font-medium shadow-2xs transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" type="number" min="0" max="168" value={form.minAvailability ?? ''} onChange={(event) => setForm({ ...form, minAvailability: event.target.value ? Number(event.target.value) : null })} />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-foreground">Taille d’équipe souhaitée</span>
              <Input className="h-11 rounded-xl border border-border/80 bg-card px-4 text-sm font-medium shadow-2xs transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" type="number" min="2" max="20" value={form.preferredTeamSize ?? ''} onChange={(event) => setForm({ ...form, preferredTeamSize: event.target.value ? Number(event.target.value) : null })} />
            </label>
        </div>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-foreground">Établissement ou environnement préféré</span>
            <Input className="h-11 rounded-xl border border-border/80 bg-card px-4 text-sm font-medium shadow-2xs transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" maxLength={160} value={form.institutionPref ?? ''} onChange={(event) => setForm({ ...form, institutionPref: event.target.value || null })} placeholder="Ex. école, incubateur, secteur…" />
          </label>
          <label className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-4 text-sm leading-relaxed">
            <input className="mt-0.5 h-4 w-4 rounded border-border accent-primary" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          <span>{t('dreamMatch.consent')}</span>
        </label>
          {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {saved && <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700"><Check className="h-4 w-4" />{t('dreamMatch.saved')}</p>}
          <Button type="submit" disabled={isSaving} className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium shadow-none transition-colors sm:text-sm">{isSaving ? t('dreamMatch.saving') : t('dreamMatch.save')}</Button>
        </form>

          <section aria-labelledby="suggestions-title" className="mt-10 space-y-4">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <div>
                <h2 id="suggestions-title" className="text-xl font-bold tracking-tight text-foreground">Pourquoi ces profils vous sont proposés</h2>
                <p className="mt-1 text-sm text-muted-foreground">Les facteurs sont expliqués sans score numérique et sans identité civile.</p>
              </div>
            </div>
            {suggestionsError && <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">{suggestionsError}</p>}
            {!suggestionsError && suggestions?.items.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">Aucune suggestion pour le moment. Complétez vos préférences pour élargir la recherche.</p>}
        <div className="grid gap-4 md:grid-cols-2">
          {suggestions?.items.map((suggestion) => (
              <article key={suggestion.talentId} className="rounded-xl border border-border/70 bg-card p-5 shadow-2xs">
              <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 font-semibold text-primary" aria-hidden="true">{suggestion.pseudonym.slice(0, 1).toUpperCase()}</div>
                <div className="min-w-0">
                  <h3 className="font-semibold">{suggestion.pseudonym}</h3>
                  {suggestion.headline && <p className="text-sm text-muted-foreground">{suggestion.headline}</p>}
                </div>
              </div>
              {suggestion.bio && <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{suggestion.bio}</p>}
              <div className="mt-5 space-y-3" aria-label={`Facteurs explicatifs pour ${suggestion.pseudonym}`}>
                {factorLabels.map(({ key, label, maximum }) => {
                  const value = suggestion.factors[key]
                  return <div key={key}>
                    <div className="mb-1 flex justify-between text-xs font-medium"><span>{label}</span><span className="text-muted-foreground">{value > 0 ? 'Présent' : 'Non déterminant'}</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.min(100, (value / maximum) * 100)}%` }} /></div>
                  </div>
                })}
              </div>
                <Button type="button" variant="outline" size="sm" onClick={() => void markNotInterested(suggestion.talentId)} disabled={excludingTalentId !== null} className="mt-5 h-9 w-full rounded-lg px-3.5 text-xs font-medium shadow-none transition-colors hover:border-destructive hover:text-destructive disabled:cursor-wait disabled:opacity-60 sm:text-sm" aria-label={`Ne plus proposer ${suggestion.pseudonym}`}>
                  {excludingTalentId === suggestion.talentId ? 'Enregistrement…' : 'Pas intéressé'}
                </Button>
            </article>
          ))}
        </div>
      </section>
        </div>
      </main>
    </DashboardLayout>
  )
}
