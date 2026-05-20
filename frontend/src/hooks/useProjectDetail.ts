import { useState, useEffect } from "react";
import { getProjectById, submitProjectApplication } from "@/data/projectApi";
import type { ProjectDetail } from "@/data/mockProject";

export function useProjectDetail(projectId: string | undefined) {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setError("Aucun identifiant de projet fourni.");
      setIsLoading(false);
      return;
    }

    async function loadProject() {
      try {
        setIsLoading(true);
        setError(null);
        
        const res = await getProjectById(projectId!);
        if (res.success) {
          setProject(res.data);
        } else {
          throw new Error(res.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement du projet.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  const applyToProject = async (applicationText: string): Promise<boolean> => {
    if (!projectId) return false;
    
    setIsApplying(true);
    try {
      const res = await submitProjectApplication(projectId, applicationText);
      return res.success;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setIsApplying(false);
    }
  };

  return { project, isLoading, error, isApplying, applyToProject };
}