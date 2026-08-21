import { ProjectStatus } from "@cofound/shared";
import { Filter, Check } from "lucide-react";

interface StatusFilterWidgetProps {
  selectedStatus: ProjectStatus | "ALL";
  setSelectedStatus: (status: ProjectStatus | "ALL") => void;
}

const statusOptions: { value: ProjectStatus | "ALL"; label: string; description: string; color: string }[] = [
  {
    value: ProjectStatus.RECRUITING,
    label: "En recrutement",
    description: "Projets recherchant activement des co-fondateurs",
    color: "bg-primary text-primary-foreground",
  },
  {
    value: ProjectStatus.ACTIVE,
    label: "En cours d'exécution",
    description: "Projets déjà lancés en phase de croissance",
    color: "bg-emerald-600 text-white",
  },
  {
    value: ProjectStatus.DRAFT,
    label: "Brouillons & Idées",
    description: "Projets en cours de structuration",
    color: "bg-amber-600 text-white",
  },
  {
    value: "ALL",
    label: "Tous les statuts",
    description: "Afficher l'intégralité du catalogue",
    color: "bg-slate-800 text-white",
  },
];

export function StatusFilterWidget({ selectedStatus, setSelectedStatus }: StatusFilterWidgetProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
        <Filter className="h-4 w-4 text-primary" />
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Filtrer par statut
        </h4>
      </div>

      <div className="space-y-1.5">
        {statusOptions.map((opt) => {
          const isSelected = selectedStatus === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setSelectedStatus(opt.value)}
              className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start justify-between gap-2 group ${
                isSelected
                  ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                  : "bg-background/50 border-border/50 hover:bg-accent/50 hover:border-border"
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? "text-primary font-bold" : "text-foreground group-hover:text-primary"
                    }`}
                  >
                    {opt.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {opt.description}
                </p>
              </div>

              {isSelected && (
                <div className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
