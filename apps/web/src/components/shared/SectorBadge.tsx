import { Tag, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectorBadgeProps {
  sector: string;
  icon?: LucideIcon;
  className?: string;
}

export function SectorBadge({ sector, icon: Icon = Tag, className }: SectorBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-muted border border-border text-foreground px-3 py-1 text-xs font-semibold tracking-tight",
        className,
      )}
    >
      <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
      {sector}
    </span>
  );
}
