import { useState } from 'react'
import { blockUser, unblockUser } from '@/data/blockApi'

export function BlockButton({ userId }: { userId: string }) {
  const [blocked, setBlocked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function toggle() {
    setBusy(true)
    setError('')
    try {
      const result = blocked ? await unblockUser(userId) : await blockUser(userId)
      setBlocked(result.blocked)
    } catch {
      setError('Action impossible pour le moment.')
    } finally {
      setBusy(false)
    }
  }

  return <span className="inline-flex flex-col items-end gap-1">
    <button type="button" className="rounded-lg border px-3 py-1.5 text-xs font-medium text-destructive disabled:opacity-50" onClick={() => void toggle()} disabled={busy}>
      {busy ? 'Traitement…' : blocked ? 'Débloquer' : 'Bloquer'}
    </button>
    {error && <span role="alert" className="text-xs text-destructive">{error}</span>}
  </span>
}
