import { Avatar } from "@/components/shared/Avatar";
import type { ProjectTeamMember } from "@/data/mockProject";

export function ProjectTeamCard({ team }: { team: ProjectTeamMember[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-2xs animate-in fade-in slide-in-from-right-8 duration-500 delay-200">
      <h3 className="mb-4 font-heading text-base font-bold text-foreground sm:text-lg">L'Équipe actuelle</h3>
      <div className="space-y-4">
        {team.map((member, idx) => (
          <div key={idx} className="flex items-center gap-3.5">
            <Avatar name={member.name} size="sm" className="h-10 w-10 shrink-0 border border-border/60 shadow-2xs" />
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-tight text-foreground sm:text-sm">{member.name}</span>
              <span className="text-xs font-medium text-primary">{member.role}</span>
              <span className="text-xs text-muted-foreground font-medium">{member.school}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}