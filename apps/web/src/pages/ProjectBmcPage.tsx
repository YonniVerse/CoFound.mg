import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BMC_BLOCK_KEYS, bmcResponseSchema, type BmcBlocks, type BmcBlockKey } from '@cofound/shared'
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

export default function ProjectBmcPage() {
  const { id = '' } = useParams()
  const [blocks, setBlocks] = useState<BmcBlocks | null>(null)
  const [saving, setSaving] = useState<BmcBlockKey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const completion = useMemo(() => blocks ? Math.round(BMC_BLOCK_KEYS.filter((key) => blocks[key].content.trim()).length / 9 * 100) : 0, [blocks])

  useEffect(() => { let active = true; apiClient.get(`/projects/${id}/bmc`, bmcResponseSchema).then((response) => { if (active) setBlocks(response.blocks) }).catch(() => { if (active) setError('Impossible de charger le BMC.') }); return () => { active = false } }, [id])

  function update(key: BmcBlockKey, content: string) {
    if (!blocks) return
    const next = { ...blocks, [key]: { ...blocks[key], content } }
    setBlocks(next)
    setSaving(key)
    window.setTimeout(() => { apiClient.patch(`/projects/${id}/bmc`, { block: key, value: next[key] }, bmcResponseSchema).then(() => setSaving(null)).catch(() => { setSaving(null); setError('Brouillon conservé localement ; nouvel essai requis.') }) }, 600)
  }

  if (error && !blocks) return <main className="p-6"><p role="alert">{error}</p></main>
  if (!blocks) return <main className="p-6">Chargement du BMC…</main>
  return <main className="mx-auto max-w-6xl px-4 py-8"><header className="mb-6"><p className="text-sm text-muted-foreground">Business Model Canvas</p><h1 className="text-3xl font-semibold">Structurez votre projet</h1><p className="mt-2">{BMC_BLOCK_KEYS.filter((key) => blocks[key].content.trim()).length}/9 blocs remplis · {completion}%</p>{error && <p role="status" className="mt-2 text-sm text-destructive">{error}</p>}</header><section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{BMC_BLOCK_KEYS.map((key) => <article key={key} className="rounded-xl border bg-card p-4"><h2 className="font-medium">{labels[key].title}</h2><p className="mt-1 text-sm text-muted-foreground">{labels[key].explanation}</p><p className="mt-2 text-xs italic text-muted-foreground">Exemple : {labels[key].example}</p><textarea aria-label={labels[key].title} value={blocks[key].content} onChange={(event) => update(key, event.target.value)} rows={5} className="mt-3 w-full rounded-md border bg-background p-2" placeholder="Votre réponse…" />{saving === key && <p className="mt-1 text-xs text-muted-foreground">Enregistrement…</p>}</article>)}</section></main>
}
