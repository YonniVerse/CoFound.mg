import { cn } from "@/lib/utils";

type SkillTagVariant = "green" | "slate" | "purple" | "indigo" | "orange";
type SkillTagSize = "sm" | "md";

interface SkillTagProps {
  label: string;
  variant?: SkillTagVariant;
  size?: SkillTagSize;
  className?: string;
}

const variantClasses: Record<SkillTagVariant, string> = {
  green: "bg-green-100 text-green-700",
  slate: "bg-slate-100 text-slate-600",
  purple: "bg-purple-100 text-purple-700",
  indigo: "bg-primary-light text-primary",
  orange: "bg-secondary-light text-secondary",
};

const sizeClasses: Record<SkillTagSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function SkillTag({ label, variant = "green", size = "sm", className }: SkillTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-medium whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {label}
    </span>
  );
}
