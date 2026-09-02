import { Avatar } from '@/components/shared/Avatar'
import type { ProjectTeamMember } from '@/data/projectTypes'
import { Card } from '@/components/ui/card'
import { Users } from 'lucide-react'

export function ProjectTeamCard({ team }: { team: ProjectTeamMember[] }) {
  return (
    <Card className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
      <h3 className="font-heading text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        L’équipe ({team.length})
      </h3>

      <div className="space-y-3.5">
        {team.map((member) => (
          <div key={member.userId} className="flex items-center gap-3">
            <Avatar
              name={member.role}
              size="md"
              className="h-10 w-10 shrink-0 rounded-full border border-border"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold leading-tight text-foreground truncate">
                {member.role === 'OWNER' ? 'Porteur de projet' : member.role}
              </span>
              <span className="text-xs text-muted-foreground">Membre actif</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
