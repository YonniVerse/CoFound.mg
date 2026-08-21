import type { TalentFeedCard } from "@cofound/shared";
import { Avatar } from "@/components/shared/Avatar";
import { SkillTag } from "@/components/shared/SkillTag";
import { Button } from "@/components/ui/button";
import { Clock, GraduationCap, Target, Eye } from "lucide-react";

interface TalentCardProps {
  talent: TalentFeedCard;
}

export function TalentCard({ talent }: TalentCardProps) {
  const fieldLabel = talent.field?.labelKey ?? null;
  const availabilityLabel = talent.availabilityHours
    ? `${talent.availabilityHours}h/sem`
    : null;

  return (
    <div className="bg-background border border-border rounded-xl p-5 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col gap-4 group">
      {/* Header: Pseudonymized Avatar + Pseudonym + Field */}
      <div className="flex items-start gap-4">
        <Avatar
          name={talent.pseudonym}
          src={null}
          size="lg"
          className="h-14 w-14 border-2 border-background shadow-xs"
        />
        <div className="flex flex-col flex-1 pt-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-heading font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
              {talent.pseudonym}
            </h3>
            {/* Completion badge */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                talent.completion >= 80
                  ? "bg-emerald-500/15 text-emerald-600"
                  : talent.completion >= 50
                    ? "bg-amber-500/15 text-amber-600"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {talent.completion}%
            </span>
          </div>

          {/* Field + Cohort */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mt-0.5">
            {fieldLabel && (
              <>
                <GraduationCap className="h-3 w-3" />
                <span>{fieldLabel}</span>
              </>
            )}
            {fieldLabel && talent.cohortYear && <span>·</span>}
            {talent.cohortYear && <span>Promo {talent.cohortYear}</span>}
          </div>
        </div>
      </div>

      {/* Headline */}
      {talent.headline && (
        <p className="text-sm text-foreground font-medium leading-snug">
          {talent.headline}
        </p>
      )}

      {/* Bio */}
      {talent.bio && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          "{talent.bio}"
        </p>
      )}

      {/* Skills & Goals */}
      <div className="flex flex-col gap-3 py-3 border-y border-border/50 mt-1">
        {/* Skills */}
        {talent.skills.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-widest opacity-60">
              Compétences :
            </span>
            <div className="flex flex-wrap gap-1.5">
              {talent.skills.slice(0, 6).map((skill) => (
                <SkillTag key={skill.id} label={skill.labelKey} variant="slate" />
              ))}
              {talent.skills.length > 6 && (
                <span className="text-xs text-muted-foreground font-medium">
                  +{talent.skills.length - 6}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Goals */}
        {talent.goals.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-foreground uppercase tracking-widest opacity-60">
              Objectifs :
            </span>
            <div className="flex flex-wrap gap-1.5">
              {talent.goals.slice(0, 3).map((goal) => (
                <span
                  key={goal}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                >
                  <Target className="h-2.5 w-2.5" />
                  {goal}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Availability */}
        {availabilityLabel && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Clock className="h-3 w-3" />
            <span>Disponible {availabilityLabel}</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="flex gap-2 mt-auto pt-1 w-full">
        <Button variant="outline" size="sm" className="h-8 text-xs flex-1">
          <Eye className="h-3 w-3 mr-1.5" />
          Voir le profil
        </Button>
        <Button size="sm" className="h-8 text-xs flex-1">
          Contacter
        </Button>
      </div>
    </div>
  );
}
