import { useState } from 'react'
import { Flag } from 'lucide-react'
import { reportReasonSchema, type ReportCreateInput, type ReportTargetType } from '@cofound/shared'
import { createReport } from '@/data/reportApi'
import { Button } from '@/components/ui/button'

const reasons = reportReasonSchema.options

const labels: Record<ReportCreateInput['reason'], string> = {
  HARASSMENT: 'Harcèlement',
  HATE_SPEECH: 'Discours haineux',
  SPAM: 'Spam',
  FRAUD: 'Fraude',
  TOXIC_CONTENT: 'Contenu toxique',
}

export function ReportButton({ targetType, targetId }: { targetType: ReportTargetType; targetId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportCreateInput['reason']>('SPAM')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  async function submit() {
    setStatus('saving')
    try {
      await createReport({ targetType, targetId, reason, description: description || null })
      setStatus('success')
      setOpen(false)
      setDescription('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') return <span role="status" className="text-xs text-emerald-700">Signalement envoyé</span>
  return (
    <div className="relative">
      <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground" onClick={() => setOpen(!open)} aria-expanded={open}>
        <Flag className="h-3.5 w-3.5" /> Signaler
      </Button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-72 rounded-xl border bg-card p-4 shadow-lg">
          <p className="text-sm font-medium">Signaler ce contenu</p>
          <select aria-label="Raison du signalement" className="mt-3 w-full rounded-lg border bg-background px-2 py-2 text-sm" value={reason} onChange={(event) => setReason(event.target.value as ReportCreateInput['reason'])}>
            {reasons.map((value) => <option key={value} value={value}>{labels[value]}</option>)}
          </select>
          <textarea aria-label="Détails du signalement" className="mt-3 min-h-20 w-full rounded-lg border bg-background px-2 py-2 text-sm" maxLength={2000} placeholder="Détails facultatifs" value={description} onChange={(event) => setDescription(event.target.value)} />
          {status === 'error' && <p role="alert" className="mt-2 text-xs text-destructive">Impossible d’envoyer le signalement.</p>}
          <div className="mt-3 flex justify-end gap-2"><Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Annuler</Button><Button type="button" size="sm" disabled={status === 'saving'} onClick={() => void submit()}>{status === 'saving' ? 'Envoi…' : 'Envoyer'}</Button></div>
        </div>
      )}
    </div>
  )
}
