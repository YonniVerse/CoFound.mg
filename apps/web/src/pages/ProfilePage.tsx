import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, Clock3, Mail, Pencil, UserRound } from 'lucide-react'
import { privateTalentProfileSchema } from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api-client'

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
    <div className="mx-auto w-full max-w-4xl" role="status" aria-label="Chargement du profil">
      <Card className="overflow-hidden rounded-xl border-border bg-card shadow-2xs">
        <CardHeader className="border-b border-border/60 px-5 py-5 sm:px-6">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full" />
        </CardHeader>
        <CardContent className="space-y-6 px-5 py-6 sm:px-6">
          <div className="mt-2 flex items-start gap-4">
            <Skeleton className="mt-3 h-16 w-16 shrink-0 rounded-2xl" />
            <div className="min-w-0 space-y-2">
              <Skeleton className="mt-3 h-6 w-48 max-w-full" />
              <Skeleton className="h-4 w-60 max-w-full" />
              <Skeleton className="h-3 w-52 max-w-full" />
            </div>
          </div>
          <div className="space-y-3 border-t border-border/50 pt-3">
            <Skeleton className="h-5 w-2/3 max-w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="grid gap-2 border-t border-border/50 pt-3 sm:grid-cols-2">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
          <div className="space-y-3 border-t border-border/50 pt-3"><Skeleton className="h-3 w-20" /><div className="flex gap-2"><Skeleton className="h-7 w-20 rounded-md" /><Skeleton className="h-7 w-28 rounded-md" /><Skeleton className="h-7 w-24 rounded-md" /></div></div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfilePage() {
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

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/feed" className="group inline-flex h-9 w-fit shrink-0 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:text-sm"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />Retour au Feed</Link>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" asChild className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium sm:text-sm"><Link to="/projects/new"><BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />Nouveau projet</Link></Button>
              <Button size="sm" asChild className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium sm:text-sm"><Link to="/onboarding"><Pencil className="h-4 w-4" aria-hidden="true" />Modifier mon profil<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
            </div>
          </div>

          {loading && <ProfileSkeleton />}
          {!loading && error && (
            <Card className="rounded-xl border-border bg-card shadow-2xs">
              <CardContent className="p-10 text-center">
                <p className="font-semibold text-foreground">Impossible de charger ton profil.</p>
                <p className="mt-2 text-sm text-muted-foreground">Réessaie dans quelques instants.</p>
              </CardContent>
            </Card>
          )}
          {!loading && !error && (
            <div className="mx-auto w-full max-w-4xl">
              <Card className="overflow-hidden rounded-xl border-border bg-card shadow-2xs">
                <CardHeader className="border-b border-border/60 px-5 py-5 sm:px-6">
                      <CardTitle className="text-lg font-bold tracking-tight">Informations du profil</CardTitle>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Ces informations sont visibles uniquement par toi dans cet espace.</p>
                </CardHeader>
                <CardContent className="space-y-6 px-5 py-6 sm:px-6">
                  <div className="mt-2 flex items-start gap-4">
                    <div className="mt-3 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted text-muted-foreground">
                      <UserRound className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="mt-3 truncate text-xl font-bold text-foreground">{displayName}</h2>
                      {data?.user.email && <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Mail className="h-3.5 w-3.5" aria-hidden="true" />{data.user.email}</p>}
                      {profile?.pseudonym && <p className="mt-1 text-xs font-medium text-muted-foreground">Pseudonyme public : {profile.pseudonym}</p>}
                    </div>
                  </div>

                  {profile ? (
                    <>
                      {profile.headline && <p className="border-t border-border/50 pt-3 text-base font-semibold leading-relaxed text-foreground">{profile.headline}</p>}
                      {profile.bio && <p className="text-sm leading-6 text-muted-foreground">{profile.bio}</p>}
                      <div className="grid gap-2 border-t border-border/50 pt-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><BriefcaseBusiness className="h-3.5 w-3.5 text-primary" aria-hidden="true" />Domaine d’études</p>
                          <p className="mt-1.5 text-sm font-semibold text-foreground">{formatLabel(profile.field?.slug)}</p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />Disponibilité</p>
                          <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">{profile.availabilityHours === null ? '—' : `${profile.availabilityHours} h / semaine`}</p>
                        </div>
                      </div>
                      {profile.goals.length > 0 && <div className="border-t border-border/50 pt-3"><p className="text-xs font-semibold text-muted-foreground">Objectifs</p><div className="mt-2 flex flex-wrap gap-2">{profile.goals.map((goal) => <span key={goal} className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{goal}</span>)}</div></div>}
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
                      <p className="font-semibold text-foreground">Ton profil n’est pas encore renseigné.</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Commence l’onboarding pour ajouter tes informations.</p>
                    </div>
                  )}
                </CardContent>
              </Card>


            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}
