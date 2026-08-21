import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { projectPostCreateSchema, type ProjectPost, type ProjectPostType } from "@cofound/shared";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { createProjectPost, deleteProjectPost, getProjectPosts } from "@/data/projectApi";

const postTypes: Array<{ value: ProjectPostType; label: string }> = [
  { value: "UPDATE", label: "Actualité" },
  { value: "SEEKING_COLLABORATOR", label: "Recherche de collaborateur" },
  { value: "SEEKING_MENTORSHIP", label: "Recherche de mentorat" },
  { value: "SEEKING_FUNDING", label: "Recherche de financement" },
];

export default function ProjectPostsPage() {
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
    getProjectPosts(projectId).then((result) => {
      if (active) setPosts(result.posts);
    }).catch(() => {
      if (active) setError("Impossible de charger les publications du projet.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [projectId]);

  const publish = async () => {
    const parsed = projectPostCreateSchema.safeParse({ type, content });
    if (!parsed.success) {
      setError("Le contenu doit contenir entre 1 et 2 000 caractères.");
      return;
    }
    setBusy(true);
    try {
      await createProjectPost(projectId, parsed.data);
      setContent("");
      const result = await getProjectPosts(projectId);
      setPosts(result.posts);
    } catch {
      setError("La publication n’a pas pu être créée.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (post: ProjectPost) => {
    setBusy(true);
    try {
      await deleteProjectPost(projectId, post.id);
      setPosts((current) => current.filter((item) => item.id !== post.id));
    } catch {
      setError("La publication n’a pas pu être supprimée.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Feed projet</p>
          <h1 className="mt-2 text-3xl font-bold">Publications du projet</h1>
          <p className="mt-2 text-muted-foreground">Partagez les avancées et les besoins de l’équipe sans exposer d’identité civile.</p>
        </header>
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium" htmlFor="post-type">Type de publication</label>
            <select id="post-type" className="rounded-lg border bg-background px-3 py-2" value={type} onChange={(event) => setType(event.target.value as ProjectPostType)}>
              {postTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <label className="text-sm font-medium" htmlFor="post-content">Message</label>
            <textarea id="post-content" className="min-h-32 rounded-lg border bg-background px-3 py-2" value={content} onChange={(event) => setContent(event.target.value)} maxLength={2000} placeholder="Partagez une actualité du projet…" />
            <button type="button" className="self-end rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50" onClick={() => void publish()} disabled={busy || !projectId}>Publier</button>
          </div>
        </section>
        {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <section className="flex flex-col gap-4" aria-live="polite">
          {loading && <p className="text-muted-foreground">Chargement des publications…</p>}
          {!loading && posts.length === 0 && <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">Aucune publication pour le moment.</p>}
          {posts.map((post) => (
            <article key={post.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>{postTypes.find((item) => item.value === post.type)?.label ?? post.type}</span>
                <time dateTime={post.createdAt.toISOString()}>{post.createdAt.toLocaleDateString("fr-FR")}</time>
              </div>
              <p className="mt-3 whitespace-pre-wrap">{post.content}</p>
              <p className="mt-4 text-xs text-muted-foreground">Publié par {post.authorPseudonym}</p>
              <button type="button" className="mt-3 text-sm font-medium text-destructive" onClick={() => void remove(post)} disabled={busy}>Supprimer</button>
            </article>
          ))}
        </section>
      </main>
    </DashboardLayout>
  );
}
