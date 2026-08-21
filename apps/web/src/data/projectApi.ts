import { fetchMock } from "./api";
import { MOCK_PROJECT_DETAIL } from "./mockProject";
import { projectMembersResponseSchema, type ProjectRoleInput } from "@cofound/shared";
import { apiClient } from "@/lib/api-client";

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

export async function submitProjectApplication(_projectId: string, _applicationText: string) {
  return fetchMock({
    success: true,
    data: null,
    message: "Application submitted successfully",
    meta: {}
  });
}

export function getProjectMembers(projectId: string) {
  return apiClient.get(`/projects/${projectId}/members`, projectMembersResponseSchema);
}

export function updateProjectMemberRole(projectId: string, memberId: string, role: ProjectRoleInput) {
  return apiClient.patch(`/projects/${projectId}/members/${memberId}/role`, { role });
}

export function leaveProject(projectId: string) {
  return apiClient.request(`/projects/${projectId}/members/me`, { method: "DELETE" });
}

export function addProjectMember(projectId: string, input: { userId: string; role: ProjectRoleInput }) {
  return apiClient.post(`/projects/${projectId}/members`, input);
}
