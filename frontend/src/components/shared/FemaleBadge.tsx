import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface FemaleBadgeProps {
  variant?: "project" | "profile";
  className?: string;
}

export function FemaleBadge({ variant = "project", className }: FemaleBadgeProps) {
  if (variant === "profile") {
    return (
      <Sparkles 
        className={cn("text-female w-4 h-4 inline-block", className)} 
        strokeWidth={2.5}
        aria-label="Profil féminin" 
      />
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
      "bg-female/10 text-female border border-female/20 shadow-sm shadow-female/5",
      className
    )}>
      <Sparkles className="w-3 h-3" strokeWidth={3} />
      <span>Impact Féminin</span>
    </div>
  );
}