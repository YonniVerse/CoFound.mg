import { useState, useEffect, useTransition } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, X, Building2, User, Rocket, AlertCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProjectCard } from '@/components/feed/ProjectCard'
import { ProfileCard } from '@/components/feed/ProfileCard'
import { useI18n } from '@/i18n'
import { apiClient } from '@/lib/api-client'
import type { SearchResponse, SearchType } from '@cofound/shared'

const POPULAR_SKILLS = [
  'React / TypeScript',
  'IA & Machine Learning',
  'UI/UX Design',
  'Business Development',
  'AgriTech & Impact',
  'Agronomie',
]

const ACTIVE_SECTORS = [
  'AgriTech',
  'FinTech',
  'Énergie & Climat',
  'Santé & MedTech',
  'Éducation',
]

export default function SearchPage() {
  const { t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialQuery = searchParams.get('q') ?? ''
  const initialType = (searchParams.get('type') as SearchType) ?? 'all'

  const [query, setQuery] = useState(initialQuery)
  const [activeType, setActiveType] = useState<SearchType>(initialType)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [, startTransition] = useTransition()

  // 300ms debounce on input search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 300)
    return () => clearTimeout(handler)
  }, [query])

  // Sync URL search params
  useEffect(() => {
    const nextParams = new URLSearchParams()
    if (debouncedQuery) nextParams.set('q', debouncedQuery)
    if (activeType !== 'all') nextParams.set('type', activeType)
    startTransition(() => {
      setSearchParams(nextParams, { replace: true })
    })
  }, [debouncedQuery, activeType, setSearchParams])

  // Fetch search results from API when debounced query or tab type changes
  useEffect(() => {
    if (!debouncedQuery) return

    let isMounted = true

    async function loadResults() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await apiClient.get<SearchResponse>(
          `/search?q=${encodeURIComponent(debouncedQuery)}&type=${activeType}`,
        )
        if (isMounted) {
          setResults(data)
        }
      } catch {
        if (isMounted) {
          setError(t('search.error'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadResults()

    return () => {
      isMounted = false
    }
  }, [debouncedQuery, activeType, t])

  const activeResults = debouncedQuery ? results : null

  const handleSelectSuggestion = (text: string) => {
    setQuery(text)
  }

  const handleClear = () => {
    setQuery('')
    setDebouncedQuery('')
    setResults(null)
  }

  const counts = activeResults?.counts ?? { projects: 0, talents: 0, opportunities: 0 }
  const totalCount = counts.projects + counts.talents + counts.opportunities

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-8 sm:px-10">
        {/* Search header */}
          <div className="max-w-3xl space-y-3">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            {t('search.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('search.subtitle')}
          </p>

          {/* Search bar input with icon and clear button */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="h-11 rounded-xl border border-border/80 bg-card pl-11 pr-11 text-sm font-medium shadow-2xs transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 sm:text-base"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                aria-label={t('search.empty.reset')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search scope tabs when there's a active query */}
        {debouncedQuery && (
          <div className="flex flex-wrap gap-2 border-b border-border pb-3">
            <Button
              variant={activeType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveType('all')}
              className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium sm:text-sm"
            >
              {t('search.tab.all')}
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {totalCount}
              </Badge>
            </Button>
            <Button
              variant={activeType === 'projects' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveType('projects')}
              className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium sm:text-sm"
            >
              <Rocket className="h-3.5 w-3.5" />
              {t('search.tab.projects')}
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {counts.projects}
              </Badge>
            </Button>
            <Button
              variant={activeType === 'talents' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveType('talents')}
              className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium sm:text-sm"
            >
              <User className="h-3.5 w-3.5" />
              {t('search.tab.talents')}
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {counts.talents}
              </Badge>
            </Button>
            <Button
              variant={activeType === 'opportunities' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveType('opportunities')}
              className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium sm:text-sm"
            >
              <Building2 className="h-3.5 w-3.5" />
              {t('search.tab.opportunities')}
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {counts.opportunities}
              </Badge>
            </Button>
          </div>
        )}

        {/* Content area */}
        {/* State 1: Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-4 py-16 text-muted-foreground">
            <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
            <p className="text-sm font-medium">{t('search.loading')}</p>
          </div>
        )}

        {/* State 2: Error */}
        {error && !isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* State 3: Empty query initial suggestions */}
        {!debouncedQuery && !isLoading && (
          <div className="space-y-6 py-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <SearchIcon className="h-4 w-4 text-primary" />
                {t('search.suggestions.skills')}
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleSelectSuggestion(skill)}
                    className="rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-2xs transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Building2 className="h-4 w-4 text-secondary" />
                {t('search.suggestions.sectors')}
              </div>
              <div className="flex flex-wrap gap-2">
                {ACTIVE_SECTORS.map((sector) => (
                  <button
                    key={sector}
                    onClick={() => handleSelectSuggestion(sector)}
                    className="rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-2xs transition-colors hover:border-secondary/40 hover:bg-secondary/5 hover:text-secondary"
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* State 4: Search results */}
        {debouncedQuery && !isLoading && !error && activeResults && (
          <div className="space-y-8">
            {totalCount === 0 ? (
              /* Empty search results */
              <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-border bg-card p-8 text-center shadow-2xs sm:p-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto text-muted-foreground">
                  <SearchIcon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    {t('search.empty.noResults').replace('{query}', debouncedQuery)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('search.empty.tryAgain')}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  {t('search.empty.reset')}
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Projects results */}
                {(activeType === 'all' || activeType === 'projects') &&
                  activeResults.projects.length > 0 && (
                    <section className="space-y-4">
                      <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-primary" />
                        {t('search.tab.projects')} ({activeResults.projects.length})
                      </h2>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {activeResults.projects.map((proj) => (
                          <ProjectCard
                            key={proj.id}
                            project={{
                              id: proj.id,
                              title: proj.title,
                              description: proj.pitch,
                              sector: 'Autre',
                              author: {
                                name: 'Fondateur',
                                school: 'Établissement',
                                avatar: null,
                              },
                              seekingSkills: [],
                              isFemaleImpact: false,
                              timeAgo: 'Récemment',
                              applicantsCount: 0,
                            }}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                {/* Talents results */}
                {(activeType === 'all' || activeType === 'talents') &&
                  activeResults.talents.length > 0 && (
                    <section className="space-y-4">
                      <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                        <User className="h-5 w-5 text-secondary" />
                        {t('search.tab.talents')} ({activeResults.talents.length})
                      </h2>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {activeResults.talents.map((talent) => (
                          <ProfileCard
                            key={talent.pseudonym}
                            profile={{
                              id: talent.pseudonym,
                              name: talent.pseudonym,
                              school: 'Établissement certifié',
                              field: talent.headline ?? 'Fondateur',
                              avatar: null,
                              bio: talent.bio ?? '',
                              skills: [],
                              seeking: 'Co-fondateur',
                              isFemale: false,
                            }}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                {/* Opportunities results */}
                {(activeType === 'all' || activeType === 'opportunities') &&
                  activeResults.opportunities.length > 0 && (
                    <section className="space-y-4">
                      <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-impact" />
                        {t('search.tab.opportunities')} ({activeResults.opportunities.length})
                      </h2>
                      <div className="space-y-4">
                        {activeResults.opportunities.map((opp) => (
                          <div
                            key={opp.id}
                            className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-2xs transition-all duration-150 hover:border-border/80 sm:p-6"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <h3 className="min-w-0 flex-1 font-heading text-sm font-semibold leading-tight text-foreground sm:text-base">
                                {opp.title}
                              </h3>
                              {opp.organizationName && (
                                <Badge variant="muted" className="text-xs">
                                  {opp.organizationName}
                                </Badge>
                              )}
                            </div>
                            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                              {opp.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
