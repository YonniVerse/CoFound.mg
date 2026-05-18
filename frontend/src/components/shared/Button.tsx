import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "indigo" | "orange" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild = false, ...props }, ref) => {
    // Si asChild est activé, on délègue, mais pour un composant autonome standard:
    const Component = asChild ? Slot.Root : "button";

    // Cartographie des styles chirurgicaux
    const variants = {
      default: "bg-slate-950 text-white hover:bg-slate-900 shadow-sm border border-slate-900 active:scale-[0.98]",
      indigo: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/10 active:scale-[0.98]",
      orange: "bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-500/10 active:scale-[0.98]",
      outline: "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]",
      ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
      link: "text-indigo-600 underline-offset-4 hover:underline p-0 h-auto font-normal",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs font-medium rounded-lg",
      md: "h-11 px-4 text-sm font-semibold rounded-xl",
      lg: "h-14 px-8 text-base font-bold rounded-xl tracking-tight",
      icon: "h-10 w-10 rounded-lg flex items-center justify-center",
    };

    return (
      <Component
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap tracking-normal transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-40",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";