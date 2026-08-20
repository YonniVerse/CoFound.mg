import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary-light text-primary border-primary/10",
  secondary: "bg-secondary-light text-secondary border-secondary/10",
  impact: "bg-impact-light text-impact border-impact/10",
  muted: "bg-muted text-muted-foreground border-border",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
} as const;

type BadgeVariant = keyof typeof variants;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-tight",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
