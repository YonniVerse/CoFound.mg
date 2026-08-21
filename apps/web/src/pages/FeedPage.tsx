import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectCard, type ProjectData } from "@/components/feed/ProjectCard";
import { ProfileCard, type ProfileData } from "@/components/feed/ProfileCard";
import { FeedFilters, type FeedFilterType } from "@/components/feed/FeedFilters";
import { ParityWidget } from "@/components/feed/ParityWidget";
import { SuggestedProfilesWidget } from "@/components/feed/SuggestedProfilesWidget";
import { StatusFilterWidget } from "@/components/feed/StatusFilterWidget";
import { ProjectCardSkeleton } from "@/components/feed/ProjectCardSkeleton";
import { useFeedData } from "@/hooks/useFeedData";
import { Sparkles } from "lucide-react";

export default function FeedPage() {
  const [filter, setFilter] = useState<FeedFilterType>("all");
  const {
    feedItems,
    apiProjects,
    suggestedProfiles,
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

  // Sentinel ref for infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoadingMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    );

    const target = sentinelRef.current;
    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasMore, isLoadingMore, isLoading, loadMore]);

  const mockFilteredItems = feedItems.filter((item) => {
    if (filter === "all") return true;
    if (filter === "projects") return item.type === "project";
    if (filter === "profiles") return item.type === "profile";
    return true;
  });

  const hasApiProjects = apiProjects.length > 0;

  return (
    <DashboardLayout>
      <FeedFilters
        filter={filter}
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
      />

      <div className="flex px-6 sm:px-10 py-8 gap-6 max-w-[1400px] mx-auto">
        {/* Main Column: Project Feed */}
        <div className="flex-1 max-w-3xl flex flex-col gap-6">
          {isLoading && (
            <div className="space-y-4">
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </div>
          )}

          {error && (
            <div className="text-center py-16 text-destructive font-medium border border-destructive/20 bg-destructive/10 rounded-xl p-6">
              {error}
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Display Real API Projects if available */}
              {hasApiProjects && filter !== "profiles" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Projets CoFound.mg ({apiProjects.length})</span>
                  </div>

                  {apiProjects.map((project, index) => (
                    <div
                      key={project.id}
                      className="animate-in fade-in slide-in-from-bottom-3 duration-400"
                      style={{ animationDelay: `${(index % 5) * 60}ms` }}
                    >
                      <ProjectCard project={project} />
                    </div>
                  ))}
                </div>
              )}

              {/* Display Mock Feed Items if filter includes profiles or API projects empty */}
              {(!hasApiProjects || filter === "profiles") &&
                mockFilteredItems.map((item, index) => (
                  <div
                    key={`${item.type}-${item.data.id}-${index}`}
                    className="animate-in fade-in slide-in-from-bottom-3 duration-400"
                    style={{ animationDelay: `${(index % 5) * 60}ms` }}
                  >
                    {item.type === "project" ? (
                      <ProjectCard project={item.data as ProjectData} />
                    ) : (
                      <ProfileCard profile={item.data as ProfileData} />
                    )}
                  </div>
                ))}

              {/* Infinite Scroll Skeletons & Sentinel */}
              {hasApiProjects && hasMore && filter !== "profiles" && (
                <div className="space-y-4 pt-2">
                  {isLoadingMore && (
                    <>
                      <ProjectCardSkeleton />
                      <ProjectCardSkeleton />
                    </>
                  )}
                  {/* Invisible sentinel element observed for auto loading */}
                  <div ref={sentinelRef} className="h-8 w-full" />
                </div>
              )}

              {/* Empty state */}
              {apiProjects.length === 0 && mockFilteredItems.length === 0 && (
                <div className="text-center py-20 text-muted-foreground font-medium bg-card border border-border rounded-xl p-8">
                  Aucun résultat ne correspond à vos critères de recherche.
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Fixed/Sticky Panel: Status Filter, Stats & Suggestions */}
        <div className="hidden lg:flex w-[320px] flex-col gap-6 sticky top-[90px] h-fit shrink-0">
          <StatusFilterWidget
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
          />
          <ParityWidget percentage={38} />
          <SuggestedProfilesWidget profiles={suggestedProfiles} />
        </div>
      </div>
    </DashboardLayout>
  );
}
