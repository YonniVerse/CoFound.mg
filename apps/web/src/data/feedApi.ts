import { fetchMock } from "./api";
import { MOCK_PROJECTS, MOCK_PROFILES, SUGGESTED_PROFILES } from "./mockFeed";
import type { ProjectData } from "@/components/feed/ProjectCard";
import type { ProfileData } from "@/components/feed/ProfileCard";

export type FeedItemType = 
  | { type: "project"; data: ProjectData; date: string }
  | { type: "profile"; data: ProfileData; date: string };

export async function getFeedItems() {
  const feedItems: FeedItemType[] = [
    ...MOCK_PROJECTS.map(p => ({ type: "project" as const, data: p, date: p.timeAgo })),
    ...MOCK_PROFILES.map(p => ({ type: "profile" as const, data: p, date: "Nouveau" }))
  ];
  
  // Simple mélange pour la démo
  const sortedItems = feedItems.sort((a, b) => a.data.id.localeCompare(b.data.id));

  return fetchMock({
    success: true,
    data: sortedItems,
    message: "Feed retrieved successfully",
    meta: {
      total: sortedItems.length
    }
  });
}

export async function getSuggestedProfiles() {
  return fetchMock({
    success: true,
    data: SUGGESTED_PROFILES,
    message: "Suggested profiles retrieved successfully",
    meta: {
      total: SUGGESTED_PROFILES.length
    }
  });
}
