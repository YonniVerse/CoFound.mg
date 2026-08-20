export type FeedFilterType = "all" | "projects" | "profiles";

interface FeedFiltersProps {
  filter: FeedFilterType;
  setFilter: (filter: FeedFilterType) => void;
}

export function FeedFilters({ filter, setFilter }: FeedFiltersProps) {
  return (
    <div className="bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b border-border pt-4 px-6 sm:px-10">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => setFilter("all")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${filter === "all" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Tous
        </button>
        <button 
          onClick={() => setFilter("projects")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${filter === "projects" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Projets
        </button>
        <button 
          onClick={() => setFilter("profiles")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${filter === "profiles" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Co-fondateurs
        </button>
      </div>
    </div>
  );
}
