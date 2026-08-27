import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Send } from 'lucide-react'
import { opportunitySchema, privateTalentProfileSchema, type Opportunity } from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/api-client'

function formatDate(value: Date | null) {
  if (!value) return 'Date non précisée'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(value)
}

export default function OpportunityDetailPage() {
  const { opportunityId } = useParams<{ opportunityId: string }>()
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!opportunityId) return
      try {
        const items = await apiClient.get<unknown[]>('/opportunities')
        const result = items.map((item) => opportunitySchema.parse(item)).find((item) => item.id === opportunityId)
        if (!result) throw new Error('NOT_FOUND')
        if (mounted) setOpportunity(result)
      } catch {
        if (mounted) setError('Cette opportunité n’est pas disponible ou a été retirée.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [opportunityId])

  const submitApplication = async () => {
    if (!opportunityId || message.trim().length < 10) {
      setError('Votre message doit contenir au moins 10 caractères.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const profile = await apiClient.get('/me/profile', privateTalentProfileSchema)
      await apiClient.post(`/opportunities/${opportunityId}/applications`, {
        applicantType: 'TALENT',
        applicantId: profile.user.id,
        message: message.trim(),
      })
      setSubmitted(true)
    } catch {
      setError('Impossible d’envoyer la candidature. Vérifiez votre profil ou votre candidature existante.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-10">
        <Link to="/search" className="inline-flex items-center text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux opportunités
        </Link>

        {loading && <p className="text-sm text-muted-foreground">Chargement de l’opportunité…</p>}
        {error && !opportunity && <Card><CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent></Card>}

        {opportunity && (
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <Card className="overflow-hidden">
              <CardHeader className="space-y-4 border-b border-border/70 bg-card/80">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Badge variant="muted" className="mb-3">Opportunité publiée</Badge>
                    <CardTitle className="font-heading text-2xl tracking-tight sm:text-3xl">{opportunity.title}</CardTitle>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm leading-7 text-muted-foreground">{opportunity.description}</p>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><CalendarDays className="h-4 w-4" /> Date limite</div>
                    <p className="mt-2 text-sm font-semibold text-foreground">{formatDate(opportunity.deadline)}</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Clock3 className="h-4 w-4" /> Places disponibles</div>
                    <p className="mt-2 text-sm font-semibold text-foreground">{opportunity.seats ?? 'Selon sélection'}</p>
                  </div>
                </div>
                {opportunity.eligibility && (
                  <section className="space-y-2">
                    <h2 className="font-heading text-lg font-bold text-foreground">Conditions de participation</h2>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{opportunity.eligibility}</p>
                  </section>
                )}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
                  Votre identité reste protégée pendant la découverte. Elle ne peut être révélée qu’après une mise en relation acceptée selon les règles de confidentialité de CoFound.mg.
                </div>
              </CardContent>
            </Card>

            <Card className="h-fit lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="font-heading text-xl">Candidater</CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">Présentez votre motivation et la valeur que vous pouvez apporter.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {submitted ? (
                  <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="text-sm font-semibold">Candidature envoyée.</p>
                    <p className="text-xs leading-5">Vous pourrez suivre son évolution dans « Mes candidatures ».</p>
                    <Link to="/my-applications" className="inline-flex text-sm font-semibold underline underline-offset-4">Voir mes candidatures</Link>
                  </div>
                ) : (
                  <>
                    <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Expliquez votre motivation et votre contribution…" className="min-h-36 resize-y" />
                    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                    <Button type="button" className="w-full gap-2" disabled={submitting || opportunity.status !== 'PUBLISHED'} onClick={() => void submitApplication()}>
                      <Send className="h-4 w-4" /> {submitting ? 'Envoi…' : 'Envoyer ma candidature'}
                    </Button>
                    <p className="text-center text-xs leading-5 text-muted-foreground">Une seule candidature par talent et par opportunité.</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}
