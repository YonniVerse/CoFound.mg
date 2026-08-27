import { useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, FileText, Loader2, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { projectPostCreateSchema, type OwnedProject, type ProjectPostFeedItem, type ProjectPostType } from '@cofound/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { getOwnedProjects, getProjectPostsFeed, createProjectPost } from '@/data/projectApi'
import { useI18n } from '@/i18n'

const postTypes: Array<{ value: ProjectPostType; labelKey: 'projectsPosts.update' | 'projectsPosts.collaborator' | 'projectsPosts.mentorship' | 'projectsPosts.funding' }> = [
  { value: 'UPDATE', labelKey: 'projectsPosts.update' },
  { value: 'SEEKING_COLLABORATOR', labelKey: 'projectsPosts.collaborator' },
  { value: 'SEEKING_MENTORSHIP', labelKey: 'projectsPosts.mentorship' },
  { value: 'SEEKING_FUNDING', labelKey: 'projectsPosts.funding' },
]

function projectInitial(title: string) {
  return title.trim().charAt(0).toUpperCase() || 'P'
}

function formatDate(value: Date) {
  return value.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function ProjectSocialFeed() {
  const { t } = useI18n()
  const [ownedProjects, setOwnedProjects] = useState<OwnedProject[]>([])
  const [posts, setPosts] = useState<ProjectPostFeedItem[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [type, setType] = useState<ProjectPostType>('UPDATE')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState('')

  const selectedProject = useMemo(
    () => ownedProjects.find((project) => project.id === selectedProjectId) ?? null,
    [ownedProjects, selectedProjectId],
  )

  useEffect(() => {
    let active = true
    Promise.all([getOwnedProjects(), getProjectPostsFeed({ limit: 20 })])
      .then(([projectsResponse, postsResponse]) => {
        if (!active) return
        setOwnedProjects(projectsResponse.projects)
        setSelectedProjectId((current) => current || projectsResponse.projects[0]?.id || '')
        setPosts(postsResponse.items)
      })
      .catch(() => {
        if (active) setError(t('feed.projectPostsLoadError'))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [t])

  const publish = async () => {
    if (!selectedProjectId) return
    const parsed = projectPostCreateSchema.safeParse({ type, content })
    if (!parsed.success) {
      setError(t('feed.projectPostContentError'))
      return
    }

    setIsPublishing(true)
    setError('')
    try {
      await createProjectPost(selectedProjectId, parsed.data)
      const refreshed = await getProjectPostsFeed({ limit: 20 })
      setPosts(refreshed.items)
      setContent('')
    } catch {
      setError(t('feed.projectPostCreateError'))
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <header className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{t('feed.projectsEyebrow')}</p>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">{t('feed.projectsFeedTitle')}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{t('feed.projectsFeedSubtitle')}</p>
      </header>

      <Card className="overflow-hidden rounded-2xl border-border/80 shadow-sm">
        <div className="flex items-start gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
            <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-base font-semibold text-foreground">{t('feed.projectComposerTitle')}</h2>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t('feed.projectComposerHint')}</p>
          </div>
        </div>

        {ownedProjects.length > 0 ? (
          <div className="space-y-4 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs font-semibold text-muted-foreground" htmlFor="project-post-project">
                {t('feed.projectComposerProjectLabel')}
                <select
                  id="project-post-project"
                  value={selectedProjectId}
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {ownedProjects.map((project) => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </label>
              <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs font-semibold text-muted-foreground" htmlFor="project-post-type">
                {t('feed.projectComposerTypeLabel')}
                <select
                  id="project-post-type"
                  value={type}
                  onChange={(event) => setType(event.target.value as ProjectPostType)}
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {postTypes.map((postType) => <option key={postType.value} value={postType.value}>{t(postType.labelKey)}</option>)}
                </select>
              </label>
            </div>
            <Textarea
              id="project-post-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={2000}
              placeholder={t('feed.projectComposerPlaceholder')}
              className="min-h-28 resize-y rounded-xl border-border bg-background text-sm leading-relaxed shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-label={t('projectsPosts.messageLabel')}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-muted-foreground">{content.length}/2 000</span>
              <Button
                type="button"
                onClick={() => void publish()}
                disabled={isPublishing || !selectedProjectId || !content.trim()}
                className="h-9 gap-2 rounded-lg px-4 text-xs font-semibold sm:text-sm"
              >
                {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                {isPublishing ? t('feed.projectPostPublishing') : t('feed.projectPostPublish')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-6 text-sm text-muted-foreground sm:px-6">{t('feed.projectComposerNoProject')}</div>
        )}
      </Card>

      {error && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      <section className="space-y-4" aria-live="polite">
        {isLoading && (
          <div className="rounded-2xl border border-border/70 bg-card px-5 py-8 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-primary" aria-hidden="true" />
            {t('feed.projectPostsLoading')}
          </div>
        )}
        {!isLoading && posts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center">
            <FileText className="mx-auto mb-3 h-8 w-8 text-primary/70" aria-hidden="true" />
            <p className="font-semibold text-foreground">{t('feed.projectPostsEmptyTitle')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('feed.projectPostsEmptyHint')}</p>
          </div>
        )}
        {!isLoading && posts.map((post) => (
          <article key={post.id} className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground" aria-hidden="true">
                  {projectInitial(post.project.title)}
                </div>
                <div className="min-w-0">
                  <Link to={`/projects/${post.projectId}`} className="truncate font-heading text-base font-semibold text-foreground hover:text-primary">
                    {post.project.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t('feed.projectPostPublishedLabel')} · {formatDate(post.createdAt)}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">{t(postTypes.find((postType) => postType.value === post.type)?.labelKey ?? 'projectsPosts.update')}</span>
            </div>
            <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">{post.content}</p>
              <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-3 text-xs text-muted-foreground">
                <span>{t('feed.projectPostPublishedAs')} {post.project.title}</span>
                <Link to={`/projects/${post.projectId}`} className="font-semibold text-primary hover:underline">{t('feed.projectPostViewProject')}</Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      {selectedProject && ownedProjects.length > 0 && <span className="sr-only">{selectedProject.title}</span>}
    </div>
  )
}
