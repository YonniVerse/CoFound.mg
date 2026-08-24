import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { talentFeedResponseSchema, type TalentFeedCard, type TalentFeedQuery } from "@cofound/shared";
import { MOCK_PROFILES } from "@/data/mockFeed";

const ALLOW_MOCK_FALLBACK = import.meta.env.DEV;

const FALLBACK_TALENTS: TalentFeedCard[] = MOCK_PROFILES.map((p, idx) => ({
  id: `mock-talent-${idx + 1}`,
  pseudonym: p.name,
  avatarSeed: p.id,
  headline: `${p.field} · ${p.school}`,
  bio: p.bio,
  field: { id: `f-${idx}`, slug: p.field.toLowerCase(), labelKey: `${p.school} · ${p.field}` },
  cohortYear: 2024,
  availabilityHours: 15 + idx * 5,
  goals: [p.seeking],
  skills: p.skills.map((sk, sIdx) => ({
    id: `sk-${idx}-${sIdx}`,
    slug: sk.toLowerCase(),
    labelKey: sk,
  })),
  completion: 85 - idx * 10,
}));

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
        if (response.items.length > 0) {
          setTalents(response.items);
        } else {
          setTalents(ALLOW_MOCK_FALLBACK ? FALLBACK_TALENTS : []);
        }
      }

      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch {
      if (!isLoadMore) {
        if (ALLOW_MOCK_FALLBACK) {
          const filtered = search
            ? FALLBACK_TALENTS.filter(
                (t) =>
                  t.pseudonym.toLowerCase().includes(search.toLowerCase()) ||
                  (t.headline && t.headline.toLowerCase().includes(search.toLowerCase())) ||
                  (t.bio && t.bio.toLowerCase().includes(search.toLowerCase())),
              )
            : FALLBACK_TALENTS;
          setTalents(filtered);
        } else {
          setTalents([]);
          setError('Le flux des talents est temporairement indisponible.');
        }
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchTalents({
        search: search || undefined,
        limit: 12,
      });
    }, 0);
    return () => window.clearTimeout(timer);
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

  const retry = useCallback(() => {
    fetchTalents({
      search: search || undefined,
      limit: 12,
    });
  }, [fetchTalents, search]);

  return {
    talents,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    search,
    setSearch,
    loadMore,
    retry,
  };
}
