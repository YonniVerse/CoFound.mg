import { cn } from "@/lib/utils";

type SkillTagVariant = "slate" | "female" | "indigo" | "orange";
type SkillTagSize = "sm" | "md";

interface SkillTagProps {
  label: string;
  variant?: SkillTagVariant;
  size?: SkillTagSize;
  className?: string;
}

const variantClasses: Record<SkillTagVariant, string> = {
  slate: "bg-muted text-muted-foreground border border-border/40",
  female: "bg-female-light text-female border border-female/10",
  indigo: "bg-primary-light text-primary border border-primary/10",
  orange: "bg-secondary-light text-secondary border border-secondary/10",
};

const sizeClasses: Record<SkillTagSize, string> = {
  sm: "px-2 py-0.5 text-xs font-semibold rounded-md",
  md: "px-2.5 py-1 text-sm font-semibold rounded-lg",
};

export function SkillTag({ label, variant = "slate", size = "sm", className }: SkillTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap tracking-tight transition-colors",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {label}
    </span>
  );
}