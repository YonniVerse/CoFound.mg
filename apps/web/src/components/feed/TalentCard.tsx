import type { TalentFeedCard } from "@cofound/shared";
import { Avatar } from "@/components/shared/Avatar";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquare, Clock } from "lucide-react";
import { ReportButton } from "@/components/shared/ReportButton";
import { BlockButton } from "@/components/shared/BlockButton";

interface TalentCardProps {
  talent: TalentFeedCard;
}

export function TalentCard({ talent }: TalentCardProps) {
  const fieldLabel = talent.field?.labelKey ?? null;
  const availabilityLabel = talent.availabilityHours
    ? `${talent.availabilityHours}h/sem`
    : null;

  return (
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-2xs hover:border-border/80 transition-all duration-150 flex flex-col gap-4 group">
      {/* Header: Pseudonymized Avatar + Pseudonym + Field & Cohort + Completion */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
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
              {talent.cohortYear && <span>Promo {talent.cohortYear}</span>}
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
          {talent.completion}% complété
        </span>
      </div>

      {/* Headline & Bio */}
      <div className="space-y-1.5">
        {talent.headline && (
          <p className="text-sm font-semibold text-foreground/90 leading-snug">
            {talent.headline}
          </p>
        )}
        {talent.bio ? (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            "{talent.bio}"
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/60 italic">
            Biographie non renseignée.
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
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50 mt-1">
        {availabilityLabel ? (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground font-medium">
            <Clock className="h-3.5 w-3.5 opacity-70" />
            <span>Dispo : {availabilityLabel}</span>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3.5 text-xs sm:text-sm font-medium rounded-lg border-border hover:bg-accent cursor-pointer gap-1.5"
          >
            <Eye className="h-4 w-4" />
            <span>Profil</span>
          </Button>
          <ReportButton targetType="PROFILE" targetId={talent.id} />
          <BlockButton userId={talent.id} />
          <Button
            size="sm"
            className="h-9 px-3.5 text-xs sm:text-sm font-medium rounded-lg cursor-pointer gap-1.5"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Contacter</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
