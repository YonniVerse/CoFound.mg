import type { TalentFeedCard } from "@cofound/shared";
import { Avatar } from "@/components/shared/Avatar";
import { SkillTag } from "@/components/shared/SkillTag";
import { Button } from "@/components/ui/button";
import {
  Clock,
  GraduationCap,
  Target,
  Eye,
  MessageSquare,
  ShieldCheck,
  Wrench,
  Sparkles,
} from "lucide-react";

interface TalentCardProps {
  talent: TalentFeedCard;
}

export function TalentCard({ talent }: TalentCardProps) {
  const fieldLabel = talent.field?.labelKey ?? "Domaine non spécifié";
  const availabilityLabel = talent.availabilityHours
    ? `${talent.availabilityHours}h / semaine`
    : "Temps flexible";

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col gap-5 group">
      {/* Header: Pseudonymized Avatar + Pseudonym + Field & Verification */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            name={talent.pseudonym}
            src={null}
            size="lg"
            className="h-14 w-14 border-2 border-primary/20 shadow-xs ring-2 ring-background"
          />
          <div className="flex flex-col pt-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
                {talent.pseudonym}
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3" />
                Opt-in
              </span>
            </div>

            {/* Field + Cohort */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mt-1">
              <span className="inline-flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5 text-primary/80" />
                {fieldLabel}
              </span>
              {talent.cohortYear && (
                <>
                  <span>·</span>
                  <span>Promo {talent.cohortYear}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Completion Badge */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Complétion
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              talent.completion >= 80
                ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                : talent.completion >= 50
                  ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                  : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {talent.completion}%
          </span>
        </div>
      </div>

      {/* Headline & Pitch */}
      <div className="space-y-1.5 bg-muted/30 p-3.5 rounded-xl border border-border/60">
        {talent.headline && (
          <p className="text-sm font-semibold text-foreground leading-snug flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{talent.headline}</span>
          </p>
        )}
        {talent.bio ? (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            "{talent.bio}"
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/80 italic">
            Ce candidat n'a pas encore rédigé sa biographie complète.
          </p>
        )}
      </div>

      {/* Skills, Goals & Availability Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-y border-border/60">
        {/* Skills Column */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 text-muted-foreground">
            <Wrench className="h-3.5 w-3.5 text-primary" />
            Compétences clés
          </span>
          {talent.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {talent.skills.map((skill) => (
                <SkillTag key={skill.id} label={skill.labelKey} variant="slate" />
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">Non spécifié</span>
          )}
        </div>

        {/* Goals & Availability Column */}
        <div className="flex flex-col gap-3">
          {talent.goals.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 text-muted-foreground">
                <Target className="h-3.5 w-3.5 text-primary" />
                Objectifs recherchés
              </span>
              <div className="flex flex-wrap gap-1.5">
                {talent.goals.map((goal) => (
                  <span
                    key={goal}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium pt-1">
            <Clock className="h-3.5 w-3.5 text-primary/80" />
            <span>Disponibilité : <strong className="text-foreground">{availabilityLabel}</strong></span>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="flex items-center gap-3 pt-1 w-full">
        <Button variant="outline" size="sm" className="h-9 text-xs flex-1 rounded-xl font-semibold gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          Consulter le profil
        </Button>
        <Button size="sm" className="h-9 text-xs flex-1 rounded-xl font-semibold gap-1.5 shadow-xs">
          <MessageSquare className="h-3.5 w-3.5" />
          Proposer d'échanger
        </Button>
      </div>
    </div>
  );
}
