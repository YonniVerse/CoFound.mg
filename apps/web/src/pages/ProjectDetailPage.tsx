import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, WalletCards, Compass, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="max-w-[1400px] mx-auto w-full space-y-6">
          {/* Back Button */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-9 gap-1.5 rounded-lg px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </div>

          {isLoading && (
            <div className="space-y-6">
              <Card className="rounded-xl border border-border bg-card p-6 shadow-2xs animate-pulse">
                <div className="h-6 w-48 rounded bg-muted mb-3" />
                <div className="h-8 w-96 rounded bg-muted mb-4" />
                <div className="h-4 w-64 rounded bg-muted" />
              </Card>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-5 text-xs sm:text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && project && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
              {/* MAIN COLUMN */}
              <div className="space-y-6">
                <ProjectHeader project={project} />
                <ProjectContent project={project} />
              </div>

              {/* RIGHT SIDEBAR */}
              <div className="space-y-5 lg:sticky lg:top-[90px]">
                {/* Entrepreneurial Creation Journey CTA */}
                <Link
                  to={`/projects/${project.id}/journey`}
                  className="group flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-2xs transition-all hover:border-primary/40 hover:bg-primary/10"
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
                    Design Thinking, BMC Strategyzer, Business Plan, Finances & Pitch.
                  </p>
                </Link>

                <Link
                  to={`/projects/${project.id}/wallet`}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-xs sm:text-sm font-semibold text-foreground shadow-2xs transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <span className="flex items-center gap-2">
                    <WalletCards className="h-4 w-4 text-primary" /> Wallet du projet
                  </span>
                  <span aria-hidden="true" className="text-muted-foreground">→</span>
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
      </main>
    </DashboardLayout>
  );
}