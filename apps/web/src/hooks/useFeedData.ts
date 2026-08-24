import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { projectFeedResponseSchema, type ProjectFeedCard, type ProjectFeedQuery, ProjectStatus } from "@cofound/shared";
import { getFeedItems, getSuggestedProfiles, type FeedItemType } from "@/data/feedApi";
import type { SuggestedProfileData } from "@/components/feed/SuggestedProfilesWidget";

export function useFeedData() {
  const [feedItems, setFeedItems] = useState<FeedItemType[]>([]);
  const [suggestedProfiles, setSuggestedProfiles] = useState<SuggestedProfileData[]>([]);
  const [apiProjects, setApiProjects] = useState<ProjectFeedCard[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | "ALL">(ProjectStatus.RECRUITING);

  const allowMockFallback = import.meta.env.DEV;

  const fetchProjects = useCallback(async (query: ProjectFeedQuery, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const queryParams = new URLSearchParams();
      if (query.status) queryParams.set("status", query.status);
      if (query.search) queryParams.set("search", query.search);
      if (query.cursor) queryParams.set("cursor", query.cursor);
      if (query.limit) queryParams.set("limit", String(query.limit));

      const path = `/projects/feed${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiClient.get(path, projectFeedResponseSchema);

      if (isLoadMore) {
        setApiProjects((prev) => [...prev, ...response.items]);
      } else {
        setApiProjects(response.items);
      }

      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch {
      if (!isLoadMore) {
        if (allowMockFallback) {
          const feedRes = await getFeedItems();
          if (feedRes.success) setFeedItems(feedRes.data);
        } else {
          setApiProjects([]);
          setError('Le flux des projets est temporairement indisponible.');
        }
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [allowMockFallback]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchProjects({
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
        search: search || undefined,
        limit: 10,
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchProjects, selectedStatus, search]);

  useEffect(() => {
    if (!allowMockFallback) return;
    getSuggestedProfiles().then((res) => {
      if (res.success) setSuggestedProfiles(res.data);
    }).catch(() => undefined);
  }, [allowMockFallback]);

  const loadMore = useCallback(() => {
    if (!nextCursor || isLoadingMore) return;
    fetchProjects(
      {
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
        search: search || undefined,
        cursor: nextCursor,
        limit: 10,
      },
      true,
    );
  }, [fetchProjects, nextCursor, isLoadingMore, selectedStatus, search]);

  return {
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
  };
}
