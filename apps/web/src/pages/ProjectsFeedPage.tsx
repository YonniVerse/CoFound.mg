import { useEffect, useRef } from "react";
import { Briefcase, Search } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectCard } from "@/components/feed/ProjectCard";
import { FeedErrorWidget } from "@/components/feed/FeedErrorWidget";
import { TalentCardSkeleton } from "@/components/feed/TalentCardSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFeedData } from "@/hooks/useFeedData";

export default function ProjectsFeedPage() {
  const {
    apiProjects,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    search,
    setSearch,
    selectedStatus,
    setSelectedStatus,
    loadMore,
  } = useFeedData();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoadingMore || isLoading) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry?.isIntersecting && loadMore(),
      { rootMargin: "240px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  return (
    <DashboardLayout>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8 sm:px-10">
        <header className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Découvrir</p>
            <h1 className="font-heading text-3xl font-bold text-foreground">Projets qui recrutent</h1>
            <p className="mt-2 text-sm text-muted-foreground">Explore des projets pseudonymisés et trouve une équipe qui correspond à tes compétences.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un projet…" className="pl-9" aria-label="Rechercher un projet" />
            </label>
            <div className="flex gap-2" role="group" aria-label="Filtrer par statut">
              <Button variant={selectedStatus === "RECRUITING" ? "default" : "outline"} onClick={() => setSelectedStatus("RECRUITING")}>Recrutement</Button>
              <Button variant={selectedStatus === "ALL" ? "default" : "outline"} onClick={() => setSelectedStatus("ALL")}>Tous les projets</Button>
            </div>
          </div>
        </header>

        {isLoading && <div className="space-y-4"><TalentCardSkeleton /><TalentCardSkeleton /></div>}
        {error && <FeedErrorWidget message={error} onRetry={() => window.location.reload()} />}
        {!isLoading && !error && apiProjects.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
            <Briefcase className="mx-auto mb-3 h-8 w-8 text-primary" />
            <p className="font-semibold">Aucun projet ne correspond à ta recherche.</p>
            <p className="mt-1 text-sm">Essaie un autre mot-clé ou affiche tous les projets.</p>
          </div>
        )}
        {!isLoading && !error && apiProjects.length > 0 && (
          <div className="space-y-5">
            {apiProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
            {hasMore && <div ref={sentinelRef} className="h-10" aria-hidden="true">{isLoadingMore && <TalentCardSkeleton />}</div>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
