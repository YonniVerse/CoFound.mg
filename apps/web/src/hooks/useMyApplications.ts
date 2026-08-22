import { useState, useEffect, useCallback } from "react";
import { apiClient, ApiClientError } from "@/lib/api-client";
import {
  myApplicationsResponseSchema,
  applicationItemSchema,
  type ApplicationItem,
  type CreateApplicationInput,
} from "@cofound/shared";

function messageForApplicationError(error: unknown): string {
  if (!(error instanceof ApiClientError)) return "Une erreur est survenue. Réessaie dans quelques instants.";
  switch (error.code as string) {
    case "APPLICATION_ALREADY_EXISTS": return "Tu as déjà une candidature en attente pour ce projet.";
    case "POSITION_CLOSED": return "Ce poste n’est plus ouvert. Choisis un autre poste ou envoie une candidature spontanée.";
    case "PROJECT_CLOSED": return "Ce projet n’accepte plus de candidatures.";
    case "NOT_ELIGIBLE": return "Ton profil n’est pas éligible pour candidater à ce projet.";
    case "CANNOT_WITHDRAW": return "Seules les candidatures en attente peuvent être retirées.";
    default: return "La demande n’a pas pu être traitée. Réessaie dans quelques instants.";
  }
}

export function useMyApplications() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get("/applications/me", myApplicationsResponseSchema);
      setApplications(response.items);
    } catch (err) {
      setApplications([]);
      setError(messageForApplicationError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = window.setTimeout(() => void fetchApplications(), 0);
    return () => window.clearTimeout(load);
  }, [fetchApplications]);

  const applyToProject = async (input: CreateApplicationInput): Promise<ApplicationItem> => {
    try {
      const response = await apiClient.post("/applications", input, applicationItemSchema);
      setApplications((prev) => [response, ...prev]);
      return response;
    } catch (err) {
      throw new Error(messageForApplicationError(err), { cause: err });
    }
  };

  const withdrawApplication = async (applicationId: string) => {
    try {
      const updated = await apiClient.patch(`/applications/${applicationId}/withdraw`, {}, applicationItemSchema);
      setApplications((prev) => prev.map((app) => (app.id === applicationId ? updated : app)));
    } catch (err) {
      throw new Error(messageForApplicationError(err), { cause: err });
    }
  };

  return { applications, isLoading, error, fetchApplications, applyToProject, withdrawApplication };
}
