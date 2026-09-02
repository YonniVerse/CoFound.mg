import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  Inbox,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  ownerApplicationsResponseSchema,
  type OwnerApplicationItem,
} from "@cofound/shared";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectNavTabs } from "@/components/project/ProjectNavTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/shared/Avatar";
import { apiClient } from "@/lib/api-client";

const STATUS_LABELS = {
  ALL: "Toutes",
  PENDING: "En attente",
  ACCEPTED: "Acceptées",
  REJECTED: "Refusées",
  WITHDRAWN: "Retirées",
} as const;

type Filter = keyof typeof STATUS_LABELS;

export default function ProjectApplicationsPage() {
  const { id: projectId = "" } = useParams<{ id: string }>();
  const [applications, setApplications] = useState<OwnerApplicationItem[]>([]);
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadApplications = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get(
        `/applications/project/${projectId}`,
        ownerApplicationsResponseSchema,
      );
      setApplications(response.items);
    } catch {
      setError("Impossible de charger les candidatures reçues.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const visibleApplications = useMemo(
    () =>
      filter === "ALL"
        ? applications
        : applications.filter((application) => application.status === filter),
    [applications, filter],
  );

  const handleAccept = async (applicationId: string) => {
    setIsSubmitting(true);
    try {
      const updated = await apiClient.patch(
        `/applications/${applicationId}/accept`,
        {},
        ownerApplicationsResponseSchema.shape.items.element,
      );
      setApplications((current) =>
        current.map((app) => (app.id === applicationId ? updated : app)),
      );
    } catch {
      setError("La candidature n’a pas pu être acceptée.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId || !rejectionReason.trim()) return;

    setIsSubmitting(true);
    try {
      const updated = await apiClient.patch(
        `/applications/${rejectingId}/reject`,
        { rejectionReason: rejectionReason.trim() },
        ownerApplicationsResponseSchema.shape.items.element,
      );
      setApplications((current) =>
        current.map((app) => (app.id === rejectingId ? updated : app)),
      );
      setRejectingId(null);
      setRejectionReason("");
    } catch {
      setError("Le refus n'a pas pu être enregistré.");
    } finally {
      setIsSubmitting(false);
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
                Candidatures reçues
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Consultez et répondez aux talents souhaitant rejoindre votre projet.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(STATUS_LABELS) as Filter[]).map((status) => {
              const count =
                status === "ALL"
                  ? applications.length
                  : applications.filter((a) => a.status === status).length;
              const isSelected = filter === status;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilter(status)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "border border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{STATUS_LABELS[status]}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="rounded-xl border border-border bg-card p-5 shadow-2xs animate-pulse">
                  <div className="h-5 w-40 rounded bg-muted mb-2" />
                  <div className="h-4 w-60 rounded bg-muted mb-4" />
                  <div className="h-16 w-full rounded bg-muted" />
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && visibleApplications.length === 0 && (
            <Card className="rounded-xl border border-dashed border-border/80 bg-card/60 p-10 text-center shadow-2xs">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Inbox className="h-5 w-5" />
              </div>
              <h2 className="mt-3 font-heading text-sm font-bold text-foreground">
                Aucune candidature
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Les candidatures correspondant à ce filtre apparaîtront ici.
              </p>
            </Card>
          )}

          {/* Applications list */}
          {!isLoading && visibleApplications.length > 0 && (
            <div className="space-y-4">
              {visibleApplications.map((application) => {
                const isPending = application.status === "PENDING";
                const isAccepted = application.status === "ACCEPTED";
                const isRejected = application.status === "REJECTED";

                return (
                  <Card
                    key={application.id}
                    className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3.5">
                        <Avatar
                          name={application.candidate.pseudonym}
                          size="md"
                          className="h-11 w-11 rounded-full border border-border/70 shrink-0"
                        />
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h2 className="font-bold text-sm sm:text-base text-foreground">
                              {application.candidate.pseudonym}
                            </h2>
                            <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              {application.candidate.headline ?? "Candidat"}
                            </span>
                          </div>

                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Briefcase className="h-3.5 w-3.5 text-primary" />
                            <span>
                              Poste :{" "}
                              <strong className="text-foreground">
                                {application.position?.title ?? "Candidature spontanée"}
                              </strong>
                            </span>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 self-start rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          isAccepted
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : isRejected
                            ? "border-destructive/20 bg-destructive/10 text-destructive"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {isAccepted && <CheckCircle2 className="h-3 w-3" />}
                        {isRejected && <XCircle className="h-3 w-3" />}
                        {isPending && <Clock className="h-3 w-3" />}
                        {STATUS_LABELS[application.status as Filter] ?? application.status}
                      </span>
                    </div>

                    <div className="mt-4 rounded-lg border border-border/60 bg-muted/20 p-3.5 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {application.message}
                    </div>

                    {application.rejectionReason && (
                      <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                        <strong>Motif du refus :</strong> {application.rejectionReason}
                      </div>
                    )}

                    {isPending && (
                      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border/50 pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setRejectingId(application.id)}
                          disabled={isSubmitting}
                          className="h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive border-border/80"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Refuser
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void handleAccept(application.id)}
                          disabled={isSubmitting}
                          className="h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Accepter dans l’équipe
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Modal / Inline Rejection dialog */}
          {rejectingId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
              <Card className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                <form onSubmit={handleReject} className="space-y-4">
                  <h3 className="font-heading text-base font-bold text-foreground">
                    Motif du refus
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Veuillez indiquer au candidat pourquoi sa candidature n'a pas été retenue.
                  </p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                    placeholder="Ex. Le profil ne correspond pas aux besoins actuels du projet..."
                    className="h-24 w-full rounded-lg border border-border/80 bg-background p-3 text-xs leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRejectingId(null);
                        setRejectionReason("");
                      }}
                      className="h-8 text-xs font-semibold"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      size="sm"
                      disabled={isSubmitting || !rejectionReason.trim()}
                      className="h-8 text-xs font-semibold"
                    >
                      Confirmer le refus
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
