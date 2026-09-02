import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useMyApplications } from "@/hooks/useMyApplications";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bookmark,
  Briefcase,
  Calendar,
  MessageSquare,
  Tag,
} from "lucide-react";
import type { ApplicationStatus } from "@cofound/shared";
import { useI18n } from "@/i18n";

type ApplicationFilter = "ALL" | ApplicationStatus;

const statusBadges: Record<
  ApplicationStatus,
  { label: string; icon: React.ReactNode; color: string }
> = {
  PENDING: {
    label: "En attente",
    icon: <Clock className="h-3.5 w-3.5" />,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  REVIEWING: {
    label: "En cours d’examen",
    icon: <Clock className="h-3.5 w-3.5" />,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  SHORTLISTED: {
    label: "Présélectionnée",
    icon: <Bookmark className="h-3.5 w-3.5" />,
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  },
  INTERVIEW: {
    label: "Entretien",
    icon: <Calendar className="h-3.5 w-3.5" />,
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  },
  WAITLISTED: {
    label: "Liste d’attente",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  ACCEPTED: {
    label: "Acceptée",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  REJECTED: {
    label: "Refusée",
    icon: <XCircle className="h-3.5 w-3.5" />,
    color: "bg-destructive/10 text-destructive border-destructive/20",
  },
  WITHDRAWN: {
    label: "Retirée",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    color: "bg-muted text-muted-foreground border-border",
  },
};

export default function MyApplicationsPage() {
  const { t } = useI18n()
  const { applications, isLoading, withdrawApplication } = useMyApplications();
  const [filter, setFilter] = useState<ApplicationFilter>("ALL");
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const statusLabels: Record<ApplicationStatus, string> = {
    PENDING: t('applications.pending'),
    REVIEWING: "En cours d’examen",
    SHORTLISTED: "Présélectionnée",
    INTERVIEW: "Entretien",
    WAITLISTED: "Liste d’attente",
    ACCEPTED: t('applications.accepted'),
    REJECTED: t('applications.rejected'),
    WITHDRAWN: t('applications.withdrawn'),
  }

  const filteredApplications = applications.filter((app) => {
    if (filter === "ALL") return true;
    return app.status === filter;
  });

  const handleWithdraw = async (application: (typeof applications)[number]) => {
    try {
      setWithdrawingId(application.id);
      await withdrawApplication(application);
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
          <div>
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-foreground flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <span>{t('applications.title')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
              {t('applications.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono font-medium">
              TOTAL : {applications.length}
            </span>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {(["ALL", "PENDING", "REVIEWING", "SHORTLISTED", "INTERVIEW", "WAITLISTED", "ACCEPTED", "REJECTED", "WITHDRAWN"] as const).map(
            (statusKey) => {
              const isActive = filter === statusKey;
              const label =
                statusKey === "ALL"
                  ? t('applications.all')
                  : statusLabels[statusKey] ?? statusKey;

              return (
                <button
                  key={statusKey}
                  onClick={() => setFilter(statusKey)}
                  className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-accent text-foreground border border-border/80 shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {label}
                </button>
              );
            },
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6 h-36 animate-pulse" />
            <div className="bg-card border border-border rounded-xl p-6 h-36 animate-pulse" />
          </div>
        )}

        {/* Applications List */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const badge = statusBadges[app.status];
              const dateStr = new Date(app.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              return (
                <div
                  key={app.id}
                  className="bg-card border border-border/80 rounded-xl p-5 sm:p-6 shadow-2xs hover:border-border transition-all flex flex-col gap-4"
                >
                  {/* Header: Project Title + Position Title + Status Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-bold text-base sm:text-lg text-foreground">
                          {app.source === 'OPPORTUNITY' ? app.opportunity.title : app.project.title}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                        {app.source === 'OPPORTUNITY' ? app.opportunity.description : app.project.pitch}
                      </p>
                      {app.source === 'PROJECT' && app.position && (
                        <div className="flex items-center gap-1.5 text-xs text-primary font-medium pt-0.5">
                          <Tag className="h-3 w-3" />
                          <span>{t('applications.targetPosition')}: {app.position.title}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${badge.color} shrink-0`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Candidate Message Block */}
                  <div className="bg-muted/40 p-3.5 rounded-lg border border-border/50 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 text-primary" />
                      {t('applications.messageLabel')}
                    </span>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
                      "{app.message}"
                    </p>
                  </div>

                  {/* Rejection Reason (if rejected) */}
                  {app.status === "REJECTED" && app.rejectionReason && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-lg">
                      <strong>{t('applications.rejectionReason')}:</strong> {app.rejectionReason}
                    </div>
                  )}

                  {/* Footer Info & Actions */}
                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/60">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Calendar className="h-3.5 w-3.5 opacity-70" />
                      <span>{t('applications.appliedOn')} {dateStr}</span>
                    </div>

                    {app.status === "PENDING" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={withdrawingId === app.id}
                        onClick={() => handleWithdraw(app)}
                        className="h-8 text-xs font-semibold rounded-lg text-destructive border-destructive/20 hover:bg-destructive/10 cursor-pointer"
                      >
                        {withdrawingId === app.id ? "Retrait..." : "Retirer la candidature"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredApplications.length === 0 && (
              <div className="text-center py-16 text-muted-foreground font-medium bg-card border border-border rounded-xl p-8 space-y-2 shadow-2xs">
                <Briefcase className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm">Aucune candidature ne correspond à ce filtre.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
