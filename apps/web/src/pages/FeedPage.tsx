import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectCard } from "@/components/feed/ProjectCard";
import { FeedFilters, type FeedFilterType } from "@/components/feed/FeedFilters";
import { ParityWidget } from "@/components/feed/ParityWidget";
import { SuggestedProfilesWidget } from "@/components/feed/SuggestedProfilesWidget";
import { TalentCard } from "@/components/feed/TalentCard";
import { TalentCardSkeleton } from "@/components/feed/TalentCardSkeleton";
import { FeedErrorWidget } from "@/components/feed/FeedErrorWidget";
import { useFeedData } from "@/hooks/useFeedData";
import { useTalentFeedData } from "@/hooks/useTalentFeedData";
import { Users } from "lucide-react";

export default function FeedPage() {
  const [filter, setFilter] = useState<FeedFilterType>("all");
  const { feedItems, apiProjects, suggestedProfiles, isLoading: isLoadingProjects, error: projectsError } = useFeedData();

  const {
    talents,
    isLoading: isLoadingTalents,
    isLoadingMore: isLoadingMoreTalents,
    hasMore: hasMoreTalents,
    error: talentError,
    search,
    setSearch,
    loadMore: loadMoreTalents,
    retry,
  } = useTalentFeedData();

  const showProjects = filter === "all" || filter === "projects";
  const showTalents = filter === "all" || filter === "profiles";

  // Sentinel ref for infinite scroll (talents feed)
  const talentSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!talentSentinelRef.current || !hasMoreTalents || isLoadingMoreTalents || isLoadingTalents || !showTalents) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreTalents();
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    );

    const target = talentSentinelRef.current;
    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasMoreTalents, isLoadingMoreTalents, isLoadingTalents, loadMoreTalents, showTalents]);

  const allowMockFallback = import.meta.env.DEV;
  const displayedProjects = apiProjects.length > 0
    ? apiProjects
    : allowMockFallback
      ? feedItems.flatMap((item) => item.type === "project" ? [item.data] : [])
      : [];
  const displayedSuggestedProfiles = allowMockFallback ? suggestedProfiles : [];
  const hasTalents = talents.length > 0;
  const isLoading = isLoadingProjects || (showTalents && isLoadingTalents);
  const error = projectsError || talentError;

  return (
    <DashboardLayout>
      <FeedFilters
        filter={filter}
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
      />

      <div className="flex px-6 sm:px-10 py-8 gap-6 max-w-[1400px] mx-auto">
        {/* Main Column: Feed */}
        <div className="flex-1 max-w-3xl flex flex-col gap-6">
          {isLoading && (
            <div className="space-y-4">
              <TalentCardSkeleton />
              <TalentCardSkeleton />
              <TalentCardSkeleton />
            </div>
          )}

          {error && (
            <FeedErrorWidget
              message={error}
              onRetry={retry}
            />
          )}

          {!isLoading && !error && (
            <>
              {/* ── Real API Talents Feed (M-04) ── */}
              {showTalents && hasTalents && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>Co-fondateurs & Talents ({talents.length})</span>
                  </div>

                  {talents.map((talent, index) => (
                    <div
                      key={talent.id}
                      className="animate-in fade-in slide-in-from-bottom-3 duration-400"
                      style={{ animationDelay: `${(index % 5) * 60}ms` }}
                    >
                      <TalentCard talent={talent} />
                    </div>
                  ))}

                  {/* Talent Infinite Scroll Sentinel */}
                  {hasMoreTalents && (
                    <div className="space-y-4 pt-2">
                      {isLoadingMoreTalents && (
                        <>
                          <TalentCardSkeleton />
                          <TalentCardSkeleton />
                        </>
                      )}
                      <div ref={talentSentinelRef} className="h-8 w-full" />
                    </div>
                  )}
                </div>
              )}

              {/* ── Projects from the API ── */}
              {showProjects &&
                displayedProjects.map((project, index) => (
                  <div
                    key={`project-${project.id}-${index}`}
                    className="animate-in fade-in slide-in-from-bottom-3 duration-400"
                    style={{ animationDelay: `${(index % 5) * 60}ms` }}
                  >
                    <ProjectCard project={project} />
                  </div>
                ))}

              {/* Empty state */}
              {!hasTalents && displayedProjects.length === 0 && (
                <div className="text-center py-20 text-muted-foreground font-medium bg-card border border-border rounded-xl p-8">
                  Aucun résultat ne correspond à vos critères de recherche.
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Fixed/Sticky Panel */}
        <div className="hidden lg:flex w-[320px] flex-col gap-6 sticky top-[90px] h-fit shrink-0">
          <ParityWidget percentage={38} />
          <SuggestedProfilesWidget profiles={displayedSuggestedProfiles} />
        </div>
      </div>
    </DashboardLayout>
  );
}
