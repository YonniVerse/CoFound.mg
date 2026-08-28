import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, BookOpen } from 'lucide-react'
import { BMC_BLOCK_KEYS, bmcResponseSchema, type BmcBlocks, type BmcBlockKey } from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/api-client'

const labels: Record<BmcBlockKey, { title: string; explanation: string; example: string }> = {
  customerSegments: { title: 'Segments clients', explanation: 'Qui bénéficiera directement du projet ?', example: 'Petites coopératives agricoles des Hautes Terres.' },
  valuePropositions: { title: 'Propositions de valeur', explanation: 'Quel problème résolvez-vous et comment ?', example: 'Réduire les pertes post-récolte grâce à un stockage partagé.' },
  channels: { title: 'Canaux', explanation: 'Comment atteindrez-vous vos clients ?', example: 'Vente directe, marchés locaux et partenaires coopératifs.' },
  customerRelationships: { title: 'Relations clients', explanation: 'Quelle relation souhaitez-vous construire ?', example: 'Accompagnement de proximité et suivi mensuel.' },
  revenueStreams: { title: 'Flux de revenus', explanation: 'Comment le projet génère-t-il ses revenus ?', example: 'Abonnement saisonnier et commission sur les ventes.' },
  keyResources: { title: 'Ressources clés', explanation: 'Quelles ressources sont indispensables ?', example: 'Entrepôt, équipe logistique et outil de suivi.' },
  keyActivities: { title: 'Activités clés', explanation: 'Quelles activités devez-vous réaliser ?', example: 'Collecte, contrôle qualité et distribution.' },
  keyPartners: { title: 'Partenaires clés', explanation: 'Avec qui devez-vous travailler ?', example: 'Coopératives, transporteurs et institutions locales.' },
  costStructure: { title: 'Structure de coûts', explanation: 'Quels sont les principaux coûts ?', example: 'Location, transport, maintenance et salaires.' },
}

function BmcSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6" role="status" aria-label="Chargement du BMC">
      <div className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2"><div className="h-3 w-32 animate-pulse rounded bg-muted" /><div className="h-7 w-72 max-w-full animate-pulse rounded bg-muted" /></div>
          <div className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="mt-6 h-2 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{BMC_BLOCK_KEYS.map((key) => <div key={key} className="rounded-xl border border-border bg-card p-5 shadow-2xs"><div className="h-5 w-2/3 animate-pulse rounded bg-muted" /><div className="mt-2 h-4 w-full animate-pulse rounded bg-muted" /><div className="mt-1 h-4 w-5/6 animate-pulse rounded bg-muted" /><div className="mt-5 h-36 animate-pulse rounded-xl bg-muted" /></div>)}</div>
    </div>
  )
}

export default function ProjectBmcPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [blocks, setBlocks] = useState<BmcBlocks | null>(null)
  const [saving, setSaving] = useState<BmcBlockKey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const completion = useMemo(() => blocks ? Math.round(BMC_BLOCK_KEYS.filter((key) => blocks[key].content.trim()).length / BMC_BLOCK_KEYS.length * 100) : 0, [blocks])
  const filledBlocks = blocks ? BMC_BLOCK_KEYS.filter((key) => blocks[key].content.trim()).length : 0

  useEffect(() => {
    let active = true
    apiClient.get(`/projects/${id}/bmc`, bmcResponseSchema).then((response) => { if (active) setBlocks(response.blocks) }).catch(() => { if (active) setError('Impossible de charger le BMC.') })
    return () => { active = false }
  }, [id])

  function update(key: BmcBlockKey, content: string) {
    if (!blocks) return
    const next = { ...blocks, [key]: { ...blocks[key], content } }
    setBlocks(next)
    setSaving(key)
    window.setTimeout(() => { apiClient.patch(`/projects/${id}/bmc`, { block: key, value: next[key] }, bmcResponseSchema).then(() => setSaving(null)).catch(() => { setSaving(null); setError('Brouillon conservé localement ; nouvel essai requis.') }) }, 600)
  }

  if (error && !blocks) {
    return <DashboardLayout><main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10"><div className="mx-auto max-w-3xl rounded-xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-destructive" role="alert"><div className="flex items-start gap-2.5"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{error}</span></div></div></main></DashboardLayout>
  }

  if (!blocks) return <DashboardLayout><main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10"><BmcSkeleton /></main></DashboardLayout>

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Business Model Canvas</p>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Structurez votre projet</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Clarifiez chaque partie de votre modèle économique pour transformer votre idée en projet concret.</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate(-1)} aria-label="Retour à la page précédente" className="group h-9 w-fit shrink-0 gap-2 px-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground sm:text-sm"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />Retour</Button>
          </header>

          <section className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6" aria-label="Progression du BMC">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"><BookOpen className="h-5 w-5" aria-hidden="true" /></div><div><p className="text-sm font-bold text-foreground">Votre modèle économique</p><p className="mt-0.5 text-xs text-muted-foreground">{filledBlocks}/{BMC_BLOCK_KEYS.length} blocs renseignés</p></div></div>
              <span className="text-sm font-bold text-primary">{completion}%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion} aria-label={`Progression du BMC : ${completion}%`}><div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${completion}%` }} /></div>
            {error && <p role="status" className="mt-3 flex items-center gap-2 text-xs font-medium text-destructive"><AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{error}</p>}
          </section>

          <section className="grid gap-4 sm:grid-cols-2" aria-label="Blocs du Business Model Canvas">
            {BMC_BLOCK_KEYS.map((key) => {
              const label = labels[key]
              return <Card key={key} className="overflow-hidden rounded-xl border-border bg-card shadow-2xs transition-shadow hover:shadow-sm">
                <CardHeader className="border-b border-border/60 px-5 py-4">
                  <CardTitle className="text-base font-bold tracking-tight">{label.title}</CardTitle>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{label.explanation}</p>
                </CardHeader>
                <CardContent className="space-y-3 px-5 py-5">
                  <p className="mt-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">Exemple :</span> {label.example}</p>
                  <Textarea aria-label={label.title} value={blocks[key].content} onChange={(event) => update(key, event.target.value)} rows={5} placeholder="Votre réponse…" className="min-h-36 resize-y rounded-xl border border-border/80 bg-background px-4 py-3 text-sm font-medium leading-relaxed shadow-2xs transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" />
                  <div className="flex min-h-4 justify-end text-xs text-muted-foreground" aria-live="polite">{saving === key ? 'Enregistrement…' : `${blocks[key].content.length}/1000`}</div>
                </CardContent>
              </Card>
            })}
          </section>
        </div>
      </main>
    </DashboardLayout>
  )
}
