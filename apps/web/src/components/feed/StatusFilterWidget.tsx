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
    dotColor: "bg-primary shadow-[0_0_10px_rgba(99,102,241,0.6)]",
  },
  {
    value: ProjectStatus.ACTIVE,
    label: "En cours",
    dotColor: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
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
    <div className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-border/70">
        <div className="flex items-center gap-2 text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
            Statut du projet
          </h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono font-medium">
          FILTRES
        </span>
      </div>

      {/* Status Options List */}
      <div className="space-y-1.5">
        {statusOptions.map((opt) => {
          const isSelected = selectedStatus === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setSelectedStatus(opt.value)}
              className={`w-full h-10 px-3.5 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-between group cursor-pointer ${
                isSelected
                  ? "bg-accent/90 text-foreground font-bold border border-border shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.dotColor}`} />
                <span className="leading-none">{opt.label}</span>
              </div>

              {isSelected && <Check className="h-4 w-4 text-primary stroke-[2.5]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
