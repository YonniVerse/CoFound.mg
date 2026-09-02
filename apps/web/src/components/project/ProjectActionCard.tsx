import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApplyModal } from '@/components/applications/ApplyModal'
import type { ProjectDetail } from '@/data/projectTypes'
import { useAuth } from '@/hooks/useAuth'

interface ProjectActionCardProps {
  project: ProjectDetail
  onApply: (input: { positionId?: string; message: string }) => Promise<boolean>
  isApplying: boolean
}

export function ProjectActionCard({ project, onApply, isApplying }: ProjectActionCardProps) {
  const [isApplyOpen, setIsApplyOpen] = useState(false)
  const { state } = useAuth()
  const currentUserId = state.status === 'authenticated' ? state.userId : null

  const isOwnerOrMember = Boolean(
    currentUserId &&
      (project.createdById === currentUserId ||
        project.members.some((member) => member.userId === currentUserId))
  )

  const handleSubmit = async ({ positionId, message }: { projectId: string; positionId?: string; message: string }) => {
    const applied = await onApply({ positionId, message })
    if (!applied) throw new Error('La candidature n’a pas pu être envoyée.')
  }

  const openPositions = project.positions.filter((position) => position.isOpen)

  return (
    <>
      <div className="flex animate-in flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-2xs duration-500 slide-in-from-right-8 sm:p-6">
        {!isOwnerOrMember && (
          <Button
            size="sm"
            className="h-9 w-full rounded-lg px-3.5 text-xs font-medium shadow-none transition-colors sm:text-sm"
            onClick={() => setIsApplyOpen(true)}
            disabled={isApplying}
          >
            {isApplying ? 'Envoi en cours…' : 'Postuler à ce projet'}
          </Button>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9 flex-1 rounded-lg px-3.5 text-xs font-medium sm:text-sm">Sauvegarder</Button>
          <Button variant="outline" size="sm" className="h-9 w-9 rounded-lg p-0" title="Partager" aria-label="Partager le projet">
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <div className="space-y-3 border-t border-border/50 pt-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stade actuel</p>
            <p className="flex items-center gap-2 text-xs font-medium text-foreground sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              {project.status}
            </p>
          </div>
          {openPositions.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Postes ouverts</p>
              <p className="text-xs font-medium text-foreground sm:text-sm">{openPositions.length}</p>
            </div>
          )}
        </div>
      </div>

      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        projectTitle={project.title}
        projectId={project.id}
        positions={openPositions.map((position) => ({ id: position.id, title: position.title }))}
        onSubmit={handleSubmit}
      />
    </>
  )
}

export default ProjectActionCard
