import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ownerApplicationsResponseSchema,
  type OwnerApplicationItem,
} from "@cofound/shared";
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
  const projectId = window.location.pathname.split("/")[2] ?? "";
  const [applications, setApplications] = useState<OwnerApplicationItem[]>([]);
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
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
    const load = window.setTimeout(() => void loadApplications(), 0);
    return () => window.clearTimeout(load);
  }, [loadApplications]);

  const visibleApplications = useMemo(
    () =>
      filter === "ALL"
        ? applications
        : applications.filter((application) => application.status === filter),
    [applications, filter],
  );

  const decide = async (applicationId: string, action: "accept" | "reject") => {
    const rejectionReason =
      action === "reject"
        ? window.prompt("Motif du refus (obligatoire)")?.trim()
        : undefined;
    if (action === "reject" && !rejectionReason) return;

    try {
      const updated = await apiClient.patch(
        `/applications/${applicationId}/${action}`,
        action === "reject" ? { rejectionReason } : {},
        ownerApplicationsResponseSchema.shape.items.element,
      );
      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId ? updated : application,
        ),
      );
    } catch {
      setError("La décision n’a pas pu être enregistrée.");
    }
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <p className="text-sm font-medium text-slate-500">Espace projet</p>
        <h1 className="text-3xl font-semibold text-slate-900">Candidatures reçues</h1>
        <p className="mt-2 text-slate-600">
          Consultez les profils pseudonymisés et traitez les candidatures de votre projet.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Filtrer les candidatures">
        {(Object.keys(STATUS_LABELS) as Filter[]).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-full px-4 py-2 text-sm ${
              filter === status
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </nav>

      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
      {isLoading && <p className="text-slate-500">Chargement des candidatures…</p>}
      {!isLoading && visibleApplications.length === 0 && (
        <section className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <h2 className="text-lg font-medium text-slate-900">Aucune candidature</h2>
          <p className="mt-2 text-slate-600">Les nouvelles candidatures apparaîtront ici.</p>
        </section>
      )}

      <section className="space-y-4">
        {visibleApplications.map((application) => (
          <article key={application.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">{application.candidate.pseudonym}</h2>
                <p className="text-sm text-slate-600">{application.candidate.headline ?? "Profil candidat"}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {application.position?.title ?? "Candidature spontanée"}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {STATUS_LABELS[application.status as Filter] ?? application.status}
              </span>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-slate-700">{application.message}</p>
            {application.rejectionReason && (
              <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                Motif : {application.rejectionReason}
              </p>
            )}
            {application.status === "PENDING" && (
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void decide(application.id, "accept")}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Accepter
                </button>
                <button
                  type="button"
                  onClick={() => void decide(application.id, "reject")}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Refuser
                </button>
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
