import { useEffect, useRef, useState } from 'react'
import { Plus, Search, SearchX, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProjectCard } from '@/components/feed/ProjectCard'
import { ProjectCardSkeleton } from '@/components/feed/ProjectCardSkeleton'
import { FeedErrorWidget } from '@/components/feed/FeedErrorWidget'
import { MessagesPanel } from '@/components/feed/MessagesPanel'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useFeedData } from '@/hooks/useFeedData'
import { useI18n } from '@/i18n'

export default function ProjectsFeedPage() {
  const { t } = useI18n()
  const [isMessagesCollapsed, setIsMessagesCollapsed] = useState(true)
  const {
    apiProjects,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    search,
    setSearch,
    selectedStatus,
    setSelectedStatus,
    loadMore,
  } = useFeedData()
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoadingMore || isLoading) return
    const observer = new IntersectionObserver(
      ([entry]) => entry?.isIntersecting && loadMore(),
      { rootMargin: '240px' },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoading, isLoadingMore, loadMore])

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-8 sm:px-10">
        <header className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{t('projects.eyebrow')}</p>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">{t('projects.title')}</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{t('projects.subtitle')}</p>
            </div>
            <Button asChild className="h-9 w-full shrink-0 gap-1.5 rounded-lg px-3.5 text-xs font-medium sm:w-auto sm:text-sm">
              <Link to="/projects/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Nouveau projet
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative w-full max-w-2xl">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('projects.searchPlaceholder')}
                className="h-11 rounded-xl border border-border/80 bg-card pl-10 pr-4 text-sm font-medium shadow-2xs transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                aria-label={t('projects.searchLabel')}
              />
            </label>

            <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('projects.filterLabel')}>
              <span className="mr-1 hidden items-center gap-1.5 text-xs font-semibold text-muted-foreground sm:inline-flex">
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                {t('projects.filterLabel')}
              </span>
              <Button
                size="sm"
                variant={selectedStatus === 'RECRUITING' ? 'default' : 'outline'}
                onClick={() => setSelectedStatus('RECRUITING')}
                className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium sm:text-sm"
              >
                {t('feed.projectsRecruiting')}
              </Button>
              <Button
                size="sm"
                variant={selectedStatus === 'ALL' ? 'default' : 'outline'}
                onClick={() => setSelectedStatus('ALL')}
                className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium sm:text-sm"
              >
                {t('feed.allProjects')}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex w-full min-w-0 max-w-full flex-col lg:max-w-[calc(100vw-16rem)] items-start gap-6 overflow-x-hidden lg:flex-row">
          <main className="w-full min-w-0 flex-1 flex flex-col gap-6 lg:max-w-[800px]">
            {isLoading && (
              <div className="space-y-4">
                <ProjectCardSkeleton />
                <ProjectCardSkeleton />
                <ProjectCardSkeleton />
              </div>
            )}

            {error && <FeedErrorWidget message={error} onRetry={() => window.location.reload()} />}

            {!isLoading && !error && apiProjects.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <SearchX className="mx-auto mb-3 h-10 w-10 text-primary" aria-hidden="true" />
                <p className="font-semibold text-foreground">{t('projects.emptyTitle')}</p>
                <p className="mt-1 text-sm">{t('projects.emptyHint')}</p>
              </div>
            )}

            {!isLoading && !error && apiProjects.length > 0 && (
              <div className="min-w-0 space-y-6">
                {apiProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className="min-w-0 animate-in fade-in slide-in-from-bottom-3 duration-400"
                    style={{ animationDelay: `${(index % 5) * 60}ms` }}
                  >
                    <ProjectCard project={project} />
                  </div>
                ))}
                {hasMore && (
                  <div ref={sentinelRef} className="space-y-4 pt-2">
                    {isLoadingMore && (
                      <>
                        <ProjectCardSkeleton />
                        <ProjectCardSkeleton />
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>

          <aside className="flex w-full shrink-0 flex-col self-start lg:sticky lg:top-[90px] lg:w-[360px]">
            {isMessagesCollapsed && <div className="h-10 w-full" aria-hidden="true" />}
            <div className={isMessagesCollapsed ? "fixed bottom-2 right-4 z-40 w-[min(360px,calc(100vw-2rem))]" : "w-full"}>
              <MessagesPanel isCollapsed={isMessagesCollapsed} onCollapsedChange={setIsMessagesCollapsed} />
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  )
}
