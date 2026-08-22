import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplyModal } from "@/components/applications/ApplyModal";
import type { ProjectDetail } from "@/data/mockProject";

interface ProjectActionCardProps {
  project: ProjectDetail;
  onApply: (text: string) => Promise<boolean>;
  isApplying: boolean;
}

export function ProjectActionCard({ project, onApply, isApplying }: ProjectActionCardProps) {
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const handleSubmit = async ({ message }: { projectId: string; positionId?: string; message: string }) => {
    const applied = await onApply(message);
    if (!applied) throw new Error("La candidature n’a pas pu être envoyée.");
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-2xs flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-500 delay-100">
        <Button
          size="sm"
          className="h-9 w-full rounded-lg px-3.5 text-xs font-medium shadow-none transition-colors sm:text-sm"
          onClick={() => setIsApplyOpen(true)}
          disabled={isApplying}
        >
          {isApplying ? "Envoi en cours…" : "Postuler à ce projet"}
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9 flex-1 rounded-lg px-3.5 text-xs font-medium sm:text-sm">Sauvegarder</Button>
          <Button variant="outline" size="sm" className="h-9 w-9 rounded-lg p-0" title="Partager" aria-label="Partager le projet">
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <div className="border-t border-border/50 pt-4 space-y-3">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stade actuel</p>
            <p className="flex items-center gap-2 text-xs font-medium text-foreground sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              {project.status}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Disponibilité souhaitée</p>
            <p className="text-xs font-medium text-foreground sm:text-sm">{project.availability}</p>
          </div>
        </div>
      </div>

      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        projectTitle={project.title}
        projectId={project.id}
        positions={project.seeking.map((item, index) => ({ id: `${project.id}-position-${index}`, title: item.role }))}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export default ProjectActionCard;
