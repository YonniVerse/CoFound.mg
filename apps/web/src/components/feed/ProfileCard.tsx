import { Avatar } from "@/components/shared/Avatar";
import { SkillTag } from "@/components/shared/SkillTag";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Eye,
  MessageSquare,
  Wrench,
  Compass,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

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
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col gap-5 group">
      {/* Header: Avatar, Name, School, Field */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            name={profile.name}
            src={profile.avatar}
            size="lg"
            className="h-14 w-14 border-2 border-primary/20 shadow-xs ring-2 ring-background"
          />
          <div className="flex flex-col pt-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
                {profile.name}
              </h3>
              {profile.isFemale && (
                <span
                  className="h-2.5 w-2.5 rounded-full bg-female ring-4 ring-female/20"
                  title="Profil Féminin"
                />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mt-1">
              <GraduationCap className="h-3.5 w-3.5 text-primary/80" />
              <span>{profile.school}</span>
              <span>·</span>
              <span>{profile.field}</span>
            </div>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 shrink-0">
          <ShieldCheck className="h-3 w-3" />
          Membre CoFound
        </span>
      </div>

      {/* Bio */}
      <div className="space-y-1 bg-muted/30 p-3.5 rounded-xl border border-border/60">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1 text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Présentation
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          "{profile.bio}"
        </p>
      </div>

      {/* Skills & Seeking Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-y border-border/60">
        {/* Expertise / Apporte */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 text-muted-foreground">
            <Wrench className="h-3.5 w-3.5 text-primary" />
            Apporte au projet
          </span>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <SkillTag key={skill} label={skill} variant="slate" />
            ))}
          </div>
        </div>

        {/* Seeking / Cherche */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 text-muted-foreground">
            <Compass className="h-3.5 w-3.5 text-primary" />
            Recherche en partenaire
          </span>
          <p className="text-xs sm:text-sm text-foreground font-semibold bg-primary/5 p-2 rounded-lg border border-primary/15">
            {profile.seeking}
          </p>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="flex items-center gap-3 pt-1 w-full">
        <Button variant="outline" size="sm" className="h-9 text-xs flex-1 rounded-xl font-semibold gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          Consulter le profil
        </Button>
        <Button size="sm" className="h-9 text-xs flex-1 rounded-xl font-semibold gap-1.5 shadow-xs">
          <MessageSquare className="h-3.5 w-3.5" />
          Proposer d'échanger
        </Button>
      </div>
    </div>
  );
}
