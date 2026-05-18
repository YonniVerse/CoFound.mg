import { cn } from "@/lib/utils";

interface FemaleBadgeProps {
  variant?: "project" | "profile";
  className?: string;
}

export function FemaleBadge({ variant = "project", className }: FemaleBadgeProps) {
  if (variant === "profile") {
    return (
      <span className={cn("text-purple-400 text-sm", className)} aria-label="Profil féminin">
        ♀
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-700 px-3 py-1 text-xs font-medium",
        className
      )}
    >
      ♀ Impact Féminin
    </span>
  );
}
