import { Avatar } from "@/components/shared/Avatar";
import type { ProjectTeamMember } from "@/data/mockProject";

export function ProjectTeamCard({ team }: { team: ProjectTeamMember[] }) {
  return (
    <div className="bg-background border border-border shadow-xs rounded-2xl p-6 animate-in fade-in slide-in-from-right-8 duration-500 delay-200">
      <h3 className="font-heading font-bold text-lg mb-4">L'Équipe actuelle</h3>
      <div className="space-y-4">
        {team.map((member, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <Avatar name={member.name} size="sm" className="h-10 w-10 border border-border" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground leading-tight">{member.name}</span>
              <span className="text-xs text-primary font-bold">{member.role}</span>
              <span className="text-xs text-muted-foreground font-medium">{member.school}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}