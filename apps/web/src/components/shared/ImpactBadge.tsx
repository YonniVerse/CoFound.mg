import { Venus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImpactBadgeProps {
  label?: string;
  className?: string;
}

export function ImpactBadge({ label = "Impact féminin", className }: ImpactBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-impact-light text-impact border border-impact/10 px-3 py-1 text-xs font-bold uppercase tracking-wider",
        className,
      )}
    >
      <Venus className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
      {label}
    </span>
  );
}
