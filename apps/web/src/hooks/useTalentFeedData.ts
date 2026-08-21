import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { talentFeedResponseSchema, type TalentFeedCard, type TalentFeedQuery } from "@cofound/shared";

export function useTalentFeedData() {
  const [talents, setTalents] = useState<TalentFeedCard[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState("");

  const fetchTalents = useCallback(async (query: TalentFeedQuery, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const queryParams = new URLSearchParams();
      if (query.search) queryParams.set("search", query.search);
      if (query.fieldId) queryParams.set("fieldId", query.fieldId);
      if (query.cursor) queryParams.set("cursor", query.cursor);
      if (query.limit) queryParams.set("limit", String(query.limit));

      const path = `/talents/feed${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiClient.get(path, talentFeedResponseSchema);

      if (isLoadMore) {
        setTalents((prev) => [...prev, ...response.items]);
      } else {
        setTalents(response.items);
      }

      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch {
      setError("Impossible de charger les profils de talents.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchTalents({
      search: search || undefined,
      limit: 12,
    });
  }, [fetchTalents, search]);

  const loadMore = useCallback(() => {
    if (!nextCursor || isLoadingMore) return;
    fetchTalents(
      {
        search: search || undefined,
        cursor: nextCursor,
        limit: 12,
      },
      true,
    );
  }, [fetchTalents, nextCursor, isLoadingMore, search]);

  return {
    talents,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    search,
    setSearch,
    loadMore,
  };
}
