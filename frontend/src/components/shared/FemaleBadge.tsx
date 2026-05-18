import { cn } from "@/lib/utils";
import { Venus } from "lucide-react";

interface FemaleBadgeProps {
  variant?: "project" | "profile";
  className?: string;
}

export function FemaleBadge({ variant = "project", className }: FemaleBadgeProps) {
  if (variant === "profile") {
    return (
      <Venus 
        className={cn("text-female w-4 h-4 inline-block", className)} 
        strokeWidth={2.5}
        aria-label="Profil féminin" 
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-female-light text-female border border-female/10 px-3 py-1 text-xs font-bold uppercase tracking-wider",
        className
      )}
    >
      <Venus className="w-3.5 h-3.5" strokeWidth={2.5} />
      Impact Féminin
    </span>
  );
}