import { useState, useEffect, useTransition } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, X, Sparkles, Building2, User, Rocket, AlertCircle } from 'lucide-react'
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
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-8 space-y-8">
        {/* Search header */}
        <div className="space-y-4 max-w-2xl">
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
              className="pl-12 pr-10 h-12 text-base rounded-xl border-border bg-card shadow-xs focus-visible:ring-2 focus-visible:ring-ring"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label={t('search.empty.reset')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search scope tabs when there's a active query */}
        {debouncedQuery && (
          <div className="flex flex-wrap gap-2 border-b border-border pb-4">
            <Button
              variant={activeType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveType('all')}
              className="rounded-full gap-2"
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
              className="rounded-full gap-2"
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
              className="rounded-full gap-2"
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
              className="rounded-full gap-2"
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
          <div className="flex flex-col items-center justify-center py-16 space-y-4 text-muted-foreground">
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
          <div className="space-y-8 py-4 animate-in fade-in duration-300">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                {t('search.suggestions.skills')}
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleSelectSuggestion(skill)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-muted hover:bg-primary-light hover:text-primary-dark text-muted-foreground border border-border transition-colors"
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
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-muted hover:bg-secondary-light hover:text-secondary text-muted-foreground border border-border transition-colors"
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
          <div className="space-y-8 animate-in fade-in duration-300">
            {totalCount === 0 ? (
              /* Empty search results */
              <div className="text-center py-16 space-y-4 max-w-md mx-auto">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <div className="space-y-3">
                        {activeResults.opportunities.map((opp) => (
                          <div
                            key={opp.id}
                            className="p-5 rounded-xl border border-border bg-card shadow-2xs space-y-2 hover:border-primary/40 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-heading font-semibold text-base text-foreground">
                                {opp.title}
                              </h3>
                              {opp.organizationName && (
                                <Badge variant="muted" className="text-xs">
                                  {opp.organizationName}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
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
