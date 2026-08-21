import type { TalentFeedCard } from "@cofound/shared";
import { Avatar } from "@/components/shared/Avatar";
import { SkillTag } from "@/components/shared/SkillTag";
import { Button } from "@/components/ui/button";
import { Clock, GraduationCap, Target, Eye, Sparkles, MessageSquare, Wrench } from "lucide-react";

interface TalentCardProps {
  talent: TalentFeedCard;
}

export function TalentCard({ talent }: TalentCardProps) {
  const fieldLabel = talent.field?.labelKey ?? null;
  const availabilityLabel = talent.availabilityHours
    ? `${talent.availabilityHours}h / semaine`
    : "Non renseignée";

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col gap-4 group">
      {/* Header: Pseudonymized Avatar + Pseudonym + Field & Cohort */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Avatar
            name={talent.pseudonym}
            src={null}
            size="lg"
            className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-background shadow-2xs ring-2 ring-primary/10"
          />
          <div className="flex flex-col">
            <h3 className="font-heading font-bold text-base sm:text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
              {talent.pseudonym}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mt-1">
              {fieldLabel && (
                <>
                  <GraduationCap className="h-3.5 w-3.5 text-primary/80" />
                  <span>{fieldLabel}</span>
                </>
              )}
              {fieldLabel && talent.cohortYear && <span>·</span>}
              {talent.cohortYear && <span>Promo {talent.cohortYear}</span>}
            </div>
          </div>
        </div>

        {/* Completion Badge */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-70 mb-0.5">
            Complétion
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              talent.completion >= 80
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : talent.completion >= 50
                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {talent.completion}%
          </span>
        </div>
      </div>

      {/* Headline & Bio Block */}
      <div className="space-y-1.5 bg-muted/40 p-3.5 rounded-xl border border-border/50">
        {talent.headline && (
          <p className="text-xs sm:text-sm font-semibold text-foreground leading-snug flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{talent.headline}</span>
          </p>
        )}
        {talent.bio ? (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            "{talent.bio}"
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/70 italic">
            Biographie non renseignée.
          </p>
        )}
      </div>

      {/* Skills, Goals & Availability Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-y border-border/60">
        {/* Skills Column */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5 text-primary" />
            Compétences
          </span>
          {talent.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {talent.skills.map((skill) => (
                <SkillTag key={skill.id} label={skill.labelKey} variant="slate" />
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground/70 italic">Aucune renseignée</span>
          )}
        </div>

        {/* Goals & Availability Column */}
        <div className="flex flex-col gap-3">
          {talent.goals.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-primary" />
                Objectifs
              </span>
              <div className="flex flex-wrap gap-1.5">
                {talent.goals.map((goal) => (
                  <span
                    key={goal}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg border border-primary/20"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium pt-0.5">
            <Clock className="h-3.5 w-3.5 text-primary/80" />
            <span>Disponibilité : <strong className="text-foreground">{availabilityLabel}</strong></span>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="flex items-center gap-3 pt-1 w-full">
        <Button variant="outline" size="sm" className="h-9 text-xs flex-1 rounded-xl font-semibold gap-1.5 cursor-pointer">
          <Eye className="h-3.5 w-3.5" />
          Consulter le profil
        </Button>
        <Button size="sm" className="h-9 text-xs flex-1 rounded-xl font-semibold gap-1.5 shadow-2xs cursor-pointer">
          <MessageSquare className="h-3.5 w-3.5" />
          Proposer d'échanger
        </Button>
      </div>
    </div>
  );
}
