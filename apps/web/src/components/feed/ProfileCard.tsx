import { Avatar } from "@/components/shared/Avatar";
import { SkillTag } from "@/components/shared/SkillTag";
import { Button } from "@/components/ui/button";

export interface ProfileData {
  id: string;
  name: string;
  school: string;
  field: string;
  avatar: string | null;
  bio: string;
  skills: string[];
  seeking: string;
  isFemale: boolean;
}

export function ProfileCard({ profile }: { profile: ProfileData }) {
  return (
    <div className="bg-background border border-border rounded-xl p-5 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col gap-4 group">
      
      {/* Header: Avatar, Name, School, Field */}
      <div className="flex items-start gap-4">
        <Avatar name={profile.name} src={profile.avatar} size="lg" className="h-14 w-14 border-2 border-background shadow-xs" />
        <div className="flex flex-col flex-1 pt-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-heading font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
              {profile.name}
            </h3>
            {profile.isFemale && (
              <span className="h-2 w-2 rounded-full bg-female" title="Profil Féminin" />
            )}
          </div>
          <span className="text-xs text-muted-foreground font-medium">{profile.school} · {profile.field}</span>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-muted-foreground font-medium line-clamp-2">
        "{profile.bio}"
      </p>

      {/* Skills & Seeking */}
      <div className="flex flex-col gap-3 py-3 border-y border-border/50 mt-1">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-foreground uppercase tracking-widest opacity-60">Apporte :</span>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map(skill => (
              <SkillTag key={skill} label={skill} variant="slate" />
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-foreground uppercase tracking-widest opacity-60">Cherche :</span>
          <span className="text-sm text-foreground font-medium">{profile.seeking}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-2 mt-auto pt-1 w-full">
        <Button variant="outline" size="sm" className="h-8 text-xs flex-1">
          Voir le profil
        </Button>
        <Button size="sm" className="h-8 text-xs flex-1">
          Contacter
        </Button>
      </div>
    </div>
  );
}
