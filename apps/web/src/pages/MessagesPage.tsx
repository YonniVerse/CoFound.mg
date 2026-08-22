import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getMessages, listConversations, sendMessage } from '@/data/messagingApi'
import type { ConversationMessage, ConversationView } from '@cofound/shared'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationView[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function loadConversations() {
    const result = await listConversations()
    setConversations(result)
    setSelectedId((current) => current || result[0]?.id || '')
  }

  async function loadMessages(id: string) {
    if (!id) return
    const result = await getMessages(id)
    setMessages(result.items)
  }

  useEffect(() => {
    let active = true
    const initialLoad = window.setTimeout(() => {
      void loadConversations().catch(() => { if (active) setError('Impossible de charger vos conversations.') }).finally(() => { if (active) setLoading(false) })
    }, 0)
    return () => { active = false; window.clearTimeout(initialLoad) }
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const initialMessages = window.setTimeout(() => {
      void loadMessages(selectedId).catch(() => setError('Impossible de charger les messages.'))
    }, 0)
    const timer = window.setInterval(() => { void loadMessages(selectedId).catch(() => undefined) }, 10_000)
    return () => { window.clearTimeout(initialMessages); window.clearInterval(timer) }
  }, [selectedId])

  async function submit() {
    const trimmed = body.trim()
    if (!selectedId || !trimmed || trimmed.length > 4_000) return
    setBusy(true); setError('')
    try { await sendMessage(selectedId, trimmed); setBody(''); await loadMessages(selectedId) }
    catch { setError('Le message n’a pas pu être envoyé.') }
    finally { setBusy(false) }
  }

  return <DashboardLayout><main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[18rem_1fr]">
    <header className="lg:col-span-2"><p className="text-sm font-semibold uppercase tracking-wide text-primary">Messagerie</p><h1 className="mt-2 text-3xl font-bold">Vos conversations</h1><p className="mt-2 text-muted-foreground">Les échanges affichent uniquement les pseudonymes.</p></header>
    {error && <p role="alert" className="lg:col-span-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <aside className="rounded-2xl border bg-card p-3"><h2 className="px-3 py-2 text-sm font-semibold">Conversations</h2>{loading && <p className="p-3 text-sm text-muted-foreground">Chargement…</p>}{!loading && conversations.length === 0 && <p className="p-3 text-sm text-muted-foreground">Aucune conversation.</p>}{conversations.map((conversation) => <button key={conversation.id} type="button" className={`w-full rounded-xl px-3 py-3 text-left text-sm ${selectedId === conversation.id ? 'bg-primary/10 font-semibold' : 'hover:bg-muted'}`} onClick={() => setSelectedId(conversation.id)}>{conversation.type === 'PROJECT' ? 'Canal projet' : 'Conversation directe'}<span className="mt-1 block text-xs text-muted-foreground">{conversation.createdAt.toLocaleDateString('fr-FR')}</span></button>)}</aside>
    <section className="flex min-h-[30rem] flex-col rounded-2xl border bg-card p-5" aria-live="polite"><div className="flex-1 space-y-3">{messages.length === 0 ? <p className="text-sm text-muted-foreground">Sélectionnez une conversation.</p> : messages.map((message) => <article key={message.id} className="rounded-xl bg-muted/50 p-3"><div className="flex justify-between gap-3 text-sm"><strong>{message.authorPseudonym}</strong><time className="text-xs text-muted-foreground">{message.createdAt.toLocaleString('fr-FR')}</time></div><p className="mt-2 whitespace-pre-wrap text-sm">{message.body}</p></article>)}</div><div className="mt-5 flex gap-2"><textarea className="min-h-20 flex-1 rounded-lg border bg-background px-3 py-2" maxLength={4000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Écrivez un message…"/><button type="button" className="self-end rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50" onClick={() => void submit()} disabled={busy || !selectedId || !body.trim()}>Envoyer</button></div></section>
  </main></DashboardLayout>
}
