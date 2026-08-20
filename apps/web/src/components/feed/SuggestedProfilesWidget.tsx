import { Avatar } from "@/components/shared/Avatar";

export interface SuggestedProfileData {
  name: string;
  role: string;
  school: string;
}

interface SuggestedProfilesWidgetProps {
  profiles: SuggestedProfileData[];
}

export function SuggestedProfilesWidget({ profiles }: SuggestedProfilesWidgetProps) {
  return (
    <div className="bg-background border border-border rounded-xl p-5 shadow-xs">
      <h4 className="font-heading font-bold text-foreground mb-4">Profils suggérés</h4>
      <div className="flex flex-col gap-4">
        {profiles.map((profile, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <Avatar name={profile.name} size="sm" />
            <div className="flex flex-col flex-1">
              <span className="text-sm font-bold text-foreground leading-tight">{profile.name}</span>
              <span className="text-xs text-muted-foreground font-medium">{profile.role} · {profile.school}</span>
            </div>
            <button className="text-xs font-bold text-primary hover:text-primary-dark transition-colors bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-md">
              Connecter
            </button>
          </div>
        ))}
      </div>
      <button className="w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground mt-4 pt-3 border-t border-border transition-colors">
        Voir toutes les suggestions
      </button>
    </div>
  );
}
