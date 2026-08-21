import { ProjectStatus } from "@cofound/shared";
import { Check, SlidersHorizontal } from "lucide-react";

interface StatusFilterWidgetProps {
  selectedStatus: ProjectStatus | "ALL";
  setSelectedStatus: (status: ProjectStatus | "ALL") => void;
}

const statusOptions: {
  value: ProjectStatus | "ALL";
  label: string;
  dotColor: string;
}[] = [
  {
    value: ProjectStatus.RECRUITING,
    label: "En recrutement",
    dotColor: "bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]",
  },
  {
    value: ProjectStatus.ACTIVE,
    label: "En cours",
    dotColor: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
  },
  {
    value: ProjectStatus.DRAFT,
    label: "Brouillons",
    dotColor: "bg-amber-500",
  },
  {
    value: "ALL",
    label: "Tous les statuts",
    dotColor: "bg-slate-400",
  },
];

export function StatusFilterWidget({
  selectedStatus,
  setSelectedStatus,
}: StatusFilterWidgetProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-3.5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Statut
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground/80 font-mono">
          FILTRAGE
        </span>
      </div>

      {/* Status Items List */}
      <div className="space-y-1">
        {statusOptions.map((opt) => {
          const isSelected = selectedStatus === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setSelectedStatus(opt.value)}
              className={`w-full h-8 px-2.5 rounded-lg text-xs transition-all flex items-center justify-between group ${
                isSelected
                  ? "bg-accent/80 text-foreground font-semibold border border-border/80 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dotColor}`} />
                <span>{opt.label}</span>
              </div>

              {isSelected && <Check className="h-3.5 w-3.5 text-primary stroke-[2.5]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
