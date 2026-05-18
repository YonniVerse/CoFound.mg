import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot"; // Assure-toi d'utiliser le bon import pour Radix Slot

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "indigo" | "orange" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : "button";

    const variants = {
      default: "bg-foreground text-background hover:opacity-90 shadow-2xs border border-foreground active:scale-[0.98]",
      indigo: "bg-primary text-primary-foreground hover:bg-primary-dark shadow-xs shadow-primary/10 active:scale-[0.98]",
      orange: "bg-secondary text-secondary-foreground hover:opacity-95 shadow-xs shadow-secondary/10 active:scale-[0.98]",
      outline: "bg-background border border-border text-foreground hover:bg-muted active:scale-[0.98]",
      ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
      link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-normal",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs font-semibold rounded-lg",
      md: "h-11 px-4 text-sm font-semibold rounded-xl",
      lg: "h-14 px-8 text-base font-bold rounded-xl tracking-tight",
      icon: "h-10 w-10 rounded-lg flex items-center justify-center",
    };

    return (
      <Component
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap tracking-normal transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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