import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectCard, type ProjectData } from "@/components/feed/ProjectCard";
import { ProfileCard, type ProfileData } from "@/components/feed/ProfileCard";
import { FeedFilters, type FeedFilterType } from "@/components/feed/FeedFilters";
import { ParityWidget } from "@/components/feed/ParityWidget";
import { SuggestedProfilesWidget } from "@/components/feed/SuggestedProfilesWidget";
import { useFeedData } from "@/hooks/useFeedData";

export default function FeedPage() {
  const [filter, setFilter] = useState<FeedFilterType>("all");
  const { feedItems, suggestedProfiles, isLoading, error } = useFeedData();

  const filteredItems = feedItems.filter(item => {
    if (filter === "all") return true;
    if (filter === "projects") return item.type === "project";
    if (filter === "profiles") return item.type === "profile";
    return true;
  });

  return (
    <DashboardLayout>
      <FeedFilters filter={filter} setFilter={setFilter} />

      <div className="flex px-6 sm:px-10 py-8 gap-10 max-w-[1400px]">
        {/* Colonne Principale : Le Feed */}
        <div className="flex-1 max-w-3xl flex flex-col gap-6">
          {isLoading && (
            <div className="flex justify-center items-center py-20 text-muted-foreground font-medium">
              Chargement du fil d'actualité...
            </div>
          )}

          {error && (
            <div className="text-center py-20 text-destructive font-medium">
              {error}
            </div>
          )}

          {!isLoading && !error && filteredItems.map((item, index) => (
            <div key={`${item.type}-${item.data.id}-${index}`} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              {item.type === "project" 
                ? <ProjectCard project={item.data as ProjectData} />
                : <ProfileCard profile={item.data as ProfileData} />
              }
            </div>
          ))}

          {!isLoading && !error && filteredItems.length === 0 && (
            <div className="text-center py-20 text-muted-foreground font-medium">
              Aucun résultat trouvé.
            </div>
          )}
        </div>

        {/* Sidebar Droite : Suggestions & Stats (Masquée sur mobile et tablette) */}
        <div className="hidden xl:flex w-[320px] flex-col gap-6 sticky top-[100px] h-fit">
          <ParityWidget percentage={38} />
          <SuggestedProfilesWidget profiles={suggestedProfiles} />
        </div>
      </div>
    </DashboardLayout>
  );
}
