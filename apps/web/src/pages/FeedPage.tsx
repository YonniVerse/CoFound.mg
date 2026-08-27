import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectCard, type ProjectData } from "@/components/feed/ProjectCard";
import { ProfileCard, type ProfileData } from "@/components/feed/ProfileCard";
import { FeedFilters, type FeedFilterType } from "@/components/feed/FeedFilters";
import { MessagesPanel } from "@/components/feed/MessagesPanel";
import { TalentCard } from "@/components/feed/TalentCard";
import { TalentCardSkeleton } from "@/components/feed/TalentCardSkeleton";
import { FeedErrorWidget } from "@/components/feed/FeedErrorWidget";
import { ProjectSocialFeed } from "@/components/feed/ProjectSocialFeed";
import { useFeedData } from "@/hooks/useFeedData";
import { useTalentFeedData } from "@/hooks/useTalentFeedData";
import { Users } from "lucide-react";

export default function FeedPage() {
  const [filter, setFilter] = useState<FeedFilterType>("all");
  const [isMessagesCollapsed, setIsMessagesCollapsed] = useState(true);
  const { feedItems, isLoading: isLoadingMock, error: mockError } = useFeedData();

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

  const mockFilteredItems = feedItems.filter((item) => {
    if (filter === "all") return true;
    if (filter === "projects") return item.type === "project";
    if (filter === "profiles") return item.type === "profile";
    return true;
  });

  const hasTalents = talents.length > 0;
  const isLoading = isLoadingMock || (showTalents && isLoadingTalents);
  const error = mockError || talentError;

  return (
    <DashboardLayout>
      <FeedFilters
        filter={filter}
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
      />

      <div className="flex items-start px-4 sm:px-10 py-8 gap-6 max-w-[1400px] mx-auto w-full">
        {/* Main Column: Feed */}
        <div className="w-full min-w-0 max-w-3xl flex-[0_0_auto] flex flex-col gap-6">
          {filter !== "projects" && isLoading && (
            <div className="space-y-4">
              <TalentCardSkeleton />
              <TalentCardSkeleton />
              <TalentCardSkeleton />
            </div>
          )}

          {filter !== "projects" && error && (
            <FeedErrorWidget
              message={error}
              onRetry={retry}
            />
          )}

          {filter === "projects" ? (
            <ProjectSocialFeed />
          ) : !isLoading && !error && (
            <>
              {/* ── Real API Talents Feed (M-04) ── */}
              {showTalents && hasTalents && (
                <div className="space-y-6 min-w-0">
                  {filter !== "all" && (
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span>Co-fondateurs & Talents ({talents.length})</span>
                    </div>
                  )}

                  {talents.map((talent, index) => (
                    <div
                      key={talent.id}
                      className="animate-in fade-in slide-in-from-bottom-3 duration-400 min-w-0"
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

              {/* ── Projects & Prototype Feed Items ── */}
              {showProjects &&
                mockFilteredItems.map((item, index) => (
                  <div
                    key={`${item.type}-${item.data.id}-${index}`}
                    className="animate-in fade-in slide-in-from-bottom-3 duration-400 min-w-0"
                    style={{ animationDelay: `${(index % 5) * 60}ms` }}
                  >
                    {item.type === "project" ? (
                      <ProjectCard project={item.data as ProjectData} />
                    ) : (
                      !hasTalents && <ProfileCard profile={item.data as ProfileData} />
                    )}
                  </div>
                ))}

              {/* Empty state */}
              {!hasTalents && mockFilteredItems.length === 0 && (
                <div className="text-center py-20 text-muted-foreground font-medium bg-card border border-border rounded-xl p-8">
                  Aucun résultat ne correspond à vos critères de recherche.
                </div>
              )}
            </>
          )}
        </div>

        {/* Messaging widget fixed to the bottom of the viewport. */}
        <div className={isMessagesCollapsed ? "fixed bottom-2 right-4 z-40 w-[min(360px,calc(100vw-2rem))]" : "flex w-[360px] shrink-0 self-start"}>
          <MessagesPanel isCollapsed={isMessagesCollapsed} onCollapsedChange={setIsMessagesCollapsed} />
        </div>
      </div>
    </DashboardLayout>
  );
}
