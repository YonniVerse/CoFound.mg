import type { TalentFeedCard } from "@cofound/shared";
import { Button } from "@/components/ui/button";
import {
    BriefcaseBusiness,
    Clock,
    EyeOff,
    MessageSquare,
    ShieldCheck,
} from "lucide-react";
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
        : "—";
    const availabilityLabel = talent.availabilityHours
        ? `${talent.availabilityHours}h/sem`
        : null;

    return (
        <article className="group flex min-w-0 flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card p-5 shadow-2xs transition-all duration-150 hover:border-border/80 sm:p-6">
            <header className="flex min-w-0 items-start gap-3">
                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted text-muted-foreground"
                    aria-hidden="true"
                >
                    <EyeOff className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 flex flex-col">
                    <h3 className="truncate text-base font-bold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-lg">
                        {t("common.anonymous")}
                    </h3>
                    <span className="mt-1 flex min-w-0 items-start gap-1.5 text-xs font-medium leading-snug text-muted-foreground">
                        <ShieldCheck
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                            aria-hidden="true"
                        />
                        <span>{t("common.identityProtected")}</span>
                    </span>
                </div>
            </header>

            {talent.headline && (
                <p className="text-sm font-semibold leading-relaxed text-foreground sm:text-base">
                    {talent.headline}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <BriefcaseBusiness
                        className="h-3.5 w-3.5 text-primary"
                        aria-hidden="true"
                    />
                    {t("common.category")}:
                </span>
                <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                    {categoryLabel}
                </span>
                <span className="mx-0.5 text-border">·</span>
                <span className="text-xs font-semibold text-muted-foreground">
                    {t("common.skills")}:
                </span>
                {talent.skills.length > 0 ? (
                    talent.skills.slice(0, 4).map((skill) => (
                        <span
                            key={skill.id}
                            className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                        >
                            {formatReferenceLabel(skill.labelKey, skill.slug)}
                        </span>
                    ))
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                )}
                {talent.skills.length > 4 && (
                    <span className="text-xs font-semibold text-muted-foreground">
                        +{talent.skills.length - 4}
                    </span>
                )}
            </div>

            {talent.goals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {talent.goals.slice(0, 2).map((goal) => (
                        <span
                            key={goal}
                            className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                        >
                            {goal}
                        </span>
                    ))}
                </div>
            )}

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
                {availabilityLabel ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
                        <Clock
                            className="h-3.5 w-3.5 opacity-70"
                            aria-hidden="true"
                        />
                        {t("common.availability")}: {availabilityLabel}
                    </span>
                ) : (
                    <span />
                )}
                <div className="flex flex-wrap items-center gap-2">
                    <ReportButton targetType="PROFILE" targetId={talent.id} />
                    <BlockButton userId={talent.id} />
                    <Button
                        size="sm"
                        className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium sm:text-sm"
                    >
                        <MessageSquare className="h-4 w-4" />
                        <span>{t("common.proposeExchange")}</span>
                    </Button>
                </div>
            </footer>
        </article>
    );
}
