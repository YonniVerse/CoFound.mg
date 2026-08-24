import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ProjectContent } from "@/components/project/ProjectContent";
import { ProjectActionCard } from "@/components/project/ProjectActionCard";
import { ProjectTeamCard } from "@/components/project/ProjectTeamCard";
import { useProjectDetail } from "@/hooks/useProjectDetail";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { project, isLoading, error, isApplying, applyToProject } = useProjectDetail(id);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-10 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6 h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        {isLoading && (
          <div className="flex justify-center items-center py-20 text-muted-foreground font-medium">
            Chargement du projet...
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-destructive font-medium bg-destructive/10 rounded-2xl">
            {error}
          </div>
        )}

        {!isLoading && !error && project && (
          <div className="flex items-start flex-col gap-6 lg:flex-row">
            
            {/* MAIN COLUMN */}
            <div className="flex-1 min-w-0 max-w-3xl flex flex-col gap-6 animate-in fade-in duration-500">
              <ProjectHeader project={project} />
              <ProjectContent project={project} />
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="w-full lg:w-[320px] shrink-0 space-y-6 lg:sticky lg:top-[90px] lg:h-fit lg:self-start">
              <ProjectActionCard 
                project={project} 
                onApply={applyToProject}
                isApplying={isApplying}
              />
              <ProjectTeamCard team={project.team} />
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}