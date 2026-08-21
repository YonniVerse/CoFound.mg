import { Avatar } from "@/components/shared/Avatar";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquare } from "lucide-react";

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
    <div className="bg-card border border-border rounded-xl p-5 shadow-2xs hover:border-border/80 transition-all duration-150 flex flex-col gap-3.5 group">
      {/* Header: Avatar, Name, School, Field */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar
            name={profile.name}
            src={profile.avatar}
            size="md"
            className="h-11 w-11 border border-border/60 shadow-2xs"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm sm:text-base text-foreground leading-tight group-hover:text-primary transition-colors truncate">
                {profile.name}
              </h3>
              {profile.isFemale && (
                <span
                  className="h-2 w-2 rounded-full bg-female shrink-0"
                  title="Profil Féminin"
                />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-normal mt-0.5 truncate">
              <span>{profile.school}</span>
              <span>·</span>
              <span>{profile.field}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        "{profile.bio}"
      </p>

      {/* Skills & Seeking */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {profile.skills.map((skill) => (
          <span
            key={skill}
            className="text-[11px] font-medium bg-muted/60 text-foreground px-2 py-0.5 rounded-md border border-border/40"
          >
            {skill}
          </span>
        ))}
        {profile.seeking && (
          <span className="text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-md">
            Cherche : {profile.seeking}
          </span>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50 mt-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs font-medium rounded-lg border-border hover:bg-accent cursor-pointer gap-1.5"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Profil</span>
        </Button>
        <Button
          size="sm"
          className="h-8 px-3 text-xs font-medium rounded-lg cursor-pointer gap-1.5"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Contacter</span>
        </Button>
      </div>
    </div>
  );
}
