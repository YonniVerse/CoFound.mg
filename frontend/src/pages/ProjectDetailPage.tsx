import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

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
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* MAIN COLUMN */}
            <div className="flex-1 space-y-10 animate-in fade-in duration-500">
              <ProjectHeader project={project} />
              <ProjectContent project={project} />
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="w-full lg:w-[320px] shrink-0 space-y-6 lg:sticky lg:top-[100px] lg:h-fit">
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