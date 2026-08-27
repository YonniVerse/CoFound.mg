import type { TalentFeedCard } from "@cofound/shared";
import { Avatar } from "@/components/shared/Avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock } from "lucide-react";
import { ReportButton } from "@/components/shared/ReportButton";
import { BlockButton } from "@/components/shared/BlockButton";
import { useI18n } from "@/i18n";

interface TalentCardProps {
  talent: TalentFeedCard;
}

export function TalentCard({ talent }: TalentCardProps) {
  const { t } = useI18n()
  const fieldLabel = talent.field?.labelKey ?? null;
  const availabilityLabel = talent.availabilityHours
    ? `${talent.availabilityHours}h/sem`
    : null;

  return (
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-2xs hover:border-border/80 transition-all duration-150 flex flex-col gap-4 group min-w-0 overflow-hidden">
      {/* Header: Pseudonymized Avatar + Pseudonym + Field & Cohort + Completion */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <Avatar
            name={talent.pseudonym}
            src={null}
            size="md"
            className="h-12 w-12 sm:h-13 sm:w-13 border border-border/60 shadow-2xs shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <h3 className="font-bold text-base sm:text-lg text-foreground leading-tight group-hover:text-primary transition-colors truncate">
              {talent.pseudonym}
            </h3>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground font-medium mt-0.5 truncate">
              {fieldLabel && <span>{fieldLabel}</span>}
              {fieldLabel && talent.cohortYear && <span>·</span>}
              {talent.cohortYear && <span>{t('common.cohort')} {talent.cohortYear}</span>}
            </div>
          </div>
        </div>

        {/* Minimalist Completion Badge */}
        <span
          className={`text-xs font-mono font-medium px-2.5 py-1 rounded-md shrink-0 ${
            talent.completion >= 80
              ? "bg-emerald-500/10 text-emerald-600"
              : talent.completion >= 50
                ? "bg-amber-500/10 text-amber-600"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {talent.completion}% {t('common.completed')}
        </span>
      </div>

      <p className="text-xs font-medium text-muted-foreground/80">
        {t('common.identityProtected')}
      </p>

      {/* Headline & Bio */}
      <div className="space-y-1.5 min-w-0">
        {talent.headline && (
          <p className="text-sm font-semibold text-foreground/90 leading-snug break-words">
            {talent.headline}
          </p>
        )}
        {talent.bio ? (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed break-words">
            "{talent.bio}"
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/60 italic">
            {t('common.bioMissing')}
          </p>
        )}
      </div>

      {/* Skills & Goals Tags */}
      {(talent.skills.length > 0 || talent.goals.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {talent.skills.slice(0, 5).map((skill) => (
            <span
              key={skill.id}
              className="text-xs font-medium bg-muted/60 text-foreground px-2.5 py-1 rounded-md border border-border/40"
            >
              {skill.labelKey}
            </span>
          ))}
          {talent.skills.length > 5 && (
            <span className="text-xs text-muted-foreground font-mono font-medium">
              +{talent.skills.length - 5}
            </span>
          )}

          {talent.goals.slice(0, 2).map((goal) => (
            <span
              key={goal}
              className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-md"
            >
              {goal}
            </span>
          ))}
        </div>
      )}

      {/* Footer Info & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50 mt-1">
        {availabilityLabel ? (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground font-medium">
            <Clock className="h-3.5 w-3.5 opacity-70" />
            <span>{t('common.availability')}: {availabilityLabel}</span>
          </div>
        ) : (
          <div />
        )}

        <div className="flex flex-wrap items-center gap-2">
          <ReportButton targetType="PROFILE" targetId={talent.id} />
          <BlockButton userId={talent.id} />
          <Button
            size="sm"
            className="h-9 px-3 text-xs sm:text-sm font-medium rounded-lg cursor-pointer gap-1.5"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{t('common.proposeExchange')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
