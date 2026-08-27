import type { TalentFeedCard } from "@cofound/shared";
import { Avatar } from "@/components/shared/Avatar";
import { Button } from "@/components/ui/button";
import { BriefcaseBusiness, Clock, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { ReportButton } from "@/components/shared/ReportButton";
import { BlockButton } from "@/components/shared/BlockButton";
import { useI18n } from "@/i18n";

interface TalentCardProps {
  talent: TalentFeedCard;
}

const labelOverrides: Record<string, string> = {
  "demo.field.computing": "Informatique",
  "demo.field.business": "Gestion et commerce",
  "demo.field.design": "Design",
};

function formatReferenceLabel(labelKey: string, slug: string) {
  const knownLabel = labelOverrides[labelKey];
  if (knownLabel) return knownLabel;
  if (!labelKey.includes(".")) return labelKey;

  const rawLabel = labelKey.split(".").at(-1) || slug;
  return rawLabel
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function TalentCard({ talent }: TalentCardProps) {
  const { t } = useI18n();
  const categoryLabel = talent.field
    ? formatReferenceLabel(talent.field.labelKey, talent.field.slug)
    : null;
  const availabilityLabel = talent.availabilityHours
    ? `${talent.availabilityHours}h/sem`
    : null;

  return (
    <article className="group flex min-w-0 flex-col gap-5 overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <Avatar
            name={talent.pseudonym}
            src={null}
            size="md"
            className="h-12 w-12 shrink-0 border border-border/60 shadow-2xs sm:h-14 sm:w-14"
          />
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-lg">
              {talent.pseudonym}
            </h3>
            <p className="mt-1 truncate text-xs font-medium text-muted-foreground sm:text-sm">
              {talent.cohortYear ? `${t("common.cohort")} ${talent.cohortYear}` : t("common.identityProtected")}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            talent.completion >= 80
              ? "bg-emerald-500/10 text-emerald-600"
              : talent.completion >= 50
                ? "bg-amber-500/10 text-amber-600"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {talent.completion}% {t("common.completed")}
        </span>
      </header>

      <div className="flex items-center gap-2 rounded-xl border border-primary/10 bg-primary/[0.04] px-3.5 py-2.5 text-xs font-medium text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <span>{t("common.identityProtected")}</span>
      </div>

      {talent.headline && (
        <p className="text-base font-semibold leading-snug text-foreground/90 sm:text-lg">
          {talent.headline}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-border/60 bg-muted/20 p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <BriefcaseBusiness className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>{t("common.category")}</span>
          </div>
          <p className="mt-2 truncate text-sm font-semibold text-foreground">
            {categoryLabel ?? "—"}
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-border/60 bg-muted/20 p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>{t("common.skills")}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {talent.skills.length > 0 ? (
              talent.skills.slice(0, 4).map((skill) => (
                <span key={skill.id} className="rounded-md bg-background px-2 py-1 text-xs font-medium text-foreground ring-1 ring-border/70">
                  {formatReferenceLabel(skill.labelKey, skill.slug)}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
            {talent.skills.length > 4 && (
              <span className="rounded-md px-1 py-1 text-xs font-semibold text-muted-foreground">
                +{talent.skills.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {talent.goals.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {talent.goals.slice(0, 2).map((goal) => (
            <span key={goal} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {goal}
            </span>
          ))}
        </div>
      )}

      <footer className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
        {availabilityLabel ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
            <Clock className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            <span>{t("common.availability")}: {availabilityLabel}</span>
          </div>
        ) : (
          <span />
        )}

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <ReportButton targetType="PROFILE" targetId={talent.id} />
          <BlockButton userId={talent.id} />
          <Button size="sm" className="h-9 rounded-lg px-3 text-xs font-medium sm:text-sm">
            <MessageSquare className="h-4 w-4" />
            <span>{t("common.proposeExchange")}</span>
          </Button>
        </div>
      </footer>
    </article>
  );
}
