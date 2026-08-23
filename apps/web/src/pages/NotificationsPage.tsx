import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, BellRing, CircleAlert, FileText, MessageCircle, UserRound } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { listNotifications, markNotificationRead } from '@/data/notificationApi'
import type { NotificationView } from '@cofound/shared'
import { StatusAlertDialog } from '@/components/ui/status-alert-dialog'

function formatNotificationType(type: string) {
  return type
    .replace(/[._-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getNotificationIcon(type: string) {
  const normalizedType = type.toLowerCase()
  if (normalizedType.includes('message')) return MessageCircle
  if (normalizedType.includes('application') || normalizedType.includes('project')) return FileText
  if (normalizedType.includes('connection') || normalizedType.includes('profile')) return UserRound
  return Bell
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationView[]>([])
  const [error, setError] = useState('')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await listNotifications()
      setItems(result)
      setError('')
    } catch {
      setError('Impossible de charger les notifications.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNotifications()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadNotifications])

  async function read(item: NotificationView) {
    if (item.readAt) return
    try {
      await markNotificationRead(item.id)
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? { ...entry, readAt: new Date() } : entry)),
      )
    } catch {
      setError('La notification n’a pas pu être marquée comme lue.')
    }
  }

  const unreadCount = useMemo(() => items.filter((item) => !item.readAt).length, [items])
  const visibleItems = showUnreadOnly ? items.filter((item) => !item.readAt) : items

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-8 sm:px-10">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Activité</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
              {unreadCount > 0 && (
                <span className="inline-flex h-6 items-center rounded-full bg-primary px-2.5 text-xs font-bold text-primary-foreground">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Retrouvez les dernières activités liées à votre parcours CoFound.mg.
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-2xs">
            <BellRing className="h-4 w-4" aria-hidden="true" />
          </div>
        </header>

        <div className="flex items-start gap-6">
          <main className="flex min-w-0 max-w-3xl flex-1 flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer les notifications">
              <button
                type="button"
                onClick={() => setShowUnreadOnly(false)}
                className={`inline-flex h-9 items-center rounded-lg px-3.5 text-xs font-medium transition-colors sm:text-sm ${
                  !showUnreadOnly
                    ? 'bg-primary text-primary-foreground shadow-none'
                    : 'border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                Toutes
              </button>
              <button
                type="button"
                onClick={() => setShowUnreadOnly(true)}
                className={`inline-flex h-9 items-center rounded-lg px-3.5 text-xs font-medium transition-colors sm:text-sm ${
                  showUnreadOnly
                    ? 'bg-primary text-primary-foreground shadow-none'
                    : 'border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                Non lues{unreadCount > 0 ? ` (${unreadCount})` : ''}
              </button>
            </div>

            <section className="space-y-3" aria-live="polite" aria-label="Liste des notifications">
              {!error && !isLoading && visibleItems.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Bell className="mx-auto mb-3 h-10 w-10 text-primary" aria-hidden="true" />
                  <p className="font-semibold text-foreground">
                    {showUnreadOnly ? 'Aucune notification non lue.' : 'Aucune notification.'}
                  </p>
                  <p className="mt-1 text-sm">
                    {showUnreadOnly ? 'Vous êtes à jour pour le moment.' : 'Les nouvelles activités apparaîtront ici.'}
                  </p>
                </div>
              ) : !error ? (
                visibleItems.map((item) => {
                  const Icon = getNotificationIcon(item.type)
                  const isUnread = !item.readAt
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void read(item)}
                      className={`group flex w-full items-start gap-3 rounded-xl border p-4 text-left shadow-2xs transition-[border-color,box-shadow,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
                        isUnread
                          ? 'border-primary/25 bg-primary/5 hover:border-primary/50 hover:shadow-sm'
                          : 'border-border/80 bg-card hover:border-primary/35 hover:shadow-sm'
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                          isUnread
                            ? 'border-primary/20 bg-primary/10 text-primary'
                            : 'border-border bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-3">
                          <span className={`text-sm leading-snug ${isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                            {formatNotificationType(item.type)}
                          </span>
                          {isUnread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Non lue" />}
                        </span>
                        <time className="mt-1.5 block text-xs text-muted-foreground" dateTime={item.createdAt.toISOString()}>
                          {item.createdAt.toLocaleString('fr-FR')}
                        </time>
                      </span>
                    </button>
                  )
                })
              ) : null}
            </section>

            {error && (
              <StatusAlertDialog
                icon={CircleAlert}
                title="Impossible de charger les notifications."
                description=""
                statusCode="503"
                statusMessage="Le code 503 indique que le service est temporairement indisponible."
                tone="destructive"
                onBack={() => window.history.back()}
                onRetry={() => void loadNotifications()}
              />
            )}
          </main>

          <aside className="sticky top-[90px] hidden h-fit shrink-0 self-start lg:flex lg:w-[320px] lg:flex-col lg:gap-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-primary">
                <BellRing className="h-4 w-4" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-wider">Votre activité</p>
              </div>
              <p className="mt-3 font-heading text-2xl font-bold text-foreground">{items.length}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                notification{items.length > 1 ? 's' : ''} dans votre espace personnel.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-2xs">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">À savoir</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Ouvrez une notification pour la marquer automatiquement comme lue.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  )
}
