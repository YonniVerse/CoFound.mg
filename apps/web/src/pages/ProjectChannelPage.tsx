import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getProjectChannelMessages, openProjectChannel, sendProjectChannelMessage } from "@/data/projectChannelApi";
import type { ConversationMessage } from "@cofound/shared";

export default function ProjectChannelPage() {
  const { id: projectId = "" } = useParams<{ id: string }>();
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadMessages = useCallback(async (id: string) => {
    const result = await getProjectChannelMessages(id);
    setMessages(result.items);
  }, []);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    openProjectChannel(projectId)
      .then((conversation) => {
        if (!active) return;
        setConversationId(conversation.id);
        return loadMessages(conversation.id);
      })
      .catch(() => { if (active) setError("Ce canal est réservé aux membres actifs du projet."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadMessages, projectId]);

  useEffect(() => {
    if (!conversationId) return;
    const timer = window.setInterval(() => { void loadMessages(conversationId).catch(() => undefined); }, 10_000);
    return () => window.clearInterval(timer);
  }, [conversationId, loadMessages]);

  const send = async () => {
    const trimmed = body.trim();
    if (!conversationId || !trimmed || trimmed.length > 4_000) return;
    setBusy(true);
    setError("");
    try {
      await sendProjectChannelMessage(conversationId, { body: trimmed });
      setBody("");
      await loadMessages(conversationId);
    } catch {
      setError("Le message n’a pas pu être envoyé.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Espace projet</p>
          <h1 className="mt-2 text-3xl font-bold">Canal de discussion</h1>
          <p className="mt-2 text-muted-foreground">Échangez avec l’équipe. Les messages affichent uniquement les pseudonymes.</p>
        </header>
        {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <section className="flex min-h-[22rem] flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm" aria-live="polite">
          {loading && <p className="text-muted-foreground">Chargement du canal…</p>}
          {!loading && messages.length === 0 && <p className="m-auto text-center text-muted-foreground">Aucun message. Lancez la discussion de l’équipe.</p>}
          {messages.map((message) => (
            <article key={message.id} className="rounded-xl bg-muted/50 p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <strong>{message.authorPseudonym}</strong>
                <time className="text-muted-foreground" dateTime={message.createdAt.toISOString()}>{message.createdAt.toLocaleString("fr-FR")}</time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{message.body}</p>
            </article>
          ))}
        </section>
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <label className="text-sm font-medium" htmlFor="project-message">Votre message</label>
          <textarea id="project-message" className="mt-2 min-h-28 w-full rounded-lg border bg-background px-3 py-2" maxLength={4000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Écrivez à votre équipe…" />
          <button type="button" className="mt-3 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50" onClick={() => void send()} disabled={busy || !body.trim() || !conversationId}>Envoyer</button>
        </section>
      </main>
    </DashboardLayout>
  );
}
