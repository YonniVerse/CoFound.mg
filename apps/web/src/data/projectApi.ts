import {
  ownedProjectsResponseSchema,
  projectCreateResponseSchema,
  publicReferenceListSchema,
  type ProjectCreateInput,
  projectMembersResponseSchema,
  projectPositionsResponseSchema,
  projectPostFeedResponseSchema,
  projectPrivateDetailSchema,
  projectPostsResponseSchema,
  projectTasksResponseSchema,
  publicProjectDetailSchema,
  type CreateProjectTaskInput,
  type ProjectPostFeedResponse,
  type ProjectPostFeedQuery,
  type UpdateProjectTaskInput,
  type ProjectRoleInput,
  type ProjectPostCreateInput,
  type ProjectPostUpdateInput,
} from '@cofound/shared'
import { apiClient } from '@/lib/api-client'

export function getOwnedProjects() {
  return apiClient.get('/projects/mine', ownedProjectsResponseSchema)
}

export function createProject(input: ProjectCreateInput) {
  return apiClient.post('/projects', input, projectCreateResponseSchema)
}

export function getProjectReferenceData(kind: 'sectors' | 'regions') {
  return apiClient.get(`/reference-data/${kind}`, publicReferenceListSchema)
}

export function getProjectPostsFeed(query: Partial<ProjectPostFeedQuery> = {}) {
  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  if (query.cursor) params.set('cursor', query.cursor)
  if (query.limit) params.set('limit', String(query.limit))
  const path = `/projects/posts/feed${params.toString() ? `?${params.toString()}` : ''}`
  return apiClient.get<ProjectPostFeedResponse>(path, projectPostFeedResponseSchema)
}

export async function getProjectById(id: string) {
  const [project, positions] = await Promise.all([
    apiClient.get(`/projects/${id}`, projectPrivateDetailSchema),
    apiClient.get(`/projects/${id}/positions`, projectPositionsResponseSchema),
  ])
  return { ...project, positions: positions.positions }
}

export function submitProjectApplication(input: { projectId: string; positionId?: string; message: string }) {
  return apiClient.post('/applications', input)
}

export function getProjectMembers(projectId: string) {
  return apiClient.get(`/projects/${projectId}/members`, projectMembersResponseSchema)
}

export function updateProjectMemberRole(projectId: string, memberId: string, role: ProjectRoleInput) {
  return apiClient.patch(`/projects/${projectId}/members/${memberId}/role`, { role })
}

export function leaveProject(projectId: string) {
  return apiClient.request(`/projects/${projectId}/members/me`, { method: 'DELETE' })
}

export function addProjectMember(projectId: string, input: { userId: string; role: ProjectRoleInput }) {
  return apiClient.post(`/projects/${projectId}/members`, input)
}

export function getProjectTasks(projectId: string) {
  return apiClient.get(`/projects/${projectId}/tasks`, projectTasksResponseSchema)
}

export function createProjectTask(projectId: string, input: CreateProjectTaskInput) {
  return apiClient.post(`/projects/${projectId}/tasks`, input)
}

export function updateProjectTask(projectId: string, taskId: string, input: UpdateProjectTaskInput) {
  return apiClient.patch(`/projects/${projectId}/tasks/${taskId}`, input)
}

export function deleteProjectTask(projectId: string, taskId: string) {
  return apiClient.request(`/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' })
}

export function getProjectPosts(projectId: string) {
  return apiClient.get(`/projects/${projectId}/posts`, projectPostsResponseSchema)
}

export function createProjectPost(projectId: string, input: ProjectPostCreateInput) {
  return apiClient.post(`/projects/${projectId}/posts`, input)
}

export function updateProjectPost(projectId: string, postId: string, input: ProjectPostUpdateInput) {
  return apiClient.patch(`/projects/${projectId}/posts/${postId}`, input)
}

export function deleteProjectPost(projectId: string, postId: string) {
  return apiClient.request(`/projects/${projectId}/posts/${postId}`, { method: 'DELETE' })
}

export function getPublicProjectDetail(projectId: string) {
  return apiClient.get(`/projects/${projectId}/public`, publicProjectDetailSchema)
}

export function exportProjectArchive(projectId: string) {
  return apiClient.get(`/projects/${projectId}/export`)
}
