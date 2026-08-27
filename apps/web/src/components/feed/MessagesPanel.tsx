import { useCallback, useEffect, useState } from 'react'
import { getMessages, listConversations, sendMessage } from '@/data/messagingApi'
import type { ConversationMessage, ConversationView } from '@cofound/shared'

export function MessagesPanel() {
  const [conversations, setConversations] = useState<ConversationView[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const loadConversations = useCallback(async () => {
    const result = await listConversations()
    setConversations(result)
    setSelectedId((current) => current || result[0]?.id || '')
  }, [])

  const loadMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return
    const result = await getMessages(conversationId)
    setMessages(result.items)
  }, [])

  useEffect(() => {
    let active = true
    const initialLoad = window.setTimeout(() => {
      void loadConversations()
        .catch(() => { if (active) setError('Impossible de charger vos conversations.') })
        .finally(() => { if (active) setLoading(false) })
    }, 0)
    return () => { active = false; window.clearTimeout(initialLoad) }
  }, [loadConversations])

  useEffect(() => {
    if (!selectedId) return
    const initialMessages = window.setTimeout(() => {
      void loadMessages(selectedId).catch(() => setError('Impossible de charger les messages.'))
    }, 0)
    const timer = window.setInterval(() => { void loadMessages(selectedId).catch(() => undefined) }, 10_000)
    return () => { window.clearTimeout(initialMessages); window.clearInterval(timer) }
  }, [loadMessages, selectedId])

  async function submit() {
    const trimmed = body.trim()
    if (!selectedId || !trimmed || trimmed.length > 4_000) return
    setBusy(true)
    setError('')
    try {
      await sendMessage(selectedId, trimmed)
      setBody('')
      await loadMessages(selectedId)
    } catch {
      setError('Le message n’a pas pu être envoyé.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex min-h-[30rem] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xs" aria-label="Messagerie">
      <header className="border-b border-border/70 px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Messagerie</p>
        <h2 className="mt-1 text-xl font-bold text-foreground">Vos conversations</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Les échanges affichent uniquement les pseudonymes.</p>
      </header>
      {error && <p role="alert" className="border-b border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">{error}</p>}
      <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr]">
        <div className="border-b border-border/70 p-3">
          <p className="px-2 pb-2 text-xs font-semibold text-muted-foreground">Conversations</p>
          {loading && <p className="px-2 py-2 text-xs text-muted-foreground">Chargement…</p>}
          {!loading && conversations.length === 0 && <p className="px-2 py-2 text-xs text-muted-foreground">Aucune conversation.</p>}
          <div className="flex max-h-32 flex-col gap-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <button key={conversation.id} type="button" className={`rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${selectedId === conversation.id ? 'bg-primary/10 font-semibold text-primary' : 'text-foreground hover:bg-muted'}`} onClick={() => setSelectedId(conversation.id)}>
                {conversation.type === 'PROJECT' ? 'Canal projet' : 'Conversation directe'}
                <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">{conversation.createdAt.toLocaleDateString('fr-FR')}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex min-h-0 flex-col p-3" aria-live="polite">
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {messages.length === 0 ? <p className="py-5 text-center text-xs text-muted-foreground">Sélectionnez une conversation.</p> : messages.map((message) => (
              <article key={message.id} className="rounded-xl bg-muted/50 p-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <strong className="truncate">{message.authorPseudonym}</strong>
                  <time className="shrink-0 text-[10px] text-muted-foreground">{message.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</time>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-foreground">{message.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-3 flex gap-2 border-t border-border/70 pt-3">
            <textarea className="min-h-16 min-w-0 flex-1 resize-none rounded-lg border border-border bg-background px-2.5 py-2 text-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" maxLength={4000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Écrivez un message…" aria-label="Écrivez un message" />
            <button type="button" className="self-end rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50" onClick={() => void submit()} disabled={busy || !selectedId || !body.trim()}>Envoyer</button>
          </div>
        </div>
      </div>
    </section>
  )
}
