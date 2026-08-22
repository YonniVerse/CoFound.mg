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
      <div className="bg-background border border-border shadow-xs rounded-2xl p-6 flex flex-col gap-5 animate-in fade-in slide-in-from-right-8 duration-500 delay-100">
        <Button
          size="xl"
          className="w-full text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
          onClick={() => setIsApplyOpen(true)}
          disabled={isApplying}
        >
          {isApplying ? "Envoi en cours…" : "Postuler à ce projet"}
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 bg-muted/50 font-semibold">Sauvegarder</Button>
          <Button variant="outline" className="px-3 bg-muted/50" title="Partager" aria-label="Partager le projet">
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <div className="border-t border-border pt-5 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Stade actuel</p>
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              {project.status}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Disponibilité souhaitée</p>
            <p className="text-sm font-semibold text-foreground">{project.availability}</p>
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
