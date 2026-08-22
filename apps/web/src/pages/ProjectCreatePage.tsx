import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectCreateSchema } from '@cofound/shared'
import { apiClient } from '@/lib/api-client'

export default function ProjectCreatePage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [pitch, setPitch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const parsed = projectCreateSchema.safeParse({ title, pitch })
    if (!parsed.success) {
      setError('Le titre doit contenir au moins 3 caractères et le pitch au moins 10 caractères.')
      return
    }
    setSaving(true)
    try {
      const project = await apiClient.post<{ id: string }>('/projects', parsed.data)
      navigate(`/projects/${project.id}`)
    } catch {
      setError('La création du projet a échoué. Veuillez réessayer.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">Nouveau projet</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Donnez forme à votre idée</h1>
        <p className="mt-3 text-muted-foreground">Commencez par un titre et un pitch. Vous pourrez compléter le BMC ensuite.</p>
      </div>
      <form onSubmit={submit} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Titre du projet</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required className="w-full rounded-md border bg-background px-3 py-2" placeholder="Ex. Agriculture durable à Madagascar" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Pitch</span>
          <textarea value={pitch} onChange={(event) => setPitch(event.target.value)} maxLength={2000} required rows={6} className="w-full rounded-md border bg-background px-3 py-2" placeholder="Décrivez le problème et la proposition de valeur…" />
        </label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Le projet sera créé en brouillon.</span>
          <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50">{saving ? 'Création…' : 'Créer le projet'}</button>
        </div>
      </form>
    </main>
  )
}
