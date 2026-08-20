import { useState, useEffect } from "react";
import { getFeedItems, getSuggestedProfiles, type FeedItemType } from "@/data/feedApi";
import type { SuggestedProfileData } from "@/components/feed/SuggestedProfilesWidget";

export function useFeedData() {
  const [feedItems, setFeedItems] = useState<FeedItemType[]>([]);
  const [suggestedProfiles, setSuggestedProfiles] = useState<SuggestedProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const [feedRes, suggestedRes] = await Promise.all([
          getFeedItems(),
          getSuggestedProfiles()
        ]);

        if (feedRes.success) {
          setFeedItems(feedRes.data);
        } else {
          throw new Error(feedRes.message);
        }

        if (suggestedRes.success) {
          setSuggestedProfiles(suggestedRes.data);
        } else {
          throw new Error(suggestedRes.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue lors du chargement.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return { feedItems, suggestedProfiles, isLoading, error };
}
