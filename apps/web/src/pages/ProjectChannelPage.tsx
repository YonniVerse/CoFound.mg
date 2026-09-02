import { useCallback, useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Send,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectNavTabs } from "@/components/project/ProjectNavTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/shared/Avatar";
import {
  getProjectChannelMessages,
  openProjectChannel,
  sendProjectChannelMessage,
} from "@/data/projectChannelApi";
import type { ConversationMessage } from "@cofound/shared";
import { ReportButton } from "@/components/shared/ReportButton";

export default function ProjectChannelPage() {
  const { id: projectId = "" } = useParams<{ id: string }>();
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
      .catch(() => {
        if (active) setError("Ce canal est réservé aux membres actifs du projet.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadMessages, projectId]);

  useEffect(() => {
    if (!conversationId) return;
    const timer = window.setInterval(() => {
      void loadMessages(conversationId).catch(() => undefined);
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [conversationId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <ProjectNavTabs projectId={projectId} />

      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <Link
                to={`/projects/${projectId}`}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Retour au projet
              </Link>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Canal de discussion
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Espace d'échange interne réservé aux membres actifs de l'équipe.
              </p>
            </div>
          </div>

          {/* Feedback error */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Chat Container */}
          <Card className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden flex flex-col h-[520px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {loading && (
                <div className="flex h-full items-center justify-center text-xs sm:text-sm text-muted-foreground">
                  Chargement des messages de l’équipe…
                </div>
              )}

              {!loading && messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center p-6">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Aucun message pour le moment</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Lancez la première discussion avec votre équipe pour coordonner votre travail.
                  </p>
                </div>
              )}

              {!loading &&
                messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-3 group">
                    <Avatar
                      name={message.authorPseudonym}
                      size="sm"
                      className="h-8 w-8 rounded-full border border-border/70 shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {message.authorPseudonym}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="rounded-xl bg-muted/40 border border-border/50 px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {message.body}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                        <ReportButton targetType="MESSAGE" targetId={message.id} />
                      </div>
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <div className="border-t border-border/60 bg-card p-3 sm:p-4">
              <form onSubmit={send} className="flex gap-2">
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Écrivez un message à l’équipe… (Entrée pour nouvelle ligne)"
                  maxLength={4000}
                  className="min-h-10 max-h-32 resize-none rounded-lg border border-border/80 bg-background p-2.5 text-xs sm:text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={busy || !body.trim() || !conversationId}
                  className="h-10 px-4 rounded-lg gap-1.5 text-xs font-semibold shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Envoyer</span>
                </Button>
              </form>
            </div>
          </Card>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>
              Les messages au sein de ce canal sont confidentiels et visibles uniquement par les membres actifs du projet.
            </span>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
