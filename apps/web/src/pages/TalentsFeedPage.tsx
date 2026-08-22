import { useEffect, useRef } from "react";
import { Search, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TalentCard } from "@/components/feed/TalentCard";
import { TalentCardSkeleton } from "@/components/feed/TalentCardSkeleton";
import { FeedErrorWidget } from "@/components/feed/FeedErrorWidget";
import { Input } from "@/components/ui/input";
import { useTalentFeedData } from "@/hooks/useTalentFeedData";

export default function TalentsFeedPage() {
  const { talents, isLoading, isLoadingMore, hasMore, error, search, setSearch, loadMore, retry } = useTalentFeedData();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoadingMore || isLoading) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry?.isIntersecting && loadMore(),
      { rootMargin: "240px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  return (
    <DashboardLayout>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8 sm:px-10">
        <header className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">La communauté</p>
            <h1 className="font-heading text-3xl font-bold text-foreground">Talents et cofondateurs</h1>
            <p className="mt-2 text-sm text-muted-foreground">Découvre des profils pseudonymisés par compétences, objectifs et disponibilités.</p>
          </div>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un talent…" className="pl-9" aria-label="Rechercher un talent" />
          </label>
        </header>

        {isLoading && <div className="space-y-4"><TalentCardSkeleton /><TalentCardSkeleton /></div>}
        {error && <FeedErrorWidget message={error} onRetry={retry} />}
        {!isLoading && !error && talents.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
            <Users className="mx-auto mb-3 h-8 w-8 text-primary" />
            <p className="font-semibold">Aucun talent ne correspond à ta recherche.</p>
            <p className="mt-1 text-sm">Essaie un autre terme ou élargis ta recherche.</p>
          </div>
        )}
        {!isLoading && !error && talents.length > 0 && (
          <div className="space-y-5">
            {talents.map((talent) => <TalentCard key={talent.id} talent={talent} />)}
            {hasMore && <div ref={sentinelRef} className="h-10" aria-hidden="true">{isLoadingMore && <TalentCardSkeleton />}</div>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
