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
            "flex h-11 w-full rounded-xl bg-white px-3.5 py-2 text-sm text-slate-950 font-normal shadow-2xs transition-all duration-150",
            "border border-slate-200 placeholder:text-slate-400",
            "hover:border-slate-300",
            // État Focus : Anneau d'ancrage technologique Indigo
            "focus-visible:outline-none focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600/10",
            // État Désactivé
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200",
            // Gestion des erreurs
            error && "border-destructive hover:border-destructive focus-visible:border-destructive focus-visible:ring-destructive/10",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p
            className={cn(
              "text-[11px] font-medium tracking-tight px-0.5",
              error ? "text-destructive" : "text-slate-400"
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