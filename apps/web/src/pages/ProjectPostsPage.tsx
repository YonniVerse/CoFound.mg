import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Plus,
  Send,
  Trash2,
  UserRound,
  AlertCircle,
  Tag,
} from "lucide-react";
import {
  projectPostCreateSchema,
  type ProjectPost,
  type ProjectPostType,
} from "@cofound/shared";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectNavTabs } from "@/components/project/ProjectNavTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createProjectPost, deleteProjectPost, getProjectPosts } from "@/data/projectApi";
import { ReportButton } from "@/components/shared/ReportButton";
import { useI18n } from "@/i18n";

const postTypes: Array<{
  value: ProjectPostType;
  labelKey:
    | "projectsPosts.update"
    | "projectsPosts.collaborator"
    | "projectsPosts.mentorship"
    | "projectsPosts.funding";
}> = [
  { value: "UPDATE", labelKey: "projectsPosts.update" },
  { value: "SEEKING_COLLABORATOR", labelKey: "projectsPosts.collaborator" },
  { value: "SEEKING_MENTORSHIP", labelKey: "projectsPosts.mentorship" },
  { value: "SEEKING_FUNDING", labelKey: "projectsPosts.funding" },
];

export default function ProjectPostsPage() {
  const { t } = useI18n();
  const { id: projectId = "" } = useParams<{ id: string }>();
  const [posts, setPosts] = useState<ProjectPost[]>([]);
  const [type, setType] = useState<ProjectPostType>("UPDATE");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    getProjectPosts(projectId)
      .then((result) => {
        if (active) setPosts(result.posts);
      })
      .catch(() => {
        if (active) setError(t("projectsPosts.loadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId, t]);

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = projectPostCreateSchema.safeParse({ type, content: content.trim() });
    if (!parsed.success) {
      setError(t("projectsPosts.contentError"));
      return;
    }
    setBusy(true);
    setError("");
    try {
      await createProjectPost(projectId, parsed.data);
      setContent("");
      const result = await getProjectPosts(projectId);
      setPosts(result.posts);
    } catch {
      setError(t("projectsPosts.createError"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (post: ProjectPost) => {
    if (!window.confirm("Supprimer cette publication ?")) return;
    setBusy(true);
    try {
      await deleteProjectPost(projectId, post.id);
      setPosts((current) => current.filter((item) => item.id !== post.id));
    } catch {
      setError(t("projectsPosts.deleteError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <ProjectNavTabs projectId={projectId} />

      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
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
                Publications du projet
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Partagez des nouvelles publiques, des recherches de compétences ou d’investissements.
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

          {/* Publish form */}
          <Card className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6">
            <h2 className="font-heading text-base font-bold text-foreground sm:text-lg flex items-center gap-2 mb-3">
              <Plus className="h-4 w-4 text-primary" />
              Nouvelle publication
            </h2>

            <form onSubmit={publish} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="post-type">
                  Type d'annonce
                </label>
                <select
                  id="post-type"
                  className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-xs sm:text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={type}
                  onChange={(event) => setType(event.target.value as ProjectPostType)}
                >
                  {postTypes.map((item) => (
                    <option key={item.value} value={item.value}>
                      {t(item.labelKey)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="post-content">
                  Contenu du message
                </label>
                <Textarea
                  id="post-content"
                  className="min-h-28 resize-y rounded-lg border border-border/80 bg-background p-3 text-xs sm:text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  maxLength={2000}
                  placeholder={t("projectsPosts.placeholder")}
                  required
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Visible dans le fil d'actualité CoFound</span>
                  <span>{content.length}/2000</span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={busy || !content.trim() || !projectId}
                  className="h-9 gap-1.5 rounded-lg px-4 text-xs font-semibold"
                >
                  <Send className="h-3.5 w-3.5" />
                  {busy ? "Publication…" : t("projectsPosts.publish")}
                </Button>
              </div>
            </form>
          </Card>

          {/* Posts List */}
          <div className="space-y-4" aria-live="polite">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Historique des annonces ({posts.length})
            </h2>

            {loading && (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Card key={i} className="rounded-xl border border-border bg-card p-5 shadow-2xs animate-pulse">
                    <div className="h-4 w-32 rounded bg-muted mb-3" />
                    <div className="h-12 w-full rounded bg-muted" />
                  </Card>
                ))}
              </div>
            )}

            {!loading && posts.length === 0 && (
              <Card className="rounded-xl border border-dashed border-border/80 bg-card/60 p-8 text-center shadow-2xs">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("projectsPosts.empty")}
                </p>
              </Card>
            )}

            {!loading &&
              posts.map((post) => (
                <Card key={post.id} className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      <Tag className="h-3 w-3" />
                      {t(
                        postTypes.find((item) => item.value === post.type)?.labelKey ??
                          "projectsPosts.update",
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <time dateTime={post.createdAt.toISOString()}>
                        {post.createdAt.toLocaleDateString("fr-FR")}
                      </time>
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {post.content}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <UserRound className="h-3 w-3" />
                      {t("projectsPosts.publishedBy")} <strong className="text-foreground">{post.authorPseudonym}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <ReportButton targetType="POST" targetId={post.id} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void remove(post)}
                        disabled={busy}
                        className="h-7 px-2 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        {t("projectsPosts.delete")}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
