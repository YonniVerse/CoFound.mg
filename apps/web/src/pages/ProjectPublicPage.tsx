import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { PublicProjectDetail } from "@cofound/shared";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getPublicProjectDetail } from "@/data/projectApi";
import { ReportButton } from "@/components/shared/ReportButton";

export default function ProjectPublicPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [project, setProject] = useState<PublicProjectDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;
    getPublicProjectDetail(id).then((result) => {
      if (active) setProject(result);
    }).catch(() => {
      if (active) setError("Impossible de charger ce projet.");
    });
    return () => { active = false; };
  }, [id]);

  return <DashboardLayout><main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
    {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-destructive">{error}</p>}
    {!project && !error && <p className="text-muted-foreground">Chargement du projet…</p>}
    {project && <>
      <header><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wide text-primary">Projet</p><h1 className="mt-2 text-4xl font-bold">{project.title}</h1></div><ReportButton targetType="PROJECT" targetId={project.id} /></div><p className="mt-3 text-lg text-muted-foreground">{project.pitch}</p></header>
      <section className="rounded-2xl border bg-card p-5"><h2 className="text-xl font-semibold">Équipe</h2><div className="mt-4 flex flex-wrap gap-3">{project.members.map((member) => <span key={`${member.pseudonym}-${member.role}`} className="rounded-full bg-muted px-4 py-2 text-sm">{member.pseudonym} · {member.role}</span>)}</div></section>
      <section className="rounded-2xl border bg-card p-5"><h2 className="text-xl font-semibold">Postes ouverts</h2>{project.positions.length === 0 ? <p className="mt-3 text-muted-foreground">Aucun poste ouvert.</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2">{project.positions.map((position) => <article key={position.id} className="rounded-xl border p-4"><h3 className="font-semibold">{position.title}</h3><p className="mt-1 text-sm text-muted-foreground">{position.description ?? "Description à venir."}</p></article>)}</div>}</section>
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-xl font-semibold">Publications</h2>
        {project.posts.length === 0 ? <p className="mt-3 text-muted-foreground">Aucune publication.</p> : <div className="mt-4 space-y-3">
          {project.posts.map((post) => <article key={post.id} className="rounded-xl border p-4">
            <p className="whitespace-pre-wrap">{post.content}</p>
            <div className="mt-2 flex items-center justify-between">
              <time className="text-xs text-muted-foreground" dateTime={post.createdAt.toISOString()}>{post.createdAt.toLocaleDateString("fr-FR")}</time>
              <ReportButton targetType="POST" targetId={post.id} />
            </div>
          </article>)}
        </div>}
      </section>
      {Object.keys(project.publicBmc).length > 0 && <section className="rounded-2xl border bg-card p-5"><h2 className="text-xl font-semibold">Business Model Canvas public</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(project.publicBmc).map(([key, block]) => <article key={key} className="rounded-xl border p-4"><h3 className="font-semibold">{key}</h3><p className="mt-1 text-sm text-muted-foreground">{block.content}</p></article>)}</div></section>}
    </>}
  </main></DashboardLayout>;
}
