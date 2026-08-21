import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export type FeedFilterType = "all" | "projects" | "profiles";

interface FeedFiltersProps {
  filter: FeedFilterType;
  setFilter: (filter: FeedFilterType) => void;
  search?: string;
  setSearch?: (search: string) => void;
}

export function FeedFilters({
  filter,
  setFilter,
  search = "",
  setSearch,
}: FeedFiltersProps) {
  return (
    <div className="bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b border-border py-3 px-6 sm:px-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-[1400px] mx-auto">
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
    </div>
  );
}
