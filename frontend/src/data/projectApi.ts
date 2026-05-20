import { fetchMock } from "./api";
import { MOCK_PROJECT_DETAIL, type ProjectDetail } from "./mockProject";

export async function getProjectById(id: string) {
  // Dans la réalité, on ferait un find() ou un appel API ciblé.
  // Ici on retourne toujours le mock pour l'exemple
  return fetchMock({
    success: true,
    data: { ...MOCK_PROJECT_DETAIL, id },
    message: "Project retrieved successfully",
    meta: {}
  });
}

export async function submitProjectApplication(projectId: string, applicationText: string) {
  return fetchMock({
    success: true,
    data: null,
    message: "Application submitted successfully",
    meta: {}
  });
}