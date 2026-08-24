import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { listNotifications, markNotificationRead } from '@/data/notificationApi'
import type { NotificationView } from '@cofound/shared'

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationView[]>([])
  const [error, setError] = useState('')
  useEffect(() => { let active = true; void listNotifications().then((result) => { if (active) setItems(result) }).catch(() => { if (active) setError('Impossible de charger les notifications.') }); return () => { active = false } }, [])
  async function read(item: NotificationView) { if (item.readAt) return; try { await markNotificationRead(item.id); setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, readAt: new Date() } : entry)) } catch { setError('La notification n’a pas pu être marquée comme lue.') } }
  return <DashboardLayout><main className="mx-auto w-full max-w-3xl px-6 py-8"><h1 className="text-3xl font-bold">Notifications</h1><p className="mt-2 text-muted-foreground">Vos notifications personnelles, sans identité civile exposée.</p>{error && <p role="alert" className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<section className="mt-6 space-y-3" aria-live="polite">{items.length === 0 ? <p className="rounded-xl border p-6 text-muted-foreground">Aucune notification.</p> : items.map((item) => <button key={item.id} type="button" onClick={() => void read(item)} className={`w-full rounded-xl border p-4 text-left ${item.readAt ? 'bg-card' : 'bg-primary/5 font-semibold'}`}><span>{item.type}</span><time className="mt-1 block text-xs text-muted-foreground">{item.createdAt.toLocaleString('fr-FR')}</time></button>)}</section></main></DashboardLayout>
}
