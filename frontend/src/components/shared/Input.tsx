import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl bg-background px-3.5 py-2 text-sm text-foreground font-normal shadow-2xs transition-all duration-150",
            "border border-border placeholder:text-muted-foreground/50",
            "hover:border-border-dark/40",
            // État Focus hérité du Design System
            "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10",
            // État Désactivé
            "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground/40 disabled:border-border",
            // Traitement sémantique de l'erreur
            error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/10",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p
            className={cn(
              "text-[11px] font-medium tracking-tight px-0.5",
              error ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";