import { Avatar } from '@/components/shared/Avatar'
import type { ProjectTeamMember } from '@/data/projectTypes'

export function ProjectTeamCard({ team }: { team: ProjectTeamMember[] }) {
  return (
    <div className="animate-in rounded-xl border border-border bg-card p-5 shadow-2xs duration-500 slide-in-from-right-8 sm:p-6">
      <h3 className="mb-4 font-heading text-base font-bold text-foreground sm:text-lg">L’équipe actuelle</h3>
      <div className="space-y-4">
        {team.map((member) => (
          <div key={member.userId} className="flex items-center gap-3.5">
            <Avatar name={member.role} size="sm" className="h-10 w-10 shrink-0 border border-border/60 shadow-2xs" />
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-tight text-foreground sm:text-sm">{member.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
