import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectDetail } from "@/data/mockProject";

interface ProjectActionCardProps {
  project: ProjectDetail;
  onApply: (text: string) => Promise<boolean>;
  isApplying: boolean;
}

// TODO(P-05) : câbler onApply et isApplying sur le bouton « Postuler ».
export function ProjectActionCard({ project }: ProjectActionCardProps) {
  return (
    <div className="bg-background border border-border shadow-xs rounded-2xl p-6 flex flex-col gap-5 animate-in fade-in slide-in-from-right-8 duration-500 delay-100">
      <Button 
        size="xl" 
        className="w-full text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
      >
        Postuler à ce projet
      </Button>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 bg-muted/50 font-semibold">Sauvegarder</Button>
        <Button variant="outline" className="px-3 bg-muted/50" title="Partager">
          <Share2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      <div className="border-t border-border pt-5 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Stade actuel</p>
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-secondary"></span>
            {project.status}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Disponibilité souhaitée</p>
          <p className="text-sm font-semibold text-foreground">{project.availability}</p>
        </div>
      </div>
    </div>
  );
}
