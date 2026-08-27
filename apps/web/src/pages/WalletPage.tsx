import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Check, ChevronRight, CreditCard, Landmark, Loader2, Plus, WalletCards } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { walletResponseSchema, type WalletResponse } from '@cofound/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { apiClient } from '@/lib/api-client'

type Operation = 'CREDIT' | 'DEBIT'

const operationCopy: Record<Operation, { title: string; description: string; submit: string }> = {
  CREDIT: { title: 'Créditer le wallet', description: 'Ajouter un montant fictif au solde.', submit: 'Ajouter le crédit' },
  DEBIT: { title: 'Débiter le wallet', description: 'Simuler une dépense ou un engagement.', submit: 'Enregistrer le débit' },
}

function formatAmount(amount: string, currency: string) {
  const numeric = Number(amount)
  if (!Number.isFinite(numeric)) return `${amount} ${currency}`
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(numeric) + ` ${currency}`
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(value)
}

export default function WalletPage() {
  const { organizationId, projectId } = useParams()
  const isProject = Boolean(projectId)
  const ownerId = projectId ?? organizationId ?? ''
  const ownerPath = isProject ? `/wallets/projects/${ownerId}` : `/wallets/organizations/${ownerId}`
  const backPath = isProject ? `/projects/${ownerId}` : `/organizations/${ownerId}/opportunities`
  const ownerLabel = isProject ? 'Wallet du projet' : 'Wallet de l’organisation'
  const [wallet, setWallet] = useState<WalletResponse | null>(null)
  const [operation, setOperation] = useState<Operation | null>(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadWallet = useCallback(async () => {
    if (!ownerId) return
    setLoading(true)
    setError(null)
    try {
      const result = await apiClient.get(ownerPath, walletResponseSchema)
      setWallet(result)
    } catch {
      setError('Le wallet ne peut pas être chargé pour cet espace.')
    } finally {
      setLoading(false)
    }
  }, [ownerId, ownerPath])

  useEffect(() => { void loadWallet() }, [loadWallet])

  const submitOperation = async () => {
    if (!operation || !wallet) return
    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || description.trim().length < 3) {
      setError('Saisissez un montant positif et une description de trois caractères minimum.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const result = await apiClient.post(`${ownerPath}/${operation === 'CREDIT' ? 'credit' : 'debit'}`, { amount: parsedAmount, currency: wallet.currency, description: description.trim() }, walletResponseSchema)
      setWallet(result)
      setOperation(null)
      setAmount('')
      setDescription('')
      setMessage(operation === 'CREDIT' ? 'Crédit fictif enregistré.' : 'Débit fictif enregistré.')
    } catch {
      setError(operation === 'DEBIT' ? 'Le débit n’a pas pu être enregistré. Vérifiez le solde disponible.' : 'Le crédit n’a pas pu être enregistré.')
    } finally {
      setBusy(false)
    }
  }

  const credits = useMemo(() => wallet?.transactions.filter((transaction) => transaction.type === 'CREDIT').reduce((total, transaction) => total + Number(transaction.amount), 0) ?? 0, [wallet])
  const debits = useMemo(() => wallet?.transactions.filter((transaction) => transaction.type === 'DEBIT').reduce((total, transaction) => total + Number(transaction.amount), 0) ?? 0, [wallet])

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-5 py-7 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-7">
          <Link to={backPath} className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l’espace précédent
          </Link>

          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <WalletCards className="h-3.5 w-3.5" /> Wallet fictif
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">{ownerLabel}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Un espace de suivi financier rattaché à {isProject ? 'ce projet' : 'cette organisation'}, jamais à un compte personnel.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Devise active : MGA</div>
          </header>

          {message && <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700"><Check className="h-4 w-4" /> {message}</div>}
          {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

          {loading ? <div className="flex min-h-[360px] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div> : wallet && <>
            <section className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-slate-900 text-primary-foreground shadow-lg">
                <CardContent className="relative p-6 sm:p-8">
                  <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div><p className="text-sm font-medium text-primary-foreground/70">Solde disponible</p><p className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{formatAmount(wallet.balance, wallet.currency)}</p><p className="mt-4 text-xs text-primary-foreground/65">Solde fictif · mis à jour le {formatDate(new Date(wallet.updatedAt))}</p></div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-3"><CreditCard className="h-6 w-6" /></div>
                  </div>
                  <div className="relative mt-10 flex flex-wrap gap-3"><Button onClick={() => setOperation('CREDIT')} className="bg-white text-primary hover:bg-white/90"><Plus className="mr-2 h-4 w-4" /> Créditer</Button><Button onClick={() => setOperation('DEBIT')} variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"><ArrowUpRight className="mr-2 h-4 w-4" /> Débiter</Button></div>
                </CardContent>
              </Card>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Crédits enregistrés</p><p className="mt-2 text-2xl font-bold text-emerald-600">{formatAmount(String(credits), wallet.currency)}</p></div><div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600"><ArrowDownLeft className="h-5 w-5" /></div></CardContent></Card>
                <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Débits enregistrés</p><p className="mt-2 text-2xl font-bold text-foreground">{formatAmount(String(debits), wallet.currency)}</p></div><div className="rounded-xl bg-muted p-3 text-muted-foreground"><ArrowUpRight className="h-5 w-5" /></div></CardContent></Card>
              </div>
            </section>

            {operation && <Card className="border-primary/20 shadow-sm"><CardHeader className="flex flex-row items-start justify-between gap-4"><div><CardTitle>{operationCopy[operation].title}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{operationCopy[operation].description}</p></div><button type="button" onClick={() => setOperation(null)} className="text-sm text-muted-foreground hover:text-foreground">Annuler</button></CardHeader><CardContent className="grid gap-4 md:grid-cols-[220px_1fr_auto] md:items-end"><label className="space-y-2 text-sm font-medium">Montant<input className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" /></label><label className="space-y-2 text-sm font-medium">Description<input className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" value={description} onChange={(event) => setDescription(event.target.value)} placeholder={operation === 'CREDIT' ? 'Ex. Budget de lancement' : 'Ex. Dépense de campagne'} /></label><Button disabled={busy} onClick={() => void submitOperation()}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronRight className="mr-2 h-4 w-4" />}{operationCopy[operation].submit}</Button></CardContent></Card>}

            <Card><CardHeader><div className="flex items-center justify-between gap-3"><div><CardTitle>Activité récente</CardTitle><p className="mt-1 text-sm text-muted-foreground">Les 100 dernières opérations de cet espace.</p></div><Landmark className="h-5 w-5 text-muted-foreground" /></div></CardHeader><CardContent>{wallet.transactions.length === 0 ? <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Aucune opération pour le moment. Le solde apparaîtra ici après le premier crédit fictif.</div> : <div className="divide-y divide-border">{wallet.transactions.map((transaction) => <div key={transaction.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"><div className="flex min-w-0 items-center gap-3"><div className={`rounded-xl p-2.5 ${transaction.type === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>{transaction.type === 'CREDIT' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{transaction.description}</p><p className="text-xs text-muted-foreground">{transaction.type === 'CREDIT' ? 'Crédit' : 'Débit'} · {formatDate(new Date(transaction.createdAt))}</p></div></div><p className={`text-sm font-bold ${transaction.type === 'CREDIT' ? 'text-emerald-600' : 'text-foreground'}`}>{transaction.type === 'CREDIT' ? '+' : '−'} {formatAmount(transaction.amount, transaction.currency)}</p></div>)}</div>}</CardContent></Card>
          </>}
        </div>
      </main>
    </DashboardLayout>
  )
}
