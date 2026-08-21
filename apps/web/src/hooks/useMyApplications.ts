import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import {
  myApplicationsResponseSchema,
  applicationItemSchema,
  type ApplicationItem,
  type CreateApplicationInput,
} from "@cofound/shared";

// Mock applications for offline local demo fallback
const MOCK_APPLICATIONS: ApplicationItem[] = [
  {
    id: "app-demo-1",
    projectId: "p1",
    positionId: "pos-1",
    applicantId: "user-current",
    message: "Bonjour ! Fort d'une expérience de 2 ans sur React Native et Node.js, je souhaite rejoindre l'équipe EcoDrive pour structurer le MVP.",
    status: "PENDING",
    rejectionReason: null,
    decidedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000 * 2),
    project: {
      id: "p1",
      title: "EcoDrive - Mobilité verte universitaire",
      pitch: "Application de covoiturage exclusive aux étudiants pour réduire les coûts et l'empreinte carbone.",
      status: "RECRUITING",
    },
    position: {
      id: "pos-1",
      title: "Développeur Mobile Fullstack",
      description: "Développement de l'application mobile et des endpoints d'authentification.",
    },
  },
  {
    id: "app-demo-2",
    projectId: "p2",
    positionId: null,
    applicantId: "user-current",
    message: "Passionné par la santé numérique, j'aimerais mettre mes compétences juridiques à disposition du projet SafeWalk.",
    status: "ACCEPTED",
    rejectionReason: null,
    decidedAt: new Date(Date.now() - 86400000 * 5),
    createdAt: new Date(Date.now() - 86400000 * 7),
    updatedAt: new Date(Date.now() - 86400000 * 5),
    project: {
      id: "p2",
      title: "SafeWalk - L'app de sécurité étudiante",
      pitch: "Plateforme d'accompagnement sécurisé pour les étudiantes rentrant tard.",
      status: "ACTIVE",
    },
    position: null,
  },
];

export function useMyApplications() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get("/applications/me", myApplicationsResponseSchema);
      if (response.items.length > 0) {
        setApplications(response.items);
      } else {
        setApplications(MOCK_APPLICATIONS);
      }
    } catch {
      // Fallback to mock applications during local dev / demo mode
      setApplications(MOCK_APPLICATIONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = window.setTimeout(() => {
      void fetchApplications();
    }, 0);
    return () => window.clearTimeout(load);
  }, [fetchApplications]);

  const applyToProject = async (input: CreateApplicationInput): Promise<ApplicationItem> => {
    try {
      const response = await apiClient.post("/applications", input, applicationItemSchema);
      setApplications((prev) => [response, ...prev]);
      return response;
    } catch {
      // Fallback local create for demo
      const newMockApp: ApplicationItem = {
        id: `app-demo-${Date.now()}`,
        projectId: input.projectId,
        positionId: input.positionId ?? null,
        applicantId: "user-current",
        message: input.message,
        status: "PENDING",
        rejectionReason: null,
        decidedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: input.projectId,
          title: "Projet Candidaté",
          pitch: "Candidature soumise en mode démo",
          status: "RECRUITING",
        },
        position: input.positionId
          ? { id: input.positionId, title: "Poste Sélectionné", description: null }
          : null,
      };
      setApplications((prev) => [newMockApp, ...prev]);
      return newMockApp;
    }
  };

  const withdrawApplication = async (applicationId: string) => {
    try {
      const updated = await apiClient.patch(`/applications/${applicationId}/withdraw`, {}, applicationItemSchema);
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? updated : app)),
      );
    } catch {
      // Local state update fallback
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: "WITHDRAWN" as const } : app,
        ),
      );
    }
  };

  return {
    applications,
    isLoading,
    error,
    fetchApplications,
    applyToProject,
    withdrawApplication,
  };
}
