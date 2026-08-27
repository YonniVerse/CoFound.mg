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

      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-6 px-4 py-8 sm:px-10 lg:flex-row">
        {/* Main Column: Feed */}
        <div className="w-full min-w-0 flex-none flex flex-col gap-6 lg:w-[800px] lg:max-w-[800px]">
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

        {/* Reserve the sidebar column in both collapsed and expanded states. */}
        <aside className="flex w-full shrink-0 self-start lg:sticky lg:top-[90px] lg:w-[360px]">
          <MessagesPanel isCollapsed={isMessagesCollapsed} onCollapsedChange={setIsMessagesCollapsed} />
        </aside>
      </div>
    </DashboardLayout>
  );
}
