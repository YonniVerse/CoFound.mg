import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  FolderGit2,
  LayoutGrid,
  MessageSquare,
  Send,
  Users,
  AlertCircle,
} from "lucide-react";
import type { PublicProjectDetail } from "@cofound/shared";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicProjectDetail } from "@/data/projectApi";
import { ReportButton } from "@/components/shared/ReportButton";
import { Avatar } from "@/components/shared/Avatar";

export default function ProjectPublicPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [project, setProject] = useState<PublicProjectDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getPublicProjectDetail(id)
      .then((result) => {
        if (active) setProject(result);
      })
      .catch(() => {
        if (active) setError("Impossible de charger ce projet.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {/* Header Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/projects"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Tous les projets
            </Link>

            {project && <ReportButton targetType="PROJECT" targetId={project.id} />}
          </div>

          {/* Feedback error */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="space-y-4">
              <Card className="rounded-xl border border-border bg-card p-6 shadow-2xs animate-pulse">
                <div className="h-6 w-48 rounded bg-muted mb-3" />
                <div className="h-4 w-full max-w-md rounded bg-muted" />
              </Card>
            </div>
          )}

          {/* Project Details */}
          {!loading && project && (
            <>
              {/* Project Hero / Overview Card */}
              <Card className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        <FolderGit2 className="h-3.5 w-3.5" />
                        Projet public
                      </span>
                    </div>
                    <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {project.title}
                    </h1>
                  </div>

                  <Button asChild size="sm" className="h-9 gap-1.5 rounded-lg px-4 text-xs font-semibold shrink-0">
                    <Link to={`/projects/${project.id}`}>
                      <Send className="h-4 w-4" />
                      Postuler au projet
                    </Link>
                  </Button>
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground pt-2 border-t border-border/50">
                  {project.pitch}
                </p>
              </Card>

              {/* Team Section */}
              <Card className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6 space-y-4">
                <h2 className="font-heading text-base font-bold text-foreground sm:text-lg flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  L'équipe ({project.members.length})
                </h2>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {project.members.map((member) => (
                    <div
                      key={`${member.pseudonym}-${member.role}`}
                      className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/20 p-3"
                    >
                      <Avatar
                        name={member.pseudonym}
                        size="sm"
                        className="h-9 w-9 rounded-full border border-border/60 shrink-0"
                      />
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {member.pseudonym}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Open Positions Section */}
              <Card className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6 space-y-4">
                <h2 className="font-heading text-base font-bold text-foreground sm:text-lg flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Postes ouverts ({project.positions.length})
                </h2>

                {project.positions.length === 0 ? (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Aucun poste actuellement ouvert. Vous pouvez envoyer une candidature spontanée.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {project.positions.map((position) => (
                      <div
                        key={position.id}
                        className="rounded-lg border border-border/80 bg-muted/20 p-4 space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm text-foreground">
                            {position.title}
                          </h3>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {position.description ?? "Description à venir."}
                          </p>
                        </div>

                        <div className="pt-2">
                          <Button asChild size="sm" variant="outline" className="h-8 w-full text-xs font-semibold">
                            <Link to={`/projects/${project.id}`}>Postuler à ce poste</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Posts Section */}
              {project.posts.length > 0 && (
                <Card className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6 space-y-4">
                  <h2 className="font-heading text-base font-bold text-foreground sm:text-lg flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Publications & Annonces
                  </h2>

                  <div className="space-y-3">
                    {project.posts.map((post) => (
                      <div
                        key={post.id}
                        className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-2"
                      >
                        <p className="text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                          <span>{new Date(post.createdAt).toLocaleDateString("fr-FR")}</span>
                          <ReportButton targetType="POST" targetId={post.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Public BMC Section */}
              {Object.keys(project.publicBmc).length > 0 && (
                <Card className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6 space-y-4">
                  <h2 className="font-heading text-base font-bold text-foreground sm:text-lg flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                    Aperçu du Business Model Canvas
                  </h2>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(project.publicBmc).map(([key, block]) => (
                      <div
                        key={key}
                        className="rounded-lg border border-border/70 bg-muted/20 p-3.5 space-y-1"
                      >
                        <h3 className="font-semibold text-xs text-primary">{key}</h3>
                        <p className="text-xs leading-relaxed text-foreground">{block.content}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
