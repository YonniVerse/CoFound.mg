import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProjectStatus } from "@cofound/shared";

export type FeedFilterType = "all" | "projects" | "profiles";

interface FeedFiltersProps {
  filter: FeedFilterType;
  setFilter: (filter: FeedFilterType) => void;
  search?: string;
  setSearch?: (search: string) => void;
  selectedStatus?: ProjectStatus | "ALL";
  setSelectedStatus?: (status: ProjectStatus | "ALL") => void;
}

export function FeedFilters({
  filter,
  setFilter,
  search = "",
  setSearch,
  selectedStatus = ProjectStatus.RECRUITING,
  setSelectedStatus,
}: FeedFiltersProps) {
  return (
    <div className="bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b border-border pt-4 pb-3 px-6 sm:px-10 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setFilter("all")}
            className={`pb-1 text-sm font-bold border-b-2 transition-colors ${filter === "all" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter("projects")}
            className={`pb-1 text-sm font-bold border-b-2 transition-colors ${filter === "projects" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Projets
          </button>
          <button
            onClick={() => setFilter("profiles")}
            className={`pb-1 text-sm font-bold border-b-2 transition-colors ${filter === "profiles" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Co-fondateurs
          </button>
        </div>

        {/* Search Input */}
        {setSearch && (
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Rechercher par mot-clé..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs rounded-lg border-border bg-card focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        )}
      </div>

      {/* Sub-filter: Project Status Pills (Visible for Projects & All) */}
      {setSelectedStatus && filter !== "profiles" && (
        <div className="flex items-center gap-2 pt-1 overflow-x-auto text-xs scrollbar-none">
          <span className="text-muted-foreground font-semibold text-[11px] uppercase tracking-wider mr-1 shrink-0">
            Statut :
          </span>
          <button
            onClick={() => setSelectedStatus("ALL")}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${selectedStatus === "ALL" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            Tous les statuts
          </button>
          <button
            onClick={() => setSelectedStatus(ProjectStatus.RECRUITING)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${selectedStatus === ProjectStatus.RECRUITING ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            Recrutement
          </button>
          <button
            onClick={() => setSelectedStatus(ProjectStatus.ACTIVE)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${selectedStatus === ProjectStatus.ACTIVE ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            En cours
          </button>
        </div>
      )}
    </div>
  );
}
