import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Clock3, Mail, Pencil, ShieldCheck, UserRound } from 'lucide-react'
import { privateTalentProfileSchema } from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api-client'
import { useI18n } from '@/i18n'

type PrivateProfileResponse = ReturnType<typeof privateTalentProfileSchema.parse>

function formatLabel(value: string | null | undefined) {
  if (!value) return '—'
  return value
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]" role="status" aria-label="Chargement du profil">
      <Card className="overflow-hidden rounded-2xl border-border/70 shadow-2xs">
        <CardHeader className="border-b border-border/60 px-5 py-5 sm:px-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-5 px-5 py-6 sm:px-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-border/70 shadow-2xs">
        <CardHeader className="px-5 py-5">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfilePage() {
  const { t } = useI18n()
  const [data, setData] = useState<PrivateProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    void apiClient.get('/me/profile', privateTalentProfileSchema)
      .then((payload) => { if (active) setData(payload) })
      .catch(() => { if (active) setError(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const profile = data?.profile
  const identityName = [data?.identity?.firstName, data?.identity?.lastName].filter(Boolean).join(' ').trim()
  const displayName = identityName || profile?.pseudonym || data?.user.email || 'Mon profil'
  const completion = profile?.completion ?? 0

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 pb-10 pt-8 sm:px-8 sm:pt-10 lg:px-10 lg:pb-12 lg:pt-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
              <Link to="/feed"><ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />{t('common.back')} au Feed</Link>
            </Button>
            <Button size="sm" asChild className="gap-2">
              <Link to="/onboarding"><Pencil className="h-4 w-4" aria-hidden="true" />Modifier mon profil<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            </Button>
          </div>

          <header className="flex flex-col gap-5 border-b border-border/60 pb-7 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <UserRound className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Espace personnel</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">Mon profil</h1>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">Gère tes informations privées et contrôle ce qui peut apparaître dans les espaces publics.</p>
              </div>
            </div>
          </header>

          {loading && <ProfileSkeleton />}
          {!loading && error && (
            <Card className="rounded-2xl border-border/70 shadow-2xs">
              <CardContent className="p-10 text-center">
                <p className="font-semibold text-foreground">Impossible de charger ton profil.</p>
                <p className="mt-2 text-sm text-muted-foreground">Réessaie dans quelques instants.</p>
              </CardContent>
            </Card>
          )}
          {!loading && !error && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
              <Card className="overflow-hidden rounded-2xl border-border/70 shadow-2xs">
                <CardHeader className="border-b border-border/60 px-5 py-5 sm:px-6">
                  <CardTitle className="text-base font-bold tracking-tight">Informations du profil</CardTitle>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Ces informations sont visibles uniquement par toi dans cet espace.</p>
                </CardHeader>
                <CardContent className="space-y-6 px-5 py-6 sm:px-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted text-muted-foreground">
                      <UserRound className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-bold text-foreground">{displayName}</h2>
                      {data?.user.email && <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Mail className="h-3.5 w-3.5" aria-hidden="true" />{data.user.email}</p>}
                      {profile?.pseudonym && <p className="mt-1 text-xs font-medium text-muted-foreground">Pseudonyme public : {profile.pseudonym}</p>}
                    </div>
                  </div>

                  {profile ? (
                    <>
                      {profile.headline && <p className="border-t border-border/60 pt-5 text-base font-semibold leading-relaxed text-foreground">{profile.headline}</p>}
                      {profile.bio && <p className="text-sm leading-7 text-muted-foreground">{profile.bio}</p>}
                      <div className="grid gap-3 border-t border-border/60 pt-5 sm:grid-cols-2">
                        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Domaine d’études</p>
                          <p className="mt-2 font-semibold text-foreground">{formatLabel(profile.field?.slug)}</p>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Disponibilité</p>
                          <p className="mt-2 flex items-center gap-1.5 font-semibold text-foreground"><Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />{profile.availabilityHours === null ? '—' : `${profile.availabilityHours} h / semaine`}</p>
                        </div>
                      </div>
                      {profile.goals.length > 0 && <div className="border-t border-border/60 pt-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Objectifs</p><div className="mt-3 flex flex-wrap gap-2">{profile.goals.map((goal) => <span key={goal} className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground">{goal}</span>)}</div></div>}
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
                      <p className="font-semibold text-foreground">Ton profil n’est pas encore renseigné.</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Commence l’onboarding pour ajouter tes informations.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-2xl border-border/70 shadow-2xs">
                  <CardHeader className="px-5 py-5">
                    <CardTitle className="text-base font-bold tracking-tight">Progression du profil</CardTitle>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Complète les étapes à ton rythme.</p>
                  </CardHeader>
                  <CardContent className="space-y-4 px-5 pb-5">
                    <div className="flex items-center justify-between text-sm"><span className="font-medium text-muted-foreground">Complétion</span><span className="font-bold text-primary">{completion}%</span></div>
                    <Progress value={completion} className="h-2" />
                    <Button variant="outline" className="w-full justify-center" asChild><Link to="/onboarding">Continuer la mise à jour<ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link></Button>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border-border/70 bg-primary/[0.03] shadow-2xs">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" /><div><p className="text-sm font-semibold leading-snug text-foreground">Identité protégée</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Ton nom et tes données privées ne sont pas affichés dans le Feed public.</p></div></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}
