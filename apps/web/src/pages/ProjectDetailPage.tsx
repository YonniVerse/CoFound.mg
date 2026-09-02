import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, WalletCards, Compass, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectNavTabs } from "@/components/project/ProjectNavTabs";
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
      {project && <ProjectNavTabs projectId={project.id} />}

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
              {/* Entrepreneurial Creation Journey CTA */}
              <Link
                to={`/projects/${project.id}/journey`}
                className="group flex flex-col gap-2 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 transition-all hover:border-primary hover:bg-primary/10 hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    <Compass className="h-3.5 w-3.5" /> Parcours Création
                  </span>
                  <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                </div>
                <p className="font-heading text-sm font-bold text-foreground">
                  Construire l’entreprise
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Design Thinking, BMC Strategyzer, Business Plan, Modélisation Financière & Pitch.
                </p>
              </Link>

              <Link to={`/projects/${project.id}/wallet`} className="flex items-center justify-between rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10">
                <span className="flex items-center gap-2"><WalletCards className="h-4 w-4" /> Wallet du projet</span>
                <span aria-hidden="true">→</span>
              </Link>
              <ProjectActionCard 
                project={project} 
                onApply={applyToProject}
                isApplying={isApplying}
              />
              <ProjectTeamCard team={project.members} />
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}