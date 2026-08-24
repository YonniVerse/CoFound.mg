import { useEffect, useState } from 'react'
import { getProjectById, submitProjectApplication } from '@/data/projectApi'
import type { ProjectDetail } from '@/data/projectTypes'

export function useProjectDetail(projectId: string | undefined) {
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isApplying, setIsApplying] = useState(false)

  const error = projectId ? fetchError : 'Aucun identifiant de projet fourni.'
  const loading = projectId ? isLoading : false

  useEffect(() => {
    if (!projectId) return
    const currentProjectId: string = projectId

    async function loadProject() {
      try {
        setIsLoading(true)
        setFetchError(null)
        setProject(await getProjectById(currentProjectId))
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Erreur lors du chargement du projet.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProject()
  }, [projectId])

  const applyToProject = async (input: { positionId?: string; message: string }): Promise<boolean> => {
    const currentProjectId = projectId
    if (!currentProjectId) return false

    setIsApplying(true)
    try {
      await submitProjectApplication({ projectId: currentProjectId, ...input })
      return true
    } catch (err) {
      console.error(err)
      return false
    } finally {
      setIsApplying(false)
    }
  }

  return { project, isLoading: loading, error, isApplying, applyToProject }
}
